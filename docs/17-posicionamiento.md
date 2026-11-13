# Posicionamiento: marketplace de datos del mundo real para agentes de IA

**Fecha:** 2026-11-12. **Estado:** síntesis estratégica para validar. No hay producto, compradores, contribuyentes ni dinero real. No es una decisión de inversión ni una aprobación para operar con fondos reales.
**Base:** investigación de competidores y de posicionamiento en [`agent-data-marketplace/`](../agent-data-marketplace/) (nivel Light) y revisión del usuario del 2026-11-12. La [investigación profunda sobre demanda agéntica y verificación](../agent-data-marketplace/deep-research/demanda-agentica-y-verificacion.md) (2026-11-13) se integró después: suma Loopuman, Execution Market y WURK a los competidores de tareas físicas y debilita el atributo 3.

**Etiquetas:** [Data] dato con fuente · [Estimate] cálculo con supuestos · [Assumption] supuesto sin verificar · [Opinion] juicio analítico.

## Conclusión ejecutiva

1. **El producto se define así** (definición del usuario, adoptada sin cambios):
   > **Marketplace de datos del mundo real para agentes de IA.** Los agentes pueden descubrir, comprar y encargar información verificable mediante x402. Las personas aportan observaciones del mundo físico, como tickets de compra, reciben recompensas y mantienen protegidos sus datos personales.
2. **El diferencial central es Modo B: encargar información que todavía no existe.** El mecanismo por sí solo no diferencia: Vangrid ya opera bounties físicos pagados por agentes vía x402 [Data]. La hipótesis diferencial es **el lote de observaciones comerciales con calidad y criterios de entrega, no el precio pequeño**: Modo B en la vertical de comercio físico (precio pagado y disponibilidad), con reglas de aceptación públicas y umbrales de privacidad. Los encargos baratos ya existen (Loopuman, WURK) [Opinion; Data, deep research 2026-11-13].
3. **La demanda agéntica no está medida.** El volumen x402 genuinamente agéntico ronda US$5.000-11.000 por mes a nivel global en 2026 (TRM Labs); RentAHuman tenía 81.000 humanos frente a 82 agentes activos (2026-02) [Data, Tier 2-3]. No afirmamos ser los primeros ni tener demanda validada.
4. **Recomendación de entrada al mercado (wedge):** vender primero a un **comprador humano** (gerente comercial o de trade de una marca regional o distribuidor con venta en almacenes y kioscos) bajo el marco **"relevamientos bajo demanda de precio pagado y disponibilidad en el canal tradicional"**, con los agentes como canal de compra. El agente compra; la persona financia y firma el presupuesto [Opinion; confianza Media].
5. **Separación estratégica.** Quién financia primero: una empresa con presupuesto real. Quién interactúa con el sistema: su agente, mediante API/MCP y x402. Qué vendemos: un resultado de datos verificados, no horas de trabajo humano. La tecnología sigue siendo agent-first: el agente descubre datos, evalúa contratos de entrega, gasta dentro de límites autorizados y encarga automáticamente.
6. **Fortaleza del posicionamiento: Moderada, como hipótesis testeable.** Es específico y falsable, pero ningún comprador lo confirmó y la premisa central (brecha entre precio de lista y precio pagado) no está medida.

## El producto en dos modos

| Modo | Qué hace el agente | Ejemplo | Rol |
|---|---|---|---|
| **Modo A — comprar datos existentes** | Encuentra información disponible, consulta su cobertura, paga mediante x402 y recibe un agregado utilizable | Precios reales observados de leche en una región | Demuestra que se pueden vender datos de inmediato |
| **Modo B — encargar nuevos datos** | Define qué necesita, fija un presupuesto y paga por obtener observaciones verificadas que todavía no existen | 20 observaciones nuevas sobre promociones en almacenes durante una semana | **Diferencial central** |

Los **tickets de compra son el primer tipo de observación**, no toda la identidad futura del producto.

Tres conceptos que no se mezclan: **datos aportados** (información física entregada voluntariamente por colaboradores: `Contribution` → `Observation`), **productos de datos** (agregados que los agentes descubren y compran: `DataProduct`) y **encargos** (solicitudes financiadas por agentes para producir información nueva: `Task`). Detalle técnico en [04 — Arquitectura técnica](./04-arquitectura-tecnica.md).

**Orden de prioridades:** primero demostrar que un agente puede comprar información útil; después, que puede encargarla; finalmente, que el marketplace consigue demanda y oferta recurrentes. Este orden describe la **prueba del producto**; la recomendación de wedge describe **quién paga primero**. No se contradicen: el agente es la interfaz que se demuestra, y el comprador humano es quien financia los encargos mientras la demanda agéntica autónoma no exista.

## Por qué un comprador humano primero

- **Hay presupuesto existente del lado humano:** el trade marketing ya paga olas de auditoría (bemyeye desde €10.000 por ola), preventistas y apps de trade [Data/Assumption].
- **No hay presupuesto medido del lado agéntico:** ver punto 3 de la conclusión. Además, la transacción promedio de comercio agéntico es de US$0,14 (Visa/Artemis, vía prensa) frente a nuestros US$1,50-10 por observación incluida en un lote entregable [Data, secundaria; Estimate]. Por eso vendemos lotes con criterios de entrega, no microtransacciones.
- **El comprador no usa nuestro vocabulario:** "agente", "x402" y "stablecoins" no aparecen en ninguna fuente del lado comprador; sí aparecen "precio neto", "canal tradicional", "relevamiento" [Opinion sobre la muestra].
- **Los agentes llegan por adentro del comprador:** el comprador agéntico realista es el agente interno de pricing o RGM de una marca o distribuidor (47% de retail y CPG usa o evalúa IA agéntica, encuesta NVIDIA 2026-01), no un agente autónomo en la web abierta [Data, vendor; Opinion].
- **El canal agéntico abierto se ocupa igual, sin contar con él:** listarse en Bazaar y en registries MCP cuesta casi nada [Data].

## Matriz competitiva

La revisión del usuario propone tres grupos. Se agregan los dos grupos más cercanos al producto según la investigación: marketplaces de tareas físicas para agentes y auditoría de campo.

| Grupo | Referente | Qué hace | Estado en nuestra investigación | Nuestra hipótesis de diferenciación |
|---|---|---|---|---|
| **Datos de compras y recompensas** | Fetch | Panel de tickets a cambio de puntos; ~11M de tickets por día (2023, posiblemente desactualizado) | Perfilado [Data] | Encargos automáticos de información específica |
| | Receipt Hog (Numerator) | Panel pasivo; ~US$0,01 por ticket al usuario; Trustpilot 2,0/5 | Perfilado [Data] | Idem, más aceptación transparente |
| | Halo (mini app de World Chain) | Tickets a cambio de recompensas on-chain para humanos con World ID; OCR de 5 campos (sin SKU); finalista de ETHGlobal Buenos Aires 2025 | **Verificado** en el [showcase de ETHGlobal](https://ethglobal.com/showcase/halo-hi8bv); sin modelo de monetización ni métricas públicas. Ver [lecciones](../agent-data-marketplace/lecciones-halo-x402.md) | Encargos con criterios de entrega y datos por producto |
| | Pogo | Recompensas por datos de compra (según el intake) | **No investigado** (límite Light) [DATA GAP] | Idem |
| **Inteligencia comercial tradicional** | Scanntech | Sell-out desde el POS de autoservicios; 3.103 PDV y 24,0% del canal autoservicio en AR, NOA 20,1% (febrero de 2024, posiblemente desactualizado); Serie F de US$180M (2026-10) | Perfilado [Data, autodeclarado]; cobertura del canal tradicional: DATA GAP | Acceso granular y bajo demanda sin contratos empresariales grandes. **Complemento, no reemplazo** |
| | Scentia | Panel de consumo; publica la lectura bruto vs. neto por canal | **No reverificado** en esta ronda; datos de prensa [DATA GAP] | Idem, con granularidad comercio-semana |
| | SEPA / Precios Claros | Más de 12M de precios de lista en cadenas, gratis | Perfilado [Data] | Solo el delta que SEPA no ve: precio pagado y canal tradicional; SEPA como línea base |
| **Infraestructura de datos para agentes** | Apify (x402) | Scrapers pagables por agentes; Actor de Jumbo AR desde ~US$6,15 por 1.000 resultados | Perfilado [Data] | Información generada físicamente por personas, no solamente datasets existentes |
| | Massive | Datos financieros vía x402, precio por ruta | Perfilado [Data] | Idem |
| | Sella (selltoagent.dev) | Marketplace de servicios para agentes, créditos ante fallas | Perfilado [Data] | Idem |
| **Tareas físicas para agentes** (los más cercanos) | Vangrid | Bounties físicos vía x402 con atestación EAS (la prensa describe pago por x402 con escrow liberado on-chain al aceptar la entrega y reembolso total al cancelar o vencer; no se verificó con documentación primaria si los fondos quedan en un contrato de escrow o en una wallet operadora custodial); desde US$50; sin LatAm; seed de US$9M autodeclarado | Perfilado [Data, prensa Tier 2; custodia confianza Media] | Vertical de comercio, lotes con criterios de entrega, Argentina. **El mecanismo no diferencia** |
| | RentAHuman | Agentes contratan humanos por hora vía MCP; 787k perfiles (2026-11, contador del sitio); 81.000 humanos frente a 82 agentes activos (2026-02) | Perfilado [Data, Tier 3] | Dato estructurado y verificado, no horas de trabajo |
| | Loopuman | Agentes encargan presencia física o datos vía API/MCP, revisión del solicitante, pago **en Celo**; 20 % de comisión y retiro mínimo de US$1 (2026-11-12); primer encargo creado por agente declarado el 2026-10-09 | Deep research [Data, autodeclarado] | Vertical de comercio con precio pagado, reglas de aceptación y umbrales de privacidad; Loopuman es horizontal y la revisión la hace el solicitante |
| | Execution Market | MCP/REST/A2A; evidencia tipada (foto geolocalizada, recibo), escrow EVM al asignar, pago USDC; prueba E2E propia en Base (2026-02-13) | Deep research [Data, sin clientes independientes] | Producto de datos agregado y entregable, no tarea suelta |
| | WURK | Microtrabajos x402/USDC en Solana y Base con API/MCP; un caso documentado de tarea física (volantes, 2026-07-10); presets desde US$0,02 por posición premiada | Deep research [Data, del proveedor] | Observación verificada con nivel declarado, no premio de microtarea |
| **Auditoría de campo** (los más cercanos en Modo B) | Premise | Microtareas de campo; 6M de contribuyentes declarados; en contracción | Perfilado [Data] | Lote programático con criterios de entrega, aceptación pública, precio pagado |
| | bemyeye | Auditorías de tienda por ola, desde €10.000 | Perfilado [Data] | Lote de 200 observaciones: US$300 (tickets) a US$1.000-2.000 (visitas encargadas) [Estimate; tabla de precios por tipo]; calidad comparable no probada |

**Status quo, la competencia real del primer comprador:** la fuerza de ventas propia (preventistas), las planillas y la intuición. El argumento es "lo que tu fuerza de ventas no llega a ver", no "más barato que Scanntech" [Opinion]. Mapa completo en [competitive-alternatives.md](../agent-data-marketplace/positioning/competitive-alternatives.md).

## Atributos únicos y temas de valor

| # | Atributo (intención de diseño) | ¿Diferencia? |
|---|---|---|
| 1 | Precio efectivamente pagado, incluida la promoción bancaria o de billetera visible en el ticket, con el total conciliado contra el QR fiscal | Sí, en AR [Data/Assumption]. Los reintegros acreditados después no figuran en el ticket |
| 2 | Cobertura bajo demanda del canal tradicional (almacenes, kioscos); NOA como primera geografía, no como diferencial | Hipótesis: el canal tradicional de Scanntech no está publicado |
| 3 | Lote de observaciones comerciales con calidad y criterios de entrega (no el precio pequeño) | **Parcial, como hipótesis**: el precio chico no diferencia: Vangrid arranca en US$50, pero Loopuman (Celo, retiro desde US$1) y WURK ya cubren microtareas chicas de forma horizontal. Lo que queda es el formato de lote de observaciones de comercio con criterios de entrega [Data, deep research 2026-11-13] |
| 4 | Reglas de aceptación públicas y niveles de verificación declarados L0-L3 ([ADR 0002](./adr/0002-verificacion-de-observaciones.md)) | Sí frente a paneles y field audit: el rechazo opaco es el primer motivo de abandono de contribuyentes [Data] |
| 5 | Compra y encargo nativos para agentes (x402, MCP) | **No**: Vangrid, RentAHuman, Loopuman, Execution Market, WURK, Apify, Massive y Sella ya lo tienen |

Atributos que solo conoce el equipo fundador (experiencia, relaciones, acceso a datos): **no se aportaron [DATA GAP].**

**Temas de valor:** (1) el precio que de verdad se paga; (2) ojos donde tu fuerza de ventas no llega, cuando los necesitás (Modo B); (3) dato con reglas claras, también para tu agente.

## Declaraciones de posicionamiento

**Moore (comprador que paga primero):**
> Para gerentes comerciales o de trade de marcas regionales de consumo masivo y sus distribuidores con venta relevante en almacenes, kioscos y autoservicios sin POS, que necesitan saber a qué precio se vende de verdad su producto y el de la competencia (con las promociones bancarias y de billetera aplicadas en caja) y si está en la góndola en comercios que su fuerza de ventas no cubre, el marketplace es un servicio de relevamientos bajo demanda de precio pagado y disponibilidad en el canal tradicional que entrega, por encargo, lotes de observaciones verificadas con ticket fiscal y foto y criterios de entrega declarados. A diferencia de las olas de auditoría de campo (bemyeye, desde €10.000 por ola) y de los reportes de los propios preventistas, el marketplace permite encargar lotes chicos con reglas de aceptación y niveles de verificación declarados antes de pagar, reembolsa el resultado no entregado, y lo puede comprar directamente el agente de pricing del cliente vía API, MCP y x402.

**Neumeier (unicidad; solo uso interno, no usar "el único" en público antes del piloto):**
> El marketplace es el único servicio de relevamiento de precio pagado que permite encargar lotes de observaciones verificadas del canal tradicional argentino, con criterios de entrega y reglas de aceptación públicas, compradas por una persona o por su agente.

**Escalera mental (Ries/Trout):** "Precio neto real del canal tradicional, por encargo."

**Regla de vocabulario:** "precio pagado" va en la etiqueta de categoría y en el texto técnico; "precio neto" va en titulares y copy de venta (igual que en [messaging-implications.md](../agent-data-marketplace/positioning/messaging-implications.md)). En ambos casos significa el total del ticket (`receiptTotal`) con las promociones visibles en caja; los reintegros acreditados después de la compra (por ejemplo, créditos posteriores de MODO o de un banco) son una señal aparte con su propia evidencia (`rebateAmount`, [04](./04-arquitectura-tecnica.md)), nunca sumada al total.

**Resultado de las pruebas:**
- Iteración 1, agéntica pura ("el único marketplace donde agentes compran y encargan datos físicos verificados vía x402"): **falla** las tres pruebas. Vangrid y RentAHuman ya ocupan ese mecanismo y ese peldaño, y "agentes de IA" no es un cliente con presupuesto medido.
- Iteración 2, la de arriba: Onliness **pasa con condiciones** (la combinación no aparece en el mercado, pero describe capacidades no construidas); Moore **pasa con condiciones** (cliente objetivo [Assumption]); escalera **pasa** (peldaño disponible, vocabulario del sector).

**Frase comercial del producto** (para el equipo y el ecosistema; ver [13 — Resumen para el equipo](./13-resumen-para-el-equipo.md)): «La infraestructura para que agentes de IA compren información verificable del mundo real, directamente de una red de colaboradores».

## Decisión de categoría

| Candidata | Tipo | A favor | En contra |
|---|---|---|---|
| **A. Marketplace de datos del mundo real para agentes de IA** | Nueva | Es la definición del usuario; único marco donde x402/MCP es ventaja; encaja con el ecosistema Celo y el hackathon | Sin compradores medidos; ancla precios en centavos; el mecanismo ya existe (Vangrid); crear categoría es caro |
| **B. Inteligencia de precio pagado para el canal tradicional** | Subcategoría de price intelligence | Hace obvio el precio pagado; posiciona como complemento de Scanntech | Sin calificar choca con SEPA gratis; brecha lista vs. pagado no medida; esconde Modo B si no se agrega el formato encargo |
| **C. Relevamiento de campo bajo demanda** (retail execution) | Existente | Presupuesto de trade existente; Modo B se entiende solo; ancla alta (€10.000 por ola) | El comprador espera reconocimiento de imágenes y KPI que no tenemos; esconde el precio pagado |

**Decisión recomendada [Opinion; confianza Media]:**
- **Definición de producto y visión:** A, sin cambios. Se usa con el equipo, el ecosistema, el hackathon y los registries de agentes.
- **Categoría de entrada al mercado:** B con el formato de compra de C: *relevamientos bajo demanda de precio pagado y disponibilidad en el canal tradicional*. "Bajo demanda" es Modo B expresado en el formato que el comprador ya compra.
- **Descriptor de distribución:** "comprable y encargable por tu agente vía API, MCP y x402".
- **Reevaluar A como categoría de venta** cuando haya compras recurrentes de agentes externos (ver criterio K7).

Análisis completo en [market-category-analysis.md](../agent-data-marketplace/positioning/market-category-analysis.md).

## Economía por observación (ilustrativa, sin validar)

Todos los números son [Estimate] o [Assumption]. El comprador paga por **resultados entregables** (agregados que cumplen sus criterios y los umbrales de privacidad), no por observaciones sueltas; la observación aceptada es la unidad de costo interno. Reglas en [16 — Seguridad, verificación y pagos](./16-modelo-seguridad-verificacion-pagos.md).

**Caso base (intake):**

| Concepto | US$ por observación aceptada |
|---|---|
| Ingreso del comprador | 1,50 |
| Recompensa al contribuyente (pago único al aceptar) | 0,75 (50%) |
| Procesamiento (extracción, verificación, almacenamiento) | 0,35 |
| **Margen de contribución** | **0,40 (~27%)** |

**Precio diferenciado por tipo de observación [Assumption]** (pricing-landscape recomienda no usar un precio único):

| Tipo | Precio | Recompensa | Procesamiento | Margen | Referencia de mercado |
|---|---|---|---|---|---|
| Ticket que la persona ya tiene | 1,50 | 0,25-0,75 | 0,35 | 0,40-0,90 | Receipt Hog paga ~US$0,01 por ticket [Data] |
| Visita encargada con desplazamiento (Modo B) | 5,00-10,00 | 3,00-6,00 | 0,50 | 1,50-3,50 | Field Agent US$2-12 por tarea (EE.UU., sin fecha); Vangrid paga 80% del bounty [Data] |

**Lote de ejemplo:** 200 tickets a US$1,50 = US$300 de ingreso; US$150 de recompensas; US$70 de procesamiento; **US$80 de margen** [Estimate].

**Reserva por encargos incompletos.** Si un encargo no alcanza el umbral mínimo, el comprador recupera el dinero del resultado no entregado (salvo que haya aceptado pagar un resultado parcial), y las recompensas ya válidas se pagan igual: la plataforma asume ese riesgo. Ejemplo: de 10 lotes como el anterior, uno se corta al 60%: se pierden US$90 de recompensas y US$42 de procesamiento sin ingreso. Margen total: 9 × 80 − 132 = **US$588 sobre US$2.700 de ingreso (~22%)** [Estimate]. Con dos lotes fallidos de 10, el margen cae a ~16%.

**Reventa en Modo A.** Una observación se recompensa una sola vez al aceptarse; cada venta adicional del mismo agregado tiene costo marginal cercano a cero, siempre que la licencia de reutilización lo permita (doc 16). Ahí está la palanca de margen; las regalías a contribuyentes quedan como opción futura [Opinion]. Decisión para la demo: los datos encargados en Modo B **no se revenden** inicialmente (licencia por defecto `task_only`, ver [16](./16-modelo-seguridad-verificacion-pagos.md)) hasta fijar las licencias; la palanca aplica solo a datos aportados con licencia de reutilización.

**Costos no incluidos [DATA GAP]:** costo del facilitador x402 en mainnet para pagos de ~US$0,75 (la demo usa el facilitador de testnet de Celo Sepolia con créditos gratuitos), costo de enviar recompensas en stablecoins, revisión manual, soporte y antifraude.

## Costo de adquisición de contribuyentes (hipótesis)

No hay ningún dato de costo de adquisición de contribuyentes en Argentina. Toda la tabla es [Assumption]; los canales vienen de [`raw/gtm-analysis.md`](../agent-data-marketplace/raw/gtm-analysis.md).

| Canal | Evidencia del canal | CAC hipotético por contribuyente activo | Riesgo |
|---|---|---|---|
| Equipo y círculo cercano (tickets del equipo para la demo) | — | ~US$0 en efectivo | No escala; sesgo de muestra |
| Comunidades cripto y de stablecoins (Ripio, Lemon, MiniPay) | Ya tienen wallet y entienden recompensas en USDC [Assumption, gtm-analysis] | US$1-3 (bono de primera observación) | Contribuyentes mercenarios (patrón de puntos pre-token de Vangrid) |
| Ecosistema Celo (talleres con Ripio, grants, hackathons) | Talleres "Stable Agents: LatAm", 2026-10-17 [Data] | US$0-2 (subsidiado por grants) | Audiencia de desarrolladores, no de compradores en almacenes |
| Prensa y redes ("la IA te paga") | Cobertura previa de RentAHuman en Forbes Argentina e iProfesional [Data] | Cercano a 0 si hay cobertura | Volumen sin calidad; no hay demanda que lo retenga |
| Referidos | — | US$0,50-1 por referido activo | Fraude de cuentas múltiples |
| Cashback y fintech (Mercado Pago, MODO, billeteras) | Mayor volumen potencial [Opinion, gtm-analysis] | Desconocido | Negociación lenta |
| Reclutamiento local para visitas de Modo B | Existen avisos pagos de relevadores en el interior (Catamarca, Malargüe) [Data, snippet] | US$3-10 | Compite con agencias por la misma mano de obra |
| Publicidad paga | Sin uso observado en la categoría [DATA GAP] | Desconocido | Canal no probado |

**Regla de recupero [Estimate]:** con el margen del caso base (US$0,40 por ticket), un CAC de US$2 se recupera con 5 observaciones aceptadas por contribuyente; uno de US$5, con 13. La retención depende de que haya encargos financiados y aceptación justa: no reclutar sin demanda [Opinion, review-mining].

## Compradores potenciales, por prioridad

| # | Comprador | Por qué | Rol | Confianza |
|---|---|---|---|---|
| 1 | Gerente comercial o de trade de marca regional de consumo masivo, o su distribuidor, con venta en canal tradicional | Dolor máximo (canal tradicional + interior + precio neto); alternativas caras o ausentes; decide sin licitación | Primer comprador que paga | Baja [Assumption] |
| 2 | Consultoras de inflación y precios (EcoGo, LCG, Analytica, Econviews) | Dolor documentado en sus propias palabras (sesgo por promociones, solo online, solo AMBA) | Design partner; ticket bajo | Media en el dolor, Baja en el pago |
| 3 | Agencias de trade e investigación | Subcontratan relevamientos en el interior para clientes CPG | Comprador de encargos | Baja |
| 4 | Software de trade y sell-out (GU Trade, Tracksmart, Nextbyn Consolido) | Sus clientes ya pagan por visibilidad del canal indirecto | Integrador (B2B2Agent) | Baja |
| 5 | Equipos con agentes internos de pricing o RGM | El agente necesita datos del canal que no ve | Canal agéntico realista | Baja |
| 6 | Agentes autónomos en la web abierta (Bazaar, registries MCP) | Costo de listarse casi nulo | Canal secundario; sin ingreso esperado | Muy baja [Data: US$5.000-11.000 por mes globales] |

**No son el primer cliente:** multinacionales (ya tienen NielsenIQ o Scanntech y licitan) y software de pricing global (busca cobertura amplia).

## Criterios explícitos de abandono

Umbrales propuestos por este análisis. **Pendiente (acción del equipo):** ratificar los umbrales propuestos en este documento antes de validar compradores. Cumplir un criterio de abandono significa detener la inversión en esa línea, no "seguir intentando".

Los criterios de compradores son etapas sucesivas, no contradictorias: día 7 de la demo, 2 compradores interesados y 1 que acepta pagar un lote ([14](./14-primeros-7-dias.md)); go/no-go del piloto, 2-3 compromisos escritos ([03](./03-prd-mvp.md)); K1, al menos 2 pilotos pagados al 2027-01-31.

K2 y el spike S3 ([15](./15-stack-tecnologico.md)) miden cosas distintas: **S3 es la puerta técnica antes del piloto** (100 tickets reales: ≥ 95 % de totales y ≥ 90 % de ítems correctos, 0 ítems inventados no detectados); **K2 es el criterio de abandono después de dos iteraciones** sobre una muestra mayor del piloto.

| ID | Criterio | Umbral propuesto | Qué se abandona |
|---|---|---|---|
| K1 | Compradores que pagan | Menos de **2 compradores con un piloto pagado en dinero** (no canje ni visibilidad) al **2027-01-31** | El wedge de comprador humano; sin otro comprador identificado, el proyecto |
| K2 | Calidad de extracción | Precisión **menor a 90% en los campos obligatorios** (comercio, fecha, total conciliado con el QR, producto y precio unitario) sobre al menos 200 tickets reales, después de dos iteraciones | Tickets como primer tipo de observación |
| K3 | Margen de contribución | **Margen negativo por lote entregable**, incluida la reserva de encargos incompletos, al precio que aceptan los compradores del piloto | El modelo económico; revisar precio o abandonar |
| K4 | Premisa del precio pagado | En una muestra de 200-500 tickets, la mediana de la diferencia entre precio pagado y precio de lista de SEPA del mismo día es **menor a 5%** en los productos objetivo | El marco "precio pagado"; queda solo disponibilidad |
| K5 | Cumplimiento de encargos (Modo B) | Menos de **70% de los encargos del piloto** alcanzan el umbral mínimo antes del vencimiento | Modo B en esa geografía |
| K6 | Oferta de contribuyentes | Sin **30 contribuyentes activos** en la primera geografía en 4 semanas con CAC de hasta US$3 | El canal de adquisición o la geografía |
| K7 | Canal agéntico abierto | **Cero compras de agentes externos** en 90 días desde el listado en registries | No se abandona el producto: el canal pasa a mantenimiento, sin inversión adicional |

## Brechas de datos

- **Voz del comprador:** ninguna cita directa de marca, distribuidor, agencia o consultora. Cerrar con al menos 5 entrevistas durante la semana de la demo ([14 — Primeros 7 días](./14-primeros-7-dias.md)) y 8-10 en total antes del piloto.
- **Custodia en Vangrid:** contrato de escrow o wallet operadora, sin documentación primaria.
- **Brecha lista vs. pagado:** no cuantificada. Es la premisa del marco (K4).
- **Cobertura del canal tradicional** de Scanntech y NielsenIQ en 2026: no publicada.
- **Disposición a pagar** por observación o por lote: ninguna fuente.
- **CAC de contribuyentes:** sin datos; toda la tabla es hipótesis.
- **Atributos del equipo fundador:** no aportados.
- **Competidores no verificados:** Pogo (no investigado), Scentia y Worldpanel (no reverificados).
- **Costo del facilitador x402 en mainnet** y del envío de recompensas.
- **Investigación profunda** sobre demanda agéntica y verificación: integrada el 2026-11-13 ([demanda-agentica-y-verificacion.md](../agent-data-marketplace/deep-research/demanda-agentica-y-verificacion.md)); sus brechas de demanda siguen abiertas.

## Entregables de posicionamiento

- [Documento de posicionamiento (Dunford 5+1)](../agent-data-marketplace/positioning/positioning-doc.md)
- [Declaraciones de posicionamiento](../agent-data-marketplace/positioning/positioning-statement.md)
- [Mapa de alternativas competitivas](../agent-data-marketplace/positioning/competitive-alternatives.md)
- [Análisis de categoría de mercado](../agent-data-marketplace/positioning/market-category-analysis.md)
- [Implicancias de mensaje](../agent-data-marketplace/positioning/messaging-implications.md)
- Investigación de competidores: [informe](../agent-data-marketplace/competitors-report.md), [matriz](../agent-data-marketplace/competitive-matrix.md), [panorama de precios](../agent-data-marketplace/pricing-landscape.md), [battle cards](../agent-data-marketplace/battle-cards/), [verificación](../agent-data-marketplace/verification-report.md)
- Producto y diseño: [03 — PRD del MVP](./03-prd-mvp.md), [04 — Arquitectura técnica](./04-arquitectura-tecnica.md), [16 — Seguridad, verificación y pagos](./16-modelo-seguridad-verificacion-pagos.md)

## Red Flags
- **Demanda no validada en ningún lado:** ni humana (cero entrevistas) ni agéntica (US$5.000-11.000 por mes globales).
- **Liderar con el mecanismo sería falso por omisión:** Vangrid ya lo opera.
- **La premisa central (brecha lista vs. pagado) no está medida.**

## Yellow Flags
- El vocabulario del producto (agentes, x402, stablecoins) no coincide con el del comprador; usarlo en la primera conversación con una marca juega en contra.
- Caída del consumo masivo en 2026 (-5,1% interanual en marzo; NOA "en plena crisis") presiona los presupuestos de investigación.
- Scanntech (Serie F de US$180M, 2026-10) puede cerrar el hueco del canal tradicional.
- El margen del caso base (~27%) es delgado: dos encargos fallidos de cada diez lo bajan a ~16%.

## Sources
- [`agent-data-marketplace/positioning/raw/alternative-mapping.md`](../agent-data-marketplace/positioning/raw/alternative-mapping.md), [`agent-data-marketplace/positioning/raw/market-categories.md`](../agent-data-marketplace/positioning/raw/market-categories.md)
- TRM Labs, "Who's actually paying" (2026-09-09): https://www.trmlabs.com/trm-tech-blog/whos-actually-paying-measuring-ai-agent-payments-onchain
- Scanntech, presentación El Foro 2024 (datos a febrero de 2024): https://cas.com.ar/wp-content/uploads/2024/04/PRESENTACION_SCANNTECH.pdf
- iProfesional, "un producto puede tener más de 5 precios" (2026-06-08): https://www.iprofesional.com/economia/456617-argentinos-sin-valores-de-referencia-un-producto-puede-tener-mas-de-5-precios-diferentes
- bemyeye, precios: https://content.bemyeye.com/pricing/
- Vangrid: https://crypto.news/vangrid-usdc-smartphone-scans-3d-models/
- RentAHuman: https://the-decoder.com/a-new-platform-lets-ai-agents-pay-humans-to-do-the-real-world-work-they-cant/
- Visa/Artemis vía Forkast: https://forkast.news/visa-artemis-the-0-14-reality-of-agent-commerce/
