# Recompensas verificables NOA

*(nombre provisional)*

Las **marcas regionales pagan solo por compradores nuevos verificados** de sus productos en almacenes del NOA. El almacenero no cambia su forma de cobrar y el comprador recibe un reembolso en pesos. El presupuesto de cada campaña puede quedar comprometido en un **escrow on-chain en Celo** que despliega y fondea la propia marca.

> Estado: **base de desarrollo**. El dominio, el contrato y la API en memoria tienen tests. La PWA, la persistencia en Postgres y la integración con un proveedor de pagos están pendientes. No hay usuarios reales ni plata real.

## Cómo funciona

```
Marca ──crea campaña (SKU, comercios, presupuesto, % de recompensa)──► Plataforma
  │                                                                      │
  └─(opcional) despliega y fondea CampaignEscrow en Celo                 │
                                                                         ▼
Almacenero ──entrega código de un solo uso junto con el producto──► Comprador
                                                                         │
Comprador ──código + comprobante de pago QR + CVU (web móvil)──► Plataforma
                                                                         │
           reglas: campaña viva, SKU, 1 por CVU, techo por sell-in, duplicados
                                                                         │
                     aprobado ─► reserva en el ledger ─► orden de pago (PSP de la marca)
                                                    └──► o atestación EIP-712 ─► escrow paga
```

Por qué el diseño es así (precio en % del SKU, verificación anclada en el comercio, escrow no custodial): [`docs/04-decisiones-de-diseno.md`](docs/04-decisiones-de-diseno.md).

## Estructura

```
packages/domain   Reglas de negocio puras (TypeScript) + tests
                  pricing · campañas · estados del reclamo · verificación y antifraude · ledger
packages/db       Migración SQL de Postgres (constraints únicos, ledger de solo inserción)
apps/api          API Fastify en memoria con los endpoints del doc 02 §11 + tests de punta a punta
apps/web          PWA (pendiente; ver su README)
contracts         CampaignEscrow.sol + token de prueba, compilado con solc-js y testeado en EVM local
docs/             Propuesta, especificación del MVP, análisis competitivo, decisiones e investigación
```

## Uso

Requiere Node ≥ 20.

```bash
npm install
npm test                     # dominio + API + contratos (sin red)
npm run typecheck

cp .env.example .env         # completar BUYER_KEY_SALT
BUYER_KEY_SALT=una-sal-larga-de-prueba npm run dev -w apps/api
```

- Contratos: `npm run compile -w contracts` deja ABI y bytecode en `contracts/artifacts/`.
- SQL: `psql "$DATABASE_URL" -f packages/db/migrations/0001_init.sql`

### Ejemplo con la API

```bash
H='-H content-type:application/json -H x-role:operator -H x-actor-id:op-1'
curl -s $H localhost:3000/v1/merchants -d '{"name":"Almacén Don Pepe","cuit":"20-11111111-1","phone":"+5493880000000","address":"Belgrano 100"}'
# → aprobar comercio, registrar sell-in, crear y activar campaña, emitir código, POST /v1/claims …
```

El flujo completo está en `apps/api/test/api.test.ts`.

## Qué cubren los tests

| Prueba de aceptación (doc 02 §13) | Dónde |
|---|---|
| Campaña sin presupuesto confirmado no se activa | `domain/test/campaign-claim.test.ts` |
| Mismo ticket dos veces se bloquea | `domain/test/verification-ledger.test.ts` |
| Producto o comercio ajeno no es elegible | ídem |
| Compras cerca del tope no superan el presupuesto | ídem (ledger) |
| Webhook de pago duplicado = una sola acreditación | ídem + `api.test.ts` |
| Payout fallido queda reintentable | `api.test.ts` |
| La marca solo ve reportes agregados y propios | `api.test.ts` |
| Reversa = asiento compensatorio | `verification-ledger.test.ts` |
| Operador bloquea reclamo → no sale el pago | `campaign-claim.test.ts` + `api.test.ts` |
| **Nuevo:** 1 reembolso por comprador; techo por sell-in contra colusión | `api.test.ts` |
| **Nuevo:** escrow paga solo con firma válida, una vez, con tope; la marca pausa y recupera el remanente; acepta el sufijo ERC-8021 | `contracts/test/escrow.test.ts` |

## Pendiente (en orden)

1. **Validación comercial antes de construir más** (doc 01 §9): entrevistar marcas y distribuidores de Jujuy y hacer un piloto concierge con una planilla.
2. Persistencia en Postgres usando `packages/db`, con transacciones y bloqueo en las reservas.
3. Autenticación real (hoy los roles se leen de headers: **solo para desarrollo**).
4. Integración con un PSP (pago del reembolso desde la cuenta de la marca) y verificación de firma de webhooks.
5. PWA (`apps/web`).
6. Despliegue de `CampaignEscrow` en Celo reutilizando la tubería con tag ERC-8021 y gas en stablecoin del repo `vaquita`; firmante de atestaciones en el backend.
7. Revisión legal: bases y condiciones, AAIP, INPROJUY, encuadre PSAV del firmante.

## Notas

- Los tests de contratos usan `ganache` como EVM en memoria. Es una dependencia **solo de desarrollo** con avisos de `npm audit` en dependencias transitivas; no se usa en producción. Se puede migrar a Foundry o Anvil cuando estén disponibles en el entorno.
- Montos siempre en **centavos enteros**; en pantalla, con `formatARS`.
- Ningún dato personal va on-chain ni a los reportes de marca.
