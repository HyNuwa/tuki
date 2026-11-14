# Implicancias de mensaje: agent-data-marketplace
*Skill: startup-positioning | Generated: 2026-11-12*

Mensajes para dos audiencias que no deben mezclarse: el **comprador humano que paga** (marca regional, distribuidor, consultora) y el **ecosistema agéntico** (desarrolladores, Celo, registries). La definición de producto del usuario es la misma para ambas; cambia el orden de lo que se dice.

## Jerarquía de mensajes (comprador humano)

1. **Resultado:** el precio que de verdad paga el consumidor y si el producto está en la góndola, en almacenes y kioscos.
2. **Tiempo y esfuerzo:** se encarga en minutos y se recibe en días, sin cotización ni ola anual [Assumption: plazo no probado].
3. **Diferencial:** encargos chicos con reglas de aceptación públicas y nivel de verificación declarado; reembolso del resultado no entregado.
4. **Costo y acceso:** desde pocos dólares por observación; lote de 200 observaciones desde US$300 (tickets existentes a US$1,50) hasta US$1.000-2.000 (visitas encargadas a US$5-10) según el tipo [Estimate; precios por tipo en `docs/17-posicionamiento.md`].
5. **Entregables:** agregados por producto, comercio y fecha con metadatos de calidad; nunca imágenes originales ni datos personales.
6. **Ancla de valor:** una fracción del costo de una ola de auditoría de campo (bemyeye desde €10.000 por ola [Data, bemyeye.com]).

> **Confianza: Baja.** Jerarquía inferida de prensa y reseñas; sin prueba de mensaje con compradores.

## Jerarquía de mensajes (ecosistema agéntico)

1. Marketplace de datos del mundo real para agentes de IA (definición del usuario).
2. Modo A: comprar agregados existentes vía x402; Modo B: encargar observaciones nuevas con presupuesto.
3. Contrato de datos legible por máquina: cobertura, antigüedad, origen, nivel de verificación, cantidad de observaciones y contribuyentes, licencia, precio.
4. Celo Sepolia y facilitador de testnet para la demo; sin fondos reales.

> **Confianza: Media.** Coincide con la definición del usuario y con el alcance de la demo; la demanda agéntica no está medida.

## Etiqueta de categoría

**Regla única:** "precio pagado" va en la etiqueta de categoría y en el texto técnico; "precio neto" va en titulares y copy de venta.

**Etiqueta de categoría con el comprador (descripción del servicio, propuestas):** "relevamientos bajo demanda de precio pagado y disponibilidad en el canal tradicional".
**Con el ecosistema y en el repositorio:** "marketplace de datos del mundo real para agentes de IA".

> **Confianza: Media** (ver `market-category-analysis.md`).

## Ancla de valor

**"Una ola de auditoría a una fracción del costo"**: en texto de apoyo, comparaciones y precios. No en titulares: la calidad comparable no está probada.

> **Confianza: Baja.** La calidad comparable con una ola de auditoría no está probada.

## Lenguaje del cliente vs. lenguaje de categoría

**[Assumption]** La columna "El cliente dice" no viene de entrevistas: son frases inferidas de prensa y avisos del sector (ver Data Gaps).

| El cliente dice (verbos) [Assumption] | La categoría dice (sustantivos y resultados) |
|---|---|
| "relevar precios", "chequear la góndola" | relevamiento bajo demanda |
| "ver si respetan el precio sugerido" | cumplimiento de precio en el canal tradicional |
| "saber cuánto pagan con el descuento" | precio neto / precio efectivo |
| "mandar a alguien al interior" | encargo de observaciones |

**Puente en el copy:** verbos del cliente con sustantivos de la categoría ("Relevá el precio neto del canal tradicional, por encargo").

> **Confianza: Baja.** Vocabulario sin validar.

## Palabras a usar y a evitar

| Usar | En vez de | Por qué |
|---|---|---|
| precio neto, precio efectivo (titulares y copy de venta) | precio pagado (en titulares) | Vocabulario del sector (Scentia: bruto vs. neto) [Opinion]; "precio pagado" queda para la etiqueta de categoría y el texto técnico |
| canal tradicional, almacenes y kioscos | LatAm, NOA como diferencial | "Interior" y "canal tradicional" son términos del comprador; el NOA es la primera zona, no el valor |
| relevamiento, encargo, lote | bounty, tarea, gig | Formato que el comprador ya compra |
| verificado con ticket fiscal | on-chain, atestación | El comprador no busca "oráculo" |
| tu agente de pricing puede comprarlo | agent-first, x402, stablecoins | Lenguaje del vendedor; ausente en todas las fuentes del comprador |
| complemento de lo que ya usás | más barato que Scanntech | Posición de complemento, no de rival |
| "una fracción del costo" | "el primero", "el único" (en público) | No hay evidencia para afirmar primero ni demanda validada |

> **Confianza: Media** en las palabras a evitar (riesgos documentados); **Baja** en las palabras a usar (sin entrevistas).

## Lado contribuyente

- Mensaje: "Sabés de antemano qué se acepta y por qué; cobrás al aceptarse, sin mínimo de retiro" [Opinion, desde review-mining: el rechazo opaco y los umbrales de retiro son las quejas principales].
- La recompensa en stablecoins es argumento de reclutamiento, no de venta al comprador.
- Evitar "la IA te paga" como titular: atrae volumen mercenario (patrón de puntos pre-token de Vangrid) [Opinion].

> **Confianza: Media.** Basado en review-mining del lado oferta.

## Prueba social

No existe. No fabricar ni pre-escribir citas. Omitir la sección en cualquier material hasta tener un piloto con resultados publicables.

## Data Gaps
- Vocabulario real del comprador: las palabras propuestas salen de prensa y de la industria, no de entrevistas.
- Plazo de entrega real de un encargo.
- Precio real del lote de 200 observaciones: el rango es [Estimate] sin disposición a pagar medida.

## Red Flags
- Usar "agentes", "x402" o "stablecoins" en la primera conversación con una marca o distribuidor hace que no reconozca el producto como solución a su problema [Opinion].
- Afirmar ser los primeros o tener demanda validada sería falso.

## Yellow Flags
- "Precio pagado" debe limitarse a la promoción visible en el ticket; los reintegros posteriores no figuran.
- Una foto de góndola sin QR se comunica como "precio de góndola observado", nunca como "precio pagado" (ADR 0002).

## Sources
- `positioning-doc.md`, `positioning-statement.md`, `market-category-analysis.md`, `raw/alternative-mapping.md`
- `../raw/review-mining.md`, `../raw/gtm-analysis.md`, `../pricing-landscape.md`
- `docs/adr/0002-verificacion-de-observaciones.md`
