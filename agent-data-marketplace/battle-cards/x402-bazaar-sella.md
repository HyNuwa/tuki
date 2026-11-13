# Battle Card: marketplaces x402 (Coinbase Bazaar / Agentic.Market, Sella, Apify x402, Massive)
*Skill: startup-competitors | Generated: 2026-11-12*

**Amenaza: BAJA como competidores; son un canal obligatorio.** Apify x402 tiene amenaza Media como sustituto parcial (scrapers de precios online). **Confianza:** Media (documentación propia; volumen con fuentes Tier 2-3).

## De un vistazo
- **Qué hacen:** catálogos y marketplaces donde agentes descubren y pagan servicios por request en USDC vía x402. Bazaar indexa automáticamente al liquidar con el CDP Facilitator; Agentic.Market (2026-04-20) cura ~70 servicios; Sella agrega APIs de terceros con créditos si falla; Apify expone más de 20.000 Actors; Massive vende datos financieros por ruta [Data].
- **Fundados:** Agentic.Market 2026-04 (Coinbase); Sella, Apify x402 y Massive: DATA GAP | **Financiamiento:** Coinbase; resto DATA GAP.
- **Precio:** ticket promedio x402 ~US$0,21-0,30 [Estimate]; Apify mínimo US$1 por tx [Data]; fees de Agentic.Market y Sella: DATA GAP.
- **Ideal para:** desarrolladores que quieren publicar o consumir APIs sin cuentas.

## Sus fortalezas
- Discovery gratis y automático; listarse cuesta casi cero [Data].
- Coinbase reporta más de 165M de transacciones y más de 480k agentes [Data, cifras propias].
- Patrones útiles de reversión de riesgo: créditos (Sella), cobro de tope y devolución (Apify) [Data].

## Sus debilidades
- Catálogo con basura y purgas silenciosas: "10,028 near-identical junk resources"; -43% de listados en 8 horas [Data, dev.to 2026-08-04].
- Demanda real baja: actividad diaria -92% desde el pico [Data]; "Probe traffic [...] while purchases sat at zero" [Data, kirothebot, dev.to 2026-08-04; mismo autor que la cita del catálogo basura, no es corroboración independiente].
- Sin señal de calidad ni disputas: "the Bazaar indexes endpoints but doesn't surface quality" [Data, snippet].

## Cómo ganarle (en realidad: cómo usarlos)
- **Si dicen "en Bazaar ya hay datos para agentes",** responder: "Hay miles de endpoints sin señal de calidad; el nuestro publica n, recencia y tasa de rechazo en cada respuesta 402" [Opinion].
- **Si dicen "puedo comprar un scraper de Coto en Apify",** responder: "Eso es precio online de lista; nosotros vendemos precio pagado en tienda y disponibilidad en el NOA" [Assumption: no se verificó que exista ese Actor].
- **Liderar con:** métricas de verificación por respuesta y escrow con reembolso por umbral.

## Cuándo nos ganan
- Cuando al agente le alcanza un dato online o de lista a precio sub-dólar.
- Como canal: si no estamos listados, no existimos para el comprador agentic.

## La queja principal de sus clientes
"one seller wallet behind 40% of all listings — 10,028 near-identical junk resources." — kirothebot (ForgeMesh), dev.to, 2026-08-04.
**Por qué importa:** en un catálogo sin confianza, la señal de calidad verificable es un diferencial de conversión.

## Vulnerabilidad clave
Sin calidad curada ni disputas, el comprador agente "paga a ciegas" [Data/Opinion].

## Señales de abandono
- Catálogo basura y cero compras reales — común (vendedores en dev.to).
- API keys más cómodas que pagos agentic — declarado por Apify.

## Qué vigilar
Curación y señales de calidad en Agentic.Market, escrow o metering nativo en x402, y el facilitador de Celo para wARS.

## Brechas de datos
- Fees de Agentic.Market y Sella; precios por ruta de Massive.
- Costo del facilitador x402 de Celo para pagos de ~US$0,75.
- Voz del comprador agente: la evidencia viene casi toda de vendedores x402, y tres datos clave (cero compras, purga de -43%, 4.400 compradores) son de un solo autor (kirothebot, dev.to).
- Existencia de selltoagent.dev.

## Red Flags
- Listarse no trae demanda: hay marketplaces de datos pay-per-record en Bazaar sin ventas reportadas [Data].

## Yellow Flags
- Casi toda la evidencia del lado comprador viene de vendedores con interés comercial; el dato de 4.400 compradores activos (mayo de 2026) contradice el de cero compras (agosto de 2026), y ambos son del mismo autor (kirothebot, dev.to) [Data].
- selltoagent.dev no se pudo verificar; Sella aparece en sellag.vercel.app y sella.dev [DATA GAP].

## Sources
- https://www.coinbase.com/developer-platform/discover/launches/agentic-market
- https://dev.to/kirothebot/43-of-the-x402-catalog-vanished-overnight-nobody-announced-it-3bf0
- https://dev.to/kirothebot/x402-has-a-91-supply-problem-and-that-is-good-news-for-solo-builders-6g4
- https://docs.apify.com/platform/integrations/x402
- https://www.sean-weldon.com/blog/2026-10-20-why-ai-agents-still-wont-pay-for-anything-jan-curn-apify
- https://massive.com/docs/ai-tools/x402
- https://www.getdrio.com/mcp/io-github-sella-network-sella/md · https://sellag.vercel.app/
- raw/competitor-profiles.md, raw/pricing-intelligence.md, raw/review-mining.md, raw/gtm-analysis.md
