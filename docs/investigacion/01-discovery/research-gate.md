# Research Gate (go/no-go)

**Fase:** 3.5 — Research Gate
**Proyecto:** recompensas-verificables-noa
**Fecha:** 2026-11-09
**Confianza:** Media

---

## Qué encontró la investigación

| Dimensión | Hallazgo | Señal |
|---|---|---|
| Tamaño de mercado | Canal tradicional grande (34 % del consumo masivo), pero el **mercado que pagaría (marcas regionales del NOA) es de USD 90k–390k/año**. Año 1 en Jujuy: USD 2k–8k netos [Estimate] | 🟡/🔴 |
| Competencia | **Hueco real**: nadie vende "pago por comprador nuevo en el almacén sin POS" a marcas regionales. Scanntech (Promo Club, USD 180 M) es la amenaza, pero no llega al almacén chico | 🟢 |
| Economía por unidad | Con USD 1,50 fijos, **los SKUs baratos dan pérdida a la marca**. Cierra con SKUs ≥ USD 2 o con una recompensa como % del precio | 🟡 |
| Verificación | No hay forma de verificar el SKU sin el comercio. El diseño viable es código del comercio + comprobante QR de pago + techo por sell-in + deduplicación por CVU | 🟡 |
| Demanda | **Todavía sin validar con clientes.** No hay evidencia de que alguna marca pague | 🔴 (no por mala, sino por inexistente) |
| Timing | Rieles de pago y digitalización fiscal a favor; consumo en caída | 🟡 |
| Regulación | El piloto en pesos es viable. El escrow cripto con usuarios reales es de riesgo alto (PSAV) | 🟡 |

## Veredicto

### Para la hackatón: 🟢 VERDE
Hay una tesis clara, un hueco competitivo verificable y un uso de Web3 defendible (escrow no custodial y auditable de presupuestos de campaña, con atestaciones off-chain). Además, el diseño de verificación es mejor que el de los docs originales. Es una buena historia de demo si se presenta con honestidad sobre lo que es testnet.

### Para una startup: 🟡 AMARILLO
**Lo más fuerte:** el hueco existe y el modelo de "pago por venta verificada" está probado afuera (Ibotta, Fetch).

**Lo que preocupa:**
1. El mercado local es muy chico para sostener un negocio.
2. La demanda no tiene ninguna evidencia.

**Qué tiene que ser cierto para que funcione:**
1. Al menos **1 distribuidor o marca de Jujuy financia un piloto concierge** (aunque sea de USD 200–500).
2. **Los almaceneros entregan el código de campaña** en menos de 20 segundos y sin coludir: fraude menor al 5 % de los reclamos.
3. **El costo por comprador nuevo verificado es menor que el de la alternativa** que usa la marca (degustación o bonificación).
4. Hay un camino para pasar de marcas regionales a **marcas nacionales que lanzan en el NOA**, que son las que tienen presupuesto.

**No es rojo** porque ningún hallazgo mata la idea. **No es verde** porque los tres supuestos que la sostienen (alguien paga, el comercio coopera, cuesta menos que la alternativa) tienen cero evidencia directa.

## Ajustes recomendados antes de seguir
- **Precio:** pasar de USD 1,50 fijos a **un % del precio del SKU con tope** (por ejemplo, la recompensa = 20–30 % del PVP; la comisión de la plataforma = USD 0,30–0,50 + fee de campaña).
- **Producto:** elegir 1 SKU de ticket ≥ ARS 3.000 para el piloto (yerba, dulce de leche, bebida, aceite regional).
- **Verificación:** código o QR del comercio + comprobante QR de pago + techo por sell-in + 1 reembolso por CVU.
- **Web3:** testnet, token mock, escrow desplegado y fondeado por la "marca", plataforma que solo firma atestaciones. En producción, fiat vía PSP.

---

## Flags

**Red Flags:**
- Demanda B2B todavía sin evidencia.
- Mercado local chico (SOM del año 1 de USD 2k–8k netos).

**Yellow Flags:**
- Economía negativa con SKUs baratos a precio fijo.
- Verificación dependiente del comercio, con riesgo de colusión.
- Scanntech como amenaza latente.
- Riesgo regulatorio del componente cripto en producción.

## Fuentes
- `market-analysis.md`, `competitor-landscape.md`, `industry-trends.md`, `confidence-dashboard.md`
