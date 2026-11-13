# Demanda agéntica y verificación de observaciones del comercio físico

**Fecha de corte solicitada: 2026-11-12, Argentina.** Investigación de fuentes públicas iniciada el 2026-11-12; comprobaciones finales el 2026-11-13. Se conservan las fechas de las capturas originales y no se incorporan cifras de actividad posteriores al corte. Alcance: demanda, contratación de personas, verificabilidad, Argentina y compradores; no se repiten los perfiles de competidores asignados a otra investigación.

## Resumen ejecutivo

- [Data] **Liquidación x402 no equivale a demanda autónoma.** TRM estima que solamente entre 0,6% y 7,5% del valor previamente filtrado parece agéntico; su estimación mensual para 2026 es US$5.000–11.000, no millones mensuales de compradores autónomos. Son heurísticas, no identificación incontrovertible de agentes. [TRM, 2026-09-09](https://www.trmlabs.com/trm-tech-blog/whos-actually-paying-measuring-ai-agent-payments-onchain).
- [Data] **La contratación física por agentes ya tiene ejemplos, pero no una demanda recurrente demostrada para tickets argentinos.** WURK documenta una campaña física de volantes y el envío de 24 USDC para impresión, en una publicación del 2026-07-10. Es un experimento del proveedor, no una cohorte comercial independiente. [WURK](https://wurk.fun/blog/an-ai-agent-hired-a-human-for-a-real-world-task).
- [Data] **El espacio no está vacío.** Execution Market y Loopuman publican flujos de agentes que encargan trabajo humano y pagan en stablecoins; este último se posiciona expresamente sobre Celo. La existencia de documentación y demostraciones no acredita escala ni retención. [Execution Market, consulta 2026-11-12](https://docs.execution.market/for-agents/quickstart), [Loopuman, consulta 2026-11-12](https://loopuman.com/).
- [Data] **La oportunidad argentina está mejor definida como precio neto y cobertura faltante, no como “precios que nadie tiene”.** SEPA ya publica precios y promociones declaradas; MODO acredita reintegros en una cuenta bancaria y puede hacerlo después de la compra. [SEPA, consulta 2026-11-12](https://www.preciosclaros.gob.ar/index.html), [MODO, consulta 2026-11-12](https://www.modo.com.ar/ayuda/preguntas-frecuentes/Condiciones-de-una-promoci%C3%B3n).
- [Opinion] **Ninguna credencial aislada prueba el hecho económico completo.** QR fiscal, prueba TLS, identidad humana y procedencia de imagen responden preguntas distintas; no prueban conjuntamente propiedad del ticket, entrega, ausencia de devolución y reintegro efectivamente recibido. La matriz de la sección 3 evita vender esa garantía inexistente.
- [Data] **Hay compradores de la información subyacente, no evidencia pública equivalente de agentes comprándola autónomamente.** Auditorías CPG, software de ejecución comercial y series de inflación ya usan datos de precios y disponibilidad. [Repsly, consulta 2026-11-12](https://repsly-dev.readme.io/reference/retail-audits), [State Street/PriceStats, documento anterior a 2025-11-12: >12 meses](https://globalmarkets.statestreet.com/research/dam/public/docs/pricestats_product_sheet.pdf).
- [Data] **El costo alternativo digital es muy bajo.** Bright Data anuncia US$1,50 por mil registros de comercio electrónico al 2026-11-12; Gigwalk anuncia recompensas de US$3–100 o más por trabajo, no por SKU ni como tarifa al comprador. Son unidades diferentes. [Bright Data](https://brightdata.com/products/web-scraper/ecommerce), [Gigwalk](https://www.gigwalk.com/gigwalkers/).
- [Opinion] **Tesis recomendada:** validar primero un servicio B2B de observaciones específicas, con presupuesto y criterios de aceptación; usar agentes/x402 como canal adicional. No fundamentar el negocio en el volumen bruto del protocolo ni prometer que una foto convierte una compra en un hecho criptográficamente probado.

## Método, etiquetas y límites

[Data] Las etiquetas significan: **[Data]**, dato o afirmación documentada —incluye declaraciones del proveedor expresamente identificadas—; **[Estimate]**, cálculo o inferencia cuantitativa; **[Assumption]**, supuesto por validar; **[Opinion]**, interpretación o recomendación. Una declaración comercial marcada [Data] acredita que el proveedor la publica, no que haya sido auditada. Las cifras sin fecha de medición del emisor se presentan como **captura al 2026-11-12, sin fecha original**.

[Data] Se buscaron fuentes primarias, documentación, publicaciones académicas y fuentes oficiales argentinas. Los preprints se identifican como tales; no se reprodujeron sus análisis de cadena ni se hicieron pagos, altas o tareas reales. Se señalan **>12 meses** cuando la evidencia es anterior al 2025-11-12; una consulta reciente no rejuvenece una observación histórica. Las páginas sin fecha no permiten certificar antigüedad. No se usan previsiones de mercado como ventas realizadas.

[Opinion] “Todos los productos” debe leerse como **censo amplio de los encontrados en esta búsqueda**, no como garantía de exhaustividad mundial: aparecen servicios nuevos, nombres similares, prototipos y páginas no verificables. Las capacidades publicadas se separan de las entregas y pagos comprobados. La revisión legal es informativa, no un dictamen para lanzar una operación concreta.

## 1. Demanda real: cuánto se paga y qué compran los agentes

### 1.1 No confundir cuatro clases de evidencia

[Data] Quantecon —**Quantum Economics AI Lab, no QuantEcon.org**— propone distinguir actividad de protocolo, actividad económica independiente, pago ligado a un servicio y atribución de autonomía. Su nota v2.0 fue revisada el **2026-10-26**, con evidencia hasta **2026-07-31**; declara no generar nuevos datos on-chain, usar agentes para investigación/redacción y no tener revisión por pares. Por tanto, su lectura de Ling y de análisis comerciales **no constituye otra replicación independiente**. La URL histórica de “authenticity audit” redirige a esta nota. [Quantecon/QEN202601](https://www.quantecon.ai/qen/202601).

| Fuente y fecha | Resultado publicado | Qué permite concluir y qué no |
|---|---|---|
| [Data] TRM Labs, **2026-09-09**; acumulado desde mayo de 2025 | Aproximadamente **US$52,7 millones / 198,9 millones de liquidaciones**, en Base, Solana y Polygon; **US$25,62 millones** tras filtros; **0,6%–7,5%** de ese valor parece agéntico. | Excluye autopagos, flujos concentrados y vendedores con pocos compradores; luego exige patrones compatibles con agentes. Puede excluir negocios legítimos pequeños o agentes de precio fijo. No es una medición censal de autonomía. [Fuente](https://www.trmlabs.com/trm-tech-blog/whos-actually-paying-measuring-ai-agent-payments-onchain). |
| [Data] Ling, Zhou, Wu y Wang, preprint **2026-07-14**; ventana **2025-09-17–2026-06-23** | **136.708.672** liquidaciones en Base por **US$44.121.383,81**; **21,20%** del conteo es ficticio y **63,78%** interno a clústeres vinculados. El valor potencialmente independiente queda acotado entre **US$187.861,35** atribuibles a servicios identificables y **US$20.258.746,09** no demostrablemente fabricados. | **84,98% del conteo interno/ficticio no significa 84,98% del dinero falso.** La categoría interna no prueba fraude; el límite inferior no significa que solamente exista ese ingreso. Cobertura Base y atribución al catálogo limitan la conclusión; no se reprodujo el estudio. [Artículo y método](https://arxiv.org/html/2607.12575v1). |
| [Data] Chainalysis, **2026-06-03**; actividad hasta Q1 de 2026 | Más de **100 millones** de transacciones acumuladas en Base; operaciones de **US$1 o más representan 95% del valor**, frente a 49% al inicio de 2025. | Identifica interacción x402, no autonomía. Reconoce que PING y farming de memecoins impulsaron el crecimiento. Una transacción real puede comprar un incentivo especulativo, no una API útil. [Fuente](https://www.chainalysis.com/blog/x402-agentic-payments-adoption/). |
| [Data] Visa/Artemis, publicación **2026-07-14**; datos del informe hasta **2026-04-21** | Aproximadamente **US$15 millones ajustados / 109,6 millones de transacciones**, desde mayo de 2025. | Ajustado no equivale a agente autónomo identificado. Es otra ventana y otra metodología: no sumar ni promediar con TRM o Ling. [Visa](https://www.visa.com/en-us/thought-leadership/innovation/agentic-payments-from-the-ground-up). |
| [Data] agenteconomy.to, captura **2026-11-12 UTC** | **US$42.833.895** acumulados de x402; por separado, ACP registra **US$429.985.260** de valor bruto de trabajos. | La propia fuente advierte que no son ingresos, incluyen pruebas/infraestructura y **no se pueden sumar**: pueden superponerse y miden cosas distintas. [Fuente](https://agenteconomy.to/stats/how-much-money-do-ai-agents-move). |

[Estimate] La división de los totales ajustados publicados por Visa arroja aproximadamente **US$0,137 por transacción**, para su ventana hasta el 2026-04-21. Es un promedio calculado, no mediana ni precio de un servicio; no corresponde describir ese cociente como una fracción de centavo. [Totales de Visa](https://www.visa.com/en-us/thought-leadership/innovation/agentic-payments-from-the-ground-up).

[Opinion] La discrepancia entre mediciones es sustantiva, no un detalle que se resuelve eligiendo el número mayor: difieren cadenas, facilitadores, períodos, filtros y unidades. Un contrato puede liquidar dinero genuino sin que exista comprador independiente, entrega útil ni decisión de un modelo. El mercado direccionable de esta startup no se obtiene multiplicando llamadas x402 por un porcentaje arbitrario.

### 1.2 Repetición y categorías: evidencia mucho más limitada

[Data] En una lectura de x402scan realizada el **2026-11-09**, Commit contó **US$361.174** en siete días. Para su muestra de vendedores, definió recurrencia como una wallet comprando en al menos dos de las cuatro semanas previas, descontando ciertos receptores y transferencias grandes: **73,5%** del volumen semanal fue a vendedores sin wallet recurrente identificada; **17,5%**, a vendedores con dos o más. Hay cobertura incompleta y las wallets no equivalen a clientes independientes; también cuentan scripts. [Medición primaria de Commit](https://getcommit.dev/x402/).

[Data] La auditoría de Fetchgate del **2026-10-04** registra **27.681 recursos**, **770.183 llamadas** en treinta días y un proxy de valor de **US$19.008 / aproximadamente US$634 diarios**. Lo calcula con contadores del catálogo y precios anunciados: **no es ingreso auditado** ni todo x402. Un solo endpoint de análisis de tokens, Q-Verdict, concentraba **40% de las llamadas**; la mediana era **una llamada por recurso**. No demuestra repetición de compradores autónomos. [Auditoría de octubre](https://fetchgate.dev/blog/x402-bazaar-october-2026).

[Data] La auditoría anterior, del **2026-08-28**, describe un catálogo altamente concentrado, con precios mayoritariamente bajos y problemas de interoperabilidad. Su metodología declara que llamadas por precio listado es un proxy y que otros facilitadores quedan fuera. Los conteos de endpoints son **oferta descubierta**, no demanda. [Auditoría y límites](https://fetchgate.dev/blog/x402-bazaar-audit-2026). Coinbase define Bazaar como catálogo público de servicios con pago, no como certificación de compradores o calidad. [Documentación actual, consulta 2026-11-12](https://docs.cdp.coinbase.com/x402/buyer/discover-services).

[Opinion] Las señales mejor documentadas corresponden a **análisis financiero/cripto, datos digitales, inferencia y servicios computacionales**, pero no hay una clasificación pública homogénea que cruce categoría, comprador independiente, repetición y entrega aceptada. “API” tampoco es una categoría económica: una API puede devolver datos, ejecutar cómputo o mover dinero. No es defendible afirmar que **comprar datos es el uso dominante** por ingresos comerciales recurrentes de agentes.

**BRECHA DE DATOS — [Data]** No se encontró una tabla auditada de retención por categoría de recursos, con compradores independientes y eliminación de autopagos, pruebas e incentivos, al 2026-11-12. Tampoco se encontró gasto recurrente verificable en precios físicos o tickets argentinos.

### 1.3 ¿Existen compras de datos o acciones físicas?

[Data] **Sí existe evidencia de al menos un flujo físico documentado por su proveedor:** WURK describe que un agente publicó, seleccionó y coordinó un trabajo de impresión/distribución de volantes, financió la tarea por x402 y pagó gastos en USDC; recibió fotos y videos del resultado. Publicación **2026-07-10**. Es evidencia de viabilidad y de una transacción narrada por el proveedor, **no prueba independiente de compras recurrentes de observaciones comerciales**. [Caso WURK](https://wurk.fun/blog/an-ai-agent-hired-a-human-for-a-real-world-task).

[Data] La infraestructura local tampoco es sólo hipotética: Celo anunció soporte de **wARS, wBRL y wCOP el 2026-09-17** en su facilitador nativo. Esto reduce fricción de moneda, pero no demuestra demanda argentina ni que el token tenga el mismo riesgo que una stablecoin en dólares. [Anuncio de Celo Core Co.](https://blog.celo.org/celo-becomes-the-first-chain-to-support-local-currency-agentic-payments-with-ripios-wars-wbrl-2eb72540c91e).

[Data] El facilitador x402 verifica y liquida el **pago**; no certifica un ticket, un relevamiento ni el cumplimiento del encargo. No proporciona por sí mismo custodia o arbitraje de calidad. [Protocolo, consulta 2026-11-12](https://github.com/x402-foundation/x402/blob/main/docs/core-concepts/facilitator.md).

## 2. Agentes que encargan y pagan trabajo humano físico

### 2.1 Productos directamente comparables

[Data] Salvo fecha específica, el estado siguiente corresponde a **documentación pública consultada el 2026-11-12, sin fecha original**. “Publicado” significa que se encontró una interfaz o descripción; no se probó su ejecución. **Sin tracción verificada** significa ausencia de prueba pública suficiente en esta investigación, no ausencia demostrada de clientes.

| Producto | Publicación, verificación y pago | Tracción y limitaciones observadas |
|---|---|---|
| **RentAHuman.ai** | [Data] API/MCP: búsqueda, bounty, aceptación, evidencia y aprobación; fondos reservados y flujo de escrow con Stripe Connect. La liberación ordinaria exige reconocimiento explícito y revisión de evidencia; no debe presentarse como autonomía sin controles. [Documentación](https://rentahuman.ai/docs), [escrow, publicación 2026-04-25; fecha comprobada 2026-11-13](https://rentahuman.ai/blog/escrow-payments-how-rentahuman-protects-ai-transactions). | [Data] El estudio académico de febrero confirma publicaciones programáticas, no volumen comercial auditado. Las condiciones actuales no garantizan la calidad del trabajo ni verifican a todas las personas. [Términos, consulta 2026-11-12](https://rentahuman.ai/terms). |
| **Execution Market** | [Data] MCP/REST/A2A; evidencia tipada —incluye foto geolocalizada y recibo—, revisión y pago USDC. La guía precisa que el escrow EVM se bloquea **al asignar**, no al publicar. [Guía](https://docs.execution.market/for-agents/quickstart). | [Data] Publica una prueba E2E en Base mainnet del **2026-02-13**; una prueba del equipo no es un cliente independiente. El sitio reconoce casos que requieren revisión manual y que vencer la ventana no garantiza pago. [Prueba del operador](https://gist.github.com/0xultravioleta/b2680a2f52143f867f63e0c0b6dbbb80), [sitio](https://execution.market/). |
| **Loopuman** | [Data] API/MCP y canales de mensajería; encargo de presencia física/datos, revisión del solicitante y pago en Celo. Al 2026-11-12 publica **20%** de comisión y retiro mínimo de **US$1**. [Flujo](https://loopuman.com/microtasks), [aplicación](https://app.loopuman.com/). | [Data] Dice que su primer encargo creado por agente se completó el **2026-10-09**, sin auditoría independiente de repetición. Hay una **inconsistencia documental**: portada afirma escrow on-chain, pero la página de seguridad lo muestra como próximo. No asumir arquitectura no custodial resuelta. [Portada](https://loopuman.com/), [escrow](https://loopuman.com/trust-safety/escrow). |
| **human.menu** | [Data] API/MCP: tareas, entregas y desbloqueo pagado x402 con USDC en Base. La reputación y metadata preceden al pago; bloquear el contenido evita entrega gratuita, no prueba que sea verdadero. [API](https://human.menu/docs). | [Data] Captura al **2026-11-12**: **US$0,33 pagados / siete entregas**, una tarea abierta de señalización presencial en Nueva York. Es un contador del operador, no una auditoría; señala escala mínima, no adopción masiva. [Tablero](https://human.menu/tasks/open). |
| **WURK** | [Data] x402/USDC en Solana y Base, API y MCP; microtrabajos y contratación con selección/chat, fondos y revisión según modalidad. No todos los premios son pagos por respuesta garantizada. [Desarrolladores](https://wurk.fun/developer). | [Data] Al **2026-11-12**, anuncia más de **tres millones** de microtrabajos acumulados; el agregado incluye campañas sociales y trabajo no agéntico. No equivale a tareas físicas ni a compradores recurrentes de datos. Existe el caso físico de julio descrito arriba. [Sitio](https://wurk.fun/). |
| **Open Bounty** | [Data] API; quórum de dos revisores concordantes, luego pago x402 y desbloqueo. **No prefinancia**: aprobación no garantiza pago. El ejemplo público de pago identifica **Base Sepolia**, no mainnet. [Flujo y advertencias](https://www.openbounty.app/). | [Data] Contadores sin valores verificables en la página consultada y ejemplos expresamente ilustrativos. Sin evidencia suficiente de volumen o pagos comerciales mainnet. |
| **GetterDone** | [Data] API/MCP: admite explícitamente fotos de locales, auditorías de góndolas y verificación presencial; autorización del dueño, fondos asegurados y aprobación. Paga al trabajador mediante Stripe Connect; puede haber retenciones antifraude. [API y controles](https://getterdone.ai/docs/api). | [Data] Documentación específica del caso de uso; no se halló volumen público auditado de trabajos físicos o compradores recurrentes. No se verificó disponibilidad operativa para trabajadores argentinos. |
| **MeatLayer** | [Data] API/MCP para entregas, fotografía, inspección y diligencias; tarjeta con Stripe, fondos retenidos y aprobación/rechazo de pruebas. [Integración](https://app.meatlayer.ai/integrate), [REST](https://meatlayer.ai/integrate.html). | [Data] Se verifica interfaz publicada, no GMV ni retención. La evidencia encontrada no justifica contar una lista de espera como actividad paga. |
| **RentHuman.com** —distinto de RentAHuman.ai— | [Data] API/MCP, fotos, confirmación y pago USDC/Solana. Al 2026-11-12 anuncia **5%** de comisión. Aunque usa “trustless”, describe custodia en una **hot wallet de la plataforma**; una insignia opcional se obtiene pagando, no equivale a prueba de presencia. [Funcionamiento](https://renthuman.com/how-it-works). | [Data] Sin volumen independiente verificado; las afirmaciones de custodia y verificación requieren diligencia técnica antes de confiar fondos. |
| **Haas.my** | [Data] MCP/REST, búsqueda por ubicación, bounty, reserva y `validate_task` para liberar fondos vía Stripe. La validación es una acción del agente/solicitante, no prueba física universal. [MCP](https://haas.my/mcp). | [Data] Integración pública documentada; sin pagos físicos o compradores recurrentes auditados encontrados. |

### 2.2 Otras implementaciones y protocolos encontrados

| Servicio | Evidencia y separación entre capacidad y adopción |
|---|---|
| **Humann.Capital / Agentt.Capital** | [Data] API, criterios manuales/schema/predicados y aprobación que libera USDC vía Coinbase CDP; al 2026-11-12 publica reparto **80% trabajador / 20% plataforma**. Que un JSON cumpla un schema no prueba la realidad observada. [API](https://www.humann.capital/docs). |
| **WorkingFor.AI** | [Data] MCP/API para trabajo físico y Stripe Checkout/escrow; comisión anunciada **10%** al 2026-11-12. Sin tracción de pagos físicos verificada. [Documentación](https://www.workingfor.ai/docs). |
| **requesthuman.ai** | [Data] Publicación MCP/API, entrega de pruebas y aprobación. Captura **2026-11-12: cero tareas y US$0 disponible** en la portada; no se verifica un mercado pago por el solo hecho de existir el endpoint. [Sitio](https://requesthuman.ai/). |
| **Humans2AI** | [Data] Referencia API anuncia ciclo de tareas, aprobación/disputa y saldo **$A9token**, no una stablecoin. La página actual carga la documentación dinámicamente; no se verificó conversión, pagos realizados ni demanda física. [Referencia](https://www.humans2ai.com/docs/api/reference). |
| **h402** | [Data] Se anuncia como protocolo de descubrimiento, verificación humana, tareas y pago compatible con x402. El contenido fue encontrado en el índice del buscador, pero la apertura directa falló por timeout el **2026-11-12**: **no se valida aquí implementación ni disponibilidad**. [Página primaria](https://h402.dev/). |
| **AskForAHuman** | [Data] Anuncia API/MCP, tareas con ubicación, escrow y USDC/tarjeta; no se corroboró su número de personas verificadas ni volumen pagado. [Sitio](https://askforahuman.com/). |
| **workman.rent** | [Data] Anuncia identidad Didit y tareas físicas; reconoce que el split USDC/Base permanece en **testnet hasta auditoría y otras autorizaciones**. No contar como red mainnet operativa. [Estado publicado](https://workman.rent/). |
| **Mundane** | [Data] Encargos físicos con prueba y escrow; el propio sitio se identifica como **prototipo v0.1** y sus cifras son ilustrativas. [Página](https://mundane.market/pricing). |
| **HumanAPI.fun / thehumanapi.com** | [Data] Son nombres distintos: el primero anuncia tareas físicas y SOL —respondió HTTP 402 en la apertura—; el segundo ofrece datos para IA y sus términos remuneran grabaciones aceptadas, incluso en activos digitales. Ninguno acredita por sí mismo una red de auditoría minorista recurrente. No confundir con Human API de datos médicos. [HumanAPI.fun](https://humanapi.fun/), [Human API Technologies](https://thehumanapi.com/terms-of-service). |
| **Nightshift** | [Data] Describe API/MCP y trabajos físicos/digitales con evidencia y escrow. Sin volumen comercial físico o contratación autónoma corroborados. [Sitio](https://www.nightshift-agi.com/). |

### 2.3 Infraestructura existente que un agente podría consumir, sin ser demanda agéntica probada

| Plataforma | Qué existe | Verificación, pago y límites |
|---|---|---|
| **Payman AI** | [Data] Sus términos, actualizados **2026-11-04**, mantienen la descripción de agentes que pagan a personas/empresas mediante API. Su propuesta comercial actual se concentra en agentes bancarios bajo control de instituciones. [Términos](https://paymanai.com/terms-of-use), [sitio](https://paymanai.com/). | [Data] Es infraestructura de pagos; no se encontró prueba de una red propia actual de recolectores físicos, validación de tickets ni volumen de encargos de campo. Un pago a una persona no acredita qué hizo. |
| **Premise** | [Data] Ya remunera relevamientos de precios y disponibilidad. Su página comercial anuncia **seis millones de contribuidores y más de cien millones de tareas** al 2026-11-12, **sin fecha original**: son acumulados autodeclarados, no agentes compradores activos. [Escala anunciada](https://premise.com/why-premise/). | [Data] Usa control de calidad y revisión humana; paga según país mediante PayPal, Payoneer o bitcoin. Una descripción de API para acceso a datos es de **2019 (>12 meses)**; no confirma una API pública actual para que un agente lance y financie campañas sin contrato. [API histórica](https://premise.com/blog/getting-started-with-hyperlocal-data-collection/), [pagos](https://contributors.premise.com/). |
| **Field Agent** | [Data] Auditorías, precios, góndolas, compras y pruebas de producto; el documento de integración permite crear/lanzar trabajos y recuperar resultados, pero es de **2017 (>12 meses)**. [API histórica](https://info.fieldagent.net/hubfs/Website_New/Partnerships/API_Integrations_OnePager_7.12.pdf). | [Data] Revisión de entregas y recompensas; compras pueden requerir adelantar dinero y tener reintegro parcial o total. No se halló flujo público actualizado de agentes autónomos pagando trabajo físico. [Guía actual, consulta 2026-11-12](https://support.fieldagent.net/hc/en-us/articles/360004054573-Navigating-the-App-Reserving-Jobs). |
| **Gigwalk** | [Data] Publica oferta específica para software/IA con API/webhooks y datos de POI, imágenes y video. Usa ubicación, fecha/hora y revisión de fotos. [Software & AI](https://www.gigwalk.com/software-and-ai/). | [Data] Paga por PayPal tras aceptación. La disponibilidad de integración empresarial no prueba una red abierta sin cuenta ni compras autónomas; el contrato comercial sigue siendo relevante. [Términos](https://www.gigwalk.com/terms-of-service/). |
| **Amazon Mechanical Turk** | [Data] `CreateHIT` y `ApproveAssignment` permiten publicar y pagar tareas programáticamente. Aprobar descuenta recompensa y comisiones del saldo del solicitante. [Crear tareas](https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMechanicalTurkRequester/mturk-creating-hits.html), [pagar](https://docs.aws.amazon.com/boto3/latest/reference/services/mturk/client/approve_assignment.html). | [Data] Hay precedente físico: Cavallo reclutó mediante MTurk, Elance y Upwork para relevamientos en tiendas, según publicación de la AEA de **2016-12-28 (>12 meses)**. No es evidencia de un LLM comprador autónomo ni de pagos x402. [AEA](https://www.aeaweb.org/research/online-offline-price-differences). |

[Data] Una API genérica de **human-in-the-loop** puede limitarse a pausar una ejecución para que una persona conocida apruebe o responda. Por ejemplo, `interrupt` de LangGraph no recluta una fuerza laboral, no verifica presencia y no paga. No corresponde sumar estas instalaciones al mercado de agentes que contratan personas. [Referencia oficial, consulta 2026-11-12](https://reference.langchain.com/python/langgraph/types/interrupt).

### 2.4 Tracción: el embudo que falta

[Data] El preprint **2026-02-23** sobre RentAHuman estudió **303 bounties del 2026-02-05 al 2026-02-20**, de los cuales **99 —32,7%—** provenían de API/MCP. Pero **35 de 37** marcados “completed” tenían cero plazas cubiertas; el investigador hizo una prueba y no cobró. El trabajo también presenta inconsistencias entre algunos totales de aplicaciones y denominadores geográficos: se conserva el hallazgo cualitativo y no se extrapolan esas tasas. No se reprodujo su base. [Estudio y tablas](https://arxiv.org/html/2602.19514v1).

[Opinion] La métrica decisiva es **encargos financiados → asignados → aceptados → pagados → recompra del comprador independiente**. Personas registradas, visitas, postulaciones y tareas publicadas pueden crecer sin que se cierre ese ciclo. Prefinanciar protege mejor al colaborador que retener el archivo hasta que un agente decida pagar, aunque aumenta complejidad de custodia y disputas.

**BRECHA DE DATOS — [Data]** No se encontró una serie comparable de GMV neto, trabajos físicos aceptados, pagos efectivamente cobrados y retención por empresa/agente para estas plataformas. No se hicieron pruebas de disponibilidad de trabajadores en Argentina ni de liquidación/retiro local.

## 3. Verificación de observaciones físicas: qué se puede demostrar

### 3.1 La afirmación debe descomponerse antes de elegir tecnología

| Evidencia / tecnología | Qué respalda | Qué no prueba |
|---|---|---|
| **Foto o PDF de ticket + OCR** | [Opinion] Permite extraer texto, contrastar sumas, formatos y productos; con revisión puede generar una observación útil. | [Opinion] OCR no autentica el papel ni al comprador. Puede ser foto repetida, ticket ajeno, montaje, compra devuelta o texto sintético; un detector de IA no constituye garantía. |
| **QR fiscal ARCA + constatación oficial** | [Data] El QR contiene datos de cabecera: fecha, CUIT emisor, punto de venta, tipo/número, total, moneda, autorización y, cuando corresponde, documento del receptor. Permite consultar al emisor/organismo correcto. [Especificación, publicada antes de 2025-11-12: >12 meses](https://www.afip.gob.ar/fe/qr/documentos/QRespecificaciones.pdf), [constatación actual](https://serviciosweb.arca.gob.ar/genericos/comprobantes/Default.aspx). | [Opinion] Decodificar el QR no equivale a consultar su validez; el payload no incluye renglones ni reintegros bancarios. Un QR válido puede copiarse sobre una foto alterada. No acredita quién aportó el ticket, entrega, pago final ni ausencia de devolución. |
| **zkTLS / TLSNotary sobre portal comercial o bancario** | [Data] Autentica datos provenientes del dominio y permite revelación selectiva, bajo el modelo de notario/verificador. El proyecto distingue integridad/procedencia y confianza en el origen. [FAQ, consulta 2026-11-12](https://tlsnotary.org/docs/faq/). | [Opinion] Prueba lo que el servidor respondió, no la realidad independiente del servidor. Si la fuente muestra “emitido” y no “pagado”, no demuestra cobro; una instantánea no prueba que después no hubiera cancelación. |
| **Reclaim** | [Data] Proveedores y configuraciones señalan sitio, login y ubicación de los datos; hay que verificar campos y versión esperados, no sólo aceptar que una prueba tenga firma. [Providers](https://docs.reclaimprotocol.org/wtf-are-providers), [verificación de reportes](https://letters.reclaimprotocol.org/how-to-verify). | [Opinion] No crea datos que el portal no ofrece, ni vuelve verdaderos datos incorrectos del emisor. Cobertura ARCA/bancos/supermercados debe comprobarse por proveedor y campo; no se verificó un conector argentino de punta a punta. |
| **C2PA / Content Credentials** | [Data] Firma procedencia e historial, y permite detectar cambios respecto del contenido vinculado. El estándar aclara que procedencia no decide si la escena es verdadera, precisa o factual. [Explainer 2.2, evidencia >12 meses; consulta 2026-11-12](https://c2pa.org/specifications/specifications/2.2/explainer/Explainer.html). | [Opinion] Una cámara puede fotografiar un ticket falso, una pantalla o una escena preparada. Firma válida no significa local, fecha física o precio verdadero; ausencia de credenciales tampoco demuestra falsedad. |
| **Proofmode** | [Data] Captura y comparte medios con metadata en un paquete verificable; su sistema incluye herramientas de captura, verificación y atestación de dispositivo. [Producto actual](https://proofmode.org/about), [folleto anterior a 2025-11-12: >12 meses](https://proofmode.org/docs/ProofmodeBrochure.pdf). | [Opinion] Refuerza cadena de custodia, no convierte automáticamente sensores ni GPS en una fuente incorruptible. Requiere confiar en dispositivo, captura y contexto; una firma sobre un archivo no prueba el hecho económico. |
| **World ID / World AgentKit** | [Data] Prueba que el agente tiene un humano único detrás y permite políticas contra Sybil. Fue anunciado el **2026-03-17**; una persona puede delegar a varios agentes. [Anuncio](https://world.org/blog/announcements/now-available-agentkit-proof-of-human-for-the-agentic-web). | [Opinion] No acredita una compra ni la ubicación de su titular. Una persona auténtica puede presentar prueba falsa o colaborar con otras. No confundir este AgentKit con otros productos de igual nombre. |

[Data] **Precisión importante sobre ARCA:** “el QR no contiene ítems” no significa “ARCA nunca tiene ítems”. Existe WSMTXCA, un servicio con detalle de artículos y consulta de comprobantes, con autenticación y alcance propio; eso no convierte el QR público en una API universal para descargar todos los productos de cualquier ticket. [Manual oficial, documento anterior a 2025-11-12: >12 meses](https://www.afip.gob.ar/fe/ayuda/documentos/Web-Service-MTXCA.pdf).

[Data] **Riesgo de documentación desactualizada:** al 2026-11-12, el repositorio público `worldcoin/agentkit` informa archivo desde el **2026-10-20**, y el enlace antiguo `docs.world.org/agents/agent-kit` respondió 404. World aún describe AgentKit en documentación de octubre. Esto requiere verificar el producto y ruta actuales; **no prueba que World ID haya dejado de funcionar**. [Repositorio](https://github.com/worldcoin/agentkit), [glosario actualizado 2026-10-05](https://support.world.org/hc/en-us/articles/55499230057107-Glossary-of-Terms).

### 3.2 Precio realmente pagado: requiere reconciliar dos fuentes

[Opinion] Deben separarse **precio de góndola**, **precio facturado tras descuentos del comercio**, **cargo del medio de pago** y **costo neto tras reintegros acreditados**. No son sinónimos. Para el neto se necesita enlazar ticket y movimiento financiero, y posteriormente reconocer reversos/devoluciones. La documentación de MODO que explica la acreditación posterior motiva esta distinción; no valida por sí sola ningún método de enlace. [MODO](https://www.modo.com.ar/ayuda/preguntas-frecuentes/Condiciones-de-una-promoci%C3%B3n).

[Assumption] Un contrato de dato útil podría conservar `gross_total`, `merchant_discount`, `bank_cashback_expected`, `bank_cashback_confirmed`, `refund_status`, moneda y fechas de observación/acreditación. Se marcaría un neto como **estimado** hasta constatar la devolución. La distribución de un reintegro de canasta entre SKU —proporcional, por elegibilidad u otra regla— es una **convención analítica**, no un precio unitario observado directamente.

[Opinion] Para góndola/disponibilidad, una evidencia defendible combina captura dentro del flujo, desafío reciente, contexto del local, barcode, timestamp, ubicación con incertidumbre, detección de duplicados y muestreo independiente. Sirve para reducir fraude y expresar confianza, no para prometer certeza absoluta. Observar un estante vacío tampoco prueba ausencia en depósito ni imposibilidad de comprar por otro canal.

[Data] Los operadores reales siguen recurriendo a revisión: Premise describe rechazos por fotos sin contexto, ubicación simulada y objetos manipulados, y reconoce errores humanos con posibilidad de apelación. Publicación **2024 (>12 meses)**, consultada el 2026-11-12. [Política operativa de calidad](https://contributors.premise.com/blog/navigating-challenges-task-rejection/).

[Data] Open Prices documenta límites concretos de deduplicación: detectar una copia exacta no equivale a detectar otra foto del mismo recibo o la misma imagen aportada por otro usuario. Esto ilustra por qué la integridad del archivo no resuelve la unicidad del hecho. **Documentación s/f, comprobada el 2026-11-13; sin cifra de actividad posterior al corte.** [Calidad de datos](https://openfoodfacts.github.io/open-prices/topics/data-quality/).

[Data] La frontera técnica incluye percepción continua: IoTeX presenta Trio como sistema para interpretar cámaras y operaciones físicas, en publicación del **2026-06-19**. Es capacidad de percepción/decisión, **no una prueba criptográfica de que la cámara muestre una compra real** ni evidencia de precisión validada sobre tickets argentinos. [Trio](https://iotex.io/blog/introducing-trio-a-world-model-for-physical-operations/).

### 3.3 El pago también puede fallar aunque la observación sea buena

[Data] Ling y colaboradores, preprint inicial del **2026-05-29**, documentan sustitución entre recursos, duplicación por concurrencia y problemas de autorización/liquidación en implementaciones x402. Los hallazgos fueron divulgados a proveedores; **no se afirma que sigan abiertos hoy**. La implicación es que pagar, servir y aceptar son estados diferentes. [Estudio de seguridad](https://arxiv.org/abs/2605.30998).

[Opinion] Una comisión asincrónica necesita un identificador de encargo, condiciones de aceptación, presupuesto reservado, vencimiento, apelación y reglas de devolución. No basta con poner un 402 delante de una petición que tarda días. El sistema debería separar evidencia aceptada, obligación de pago y liquidación final, con prevención de doble recompensa y sin exponer datos personales en la cadena.

**BRECHA DE DATOS — [Data]** No se encontró un benchmark público del falso positivo/falso negativo y costo total por ticket argentino que combine OCR, ARCA, prueba TLS de reintegro, duplicados, devoluciones y revisión humana. Tampoco una garantía general de presencia física resistente a colusión y cámaras comprometidas.

## 4. Argentina: datos públicos, precio neto y protección de datos

### 4.1 Qué cubre SEPA y dónde está el vacío

[Data] Según la documentación oficial consultada el **2026-11-12**, SEPA recibe diariamente precios por punto de venta de grandes comercios; la participación de pequeños y medianos es voluntaria. Publica lista y hasta dos promociones elegidas por el comercio; **no todas las promociones existentes**. Advierte que disponibilidad está sujeta a stock y admite reclamos por diferencias con góndola. Esto sustenta una brecha de cobertura y verificación, **no cuantifica cuánto falta en Jujuy/NOA**. [SEPA](https://www.preciosclaros.gob.ar/index.html).

[Data] La propia plataforma indica que los datos provienen de comercios y se publican como se reciben, y que el Estado no responde por su veracidad. Es una fuente competidora/substituta útil y gratuita, no una constatación independiente de cada transacción. [Condiciones de Precios Claros, consulta 2026-11-12](https://www.preciosclaros.gob.ar/).

[Opinion] No afirmar que SEPA “no tiene promociones” ni que sus datos sean inútiles: ese argumento sería falso. El diferencial que queda por probar es **valor adicional** de comercios no cubiertos, frescura intradía, validación presencial, promociones omitidas y neto acreditado al consumidor.

### 4.2 MODO y Cuenta DNI: beneficio anunciado frente a acreditación efectiva

[Data] MODO describe condiciones por banco, tarjeta, comercio, día, tope y acreditación; esta puede ser inmediata o hasta **sesenta días** según promoción. Los topes pueden depender del usuario o del banco. Los números de ejemplo de la ayuda no son promociones vigentes. [Condiciones](https://www.modo.com.ar/ayuda/preguntas-frecuentes/Condiciones-de-una-promoci%C3%B3n), [topes](https://www.modo.com.ar/ayuda/preguntas-frecuentes/Qu%C3%A9-es-el-tope-de-reintegro), consulta **2026-11-12**.

[Data] Banco Provincia explica que cobrar con Cuenta DNI Comercios puede generar reintegros en la billetera del comprador si corresponde. Una condición oficial de una campaña del **2026-02-15 al 2026-02-28** indica acreditación en los movimientos de cuenta dentro de **diez días hábiles**. Es evidencia del mecanismo, **no una promo vigente en noviembre**. [FAQ de comercios](https://www.bancoprovincia.com.ar/cuentadni/index?url=cdniComerciosFaq), [condiciones de febrero de 2026](https://mesumo.bancoprovincia.com.ar/gateway/cdn/mesumo_terminos_0032).

[Opinion] Un comprador con el mismo ticket puede tener distinto neto según elegibilidad y tope ya consumido. Inferir descuento a partir del calendario puede producir un **neto contrafáctico**, no observado. Es comercialmente más valioso mostrar neto confirmado y condiciones, pero también más invasivo y costoso de recolectar.

**BRECHA DE DATOS — [Data]** No se cuantificó la diferencia efectiva SEPA–góndola–ticket–neto bancario por SKU/comercio/geografía. No se obtuvo una grilla primaria completa y estable de promociones de noviembre de 2026; por ello no se extrapolan tasas o topes de otros meses.

### 4.3 Ley 25.326: agregación no es una excepción automática

[Data] La **Ley 25.326, sancionada el 2000-10-04 (>12 meses)**, en su texto actualizado consultado el 2026-11-12, exige datos pertinentes, finalidad compatible, consentimiento libre/expreso/informado cuando aplica e información previa; reconoce derechos y obligaciones de seguridad. La cesión requiere las condiciones del artículo 11; su excepción por disociación exige titulares **inidentificables**. Los datos sensibles tienen régimen especial; los artículos 21/24 regulan inscripción de bases. Nada autoriza sin más “vender tickets porque se pagó una recompensa”. [Texto actualizado, arts. 2, 4–11, 14–16 y 21–24](https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/actualizacion).

[Data] La AAIP, en sus criterios de **Resolución 4/2019 (>12 meses)**, considera la posibilidad de identificar mediante medidas/plazos desproporcionados o inviables. **Quitar nombre o hashear una wallet no demuestra disociación**: es necesario evaluar si el conjunto sigue haciendo identificable a una persona. [Resolución y anexo](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-4-2019-318874/texto), [anexo oficial](https://www.argentina.gob.ar/normativa/318874_res4AAIP_pdf/archivo).

[Data] La AAIP explica que alojamiento o procesamiento fuera del país puede constituir transferencia internacional y requiere considerar adecuación, excepciones o salvaguardas. Acceso desde un agente extranjero a datos identificables y uso de OCR/LLM en otra jurisdicción deben evaluarse, no ignorarse porque el pago sea on-chain. [Guía oficial de transferencias, publicada antes de 2025-11-12: >12 meses; consulta actual](https://www.argentina.gob.ar/transferencias-internacionales).

[Opinion] Diseño prudente por validar jurídicamente: consentimiento granular para captura, verificación y comercialización; retención limitada; separación de identidad/pago/evidencia; redacción de documentos, tarjetas y QR identificables antes de terceros; agregados con mínimos de grupo, ventanas y control de consultas por diferencia. Una compra singular en una localidad pequeña o un producto que revele salud pueden reidentificar sin nombre. **No publicar tickets ni vínculos de identidad en blockchain.**

[Assumption] Un marketplace global “sin cuenta” podría vender exclusivamente agregados que superen controles de divulgación. Exportar evidencia identificable requeriría una relación y base jurídica más estrictas; minimizar fricción de cobro no elimina obligaciones de privacidad. La suficiencia de consentimiento, disociación y contratos requiere asesoramiento argentino específico antes del piloto.

### 4.4 Recolección colaborativa local: antecedentes, no espacio virgen

- [Data] **TuPlayero** combina precios oficiales de combustibles y reportes de usuarios; dice validar rangos contra medianas provinciales y limitar reportes por dispositivo. Es recolección local colaborativa real como propuesta funcional; no prueba compra ni ofrece una cifra pública de observaciones aceptadas. [Fuentes, consulta 2026-11-12, sin fecha original](https://tuplayero.com/fuentes).
- [Data] **Changuito —Cordevs, `com.cordevs.bestprice`—** permite corregir el precio si difiere de góndola según su descripción en Google Play. Eso acredita captura/corrección en la experiencia de compra, **no confirma un mercado compartido de datos ni recompensas por evidencia**. [Ficha del desarrollador, consulta 2026-11-12](https://play.google.com/store/apps/details?hl=es&id=com.cordevs.bestprice).
- [Data] **Open Prices/Open Food Facts** recibe precios con foto de etiqueta o ticket, por web/API. El índice de países encontrado muestra Argentina, pero su página es dinámica y no se verificó un conteo reproducible. No se atribuye carácter local argentino al operador internacional ni se presenta como mercado pago. [Países, consulta 2026-11-12](https://prices.openfoodfacts.org/countries?filter=location_count_gte_1), [documentación s/f, comprobada 2026-11-13](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/product-prices/).
- [Data] El **piloto de precios crowdsourced del Banco Mundial** incluye un archivo argentino, actualizado el **2018-01-29 (>12 meses)**. Una conversión de formato posterior no significa una nueva ola de recolección. Es precedente de campo, no empresa activa ni demanda agéntica actual. [Archivo argentino](https://energydata.info/en/dataset/crowdsourced-price-data-collection-pilot/resource/e9362e88-33ef-4435-9c22-ec857684e425).

**BRECHA DE DATOS — [Data]** No se verificó un actor argentino que combine actualmente tickets itemizados, prueba del reintegro bancario efectivamente cobrado, recompensa estable y compradores autónomos recurrentes. Tampoco puede concluirse su inexistencia a partir de esta búsqueda. Pricely y otras interfaces de precios no deben clasificarse como crowdsourcing de compras sin evidencia de su mecanismo de aporte.

## 5. Compradores plausibles y precios de referencia

### 5.1 Quién podría pagar: separar necesidad de datos y adopción de agentes

| Comprador / agente plausible | Evidencia de necesidad | Encaje y obstáculo para esta propuesta |
|---|---|---|
| **Software de pricing / inteligencia comercial** | [Data] Price API vende datos de producto por fuente y momento, y Bright Data ofrece precios/disponibilidad de comercio electrónico. [Price API](https://www.priceapi.com/pricing), [Bright Data](https://brightdata.com/products/web-scraper/ecommerce), consulta **2026-11-12**. | [Assumption] Un agente podría comprar un chequeo físico cuando falte una celda crítica; no conviene enviar personas para replicar datos baratos disponibles online. Integración, normalización de SKU y SLA pueden importar más que el medio de pago. |
| **CPG: trade marketing, category management, distribuidores** | [Data] El API de Repsly exporta presencia, precio, promoción, participación de góndola, agotados y stock; es un contrato de datos directamente afín. [Retail audits, consulta 2026-11-12](https://repsly-dev.readme.io/reference/retail-audits). | [Assumption] Un agente de la marca podría financiar auditorías de excepciones o zonas sin promotor. Compite contra visitas propias, distribuidores y redes de auditoría ya contratadas, no contra “no tener datos”. |
| **Fondos macro/quant y analistas de inflación** | [Data] State Street ofrece PriceStats: scraping de precios online y series diarias con rezago de **tres días**, según ficha anterior a 2025-11-12 (**>12 meses**). [Ficha primaria](https://globalmarkets.statestreet.com/research/dam/public/docs/pricestats_product_sheet.pdf). | [Assumption] Hay posible valor en canales/geografías no cubiertos y cambios de promociones, pero necesitan continuidad, canasta, ponderaciones, calidad y derechos de uso. Un conjunto oportunista de tickets no es por sí solo un índice invertible. |
| **Retail media / medición de promociones** | [Data] NIQ describe que medir incrementabilidad exige integrar precios, promociones, distribución y ventas; IAB distingue medición cerrada de la simple conversión. [NIQ, publicación de 2026](https://nielseniq.com/global/en/insights/analysis/2026/retail-media-incrementality-measurement/), [IAB Europe, consulta 2026-11-12](https://iabeurope.eu/retail-media-glossary/). | [Assumption] Datos independientes pueden auditar ejecución o contexto; tickets anónimos agregados **no vinculan automáticamente exposición publicitaria con compra ni prueban causalidad**. Resolver identidad para atribución tensiona privacidad. |
| **Agencias de investigación y software de POI** | [Data] Gigwalk ofrece recolección por API de ubicaciones, imágenes y video; el comprador de campo ya existe. [Oferta Software & AI, consulta 2026-11-12](https://www.gigwalk.com/software-and-ai/). | [Assumption] Pueden comprar capacidad de última milla regional o revender resultados; exigirán criterios de muestreo, aceptabilidad y permisos. Una compra programática tras onboarding empresarial parece más plausible inicialmente que un agente anónimo global. |

[Opinion] El cliente económico inicial más plausible es **un equipo con una decisión y presupuesto existentes**, que utiliza un agente para operar el servicio. No hace falta que el agente sea un actor económico independiente. Esto mantiene abierta la tesis B2B aunque fracase la hipótesis de descubrimiento/pago completamente autónomo.

### 5.2 Benchmarks públicos: no mezclar unidades

| Referencia, fecha observada | Precio / unidad | Uso correcto del benchmark |
|---|---|---|
| [Data] Bright Data, **2026-11-12**, sin fecha original | **US$1,50 / 1.000 registros** pay-as-you-go; cobra entregas exitosas. | [Estimate] **US$0,0015 por registro digital**, calculado con la tarifa mostrada. No incluye visita, ticket de consumidor ni neto bancario. [Fuente](https://brightdata.com/products/web-scraper/ecommerce). |
| [Data] Price API, **2026-11-12**, sin fecha original | La tabla indexada publica **€99 / 5.000 créditos mensuales** y **€499 / 50.000**; un crédito permite una consulta simple de un producto en una fuente una vez. | [Estimate] Cuota/créditos incluidos: aproximadamente **€0,0198** y **€0,00998**, respectivamente; **no confundir con sobreconsumo**, requests premium ni uso parcial. La introducción de la página dice “desde €499”, inconsistente con Go de €99: confirmar oferta comercial. [Fuente](https://www.priceapi.com/pricing). |
| [Data] Gigwalk, **2026-11-12**, sin fecha original | **US$3–100 o más por Gig**, de minutos a horas. | Recompensa al trabajador, **no precio B2B**; un Gig puede incluir varios SKU/fotos y desplazamiento. Sin costo público comparable por observación aceptada. [Fuente](https://www.gigwalk.com/gigwalkers/). |
| [Data] RentAHuman, documentación **2026-11-12** | La API permite fijar encargos entre **US$1 y US$10.000**. | Límite aceptado por el endpoint, **no precio de mercado ni mediana**. No usarlo como disposición a pagar. [Fuente](https://rentahuman.ai/docs). |
| [Data] human.menu, captura **2026-11-12** | Tarea presencial de señalización anunciada a **0,01 USDC**. | Precio **pedido**, no costo laboral sostenible ni prueba de ejecución; la captura identifica una tarea abierta. [Fuente](https://human.menu/tasks/open). |
| [Data] WURK, documentación **2026-11-12** | Presets desde **US$0,02 por posición premiada**, según su descripción. | Es un premio de microtarea con selección, no una observación física garantizada ni un costo por respuesta. [Fuente](https://wurk.fun/). |

[Estimate] Para la hipótesis del intake, **US$1,50 comprador − US$0,75 colaborador − US$0,35 procesamiento = US$0,40** antes de adquisición, soporte, fraude, revisitas, retiros, reservas de disputas, impuestos y costos fijos: **26,7% del precio**, cálculo realizado el **2026-11-12**. Todos los importes son **supuestos internos**, no evidencia de mercado. Frente a US$0,0015 por registro digital, US$1,50 por observación es aproximadamente **mil veces más**, pero **no son bienes equivalentes**: sólo importa si la observación física cambia una decisión que el dato digital no resuelve.

[Assumption] Como ejercicio de sensibilidad, al **2026-11-12**, si se pagaran **US$0,75 por cada intento** y sólo se aceptara **80%**, la recompensa por observación aceptada sería **US$0,9375**; mantener US$0,35 de procesamiento por aceptada dejaría **US$0,2125** antes de otros costos. Si se remunera únicamente aceptación, el costo del intento fallido lo soporta la persona: puede deteriorar participación, selección y equidad. Este escenario no describe tasas reales.

### 5.3 Evidencia que contradice una necesidad universal de recolectar en persona

[Data] Cavallo encontró **72% de igualdad online/offline** en **38.383 observaciones / 56 comercios de diez países**; para Argentina, **60% en 3.699 observaciones de cinco comercios**. El trabajo cubre **2014–2016** y se publicó en **enero de 2017: >12 meses**. Además, los precios medios y patrones de cambio podían ser similares pese a diferencias por artículo. [Paper del autor, tabla 3](https://www.hbs.edu/ris/Publication%20Files/Cavallo_Alberto_J6_Are%20Online%20and%20Offline%20Prices%20Similar_2a1a63af-8938-4680-bb23-a850324b096a.pdf), [NBER](https://www.nber.org/papers/w22142).

[Opinion] Esto **debilita el argumento de sustituir todo scraping por personas**, no el de medir las excepciones. Es evidencia antigua y de grandes cadenas: no permite trasladar esos porcentajes a Argentina en 2026 ni resuelve reintegros bancarios personalizados. Pero PriceStats demuestra que una señal macro útil puede construirse sin observar el neto de cada consumidor.

**BRECHA DE DATOS — [Data]** No se halló una tarifa pública vigente y comparable de auditoría argentina por SKU/local/fecha **aceptado**, incluyendo traslado, control de calidad, fraude y reembolso. Tampoco una orden de compra pública de un fondo o marca para que sus agentes adquieran estos datos vía x402. Los compradores indicados son plausibles, no clientes confirmados.

## Implicancias para la tesis

### Qué la sostiene

1. [Opinion] **Existe una necesidad de información física:** presencia, agotados, ejecución promocional y precio neto pueden quedar fuera de un precio online. Los contratos de datos de auditoría ya demandan esas variables.
2. [Opinion] **La encargabilidad programática es viable:** APIs/MCP y casos físicos publicados reducen incertidumbre de integración. El diferencial puede estar en dato regional, aceptación y tiempo de respuesta, no en inventar una interfaz de pagos.
3. [Opinion] **La brecha argentina es concreta pero aún no cuantificada:** pequeños comercios, información declarada y reintegros posteriores permiten formular un producto más preciso que un agregador general de precios.
4. [Opinion] **La verificación puede ser graduada:** cabecera fiscal, renglones, evidencia del cargo/reintegro y captura se pueden combinar con diferentes niveles de confianza y precios, sin fingir una prueba única.

### Qué la debilita

1. [Data] Las métricas x402 disponibles **no prueban una gran base de agentes compradores independientes**; los filtros de TRM y Ling reducen sustancialmente la interpretación comercial de los conteos. Véanse fuentes de la sección 1.
2. [Opinion] **La novedad horizontal ya es baja:** múltiples proyectos ofrecen “agente contrata humano”, y varios incluyen x402, escrow y datos físicos. Eso no invalida un nicho argentino, pero elimina esa combinación como barrera suficiente.
3. [Opinion] **Datos convencionales tienen sustitutos baratos y redes existentes.** Cobrar por observación exige demostrar beneficio incremental, no sólo automatizar el checkout.
4. [Opinion] **La prueba del neto es operativamente difícil:** acreditación demorada, promociones personales, canastas, devoluciones y privacidad pueden consumir el margen. El ticket solo no entrega la promesa central.
5. [Opinion] **La liquidez puede ser local y no global:** una persona registrada en otro país no ayuda a cubrir una tienda específica en una franja horaria. Incentivar compras o comisionar relevamientos puede sesgar la muestra que luego se vendería como representativa.

### Decisión sugerida y prueba de falsación

[Opinion] Avanzar sólo como **hipótesis de servicio especializado B2B**, no como mercado ya validado por transacciones de infraestructura. Mantener dos productos separados: agregado reutilizable y encargo con tiempo de entrega; un presupuesto de tarea no es una compra instantánea de datos existentes.

[Assumption] Piloto propuesto, no ejecutado ni presupuesto autorizado: elegir una categoría y microzona; obtener de un comprador una pregunta que no resuelva con su fuente actual; contratar observaciones con fondos reservados y protocolo de aceptación; contrastar contra SEPA/web y medir costo por aceptada, tiempo, rechazo, cobertura, diferencia relevante y recompra sin subsidio. Definir antes del piloto qué mejora justifica pagar y qué resultado obliga a abandonar o cambiar el caso de uso.

[Opinion] **Principal evidencia desconfirmatoria:** el mercado medido de pagos no puede interpretarse como demanda agéntica independiente a escala, mientras que el costo alternativo de precios digitales es bajo y ya hay múltiples APIs de trabajo humano. La tesis necesitaría sobrevivir aun si x402 no atrae compradores por sí solo. La ausencia de pedidos recurrentes de observaciones físicas no demuestra que nunca existirán, pero hoy es una brecha central, no un detalle de ejecución.

## Brechas de datos

| Brecha explícita | Prueba que permitiría cerrarla |
|---|---|
| **BRECHA DE DATOS — [Data]** Autonomía y demanda real x402 no identificadas de forma censal. | Cohortes de operadores independientes, atribución consentida de agente/script/humano y evidencia de recurso aceptado. |
| **BRECHA DE DATOS — [Data]** No hay clasificación confiable de repetición por categoría de recurso. | Ventanas comparables, compradores deduplicados y retención por servicio, excluyendo tests e incentivos. |
| **BRECHA DE DATOS — [Data]** No se probaron compras recurrentes de tickets o góndolas argentinos por agentes. | Órdenes pagadas y recompra sin subsidio, con caso de decisión y responsable de presupuesto. |
| **BRECHA DE DATOS — [Data]** Estado comercial y cobertura local de varias APIs humanas desconocidos. | Prueba autorizada de asignación, entrega aceptada, retiro efectivo y recurrencia en Argentina. |
| **BRECHA DE DATOS — [Data]** Escrow y “verificación” tienen significados inconsistentes entre proveedores. | Contratos/implementaciones auditados, políticas de disputa y trazas de pago; resolver contradicciones como las de Loopuman y RentHuman. |
| **BRECHA DE DATOS — [Data]** No hay tamaño medido de la brecha SEPA–góndola–neto por geografía. | Muestra pareada y contemporánea de los mismos SKU/locales/fechas, con reintegro confirmado. |
| **BRECHA DE DATOS — [Data]** No se validaron proveedores zkTLS argentinos ni costo/precisión del pipeline. | Pruebas de fuente, parser, privacidad, devolución, duplicación y tasa de error con dataset consentido. |
| **BRECHA DE DATOS — [Data]** No hay presupuesto B2B confirmado ni costo completo por observación. | Cotizaciones comparables y piloto que contabilice adquisición, traslado, rechazos, fraude y soporte. |
| **BRECHA DE DATOS — [Data]** Representatividad estadística y reidentificación no evaluadas. | Diseño muestral y revisión jurídica/técnica del esquema de datos y de consultas antes de comercializar. |

## Fuentes

[Data] Fuentes utilizadas; salvo indicación diferente, consulta inicial **2026-11-12**, con comprobaciones finales **2026-11-13**. **s/f**: sin fecha editorial verificable. Fechas de estudio, publicación y captura no son intercambiables. Los enlaces documentan capacidades o afirmaciones del emisor, no necesariamente auditorías independientes.

### Demanda y medición

1. TRM Labs — *Who’s Actually Paying?*, **2026-09-09**: https://www.trmlabs.com/trm-tech-blog/whos-actually-paying-measuring-ai-agent-payments-onchain
2. Ling et al. — *How Agentic Is Agentic Commerce?*, preprint **2026-07-14**, ventana 2025-09-17–2026-06-23: https://arxiv.org/html/2607.12575v1
3. Chainalysis — *Inside x402*, **2026-06-03**: https://www.chainalysis.com/blog/x402-agentic-payments-adoption/
4. Visa/Artemis — *Agentic Payments from the Ground Up*, **2026-07-14**: https://www.visa.com/en-us/thought-leadership/innovation/agentic-payments-from-the-ground-up
5. agenteconomy.to — *How much money do AI agents actually move?*, captura **2026-11-12**: https://agenteconomy.to/stats/how-much-money-do-ai-agents-move
6. Yulin Liu/Quantum Economics AI Lab — QEN202601, **v2.0, 2026-10-26**, evidencia hasta 2026-07-31: https://www.quantecon.ai/qen/202601
7. Commit — medición propia, **2026-11-09**: https://getcommit.dev/x402/
8. Fetchgate — auditoría Bazaar, **2026-08-28**, actualización editorial 2026-10-04: https://fetchgate.dev/blog/x402-bazaar-audit-2026
9. Fetchgate — segunda auditoría, **2026-10-04**: https://fetchgate.dev/blog/x402-bazaar-october-2026
10. Coinbase — descubrimiento Bazaar, **s/f**: https://docs.cdp.coinbase.com/x402/buyer/discover-services
11. x402 Foundation — función del facilitador, **s/f**: https://github.com/x402-foundation/x402/blob/main/docs/core-concepts/facilitator.md
12. Celo Core Co. — soporte de monedas locales, **2026-09-17**: https://blog.celo.org/celo-becomes-the-first-chain-to-support-local-currency-agentic-payments-with-ripios-wars-wbrl-2eb72540c91e

### Trabajo humano e interfaces

13. RentAHuman — documentación, **s/f**: https://rentahuman.ai/docs
14. RentAHuman — escrow, **2026-04-25**, fecha comprobada 2026-11-13: https://rentahuman.ai/blog/escrow-payments-how-rentahuman-protects-ai-transactions
15. RentAHuman — términos, **2026, versión consultada**: https://rentahuman.ai/terms
16. Mehta y Deshkumar — estudio de RentAHuman, preprint **2026-02-23**: https://arxiv.org/html/2602.19514v1
17. Execution Market — guía de agentes, **s/f**: https://docs.execution.market/for-agents/quickstart
18. Execution Market — sitio y límites operativos, **s/f**: https://execution.market/
19. Execution Market/0xultravioleta — reporte E2E del operador, **2026-02-13**: https://gist.github.com/0xultravioleta/b2680a2f52143f867f63e0c0b6dbbb80
20. Loopuman — portada, **s/f**, primer encargo declarado 2026-10-09: https://loopuman.com/
21. Loopuman — microtareas, **s/f**: https://loopuman.com/microtasks
22. Loopuman — seguridad/escrow, **s/f**: https://loopuman.com/trust-safety/escrow
23. Loopuman — aplicación, **s/f**: https://app.loopuman.com/
24. human.menu — API, **s/f**, versión declarada 3.0: https://human.menu/docs
25. human.menu — tareas y contador, captura **2026-11-12**: https://human.menu/tasks/open
26. WURK — documentación, **s/f**: https://wurk.fun/developer
27. WURK — contadores y modalidades, captura **2026-11-12**: https://wurk.fun/
28. WURK — experimento físico, **2026-07-10**: https://wurk.fun/blog/an-ai-agent-hired-a-human-for-a-real-world-task
29. Open Bounty — quórum, pago y advertencias, **s/f**: https://www.openbounty.app/
30. GetterDone — API y pagos, **s/f**: https://getterdone.ai/docs/api
31. MeatLayer — MCP, **s/f**: https://app.meatlayer.ai/integrate
32. MeatLayer — REST, **s/f**: https://meatlayer.ai/integrate.html
33. RentHuman.com — funcionamiento y custodia, **s/f**: https://renthuman.com/how-it-works
34. Haas.my — MCP, **s/f**: https://haas.my/mcp
35. Humann.Capital — API, **s/f**: https://www.humann.capital/docs
36. WorkingFor.AI — documentación, **s/f**: https://www.workingfor.ai/docs
37. requesthuman — estado y flujo, captura **2026-11-12**: https://requesthuman.ai/
38. Humans2AI — referencia API, **s/f**, lectura parcial/dinámica: https://www.humans2ai.com/docs/api/reference
39. h402 — protocolo, **s/f**, contenido indexado; apertura con timeout: https://h402.dev/
40. AskForAHuman — oferta, **s/f**: https://askforahuman.com/
41. workman.rent — funcionamiento y límites de mainnet, **s/f**: https://workman.rent/
42. Mundane — prototipo, **s/f**: https://mundane.market/pricing
43. HumanAPI.fun — oferta indexada; apertura HTTP 402, **s/f**: https://humanapi.fun/
44. Human API Technologies — términos de datos/grabaciones, **2026, versión consultada**: https://thehumanapi.com/terms-of-service
45. Nightshift — oferta, **s/f**: https://www.nightshift-agi.com/
46. Payman — términos actualizados **2026-11-04**: https://paymanai.com/terms-of-use
47. Payman — posicionamiento actual, **s/f**: https://paymanai.com/
48. Premise — escala anunciada, **s/f**: https://premise.com/why-premise/
49. Premise — integración/datos, **2019: >12 meses**: https://premise.com/blog/getting-started-with-hyperlocal-data-collection/
50. Premise — pagos a colaboradores, **s/f**: https://contributors.premise.com/
51. Field Agent — API, **2017: >12 meses**: https://info.fieldagent.net/hubfs/Website_New/Partnerships/API_Integrations_OnePager_7.12.pdf
52. Field Agent — trabajos y reembolsos, **s/f**: https://support.fieldagent.net/hc/en-us/articles/360004054573-Navigating-the-App-Reserving-Jobs
53. Gigwalk — oferta Software & AI, **s/f**: https://www.gigwalk.com/software-and-ai/
54. Gigwalk — términos, **s/f**: https://www.gigwalk.com/terms-of-service/
55. AWS MTurk — crear HITs, **s/f**: https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMechanicalTurkRequester/mturk-creating-hits.html
56. AWS MTurk — aprobación y pago, **s/f**: https://docs.aws.amazon.com/boto3/latest/reference/services/mturk/client/approve_assignment.html
57. AEA — investigación de Cavallo y reclutamiento de campo, **2016-12-28: >12 meses**: https://www.aeaweb.org/research/online-offline-price-differences
58. LangChain — `interrupt`, **s/f**: https://reference.langchain.com/python/langgraph/types/interrupt

### Pruebas, privacidad y Argentina

59. ARCA — QR, especificaciones con ejemplos **2020–2021: >12 meses**: https://www.afip.gob.ar/fe/qr/documentos/QRespecificaciones.pdf
60. ARCA — constatación de comprobantes, **s/f**: https://serviciosweb.arca.gob.ar/genericos/comprobantes/Default.aspx
61. ARCA — WSMTXCA, documento anterior a 2025-11-12, **>12 meses**: https://www.afip.gob.ar/fe/ayuda/documentos/Web-Service-MTXCA.pdf
62. TLSNotary — FAQ, **s/f**, versión consultada: https://tlsnotary.org/docs/faq/
63. Reclaim — definición de proveedores, **s/f**: https://docs.reclaimprotocol.org/wtf-are-providers
64. Reclaim — verificación de reportes, **s/f**: https://letters.reclaimprotocol.org/how-to-verify
65. C2PA — Explainer 2.2, publicado antes de 2025-11-12, **>12 meses**: https://c2pa.org/specifications/specifications/2.2/explainer/Explainer.html
66. Proofmode — producto actual, **s/f**: https://proofmode.org/about
67. Proofmode — folleto, anterior a 2025-11-12, **>12 meses**: https://proofmode.org/docs/ProofmodeBrochure.pdf
68. World — AgentKit, **2026-03-17**: https://world.org/blog/announcements/now-available-agentkit-proof-of-human-for-the-agentic-web
69. World — repositorio archivado **2026-10-20**: https://github.com/worldcoin/agentkit
70. World — glosario, actualización **2026-10-05**: https://support.world.org/hc/en-us/articles/55499230057107-Glossary-of-Terms
71. Premise — controles y apelaciones, **2024: >12 meses**: https://contributors.premise.com/blog/navigating-challenges-task-rejection/
72. IoTeX — Trio, **2026-06-19**: https://iotex.io/blog/introducing-trio-a-world-model-for-physical-operations/
73. Ling et al. — seguridad x402, preprint inicial **2026-05-29**: https://arxiv.org/abs/2605.30998
74. SEPA — cobertura y promociones, **s/f**, consulta actual: https://www.preciosclaros.gob.ar/index.html
75. Precios Claros — condiciones de datos, **s/f**: https://www.preciosclaros.gob.ar/
76. MODO — condiciones, **s/f**: https://www.modo.com.ar/ayuda/preguntas-frecuentes/Condiciones-de-una-promoci%C3%B3n
77. MODO — topes, **s/f**: https://www.modo.com.ar/ayuda/preguntas-frecuentes/Qu%C3%A9-es-el-tope-de-reintegro
78. Banco Provincia — FAQ de comercios, **s/f**: https://www.bancoprovincia.com.ar/cuentadni/index?url=cdniComerciosFaq
79. Banco Provincia — campaña **2026-02-15–2026-02-28**, no vigente en noviembre: https://mesumo.bancoprovincia.com.ar/gateway/cdn/mesumo_terminos_0032
80. Ley 25.326 — **2000-10-04: >12 meses**, texto actualizado consultado: https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/actualizacion
81. AAIP — Resolución **4/2019: >12 meses**: https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-4-2019-318874/texto
82. AAIP — anexo a Resolución **4/2019: >12 meses**: https://www.argentina.gob.ar/normativa/318874_res4AAIP_pdf/archivo
83. AAIP — transferencias internacionales, evidencia anterior a 2025-11-12, **>12 meses**: https://www.argentina.gob.ar/transferencias-internacionales
84. TuPlayero — fuentes y validación, **s/f**: https://tuplayero.com/fuentes
85. Cordevs/Changuito — ficha de aplicación, **s/f**: https://play.google.com/store/apps/details?hl=es&id=com.cordevs.bestprice
86. Open Food Facts/Open Prices — países, **s/f**, lectura dinámica limitada: https://prices.openfoodfacts.org/countries?filter=location_count_gte_1
87. Banco Mundial/ENERGYDATA — piloto argentino, **2018-01-29: >12 meses**: https://energydata.info/en/dataset/crowdsourced-price-data-collection-pilot/resource/e9362e88-33ef-4435-9c22-ec857684e425

### Compradores, costos y sustitución

88. Repsly — API de auditorías, **s/f**: https://repsly-dev.readme.io/reference/retail-audits
89. State Street — PriceStats, ficha anterior a 2025-11-12, **>12 meses**: https://globalmarkets.statestreet.com/research/dam/public/docs/pricestats_product_sheet.pdf
90. NIQ — incrementabilidad retail media, **2026**: https://nielseniq.com/global/en/insights/analysis/2026/retail-media-incrementality-measurement/
91. IAB Europe — glosario retail media, **s/f**: https://iabeurope.eu/retail-media-glossary/
92. Bright Data — ecommerce scraper, tarifa capturada **2026-11-12**, s/f editorial: https://brightdata.com/products/web-scraper/ecommerce
93. Price API — tarifas, captura/indexación consultada **2026-11-12**, contenido dinámico: https://www.priceapi.com/pricing
94. Gigwalk — recompensas, captura **2026-11-12**, s/f editorial: https://www.gigwalk.com/gigwalkers/
95. Cavallo — paper AER, **enero de 2017**, datos 2014–2016, **>12 meses**: https://www.hbs.edu/ris/Publication%20Files/Cavallo_Alberto_J6_Are%20Online%20and%20Offline%20Prices%20Similar_2a1a63af-8938-4680-bb23-a850324b096a.pdf
96. Cavallo/NBER — working paper, **marzo/agosto de 2016: >12 meses**: https://www.nber.org/papers/w22142
97. Open Food Facts — API de precios y pruebas, **s/f**, comprobada 2026-11-13: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/product-prices/
98. Open Prices — calidad y límites de duplicación, **s/f**, comprobada 2026-11-13: https://openfoodfacts.github.io/open-prices/topics/data-quality/
