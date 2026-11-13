# Battle Card: Quay

*Skill: startup-competitors | Generated: 2026-11-11*

**Amenaza: BAJA** como competidor: no opera en Argentina ni en EVM. **Valor ALTO como referencia** de diseño y de go-to-market. **Confianza:** Media (docs públicas; sin tracción verificable).

## De un vistazo
- **Qué hace:** escaneás un SGQR de Singapur y firmás **una sola transacción de Sui** que hace el swap (Cetus), paga en USDsui al comercio y emite un `PaymentReceipt` onchain [Data].
- **Fundada:** 2026 | **Financiamiento:** premio de 1.er puesto en Sui Overflow 2026 (27-ago-2026; monto no publicado) | **Equipo:** DATA GAP [Data].
- **Precio:** gas patrocinado, tasa Pyth con slippage máximo que fija el usuario y 25 bps en el cash-out opcional a SGD [Data].
- **Ideal para:** comercios web2 de Singapur que quieren aceptar cripto "sin aprender cripto".

## Sus fortalezas
- **El producto más parecido a nuestros diferenciadores:** firma desde la wallet propia, sin depósito, cotización con tope de slippage, todo o nada y recibo verificable para el comercio con CSV y GST [Data].
- No custodial en el flujo de pago; sin KYC para el comprador [Data].
- Arquitectura modular por riel: cada país es "un directorio y un parser nuevos" [Data].
- GTM replicable: hackathon de ecosistema, beta en un mercado y docs públicas [Data].

## Sus debilidades
- **No opera en Argentina**; el roadmap apunta a DuitNow, QRIS, UPI y PIX [Data].
- **Su atomicidad no se puede trasladar:** en Argentina el comercio cobra ARS fuera de la cadena vía un PSP [Opinion].
- Exige que el comercio se registre con aprobación manual [Data].
- Sin tracción comprobada; las métricas del sitio son de demo [Data].

## Cómo ganarle
- No compite por nuestros usuarios. **Si un jurado o inversor dice "Quay ya lo hizo",** responder: "En Sui, en Singapur y con comercios registrados. Nosotros aplicamos el mismo patrón en Base para comercios argentinos que no tienen que hacer nada, con garantía de reembolso en vez de atomicidad" [Data/P].
- **Liderar con:** funciona con el QR que el comercio ya tiene.

## Cuándo nos gana
- En Singapur, o si el comercio cobra en stablecoin onchain: ahí su garantía es criptográfica y la nuestra, contractual.
- Ante jurados de hackathon, por elegancia técnica y premio previo.

## La queja principal de sus clientes
No hay reseñas; no opera en nuestro mercado [Data gap deliberado].
**Por qué importa:** n/a.

## Vulnerabilidad clave
Necesita la cooperación del comercio. En Argentina el comercio no va a participar.

## Señales de abandono
- n/a.

## Qué vigilar
PIX (Brasil) como primer paso en LatAm, reembolsos firmados por el comercio y cualquier mención de Argentina.

## Brechas de datos
- Equipo, financiamiento, track exacto del premio y tracción real. Importan poco porque no opera en Argentina; se acotan con el handbook de Sui Overflow.

## Red Flags
- Si la idea se inspiró en Quay, hay que **ajustar la expectativa técnica**: "garantizado" en Argentina significa escrow, SLA con el proveedor y operaciones de reembolso, no un smart contract [Opinion].

## Yellow Flags
- El track exacto del premio difiere entre versiones del anuncio [Data].

## Sources
- https://www.quay.cash/ · https://www.quay.cash/docs · https://www.sui.io/blog/sui-overflow-2026-winners.md · raw/competitor-profiles.md, raw/gtm-analysis.md, raw/strategic-signals.md
