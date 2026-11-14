# Mapa de alternativas y cliente: agent-data-marketplace
*Skill: startup-positioning | Generated: 2026-11-12*

> Nivel Light: plantillas A1 (alternativas) y A2 (inteligencia de cliente) fusionadas, en 3 rondas de búsqueda centradas en el **comprador**: (1) cómo miden precios las consultoras de inflación y qué pasa con las promociones, (2) cómo se mide el canal tradicional y qué herramientas usan marcas y distribuidoras, (3) software de pricing, scraping y apps de trade marketing en Argentina. Se reutilizan los perfiles de `../../competitors-report.md`, `../../raw/review-mining.md` y `../../battle-cards/`; no se rehízo el perfilado de competidores.
>
> Etiquetas: **[Data]** dato con fuente · **[Estimate]** cálculo con supuestos · **[Assumption]** supuesto sin verificar · **[Opinion]** juicio analítico. Las citas van en su idioma original. **(snippet)** = cita tomada del extracto del buscador, sin leer la página completa.
>
> **Advertencia principal:** sigue sin existir voz directa del comprador enterprise o regional (cero reseñas de compradores de Scanntech, NielsenIQ, Scentia o field audit; ver review-mining.md). Todo el "dolor del comprador" de este archivo se infiere de prensa económica, de cómo las consultoras describen sus propios límites metodológicos y de marketing de proveedores. Sin entrevistas, el lado demanda es hipótesis.

---

## El trabajo a realizar (JTBD)

**Trabajo central [Opinion, construido sobre evidencia]:** "Saber a qué precio se vende **de verdad** mi producto (y el de la competencia) y si está en la góndola, en los comercios y regiones donde no tengo ojos, a tiempo para corregir un precio, una promoción o una ruta de distribución."

El trabajo se desdobla por comprador:

| Comprador | Versión del trabajo | Frecuencia |
|---|---|---|
| Marca regional / distribuidora | "¿Mi lista de precios sugerida se respeta en almacenes de Jujuy y Salta? ¿Me falta stock donde la competencia sí está?" | Semanal a mensual [Assumption] |
| Consultora de inflación / macro | "Mi índice semanal mide precio publicado online; ¿cuánto se desvía del precio que la gente paga con descuentos?" | Semanal [Data: frecuencia de LCG, EcoGo, Analytica] |
| Agencia de trade / investigación | "Cumplir un relevamiento de precio, exhibición y disponibilidad para un cliente CPG sin montar campo en el interior." | Por proyecto [Data: ofertas de auditor en Catamarca, Malargüe] |
| Software de pricing | "Alimentar mi motor con precios de competencia que el scraping no ve (tiendas físicas, netos)." | Continua [Assumption] |

**Por qué el trabajo es más difícil en Argentina que en otros mercados [Data]:** "un producto puede tener simultáneamente más de cinco precios distintos" según medio de pago y promociones (iProfesional, 2026-06-08). Osvaldo Del Río (Scentia) sostiene, según la misma nota (paráfrasis, sin comillas en el original), que los precios **brutos** de supermercados y comercios de cercanía se parecen, pero en precios **netos** el supermercado queda en promedio **16% más barato** que almacenes y autoservicios. Es decir: el dato que importa (neto) no es el que se publica (bruto). Y el canal tradicional pesa: almacenes ~34% del consumo masivo frente a 31% de cadenas; 35% al sumar autoservicios independientes, sobre más de 194.700 PDV independientes relevados por NielsenIQ [Data, mercado.com.ar 2026; dos informes con definiciones distintas].

---

## Alternativas directas (mismo trabajo: observar precio y góndola en el punto físico)

### NielsenIQ Retail Index (auditoría del canal tradicional)
- **Tipo:** Competidor directo (incumbente).
- **Hired for:** medir ventas, precios y distribución en almacenes y autoservicios; se combina con Scantrack (datos de cadenas) [Data, mercado.com.ar].
- **Strengths:**
  - Metodología aceptada, series históricas, cobertura nacional declarada de 194.700+ PDV relevados [Data].
  - Es el lenguaje con el que la industria habla del canal ("canal indirecto", "precio promedio ponderado") [Data].
- **Limitations:**
  - Auditoría por muestra con periodicidad bimestral/mensual típica [Assumption: no se verificó la frecuencia vigente].
  - No hay evidencia de que capture precio neto pagado con descuento bancario o de billetera [DATA GAP].
  - Contrato enterprise por cotización; inaccesible para una marca regional chica [Assumption].
- **Best for:** multinacionales y grandes nacionales que necesitan participación de mercado oficial.
- **Switching triggers:** recorte de presupuesto; necesidad de granularidad (tienda, día) que el panel no entrega [Assumption].
- **Switching costs:** Technical: M | Contractual: H | Emotional: H (es "la fuente" para directorio y retailers).

### Field audit crowdsourced (bemyeye, Field Agent/Storesight, Premise, Rocketpin)
- **Tipo:** Competidor directo (detalle en battle-cards).
- **Hired for:** olas de auditoría de precio, exhibición y quiebre de stock por proyecto.
- **Strengths:** presupuesto ya asignado en la marca; entrega fotos y evidencia; bemyeye desde unos €10.000 por ola [Data, competitors-report].
- **Limitations:** venta por cotización y ciclos lentos; "covers fewer countries compared to its competitors" (Field Agent, AIMultiple) [Data]; "you can expect varying degrees of quality in their deliverables" (Storesight, sobre la categoría) [Data]; sin evidencia de operación activa en NOA [DATA GAP].
- **Best for:** multinacionales con campañas puntuales de trade.
- **Switching triggers:** latencia de despliegue ("weeks or months" de agencias tradicionales, según Roamler, competidor) [Data, marketing de vendedor]; ola demasiado cara para un SKU o una provincia.
- **Switching costs:** Technical: L | Contractual: M | Emotional: L.

### Agencias locales de auditoría y promotoría (relevadores contratados)
- **Tipo:** Agencia/outsourcing (directo en el trabajo).
- **Hired for:** "Completar una encuesta digital desde una app en tu celular. Registrar precios, disponibilidad de productos y exhibición en góndola o heladeras. Tomar fotos de respaldo para validar la auditoría." [Data, aviso de empleo "Auditor/a comercios minoristas Catamarca", proximotrabajo, snippet]. Terrand Audits ofrece "Tienda Check" en Argentina [Data, infonegocios, snippet].
- **Strengths:** ya existen en el interior (avisos en Catamarca, Malargüe, San Vicente); entregan exactamente el formato que el producto propone (precio + disponibilidad + foto).
- **Limitations:** costo fijo de relevador por ruta; sin datos de precio neto pagado; latencia de proyecto [Assumption].
- **Best for:** agencias de trade que subcontratan para CPG.
- **Switching triggers:** encargos chicos o urgentes que no justifican armar ruta [Assumption].
- **Switching costs:** Technical: L | Contractual: L-M | Emotional: M (relación personal con la agencia).

### Vangrid / RentAHuman (agentes que pagan tareas físicas)
- **Tipo:** Competidor directo por mecanismo, no por vertical (ver battle-cards).
- **Hired for:** bounty físico genérico pagado por un agente.
- **Strengths:** mecanismo x402 + escrow + EAS en producción (Vangrid, US$9M) [Data].
- **Limitations:** ticket mínimo US$50; sin LatAm; sin producto de datos de comercio [Data]. Ningún comprador CPG argentino los usa hoy [Assumption fuerte].
- **Best for:** desarrolladores de agentes en EE.UU.
- **Switching triggers / costs:** no aplican al comprador objetivo hoy. Technical: L | Contractual: L | Emotional: L.

---

## Alternativas adyacentes (trabajo vecino o parcial)

### Scanntech (POS de autoservicios)
- **Tipo:** Adyacente fuerte (complemento según el checkpoint).
- **Hired for:** sell-out y precio de ticket en autoservicios con POS conectado (628-756 PDV en AR) [Data, competitors-report].
- **Strengths:** dato de ticket real, latencia declarada de "24 a 48 horas" (México) [Data, autodeclarado]; Serie F de US$180M.
- **Limitations:** no ve comercio sin POS ni promociones aplicadas fuera del POS [Data/Assumption].
- **Switching triggers:** no se cambia; se complementa [Opinion].
- **Switching costs:** Technical: M | Contractual: H | Emotional: M.

### Paneles de hogares y consumo (Scentia, Worldpanel by Numerator)
- **Tipo:** Adyacente.
- **Hired for:** tendencia de volumen y precio promedio ponderado por canal. Ejemplo de lo que entregan: precio promedio ponderado +23,1% interanual en marzo frente a 32,6% de IPC; cerveza +47% por litro en super/mayorista/autoservicio y +68% en kioscos y almacenes [Data, prensa basada en Scentia, 2026].
- **Strengths:** separan canal tradicional del moderno; el propio Scentia instaló la lectura bruto vs. neto en prensa [Data].
- **Limitations:** agregados mensuales; no responden "¿qué pasa en este almacén de Palpalá esta semana?" [Opinion].
- **Switching costs:** Technical: L | Contractual: H | Emotional: H.

### SEPA / Precios Claros
- **Tipo:** Adyacente gratuito (piso de precio).
- **Hired for:** precio de lista en cadenas (12M+ precios, CC BY 4.0) [Data].
- **Limitations:** lista, no neto; sin canal tradicional [Opinion].
- **Switching costs:** nulos; se usa como insumo, no se reemplaza.

### Scraping propio o de terceros (LCG, Econviews, Apify, Turbodato)
- **Tipo:** Adyacente / herramienta interna.
- **Hired for:** índice semanal de precios online. LCG "releva cada miércoles los valores de 8.000 alimentos y bebidas en cinco supermercados [...] mediante web scraping" [Data, Perfil]. Existe un scraper de Jumbo Argentina en Apify desde unos US$6,15 por 1.000 resultados [Data, apify.com] (cierra el DATA GAP del informe de competidores: **sí hay Actor argentino**). Turbodato se ofrece en Argentina con API y alertas [Data, Capterra].
- **Strengths:** barato, frecuente, automatizable.
- **Limitations (dicha por los propios usuarios):** LCG advirtió que una baja de precios "podría estar vinculad[a] con las ofertas del CyberMonday, debido a que el relevamiento se realiza sobre precios publicados en internet" [Data, Perfil]. Solo cadenas con e-commerce; Econviews mide "en supermercados del Gran Buenos Aires" [Data]. Nada de canal tradicional ni interior.
- **Switching triggers:** episodios donde el índice online diverge del IPC por promociones (CyberMonday, 2x1, segunda unidad al 70-80%) [Data].
- **Switching costs:** Technical: L | Contractual: L | Emotional: L.

### PriceStats / índices online académicos
- **Tipo:** Adyacente.
- **Hired for:** inflación diaria con precios online; históricamente mostró inflación online ~3 veces la oficial en Argentina (Cavallo, 2013) [Data, RePEc].
- **Limitations:** online; Cavallo encontró precios online y offline idénticos ~72% de las veces en 56 retailers multicanal de 10 países (el autor es socio de PriceStats) [Data]. El 28% restante y el canal sin e-commerce quedan fuera. No se encontró cómo trata promociones [DATA GAP].
- **Switching costs:** no es un cliente probable; es un posible comprador de un delta offline [Opinion].

### SaaS de trade marketing y sell-out (GU Trade, Tracksmart, Nextbyn Consolido)
- **Tipo:** Adyacente (herramienta para el equipo propio).
- **Hired for:** digitalizar lo que relevan mercaderistas propios: share of shelf por fotos con reconocimiento de imagen (GU Trade); exhibición en góndola (Tracksmart, opera en AR y otros 7 países) [Data, peru-retail, snippet]. Nextbyn Consolido "permite monitorear ventas y stock en más de 350.000" PDV vía datos de distribuidores [Data, snippet; cifra sin verificar].
- **Strengths:** ya instalados en marcas y distribuidoras; el comprador ya está acostumbrado a pagar por "visibilidad del canal indirecto".
- **Limitations:** dependen de que **alguien propio** vaya al PDV (GU Trade, Tracksmart) o de datos de facturación del distribuidor, no del precio que paga el consumidor (Consolido) [Opinion].
- **Switching triggers:** querer ver PDV fuera de la ruta propia o de la competencia [Assumption].
- **Switching costs:** Technical: M | Contractual: M | Emotional: L. **[Opinion]** Más que alternativa, es un **canal de integración**: el dato del producto podría entrar como capa externa en estas herramientas.

---

## Status quo y alternativas manuales

### Fuerza de ventas propia (preventistas, vendedores, repositores del distribuidor)
- **Tipo:** Manual / status quo dominante en NOA [Assumption].
- **Hired for:** ver precio y góndola de **sus clientes** durante la visita de preventa.
- **Strengths:** costo marginal cero; relación directa con el almacenero; ya pasan cada semana.
- **Limitations:** conflicto de interés (el vendedor reporta lo que le conviene); no ve comercios fuera de su ruta ni el precio cobrado al consumidor con promociones; se registra en WhatsApp o planilla, sin estructura [Assumption/Opinion]. No se encontró ninguna app de preventa con módulo de relevamiento usada en NOA [DATA GAP].
- **Switching triggers:** sospecha de que la lista sugerida no se respeta; caída de ventas sin explicación en una provincia; lanzamiento de la competencia [Assumption].
- **Switching costs:** Technical: L | Contractual: L | Emotional: **H** ("mis vendedores ya lo saben").

### Planillas, llamadas y visitas del gerente
- **Tipo:** Manual.
- **Hired for:** chequeo puntual de precios de competencia (llamar a comercios, mandar a alguien, fotos por WhatsApp) [Assumption].
- **Limitations:** no escala, no es comparable en el tiempo, no sirve para un informe al directorio.
- **Switching costs:** Technical: L | Contractual: L | Emotional: L.

### Intuición + Scentia/SEPA + "no hacer nada"
- **Tipo:** Status quo.
- **Hired for:** decidir precios con lo que ya hay. El título del estudio de NielsenIQ lo dice desde el vendedor: "De la intuición a la precisión: cómo los datos confiables están ayudando a las marcas a crecer el doble en el canal indirecto" [Data, mercado.com.ar, snippet].
- **Strengths:** gratis; en contexto de caída de consumo (Scentia: -5,1% interanual en marzo de 2026; NOA "en plena crisis" según Ámbito, 2026-07) la tentación es recortar, no sumar proveedores [Data].
- **Limitations:** decisiones tardías ante 5+ precios por producto y descuentos que cambian semanalmente [Opinion].
- **Switching triggers:** pérdida de participación visible; un retailer o distribuidor que exige evidencia; una auditoría que muestra que el precio sugerido no se cumple [Assumption].
- **Switching costs:** Emotional: M (admitir que no se sabe).

---

## Resumen del panorama

| Alternativa | Tipo | Ajuste al trabajo | Fortaleza clave | Limitación clave |
|---|---|---|---|---|
| NielsenIQ Retail Index | Directo | Alto (canal tradicional) | Metodología oficial | Muestra, caro, sin neto pagado [DATA GAP] |
| Field audit crowd (bemyeye, Field Agent, Premise, Rocketpin) | Directo | Alto | Presupuesto asignado | Lento, caro, sin NOA verificado |
| Agencias locales de auditoría | Directo / outsourcing | Alto | Ya en el interior | Costo fijo por ruta, latencia |
| Vangrid / RentAHuman | Directo por mecanismo | Bajo hoy | x402 en producción | Sin vertical ni LatAm |
| Scanntech | Adyacente | Medio | Ticket real POS | Sin canal sin POS ni promos externas |
| Scentia / Worldpanel | Adyacente | Medio | Bruto vs. neto por canal | Agregado mensual |
| SEPA | Adyacente gratis | Bajo-medio | Gratis, oficial | Solo lista en cadenas |
| Scraping (LCG, Apify, Turbodato) | Adyacente | Bajo-medio | Barato, semanal | Solo online, sesgado por promos |
| PriceStats | Adyacente | Bajo | Diario | Solo online |
| SaaS trade (GU Trade, Tracksmart, Consolido) | Adyacente / canal | Medio | Instalado en el cliente | Depende de equipo propio o facturación |
| Fuerza de ventas propia | Status quo | Medio | Costo marginal cero | Sesgo, solo ruta propia |
| Planillas / llamadas | Manual | Bajo | Inmediato | No escala |
| Intuición / no hacer nada | Status quo | — | Gratis | Decisiones a ciegas |

**Conteo:** 4 directas · 7 adyacentes · 3 status quo/manuales (13 en total).

---

## Mapa de lenguaje (frases del comprador, en su idioma)

### Cómo describen el problema
- "un producto puede tener simultáneamente más de cinco precios distintos" — iProfesional, 2026-06-08
- "Argentinos, sin valores de referencia" — titular iProfesional, 2026-06-08
- precios "brutos" parecidos vs. "netos" distintos (supermercado 16% más barato en neto) — Scentia vía iProfesional (paráfrasis)
- "podría estar vinculado con las ofertas [...] debido a que el relevamiento se realiza sobre precios publicados en internet" — LCG vía Perfil
- promociones que "esconden la baja de la inflación" (2x1, segunda unidad al 70-80%) — Gobierno vs. supermercadistas, 2024, vía El Heraldo/Cronista
- "el volumen real del negocio está en el canal tradicional: kioscos, almacenes, mayoristas y cadenas regionales" — Forbes Argentina (snippet)

### Qué significa "mejor"
- "De la intuición a la precisión" / "datos confiables" en el "canal indirecto" — NielsenIQ (snippet)
- "precios, disponibilidad de productos y exhibición en góndola o heladeras" + "fotos de respaldo para validar" — aviso de auditoría, Catamarca (snippet)
- desplegar en "a few days" en vez de "weeks or months" — Roamler (marketing de vendedor)

### Palabras para evaluar [Opinion: vocabulario del sector, a validar en entrevistas]
- "precio neto" / "precio efectivo" (no "precio pagado"), "canal tradicional" / "canal indirecto", "quiebre de stock", "cumplimiento de precio sugerido", "share de góndola", "relevamiento", "ola", "PDV", "interior" (no "LatAm" ni "NOA" en boca de una marca nacional).
- **[Opinion]** "Agente", "x402" y "stablecoins" no aparecen en ninguna fuente del lado comprador. Son lenguaje del vendedor; no deberían estar en la propuesta al primer cliente.

---

## Jerarquía de dolores (lado comprador)

| Dolor | Frecuencia | Severidad | Evidencia |
|---|---|---|---|
| El precio publicado (lista/online) no es el que se paga: 5+ precios por producto, netos distintos por canal | Común | Frustrante → Deal-breaker para índices | iProfesional/Scentia, LCG [Data] |
| Los índices online se distorsionan con promociones (CyberMonday, 2x1) | Ocasional (eventos) | Frustrante | LCG vía Perfil [Data] |
| Canal tradicional (34-35% del consumo) medido por muestra, caro o por intuición | Común | Frustrante | NIQ, Forbes [Data/snippet]; sin cita de comprador [DATA GAP] |
| Cobertura fuera de AMBA: relevamientos de consultoras en "cinco supermercados" o "Gran Buenos Aires" | Común | Frustrante | LCG, Econviews [Data] |
| Latencia de field audit por proyecto ("weeks or months") | Ocasional | Molesto-Frustrante | Solo marketing de vendedor [Data, sesgado] |
| Costo de ola (desde €10.000) para un encargo chico | Ocasional | Deal-breaker para marca regional | bemyeye [Data]; impacto en marca regional [Assumption] |
| Contexto de caída de consumo: presupuesto de investigación bajo presión | Común (2026) | Barrera de compra | Scentia, Ámbito [Data] |

---

## Jobs to be Done

**Funcionales:** verificar cumplimiento de precio sugerido en el canal tradicional; medir brecha precio de lista vs. neto por medio de pago; detectar quiebres de stock propios y presencia de la competencia fuera de la ruta propia; corregir un índice semanal por promociones.

**Sociales:** llegar al directorio o al cliente CPG con "datos confiables" y no con "lo que dicen los vendedores"; para la consultora, publicar un dato que la prensa cite como diferencial ("lo que pagan de verdad").

**Emocionales:** dejar de decidir precios "a ciegas" en una economía con 5+ precios por producto; no quedar expuesto cuando una provincia cae sin explicación.

---

## Perfil de cliente con mejor ajuste (best-fit)

**Hipótesis principal [Assumption + Opinion]: gerente comercial o de trade de una marca regional de consumo masivo (o su distribuidor principal) con fuerte venta en canal tradicional del NOA.**
- Vende una parte relevante (estimada en más de un tercio, en línea con el 34-35% nacional) en almacenes y autoservicios sin POS [Estimate].
- Para esa región, no compra NielsenIQ ni Scanntech o lo compra solo a nivel nacional agregado [Assumption].
- Ya paga, en forma explícita o implícita, por mirar la góndola: preventistas, una agencia local o una app de trade [Assumption].
- Su decisión cambia con el dato: precio sugerido, bonificación al distribuidor, promoción por provincia [Assumption].
- Decide rápido (dueño o gerente con presupuesto propio) y paga encargos chicos sin licitación [Assumption].
- **Por qué este perfil [Opinion]:** es donde el dolor (canal tradicional + interior + neto) es máximo y las alternativas directas (NIQ, field audit enterprise) son más caras o están ausentes. La tesis de la UNT sobre una bebida regional en NOA que usa tableros semanales de SOM y Price Index muestra que este comprador ya **piensa** en esos términos [Data, face.unt.edu.ar].

**Segmento alternativo de validación rápida [Opinion]: consultoras de inflación (EcoGo, LCG, Analytica, Econviews).**
- Dolor documentado en sus propias palabras (sesgo por promociones, solo online, solo AMBA) [Data].
- Ciclos de decisión cortos y valor de prensa, pero ticket probablemente bajo y riesgo de que solo quieran el dato gratis o en canje por visibilidad [Assumption].
- Útiles como **design partner** y amplificador, no como fuente principal de ingresos.

**Quién no es el primer cliente [Opinion]:** multinacionales (ya tienen NIQ/Scanntech y compran con licitación), software de pricing global (quiere cobertura amplia, no NOA) y operadores de agentes (no hay evidencia de demanda; ver Riesgo 1 del informe de competidores).

---

## Disparadores de cambio

**Qué dispara la búsqueda [Assumption salvo indicación]:**
- Una caída de ventas en una provincia sin explicación en Scentia/NIQ.
- Sospecha de que el almacén o el distribuidor no respeta el precio sugerido o la bonificación.
- Un evento promocional (CyberMonday, Hot Sale, guerra de descuentos bancarios) que distorsiona el dato [Data para consultoras: LCG].
- Lanzamiento o entrada agresiva de una marca Tier 3 de precio (NIQ: "se mantuvo fuerte el peso de las marcas Tier 3" en el canal tradicional) [Data].

**Qué cierra el cambio:**
- Un primer lote barato y rápido que muestre algo que los vendedores no habían reportado [Assumption].
- Evidencia con foto, ticket y fecha que se pueda llevar al directorio o al distribuidor [Opinion, sobre el formato de las auditorías existentes].

**Qué lo impide:**
- "Mis vendedores ya lo saben" (costo emocional alto del status quo) [Assumption].
- Presupuesto en recorte por caída de consumo [Data, contexto].
- Desconfianza en un dato de terceros sin metodología ni historia; dudas sobre privacidad del contribuyente [Opinion].
- Si el producto se presenta como "marketplace de agentes con stablecoins", el comprador no lo reconoce como solución a su problema [Opinion].

---

## Insights clave para el posicionamiento

1. **[Data/Opinion]** El hueco no es "datos de precios" (SEPA, scraping y PriceStats los dan baratos o gratis): es el **precio neto** después de promociones y el **canal sin e-commerce ni POS**. La industria ya usa la distinción bruto/neto (Scentia); conviene adoptar ese lenguaje existente en vez de crear categoría.
2. **[Opinion]** La competencia real del primer cliente no es Vangrid ni Scanntech, sino **sus propios preventistas y la intuición**. El argumento debe ser "lo que tu fuerza de ventas no ve o no te cuenta", no "más barato que Scanntech".
3. **[Data]** El scraping de cadenas argentinas ya está commoditizado (Apify Jumbo AR, ~US$6 por 1.000 resultados). Cualquier oferta de precio online compite contra eso.
4. **[Opinion]** Las apps de trade (GU Trade, Tracksmart) y plataformas de sell-out (Consolido) son más **canal de integración** que rival: el comprador ya paga por visibilidad del canal indirecto.
5. **[Opinion]** Las consultoras de inflación tienen el dolor mejor documentado y la decisión más rápida; son el mejor design partner aunque no el mejor pagador.

---

## Brechas de datos

- **DATA GAP crítico:** ninguna cita directa de un comprador (marca regional, distribuidor, agencia, consultora) sobre costo, latencia o cobertura. Cerrar con 8-10 entrevistas (NOA: distribuidoras y marcas regionales; AMBA: 2-3 consultoras de precios).
- **DATA GAP:** cobertura real de NielsenIQ Retail Index y Scentia en NOA, frecuencia y precio. Preguntar a clientes actuales.
- **DATA GAP:** existencia y uso de apps de preventa con módulo de relevamiento en distribuidoras del NOA (tres variantes de búsqueda sin resultados).
- **DATA GAP:** cómo trata PriceStats las promociones y si tiene muestra offline en Argentina.
- **DATA GAP:** Ofertómetro y otros trackers de promociones no aparecieron en las búsquedas; no se pudo perfilar.
- **DATA GAP:** cifra de 350.000 PDV de Nextbyn Consolido solo en snippet; no verificada.
- **DATA GAP:** disposición a pagar por precio neto/disponibilidad por observación o por lote; ninguna fuente.
- Varias fechas de notas de prensa del buscador eran inconsistentes; se citaron solo las que se pudieron leer o fechar (iProfesional 2026-06-08 leída directamente).

---

## Flags

### Red Flags
- **Toda la demanda es inferida.** No hay un solo comprador que diga "pagaría por esto"; el dolor mejor documentado es de consultoras que hoy resuelven con scraping casi gratis.
- **El contexto macro juega en contra:** caída de consumo masivo (-5,1% interanual en marzo de 2026, NOA "en plena crisis") presiona los presupuestos de investigación justo en el segmento objetivo.

### Yellow Flags
- El status quo (preventistas) tiene costo marginal cero y alto costo emocional de abandono; el producto debe complementarlo, no pedir que se reemplace.
- El vocabulario del producto (agentes, x402, stablecoins) no coincide con ningún término del comprador.
- La brecha neto vs. bruto podría ser cubierta por Scentia o NIQ si deciden publicarla con más granularidad (ya la miden en agregado).
- Los avisos de auditor en el interior muestran que existe oferta de relevadores pagos; el modelo crowd compite también contra esa mano de obra.

---

## Sources

- ../../competitors-report.md, ../../raw/review-mining.md, ../../battle-cards/, ../intake.md
- https://www.iprofesional.com/economia/456617-argentinos-sin-valores-de-referencia-un-producto-puede-tener-mas-de-5-precios-diferentes
- https://perfil.com/economia/la-inflacion-de-alimentos-corto-ocho-semanas-de-aumentos-y-el-cybermonday-habria-influido-a40-aY1mJ5h4Jk2v
- https://www.perfil.com/noticias/economia/inflacion-septiembre-consultoras-anticipan-dato-cercano-2-alimentos-vuelven-presionar-a40.phtml
- https://www.iprofesional.com/economia/467906-precios-de-alimentos-la-suba-mensual-se-desacelero-en-octubre.amp
- https://www.elheraldo.com.ar/noticias/economia/en-medio-de-la-polemica-por-las-promociones-los-alimentos-subieron-casi-7
- https://mercado.com.ar/negocios/nielseniq-el-canal-tradicional-ya-explica-35-de-las-ventas-de-consumo-masivo
- https://mercado.com.ar/tendencias/nielseniq-releva-una-recuperacion-de-2-del-consumo-masivo-en-2025
- https://www.forbesargentina.com/negocios/estrategias-canal-batalla-ganar-gondola-kiosco-e-commerce-n100593
- https://www.elancasti.com.ar/politica-y-economia/el-consumo-masivo-volvio-caer-marzo-y-acumula-un-retroceso-del-31-2026-n611368
- https://www.losandes.com.ar/economia/el-vino-le-gano-la-cerveza-gracias-las-ventas-kioscos-y-almacenes-n5982427
- https://www.ambito.com/ambito-nacional/se-acentua-la-caida-del-consumo-las-provincias-nortenas-estamos-plena-crisis-n6295540
- https://face.unt.edu.ar/web/iadmin/wp-content/uploads/sites/2/2026/02/21-Espeche-Miguez-Mateo-Trabajo-de-campo_compressed.pdf
- https://apify.com/scrapers_lat/jumbo-ar-scraper
- https://www.capterra.es/software/1113544/Turbodato
- https://ideas.repec.org/a/eee/moneco/v60y2013i2p152-165.html
- https://www.nber.org/papers/w24275
- https://www.peru-retail.com/como-escoger-sistema-trade-marketing/
- https://dev.proximotrabajo.com/empleos/auditor-a-comercios-minoristas-catamarca-f04cc0bc-deba-4687-b47c-a9c265eff955
- https://infonegocios.info/y-ademas/terrand-audits-consolida-su-servicio-tienda-check-en-argentina-y-lo-exporta-a-europa-cuidado-de-marca-y-control-de-franquicias
- https://research.aimultiple.com (Field Agent, citado en review-mining.md)
- https://content.bemyeye.com/pricing/
