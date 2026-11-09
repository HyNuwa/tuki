import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import { Service, ServiceError } from "./service.js";

/**
 * API mínima (doc 02 §11).
 *
 * ⚠️ AUTENTICACIÓN DE DESARROLLO: el rol y el actor se leen de los headers
 * `x-role` y `x-actor-id`. Sirve para probar permisos, NO para producción.
 * Antes de cualquier piloto real hay que reemplazarlo por sesiones reales.
 */
type Role = "operator" | "brand" | "merchant" | "buyer";

const centavos = z.number().int().nonnegative();
const date = z.coerce.date();

const campaignBody = z.object({
  brandId: z.string().min(1),
  name: z.string().min(1),
  skus: z.array(z.object({ code: z.string().min(1), name: z.string().min(1), price: centavos })).min(1),
  merchantIds: z.array(z.string()).min(1),
  startsAt: date,
  endsAt: date,
  budget: centavos,
  pricing: z.object({
    reward: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("fixed"), amount: centavos }),
      z.object({ kind: z.literal("percentOfPrice"), bps: z.number().int().min(0).max(10_000), cap: centavos, floor: centavos.optional() }),
    ]),
    merchantIncentive: centavos,
    platformFee: centavos,
    launchFee: centavos,
  }),
  limits: z.object({ maxClaimsPerBuyer: z.number().int().min(1), maxClaimsPerMerchant: z.number().int().min(1).optional() }),
  fundingConfirmed: z.boolean(),
  termsUrl: z.string().url().optional(),
});

const claimBody = z.object({
  campaignId: z.string(),
  merchantId: z.string(),
  skuCode: z.string(),
  cvu: z.string().regex(/^\d{22}$/, "El CVU/CBU tiene 22 dígitos"),
  purchasedAt: date,
  merchantCode: z.string().optional(),
  paymentProof: z.object({ merchantCuit: z.string(), amount: centavos, paidAt: date }).optional(),
  receiptFingerprint: z.string().optional(),
  receiptShowsSku: z.boolean().optional(),
});

export function buildServer(service: Service) {
  const app = Fastify({ logger: false });

  const actor = (req: FastifyRequest) => ({
    role: req.headers["x-role"] as Role | undefined,
    id: (req.headers["x-actor-id"] as string | undefined) ?? "anon",
  });

  const requireRole = (req: FastifyRequest, ...roles: Role[]) => {
    const { role } = actor(req);
    if (!role || !roles.includes(role)) throw new ServiceError(403, "FORBIDDEN", `Requiere rol: ${roles.join(" o ")}`);
  };

  app.setErrorHandler((err, _req, reply: FastifyReply) => {
    if (err instanceof ServiceError) return reply.status(err.status).send({ error: err.code, message: err.message });
    if (err instanceof z.ZodError) return reply.status(400).send({ error: "VALIDATION", issues: err.issues });
    return reply.status(500).send({ error: "INTERNAL", message: "Error inesperado" });
  });

  app.get("/health", async () => ({ ok: true }));

  // --- comercios
  app.post("/v1/merchants", async (req, reply) => {
    requireRole(req, "operator");
    const body = z.object({ name: z.string(), cuit: z.string(), phone: z.string(), address: z.string() }).parse(req.body);
    return reply.status(201).send(service.addMerchant(body));
  });
  app.post("/v1/merchants/:id/approve", async (req) => {
    requireRole(req, "operator");
    return service.approveMerchant((req.params as { id: string }).id);
  });
  app.post("/v1/merchants/:id/sell-in", async (req, reply) => {
    requireRole(req, "operator");
    const body = z.object({ invoiceRef: z.string(), skuCode: z.string(), units: z.number().int().positive() }).parse(req.body);
    return reply.status(201).send(service.recordSellIn({ ...body, merchantId: (req.params as { id: string }).id }));
  });

  // --- campañas
  app.post("/v1/campaigns", async (req, reply) => {
    requireRole(req, "operator", "brand");
    return reply.status(201).send(service.createCampaign(campaignBody.parse(req.body)));
  });
  app.get("/v1/campaigns", async (req) => {
    requireRole(req, "operator", "brand");
    const { role, id } = actor(req);
    return [...service.campaigns.values()].filter((c) => role === "operator" || c.brandId === id);
  });
  app.post("/v1/campaigns/:id/activate", async (req) => {
    requireRole(req, "operator"); // activación con aprobación de operador (doc 02 §5.1)
    return service.activate((req.params as { id: string }).id);
  });
  app.get("/v1/campaigns/:id/report", async (req) => {
    requireRole(req, "operator", "brand");
    const report = service.report((req.params as { id: string }).id);
    const { role, id } = actor(req);
    const campaign = service.campaigns.get(report.campaign.id)!;
    if (role === "brand" && campaign.brandId !== id) throw new ServiceError(403, "FORBIDDEN", "No es tu campaña");
    return report;
  });

  // --- ofertas y códigos
  app.get("/v1/offers", async (req) => {
    const { merchantId } = z.object({ merchantId: z.string() }).parse(req.query);
    return service.offersFor(merchantId);
  });
  app.post("/v1/campaigns/:id/merchant-codes", async (req, reply) => {
    requireRole(req, "merchant", "operator");
    const { id: actorId, role } = actor(req);
    const { merchantId } = z.object({ merchantId: z.string() }).parse(req.body);
    if (role === "merchant" && merchantId !== actorId) throw new ServiceError(403, "FORBIDDEN", "Solo tus códigos");
    return reply.status(201).send(service.issueMerchantCode((req.params as { id: string }).id, merchantId));
  });

  // --- reclamos
  app.post("/v1/claims", async (req, reply) => {
    const key = req.headers["idempotency-key"];
    if (typeof key !== "string" || key.length < 8) throw new ServiceError(400, "IDEMPOTENCY_KEY", "Falta Idempotency-Key");
    const result = service.submitClaim(key, claimBody.parse(req.body));
    return reply.status(201).send({
      folio: result.claim.id,
      status: result.claim.status,
      evidenceLevel: result.verification.evidenceLevel,
      reasons: result.verification.reasons,
    });
  });
  app.post("/v1/claims/:id/decision", async (req) => {
    requireRole(req, "operator");
    const body = z.object({ approve: z.boolean(), reason: z.string().min(3) }).parse(req.body);
    return service.decide((req.params as { id: string }).id, actor(req).id, body.approve, body.reason);
  });
  app.post("/v1/claims/:id/block", async (req) => {
    requireRole(req, "operator");
    const body = z.object({ reason: z.string().min(3) }).parse(req.body);
    return service.blockPayout((req.params as { id: string }).id, actor(req).id, body.reason);
  });

  // --- pagos
  app.post("/v1/payouts", async (req, reply) => {
    requireRole(req, "operator");
    const { claimId } = z.object({ claimId: z.string() }).parse(req.body);
    return reply.status(201).send(service.createPayout(claimId, actor(req).id));
  });
  app.post("/v1/payouts/webhook", async (req) => {
    // TODO producción: verificar la firma del proveedor de pagos antes de procesar.
    const body = z.object({ payoutId: z.string(), providerRef: z.string(), result: z.enum(["paid", "failed"]) }).parse(req.body);
    return service.payoutWebhook(body.payoutId, body.providerRef, body.result);
  });

  return app;
}
