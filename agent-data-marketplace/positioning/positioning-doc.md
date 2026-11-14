# Posicionamiento de mercado: agent-data-marketplace
*Skill: startup-positioning | Generated: 2026-11-12*

**Base.** `competitive-alternatives.md`, `market-category-analysis.md`, `raw/alternative-mapping.md`, `raw/market-categories.md`, `../competitors-report.md`, `../competitive-matrix.md`, `../pricing-landscape.md`, `../battle-cards/`, `../verification-report.md` (correcciones) y la revisión del usuario (L6). La investigación profunda (`deep-research/demanda-agentica-y-verificacion.md`) no existía al sintetizar y no se usó. Etiquetas: [Data], [Estimate], [Assumption], [Opinion].

**Producto (definición del usuario, adoptada sin cambios):**
> **Marketplace de datos del mundo real para agentes de IA.** Los agentes pueden descubrir, comprar y encargar información verificable mediante x402. Las personas aportan observaciones del mundo físico, como tickets de compra, reciben recompensas y mantienen protegidos sus datos personales.

**Estado:** pre-lanzamiento. Sin producto, sin compradores, sin contribuyentes, sin dinero real. Todo atributo del producto es intención de diseño.

## Resumen ejecutivo

El producto es un marketplace de datos del mundo real para agentes de IA, y su diferencial central es **Modo B: encargar observaciones verificadas que todavía no existen**. Para entrar al mercado se recomienda venderlo primero a un comprador humano (el gerente comercial o de trade de una marca regional o de un distribuidor con venta en almacenes y kioscos) como **relevamientos bajo demanda de precio pagado y disponibilidad en el canal tradicional**, con los agentes como canal de compra y no como cliente principal. Gana donde nadie llega hoy: el precio con la promoción bancaria o de billetera aplicada en caja, en comercios sin POS, en lotes de pocos cientos de dólares y con reglas de aceptación públicas; no gana en series históricas, representatividad ni escala, y no tiene demanda validada.

## 1. Alternativas competitivas

Mapa completo en `competitive-alternatives.md` (16 alternativas: 5 directas, 8 adyacentes y 3 de status quo). La tabla siguiente agrupa algunas filas.

Ajuste al trabajo y carencias: [Opinion], derivados de la evidencia de `competitive-alternatives.md`.

| Alternativa | Tipo | Ajuste al trabajo | Dónde se queda corta |
|---|---|---|---|
| Fuerza de ventas propia (preventistas) | Status quo | Medio | Sesgo; solo la ruta propia; sin precio neto |
| Field audit (bemyeye, Field Agent, Premise) | Directo | Alto | Desde €10.000 por ola; cotización; sin NOA verificado |
| Agencias locales de auditoría | Directo | Alto | Costo fijo por ruta, latencia |
| NielsenIQ Retail Index | Directo | Alto | Muestra, contrato enterprise, sin precio neto [DATA GAP] |
| Vangrid / RentAHuman | Directo por mecanismo | Bajo hoy | Mínimo US$50; horizontal; sin LatAm |
| Scanntech | Adyacente (complemento) | Medio | No ve comercios sin POS ni promociones externas |
| Scentia / Worldpanel | Adyacente | Medio | Agregado mensual |
| SEPA | Adyacente gratis | Bajo-medio | Solo lista en cadenas |
| Scraping / Apify / Massive / Sella | Adyacente | Bajo-medio | Solo online o datasets existentes |
| Fetch / Receipt Hog / Pogo / Halo | Adyacente | Bajo en AR | Paneles pasivos sin encargos; Halo no verificado; Pogo no investigado |
| Intuición / no hacer nada | Status quo | — | Decisiones a ciegas |

> **Confianza: Media.** El mapa es amplio y está bien fuentado del lado oferta, pero ningún comprador confirmó qué usa hoy.

## 2. Atributos únicos

| # | Atributo | Evidencia de que es único | ¿Defendible? |
|---|---|---|---|
| 1 | Precio efectivamente pagado, incluida la promoción bancaria o de billetera visible en el ticket, con el total conciliado contra el QR fiscal de ARCA | Nadie lo tiene en AR: SEPA da lista, Scanntech ve el POS sin promociones externas [Data/Assumption, competitive-matrix]. Los reintegros acreditados después de la compra no figuran en el ticket [Opinion] | Medio. Numerator y Fetch lo hacen con tickets en EE.UU.; Scanntech podría sumarlo |
| 2 | Cobertura bajo demanda del canal tradicional (almacenes, kioscos); NOA como primera geografía, no como diferencial | Scanntech: 24,0% del canal autoservicio, NOA 20,1% (febrero de 2024, posiblemente desactualizado); **no publica canal tradicional** [Data, autodeclarado]. No hay evidencia de un hueco NOA en autoservicios | Bajo-Medio. Se defiende con densidad local de contribuyentes, que tarda meses |
| 3 | Lote de observaciones comerciales con calidad y criterios de entrega, no el precio pequeño | El precio chico no diferencia: Loopuman (Celo, retiro desde US$1) y WURK (desde US$0,02) ya cubren microtareas baratas de forma horizontal [Data, deep research 2026-11-13]; bemyeye vende olas desde €10.000 [Data]. No se encontró un lote de comercio con criterios de entrega declarados | Medio. Copiable; se defiende con calidad medida y operación |
| 4 | Reglas de aceptación públicas antes de la tarea y niveles de verificación declarados L0-L3 | El rechazo opaco es el primer motivo de abandono en Receipt Hog, Fetch, Premise, Field Agent y bemyeye [Data, review-mining]; los catálogos x402 "no muestran calidad" [Data] | Medio. Copiable, pero exige operación y reputación |
| 5 | Compra y encargo nativos para agentes (x402, MCP) | Vangrid, RentAHuman, Apify, Massive y Sella ya lo tienen [Data] | **No.** Es requisito de entrada, no diferencial |

**Atributos que solo conoce el equipo fundador** (experiencia en CPG, relaciones con distribuidores del NOA, acceso a datos): **no se aportaron [DATA GAP].** Es la pieza que más podría fortalecer el posicionamiento.

> **Confianza: Media** en que la combinación 1+2+3+4 no existe hoy (búsqueda Light); **Baja** en que se pueda entregar: ninguno de los cuatro está construido.

## 3. Temas de valor

### Tema 1: el precio que de verdad se paga
- **Atributos:** 1.
- **Resultado para el cliente:** decidir precio sugerido, bonificación o promoción con el precio neto, no con el de lista ("un producto puede tener más de cinco precios").
- **Evidencia:** iProfesional 2026-06-08 (incluye el dato de Scentia, supermercado 16% más barato en neto: Scentia vía iProfesional, misma fuente); LCG sobre el sesgo del CyberMonday [Data].

### Tema 2: ojos donde tu fuerza de ventas no llega, cuando los necesitás (Modo B)
- **Atributos:** 2, 3.
- **Resultado para el cliente:** encargar en días un relevamiento chico de comercios fuera de la ruta propia o de la competencia, sin cotización ni ola anual.
- **Evidencia:** latencia de "weeks or months" de agencias (marketing de Roamler, sesgado) y precio de ola de bemyeye [Data]; utilidad para el comprador [Assumption].

### Tema 3: dato con reglas claras, también para tu agente
- **Atributos:** 4, 5.
- **Resultado para el cliente:** saber antes de pagar qué cuenta como observación válida, qué nivel de verificación tiene cada agregado y qué pasa si el encargo no se completa (reembolso del resultado no entregado); el mismo contrato lo puede leer su agente de pricing.
- **Evidencia:** Visa/Artemis señala confianza y disputas como piezas inmaduras del comercio agéntico [Data, secundaria]; formato de auditorías existentes con "fotos de respaldo para validar" [Data, snippet].

> **Confianza: Media** en los temas 1 y 3; **Baja** en el tema 2, que depende de que el canal tradicional esté sub-cubierto (hipótesis).

## 4. Clientes con mejor ajuste

**Perfil [Assumption + Opinion]:** gerente comercial o de trade de una **marca regional de consumo masivo, o su distribuidor principal**, que:
- vende una parte relevante en almacenes, kioscos y autoservicios sin POS (en línea con el 34-35% nacional) [Estimate];
- no compra NielsenIQ ni Scanntech para esa región, o solo lo compra agregado [Assumption];
- ya paga, explícita o implícitamente, por mirar la góndola (preventistas, agencia, app de trade) [Assumption];
- cambia una decisión con el dato (precio sugerido, bonificación, promoción por provincia) y decide con presupuesto propio, sin licitación [Assumption].

**Design partner:** consultoras de inflación y precios (EcoGo, LCG, Analytica, Econviews), con el dolor documentado en sus propias palabras y decisión rápida, pero ticket bajo [Data/Assumption].

**Por qué les importa más:** es donde el dolor (canal tradicional + interior + precio neto) es máximo y las alternativas directas son caras o están ausentes [Opinion].

**Quién no es el primer cliente:** multinacionales (ya tienen NIQ/Scanntech y licitan), software de pricing global y operadores de agentes autónomos (sin demanda medida).

> **Confianza: Baja.** Todo el perfil es inferido; cero entrevistas.

## 5. Categoría de mercado

**Categoría de entrada:** *relevamientos bajo demanda de precio pagado y disponibilidad en el canal tradicional* (subcategoría de inteligencia de precios, con el formato de compra del relevamiento de campo). Detalle en `market-category-analysis.md`.

**Definición de producto y visión (sin cambios):** "Marketplace de datos del mundo real para agentes de IA". Se usa ante el equipo, el ecosistema Celo, el hackathon y los registries de agentes.

**Por qué este marco:** "precio pagado" hace obvio el atributo 1; "bajo demanda" hace obvio Modo B (atributo 3) en un formato que el comprador ya compra; "canal tradicional" ubica el producto como complemento de Scanntech.

**Expectativas del comprador:** dato por comercio y fecha, evidencia con ticket, lote cerrado a precio conocido.

**Riesgo:** el comprador puede esperar series y representatividad; la premisa (brecha lista vs. pagado) no está medida.

> **Confianza: Media.**

## 6. Tendencia

**Fragmentación de promociones bancarias y de billetera** ("en Argentina el precio de góndola ya no es el precio"): Carrefour 35% con Mercado Pago, Banco Nación 30% con MODO, Cuenta DNI hasta 40% en 2026 [Data, market-categories T4]. Apoyo secundario: los agentes de pricing y RGM en CPG necesitan datos del canal que no ven (47% de retail y CPG usa o evalúa IA agéntica, encuesta NVIDIA 2026-01) [Data, vendor].

**No se usa** el comercio agéntico vía x402 como tendencia de posicionamiento: es temprano, está inflado por transacciones artificiales (63,9-90,2% "gamed", Artemis) y ancla precios en centavos [Data].

**¿Funciona sin la tendencia?** Parcialmente. Sin promociones fragmentadas, el precio pagado converge con el de lista y queda solo el tema 2 (canal tradicional bajo demanda).

> **Confianza: Media-Alta** en la tendencia; **Baja** en su tamaño por producto y comercio.

## Pruebas de validación

### Iteración 1 (descartada): posicionamiento agéntico puro
- **Onliness:** "Somos el único marketplace de datos que permite a agentes de IA comprar y encargar observaciones físicas verificadas vía x402." **Falla:** Vangrid opera bounties físicos pagados por agentes vía x402 con atestación EAS (la prensa describe pago por x402 con escrow liberado on-chain al aceptar la entrega y reembolso total al cancelar o vencer; no se verificó con documentación primaria si los fondos quedan en un contrato de escrow o en una wallet operadora custodial; confianza Media); RentAHuman y GeoBounties ofrecen tareas físicas vía MCP [Data].
- **Moore:** el campo "para [cliente]" queda en "agentes de IA", que no tienen presupuesto medido (US$5.000-11.000 por mes globales). **Falla.**
- **Escalera:** "datos del mundo real para agentes" ya lo ocupan Vangrid y RentAHuman en prensa ("humans as oracle layer"). **Falla.**

### Iteración 2 (adoptada): vertical, geográfica y bajo demanda
- **Onliness básico:** "Nuestro marketplace es el único servicio de relevamiento de precio pagado que permite encargar lotes de observaciones verificadas del canal tradicional argentino, con criterios de entrega y reglas de aceptación públicas, compradas por una persona o por su agente." **Pasa con condiciones:** ninguna alternativa encontrada combina precio pagado + lote con criterios de entrega + canal tradicional + aceptación pública (búsqueda Light); pero el "único" describe intención de diseño, no un producto que entregue hoy.
- **Moore:** todos los campos se completan con evidencia o supuestos declarados (ver `positioning-statement.md`). **Pasa con condiciones:** el cliente objetivo es [Assumption].
- **Escalera (Ries/Trout):** "Precio neto real del canal tradicional, por encargo" (8 palabras). Un solo peldaño; disponible en AR según la muestra (Scentia mide bruto vs. neto solo en agregado mensual). Usa vocabulario del sector ("precio neto", "canal tradicional"), no del vendedor. **Pasa**, a confirmar en entrevistas.

## Evaluación de fortaleza

| Componente | Fortaleza | Notas |
|---|---|---|
| Alternativas competitivas | Moderada | Mapa amplio; sin confirmación del comprador |
| Atributos únicos | Moderada | Combinación única; ninguno construido; atributo 5 no diferencia; faltan atributos del equipo |
| Temas de valor | Moderada | 1 y 3 con evidencia; 2 depende de una hipótesis |
| Clientes con mejor ajuste | Necesita trabajo | Todo inferido; cero entrevistas |
| Categoría | Moderada | Subcategoría existente; premisa no medida |
| **General** | **Moderada, como hipótesis testeable** | Específica y falsable, no validada. No usar como si fuera fuerte |

## Recomendaciones estratégicas
1. **Medir la premisa antes de vender:** 200-500 tickets en la primera geografía comparados con SEPA del mismo día. Si la brecha lista vs. pagado no es material, el tema 1 se cae.
2. **Entrevistar compradores en paralelo a la demo, no después:** al menos 5 durante la semana de la demo ([doc 14](../../docs/14-primeros-7-dias.md)) y 8-10 en total antes del piloto (distribuidoras y marcas regionales; 2-3 consultoras). Pedir un piloto pagado.
3. **Vender Modo B como relevamiento a medida**, con precio por lote y reglas de aceptación pactadas.
4. **Listarse en Bazaar y registries MCP el primer día**, sin contar con ese ingreso.
5. **Completar los atributos del equipo fundador.**

**Advertencia sobre prueba social:** no fabricar ni pre-escribir citas de clientes. No existe ninguna hoy.

## Data Gaps
- Atributos únicos del equipo fundador [DATA GAP].
- Disposición a pagar y decisión que cambiaría con el dato: ninguna fuente.
- Brecha lista vs. pagado cuantificada.
- Cobertura del canal tradicional de Scanntech y NielsenIQ en 2026.
- Existencia de Halo; Pogo, Scentia y Worldpanel sin investigar o sin reverificar.
- Costo de adquisición de contribuyentes en AR: sin datos.
- Custodia de los fondos en Vangrid (contrato de escrow o wallet operadora): sin documentación primaria.
- Investigación profunda sobre demanda agéntica y verificación: pendiente al sintetizar.

## Red Flags
- **La demanda no está validada en ningún lado:** ni la humana (cero entrevistas) ni la agéntica (US$5.000-11.000 por mes globales).
- **Liderar con el mecanismo es falso por omisión:** Vangrid ya lo opera con US$9M declarados.
- **La premisa central (brecha lista vs. pagado) no está medida.**

## Yellow Flags
- El vocabulario del producto (agentes, x402, stablecoins) no coincide con ningún término del comprador.
- Caída de consumo masivo (-5,1% interanual en marzo de 2026 [Data]; NOA "en plena crisis" [Data, prensa]) presiona presupuestos de investigación.
- Scanntech (Serie F de US$180M, 2026-10 [Data]) puede cerrar el hueco del canal tradicional.
- Apego del equipo a la categoría agéntica: riesgo de que se filtre a la propuesta comercial.

## Sources
- `competitive-alternatives.md`, `market-category-analysis.md`, `raw/alternative-mapping.md`, `raw/market-categories.md`
- `../competitors-report.md`, `../competitive-matrix.md`, `../pricing-landscape.md`, `../raw/review-mining.md`, `../raw/gtm-analysis.md`, `../verification-report.md`
- https://www.trmlabs.com/trm-tech-blog/whos-actually-paying-measuring-ai-agent-payments-onchain (Tier 2)
- https://www.iprofesional.com/economia/456617-argentinos-sin-valores-de-referencia-un-producto-puede-tener-mas-de-5-precios-diferentes (Tier 2)
- https://cas.com.ar/wp-content/uploads/2024/04/PRESENTACION_SCANNTECH.pdf (Tier 1, autodeclarado)
- https://content.bemyeye.com/pricing/ (Tier 1)
- https://crypto.news/vangrid-usdc-smartphone-scans-3d-models/ (Tier 2)
- https://forkast.news/half-of-x402s-transaction-volume-is-artificial-the-infrastructure-layer-keeps-building-anyway/ (Tier 3)
