# Categorías y tendencias: agent-data-marketplace
*Skill: startup-positioning | Generated: 2026-11-12*

**Alcance.** Nivel Light: análisis de categoría de mercado (B1) y de tendencias y timing (B2) en un solo archivo. Tres rondas de búsqueda web (12 búsquedas y 3 lecturas completas) más la base de `../intake.md`, `../../competitors-report.md` y `../../pricing-landscape.md`.
**Etiquetas.** [Data] dato con fuente · [Estimate] cálculo con supuestos explícitos · [Assumption] supuesto sin verificar · [Opinion] juicio analítico. **Confianza:** Alta / Media / Baja.

**Fortalezas únicas que el marco tiene que hacer obvias** (del intake y del informe de competidores):
1. Precio efectivamente pagado tras promociones bancarias y de billetera.
2. Cobertura del NOA y del canal tradicional.
3. Encargos programáticos chicos, de US$1 a 50 por observación.
4. Reglas de aceptación explícitas, pactadas antes de la tarea.
5. Compra nativa para agentes (x402, MCP).

---

## Cómo se describen los competidores

| Competidor | Categoría que se atribuye | Categoría en directorios / analistas | Fuente |
|---|---|---|---|
| Scanntech | Datos de punto de venta e inteligencia comercial para CPG | Retail measurement / POS data [Opinion] | competitors-report.md |
| Numerator / Worldpanel | Panel de consumo e inteligencia de compradores | Consumer panel / shopper insights [Opinion] | competitors-report.md |
| Trax (fusionada con FORM, 2026-02) | Reconocimiento de imágenes en góndola | Retail execution (REX) [Data] | fxstreet, consumergoods.com |
| Wiser | "Retail intelligence platform that uses crowdsourced data collection" | Retail auditing & mobile crowdsourcing (Capterra/GetApp) [Data] | GetApp |
| Field Agent / Storesight, bemyeye, Premise | Auditoría y datos de campo crowdsourced | Retail audit services [Data] | aimultiple, fxstreet |
| Pricefx, Vendavo, Conga | Pricing y optimización de rebates | Gartner MQ B2B Pricing & Rebate Optimization (primera edición, 2026-04) [Data] | Business Wire, Pricefx |
| Vangrid, RentAHuman, GeoBounties | Humanos como capa física para agentes | Sin categoría de analista; prensa cripto habla de "humans as oracle layer" [Data, Tier 3] | KuCoin |
| Bazaar / Agentic.Market, Apify x402 | Catálogo de servicios pagables por agentes | Sin categoría de analista [Data] | competitors-report.md |

**Lectura** [Opinion]: los compradores CPG ya tienen palabras para tres de estos espacios (retail execution, panel de consumo y pricing). Lo agentic todavía no tiene categoría reconocida por analistas ni presupuesto asignado.

---

## Categorías candidatas

### Categoría 1: auditoría de punto de venta / retail execution (REX)
- **Tipo:** Existente.
- **Expectativas del comprador:** fotos de góndola con reconocimiento de imágenes, KPI de quiebre de stock, share of shelf, cumplimiento de planograma y precio en góndola; panel de reporte por cadena y región; contrato por ola o anual [Data: fxstreet, Capterra].
- **Líderes:** Trax+FORM (más de 750 clientes en más de 80 países; 30 de los 50 mayores CPG), Repsly, Field Agent/Storesight, bemyeye, Wiser [Data: fxstreet 2026-07; vendor claims]. En Argentina operó Rocketpin (dato de 2019) [Data, desactualizado].
- **Densidad competitiva:** Alta. Latka cuenta 73 empresas SaaS de retail execution con US$1.600M de ingresos combinados [Data, Tier 2-3].
- **Crecimiento:** Estable a moderado. Las estimaciones de tamaño van de US$0,3B a US$6,8B para 2026 según la definición, con CAGR de 6,7-6,8% [Data: Insight Partners, Intel Market Research, QKS; tamaño con confianza Baja por la dispersión]. La categoría se está consolidando: Gemspring compró Trax IR y la fusionó con FORM en 2026-02. Wiser habría entrado en Chapter 11 el 2026-04-26 [Data, fuente única de un competidor; sin confirmar].
- **A favor:** el presupuesto de trade marketing ya existe. El ancla de precio es alta (bemyeye cobra desde €10.000 por ola), lo que hace visible el ahorro de un lote programático de US$300 [Data/Estimate]. Los criterios de aceptación explícitos encajan con lo que el comprador ya pide de una auditoría.
- **En contra:** el comprador espera reconocimiento de imágenes, panel de KPI y cobertura de cadenas, y el producto no tiene nada de eso hoy. La categoría compara por cobertura y por tecnología de imagen, no por precio pagado. El precio pagado tras promociones no forma parte de lo que se mide en REX.
- **Fit Dunford:** parcial. Hace obvias las fortalezas 2 (NOA y canal tradicional), 3 (encargos chicos) y 4 (aceptación), y esconde la 1 (precio pagado), que es la más diferencial [Opinion].

### Categoría 2: inteligencia de precios / price intelligence
- **Tipo:** Existente. Hay dos subcategorías que no conviene mezclar: pricing B2B y optimización (Gartner MQ 2026: Pricefx, Vendavo y Conga como líderes) y monitoreo de precios de la competencia, sobre todo online.
- **Expectativas del comprador:** series de precios de la competencia por SKU, tienda y día; alertas; integración con el motor de pricing o RGM. En retail se espera cobertura casi total del surtido [Opinion; Gartner Competitive Landscape de price/promotion/markdown con Centric y Revionics, Data].
- **Líderes:** para optimización, Pricefx, Vendavo, Conga, Revionics y Centric [Data]. En Argentina el piso es público: SEPA / Precios Claros publica más de 12M de precios gratis [Data]. CECN y UDESA ya publican indicadores de dispersión a partir de SEPA [Data].
- **Densidad competitiva:** Alta a nivel global; en Argentina, el precio de lista está commoditizado por SEPA.
- **Crecimiento:** Creciendo. Gartner atribuye la demanda a la salida de las planillas y a la inflación y los aranceles, que obligan a cambiar precios con frecuencia [Data: resumen del MQ].
- **A favor:** la fortaleza 1 es literalmente un dato de precio, y lo que la hace única es lo que falta en todo el mercado: el precio después del descuento del medio de pago. Un mismo producto puede tener "más de cinco precios" según el medio de pago y las promociones, y los reintegros con MODO de 10-25% son habituales en supermercados [Data: iProfesional 2026-06, fuentes C-P, 1816 y Scentia]. Scentia estima que, con descuentos, los supermercados son en promedio 16% más baratos que los comercios de barrio [Data], es decir que la brecha relevante para un distribuidor del canal tradicional aparece en el precio pagado, no en el de lista.
- **En contra:** "price intelligence" sin calificar remite a monitoreo de precio de lista. Ahí el producto pierde contra SEPA (gratis) y contra el scraping. La dispersión de lista entre cadenas es baja (3,5-3,7% promedio en 2026, 9,2% máximo en frutas y verduras) [Data: UDESA, CECN], así que el precio de lista no justifica pagar.
- **Fit Dunford:** fuerte solo con calificador. Ver Recomendación.

### Categoría 3: panel de consumo / shopper data
- **Tipo:** Existente.
- **Expectativas del comprador:** panel representativo con proyección estadística, series históricas largas, cobertura nacional por categoría y metodología aceptada por la industria [Opinion].
- **Líderes:** Numerator/Worldpanel, Scentia y Scanntech (POS) en Argentina; Fetch y Receipt Hog en EE.UU. [Data: competitors-report.md].
- **Densidad competitiva:** Media en jugadores y Alta en barreras: pocos jugadores, con contratos anuales y alto costo de cambio [Data/Opinion].
- **Crecimiento:** Estable; capital concentrado en incumbentes (Scanntech, Serie F de US$180M, 2026-10) [Data].
- **A favor:** los tickets itemizados con precio pagado son exactamente el insumo de un panel.
- **En contra:** sin panel representativo, sin series y sin metodología de proyección, el producto queda como "un panel chico y nuevo" frente a Scanntech. Esto contradice la posición de complemento confirmada en el checkpoint.
- **Fit Dunford:** débil. Invita a la comparación de frente que el producto pierde [Opinion].

### Categoría 4: crowdsourced field data / microtareas de campo
- **Tipo:** Existente, aunque difusa (retail auditing & mobile crowdsourcing).
- **Expectativas del comprador:** red de contribuyentes con cobertura geográfica, tareas configurables, control de calidad, precio por tarea [Data: Capterra, Wiser].
- **Líderes:** Premise, Field Agent/Storesight, bemyeye, Wiser, Shopkick/Quri (dentro del portafolio histórico de Trax); aparecen entrantes como Hetal y Eileen [Data, fuente de un competidor].
- **Densidad competitiva:** Media.
- **Crecimiento:** Estable o en contracción en los jugadores grandes (Premise vendió su unidad de sector público en 2025; posible Chapter 11 de Wiser) [Data; Wiser sin confirmar].
- **A favor:** hace visibles las fortalezas 3 y 4 (encargos chicos y aceptación justa), y la aceptación transparente es el principal dolor del lado contribuyente en las reseñas [Data: review-mining].
- **En contra:** el valor queda en el mecanismo y no en el dato. El comprador compara precio por tarea y cobertura, y el producto no tiene red hoy.
- **Fit Dunford:** débil a moderado. Describe cómo se produce el dato, no qué decisión resuelve [Opinion].

### Categoría 5: agent data marketplace / x402 data API
- **Tipo:** Nueva (categoría en formación, sin analistas que la definan).
- **Expectativas del comprador:** endpoint pagable por request, discovery en Bazaar o registries MCP, precio sub-dólar, sin contrato [Data: pricing-landscape.md].
- **Líderes:** ninguno con demanda probada; Bazaar/Agentic.Market como canal, y Vangrid y RentAHuman en tareas físicas [Data].
- **Densidad competitiva:** Media en oferta y casi nula en demanda.
- **Crecimiento:** volumen nominal alto, comercio real mínimo. TRM Labs mide US$52,7M en 198,9M de transacciones x402 entre 2025-05 y mediados de 2026; tras filtrar autopagos y flujos masivos quedan US$25,6M, y solo entre 0,6% y 7,5% de eso parece agéntico. El volumen de agentes es de unos US$5.000 a 11.000 por mes en 2026 [Data, Tier 2, publicado 2026-09-09]. La transacción promedio es de US$0,14 (Visa/Artemis, 2026-07) [Data, reportado por Forkast; sin acceso al informe primario].
- **A favor:** hace obvia la fortaleza 5 y es el único marco donde x402 es una ventaja.
- **En contra:** el comprador no existe en volumen. La categoría ancla el precio en centavos (US$0,14), incompatible con observaciones de US$1-50. Además, el mecanismo ya no diferencia porque Vangrid lo tiene en producción.
- **Fit Dunford:** débil. Hace obvia la fortaleza menos defendible y esconde las demás [Opinion].

### Categoría 6: physical-world oracle / real-world data for agents
- **Tipo:** Nueva.
- **Expectativas del comprador:** feeds verificables del mundo físico con atestación on-chain (modelo Hivemapper, WeatherXM, DIMO), interfaz programable y token [Data, Tier 3: Chainscore, Outlier Ventures].
- **Líderes:** redes DePIN; Vangrid en tareas físicas para agentes.
- **Densidad competitiva:** Media, en crecimiento entre proyectos cripto.
- **Crecimiento:** narrativa fuerte con datos débiles. KuCoin afirma unos US$150M de ingresos on-chain de DePIN en 2026-01, sin fuente primaria verificable [Data, Tier 3, confianza Baja]. Pebblous señala que falta la capa de "quality oracle", la que permite saber en qué dato confiar [Data, Tier 3].
- **A favor:** las reglas de aceptación explícitas son precisamente esa capa faltante de calidad.
- **En contra:** es audiencia cripto y no CPG; el comprador marca o distribuidor no busca "oráculo"; está asociado a tokens y especulación.
- **Fit Dunford:** débil para el primer comprador humano; solo sirve como relato para el ecosistema Celo/Ripio [Opinion].

### Candidata agregada: inteligencia de precio pagado y disponibilidad para el canal tradicional (subcategoría)
Es una subcategoría de la Categoría 2 con calificadores de "precio pagado", "promociones aplicadas" y "canal tradicional/NOA", y toma de la Categoría 1 la disponibilidad en góndola. Ver Recomendación.

---

## Comparación de categorías

| Categoría | Tipo | Líderes | Densidad | Fit con fortalezas | Riesgo |
|---|---|---|---|---|---|
| Inteligencia de precio pagado (subcategoría de price intelligence) | Subcategoría | Nadie en precio pagado; SEPA, CECN y UDESA en precio de lista | Baja en el nicho | **Fuerte** (1, 2, 3 y 4; la 5 como canal) | M |
| Retail execution / auditoría de PDV | Existente | Trax+FORM, Repsly, Field Agent, bemyeye | Alta | Moderado (2, 3 y 4) | M |
| Price intelligence sin calificar | Existente | Pricefx, Vendavo, Revionics; SEPA gratis | Alta | Débil (choca con SEPA) | A |
| Panel de consumo / shopper data | Existente | Scanntech, Numerator, Scentia | Media (barreras altas) | Débil | A |
| Crowdsourced field data | Existente | Premise, Field Agent, Wiser | Media | Débil-Moderado | M |
| Agent data marketplace / x402 | Nueva | Ninguno con demanda | Media oferta / nula demanda | Débil | A |
| Physical-world oracle | Nueva | DePIN, Vangrid | Media | Débil | A |

---

## Recomendación

[Opinion; confianza Media] **Posicionarse en una subcategoría de inteligencia de precios: "precio efectivamente pagado y disponibilidad en el canal tradicional del NOA"** (en el sitio, por ejemplo: "inteligencia de precio pagado para el canal tradicional"). Tomar de retail execution el formato de compra: lote o "ola" programática con reglas de aceptación.

- **Por qué subcategoría y no head-to-head.** En price intelligence a secas, el producto se compara con SEPA, que es gratis, y con herramientas que ya tienen cobertura total. En retail execution, se lo compara con reconocimiento de imágenes y paneles de KPI que no tiene. El calificador "precio pagado" convierte la mayor debilidad del mercado (nadie ve el descuento por medio de pago) en el eje de comparación. El calificador "canal tradicional/NOA" lo pone como complemento de Scanntech y no como rival.
- **Qué hacen las fortalezas en este marco.** La 1 es el eje. La 2 es el dónde. La 3 se presenta como "una ola de auditoría a una fracción del costo" (US$300 frente a €10.000). La 4 es la garantía de calidad que el comprador CPG ya pide. La 5 se describe como "también lo consume tu agente" o "canal", nunca como categoría.
- **Riesgo de creación de categoría: medio.** "Inteligencia de precios" ya existe y el comprador la busca; lo que hay que explicar es solo el calificador. El costo está en demostrar que el precio pagado cambia una decisión: la dispersión de lista es baja (3,6% promedio entre cadenas) y el valor depende de que la brecha por promociones sea grande y relevante para el comprador. Hay evidencia indirecta de que lo es (más de 5 precios por producto, reintegros de 10-35%, supermercados 16% más baratos que el barrio con descuentos), pero ninguna fuente cuantifica la brecha precio de lista vs. precio pagado por SKU y tienda [DATA GAP].
- **No recomendado:** usar "agent data marketplace" u "oráculo del mundo físico" como categoría principal. Las dos son categorías nuevas sin demanda probada, y la de x402 ancla el precio en US$0,14. Pueden servir como relato secundario ante el ecosistema cripto (Celo/Ripio, grants), nunca ante la marca o el distribuidor.

---

## Tendencias

### T1: comercio agéntico y adopción de x402
- **Tipo:** Tecnología.
- **Evidencia:** 196M de transacciones x402 acumuladas en 12 cadenas al 2026-11-01, con más de US$42M liquidados (Fireblocks) [Data]. Del lado real: entre 63,9% (promedio) y 90,2% (pico) de las transacciones clasificadas como "gamed" (Artemis, 2025-11 a 2026-02); volumen comercial real de unos US$28.000 a 40.000 por día (CoinDesk/Major Matters, 2026-03); volumen agéntico de US$5.000 a 11.000 por mes (TRM Labs, 2026-09) [Data, Tier 2]. Bernstein estima el comercio agéntico en menos de 1% del e-commerce de EE.UU. [Data, vía Forkast]. Visa/Artemis (2026-07) señala la confianza, la identidad, el control de gasto y la resolución de disputas como las piezas inmaduras [Data, vía Cointelegraph y The Block].
- **Fuerza:** Emergente en infraestructura, especulativa en demanda.
- **Dirección:** Neutral a viento en contra como marco de posicionamiento; viento a favor leve como canal de costo casi nulo.
- **Timing:** Temprano.
- **Implicancia:** no apoyar el posicionamiento en "para agentes". Lo que Visa/Artemis marca como faltante (disputas, control y confianza) coincide con las reglas de aceptación explícitas, y vale como argumento técnico secundario.

### T2: agentes de IA para pricing, RGM y trade marketing en CPG
- **Tipo:** Tecnología / comportamiento.
- **Evidencia:** 47% de las empresas de retail y CPG usa o evalúa IA agéntica (encuesta NVIDIA, 2026-01). Según CGF y BCG (2026-04, n=39), en CPG el avance está en forecasting y en optimización de RGM [Data]. Microsoft y Visualfabriq describen agentes que recomiendan movimientos de precio y reasignan trade spend [Data, fuente vendor]. Cognizant afirma que las marcas medianas tienen la mayor oportunidad, porque los grandes CPG ya incorporaron IA a RGM [Opinion de vendor].
- **Fuerza:** Emergente.
- **Dirección:** Viento a favor. Un agente de pricing necesita datos de entrada que no tiene, y el precio pagado en el canal tradicional es uno de ellos. Ese es el comprador agéntico realista: el agente interno de una marca o distribuidor, no un agente autónomo en la web abierta.
- **Timing:** A tiempo para pilotos con marcas medianas; temprano para compra autónoma.
- **Implicancia:** describir la entrega agéntica como "los datos que tu agente de pricing no puede ver", con un humano que firma el presupuesto.

### T3: desinflación argentina y valor del seguimiento de precios
- **Tipo:** Económica.
- **Evidencia:** las fuentes sobre el ritmo mensual se contradicen. IDECBA da 1,9% en CABA para 2026-10, y las proyecciones (Analytica, REM) ubican la cifra nacional en 1,8-2,0% para octubre [Data]. iProfesional (2026-06) afirma en cambio que el IPC "se mantiene por encima de 3% mensual" [Data, sin conciliar]. No se encontró el dato oficial del INDEC de octubre de 2026 [DATA GAP]. La dispersión de lista entre cadenas está estable y baja, 3,5-3,7% durante 2026, aunque la brecha entre regiones es de 11,3% (UDESA, CECN) [Data].
- **Fuerza:** Fuerte (la inflación sigue en un dígito alto mensual o anual de dos dígitos).
- **Dirección:** Mixta. Con inflación de 2% mensual, el precio sigue moviéndose lo bastante para que haga falta seguirlo, y la dispersión entre regiones (11,3%) favorece la cobertura del NOA. Con menos inflación, en cambio, el precio de lista entre cadenas converge y su seguimiento pierde valor; el valor se desplaza a la promoción y al canal.
- **Timing:** A tiempo.
- **Implicancia:** no vender "seguimiento de inflación" (lo cubren INDEC, SEPA y las consultoras). Vender la brecha regional y por medio de pago.

### T4: fragmentación de promociones bancarias y de billetera
- **Tipo:** Comportamiento / económica.
- **Evidencia:** calendarios mensuales de 2026 con decenas de combinaciones por cadena, día, medio y tope. Algunos ejemplos: Carrefour 35% con Mercado Pago y tope de $20.000 (2026-02); Banco Nación 30% con MODO y tope de $12.000 (2026-02); Cuenta DNI hasta 40% (2026-08) [Data: El Observador, iProfesional, El Economista]. Un producto puede tener "más de cinco precios" según el medio de pago [Data: iProfesional 2026-06]. Mercado Pago gana terreno frente a los bancos con descuentos más simples y sin tope [Data: iProfesional 2026-07].
- **Fuerza:** Fuerte.
- **Dirección:** Viento a favor directo. Es la tendencia que crea el hueco del precio pagado: SEPA y el POS ven el precio de lista, mientras el reintegro aparece después en el banco o la billetera.
- **Timing:** A tiempo. Si un día se eliminaran o regularan estas promociones, el hueco se cerraría; no se encontró señal regulatoria en ese sentido [DATA GAP].
- **Implicancia:** es la tendencia que conviene nombrar en el posicionamiento ("en Argentina el precio de góndola ya no es el precio").

### T5: adopción de stablecoins en Argentina
- **Tipo:** Comportamiento / tecnología.
- **Evidencia:** según Chainalysis (vía iProUP), Argentina movió unos US$88,5B en cripto entre 2025-07 y 2026-06, un 15,3% más interanual [Data, Tier 2]. Otra fuente estima una adopción cercana al 20% y unos 8,6M de usuarios, a partir de un informe de 2025 [Data, posiblemente desactualizado]. USDT domina el P2P [Data, Tier 3]. El 99,6% del volumen x402 se liquida en USDC (TRM Labs) [Data].
- **Fuerza:** Fuerte.
- **Dirección:** Viento a favor del lado contribuyente (cobrar en dólares digitales es atractivo y conocido); neutral del lado comprador.
- **Timing:** A tiempo.
- **Implicancia:** usar el pago en stablecoins como argumento de reclutamiento y retención de contribuyentes, no como posicionamiento hacia el comprador.

### T6: regulación de privacidad de datos
- **Tipo:** Regulatoria.
- **Evidencia:** la Ley 25.326 sigue vigente. Hay varios proyectos de reemplazo o reforma: el 3397-D-2026 (Rossi, 2026-07-16), que deroga las leyes 25.326 y 26.343; los proyectos de Carro y Doñate; y uno sobre IA y datos personales. Ninguno aprobado según las fuentes [Data: Marval, Digital Policy Alert, Diario Judicial 2026-07].
- **Fuerza:** Emergente.
- **Dirección:** Neutral hoy; posible viento en contra si una ley al estilo GDPR endurece el consentimiento y la finalidad, y posible viento a favor si el consentimiento explícito por finalidad pasa a ser obligatorio y los competidores no lo tienen.
- **Timing:** Temprano (sin fecha de sanción).
- **Implicancia:** diseñar desde ahora con consentimiento por finalidad y agregación mínima, y mencionarlo como garantía, no como titular.

---

## Evaluación de timing

[Opinion; confianza Media] **A tiempo para el dato, temprano para el canal.** La fragmentación de promociones (T4), la brecha regional de precios (T3) y la llegada de agentes de pricing a marcas medianas (T2) hacen que el precio pagado en el NOA sea un dato con demanda plausible ahora, a confirmar con 2-3 compradores. La compra autónoma por agentes vía x402 (T1) es temprana: el volumen agéntico real es de miles de dólares por mes a nivel global y su precio promedio (US$0,14) no sostiene encargos de US$1-50.

Trayectoria a 12-18 meses:
- La infraestructura agéntica (identidad, control de gasto, disputas) puede madurar, pero no hay señal que permita fechar demanda real.
- En retail execution, la consolidación (Trax+FORM) y el capital de Scanntech pueden cerrar el hueco desde arriba.
- Si la inflación baja más, el valor del precio de lista cae y el del precio pagado se vuelve relativamente mayor, siempre que las promociones sigan.

## Recomendación de tendencia para el posicionamiento

Nombrar solo **T4** (fragmentación de promociones: "el precio de góndola ya no es el precio") y, como apoyo, **T2** (los agentes de pricing necesitan datos del canal que no ven). **No** usar T1 (comercio agéntico/x402) como tendencia de posicionamiento: es temprana, está inflada por transacciones artificiales y ancla precios en centavos.

---

## Brechas de datos

- DATA GAP: brecha cuantificada entre precio de lista y precio pagado (por SKU, tienda, día y medio de pago) en Argentina. Es la premisa central de la subcategoría. Cómo cerrarla: un muestreo propio de 200-500 tickets en Jujuy/Salta comparado con SEPA del mismo día. Confianza actual: Baja.
- DATA GAP: dato oficial del INDEC para octubre de 2026, y conciliación entre ~2% mensual (IDECBA, REM) y "más de 3%" (iProfesional). Cómo cerrarla: consultar indec.gob.ar.
- DATA GAP: tamaño del mercado de price intelligence y de retail execution en Argentina o LatAm; las cifras globales van de US$0,3B a US$6,8B según la definición.
- DATA GAP: estado real de Wiser (Chapter 11 citado por una sola fuente de un competidor). Cómo cerrarla: buscar en PACER o en prensa financiera.
- DATA GAP: señales regulatorias del BCRA o la Secretaría de Comercio sobre promociones bancarias y de billetera que podrían cerrar el hueco del precio pagado.
- DATA GAP: informe primario de Visa/Artemis (la cifra de US$0,14 y los 109,6M de transacciones vienen de prensa secundaria).

## Flags

**Red Flags**
- La subcategoría recomendada depende de una premisa no medida: que la brecha entre precio de lista y precio pagado sea grande y cambie decisiones de un distribuidor o de una marca regional. Sin ese número, el posicionamiento es una hipótesis.
- La demanda agéntica sigue sin aparecer: unos US$5.000 a 11.000 por mes de volumen agéntico x402 a nivel global (TRM Labs). Posicionar en "agent data marketplace" sería posicionar en una categoría sin compradores.

**Yellow Flags**
- La desinflación reduce el valor del precio de lista y puede reducir la urgencia del comprador; sostiene el valor solo si las promociones siguen fragmentadas.
- Retail execution se consolida (Trax+FORM); un jugador con capital podría agregar captura de tickets o precio pagado.
- Hay proyectos de reemplazo de la Ley 25.326 en curso; el resultado puede cambiar los requisitos de consentimiento.
- Varias cifras de mercado vienen de vendors o de prensa cripto (Tier 3) y no se pudieron verificar contra fuentes primarias.

---

## Fuentes

- Latka, Retail Execution Software: https://getlatka.com/companies/industries/i-retail-execution-software
- The Insight Partners, Retail Execution Software Market 2026-2034: https://www.theinsightpartners.com/reports/retail-execution-software-market
- Intel Market Research, Retail Execution Software: https://www.intelmarketresearch.com/retail-execution-software-market-63376
- QKS Group, Retail Execution Platform forecast 2026-2030: https://qksgroup.com/market-research/market-forecast-retail-execution-platform-2026-2030-worldwide-2750
- FXStreet, Coca-Cola, AB InBev y Kraft Heinz y los datos de góndola: https://www.fxstreet.com/news/coca-cola-ab-inbev-and-kraft-heinz-are-quietly-turning-store-shelves-into-ai-data-202610070035
- Consumer Goods Technology, News Briefs 2026-02-03: https://consumergoods.com/news-briefs/2026-02-03
- ShopVision, Wiser Alternatives (Chapter 11): https://www.shopvision.ai/wiser-solutions-alternatives
- GetApp, Wiser Retail Execution Management: https://www.getapp.com/all-software/a/wiser-retail-execution-management/
- Survey.com, How to Choose the Best Retail Audit Partner 2026: https://survey.com/?p=5641
- Pricefx, Leader 2026 Gartner MQ: https://www.pricefx.com/content/news/pricefx-leader-2026-gartner-magic-quadrant-pricing-rebate-management-b2b
- Business Wire, Gartner MQ B2B Pricing 2026: https://www.businesswire.com/news/home/20260416954874/en/
- Centric Software, Gartner Competitive Landscape: https://www.centricsoftware.com/press-releases/centric-software-named-gartner-competitive-landscape-report-price-promotion-markdown-optimization
- TRM Labs, Who's actually paying (2026-09-09): https://www.trmlabs.com/trm-tech-blog/whos-actually-paying-measuring-ai-agent-payments-onchain
- 4Pillars, x402 on Polygon: real or gamed: https://research.4pillars.io/en/research/x402-on-polygon-real-or-gamed
- Forkast, 200 million transactions later the real volume is still tiny: https://forkast.news/the-x402-foundation-activated-a-27-year-old-internet-code-200-million-transactions-later-the-real-volume-is-still-tiny/
- Forkast, Half of x402's transaction volume is artificial: https://forkast.news/half-of-x402s-transaction-volume-is-artificial-the-infrastructure-layer-keeps-building-anyway/
- Forkast, Visa/Artemis the $0.14 reality: https://forkast.news/visa-artemis-the-0-14-reality-of-agent-commerce/
- Forkast, Visa hundreds vs millions gap: https://forkast.news/visa-hundreds-vs-millions-gap-commercial-launch-data-shows-the-agent-commerce-ceiling/
- Cointelegraph, Visa/Artemis infrastructure gaps: https://cointelegraph.com/news/autonomous-ai-agent-economy-infrastructure-gaps-visa-artemis
- The Block, Visa stablecoins micro-commerce: https://www.theblock.co/news/markets/2026-07-16-visa-stablecoins-agentic-ai-commerce-408574
- Fireblocks, The Agent Economy at a Glance: https://www.fireblocks.com/?p=32426
- BlockEden, x402 154M transactions: https://blockeden.xyz/blog/2026/04/01/x402-protocol-http-402-ai-agent-commerce-stablecoin-payments/
- Microsoft, Agentic AI in RGM: https://microsoft.com/en-us/microsoft-cloud/blog/retail-and-consumer-goods/2026/02/18/agentic-ai-in-revenue-growth-management-from-hype-to-decision-intelligence
- BCG, State of AI for CPG 2026: https://www.bcg.com/assets/2026/state-of-ai-for-cpg.pdf
- Visualfabriq, What is agentic RGM: https://visualfabriq.com/knowledge-hub/what-is-agentic-revenue-growth-management
- Cognizant, AI predictions RGM: https://www.cognizant.com/us/en/insights/insights-blog/ai-predictions-revenue-growth-management-for-consumer-brands
- Outlier Ventures, DePIN for AI agents: https://outlierventures.io/article/depin-infrastructure-for-ai-agents/
- KuCoin, Humans are becoming the oracle layer: https://www.kucoin.com/news/flash/humans-are-becoming-the-oracle-layer-for-ai-agents
- KuCoin, DePIN sector 2026: https://www.kucoin.com/blog/en-depin-crypto-sector-2026-how-decentralized-physical-infrastructure-surpassed-oracles
- Pebblous, Web3 data economy: https://blog.pebblous.ai/report/web3-data-economy/en/
- Bloomberg Línea, un mismo producto hasta 9% de diferencia: https://www.bloomberglinea.com/latinoamerica/argentina/precios-en-argentina-un-mismo-producto-puede-costar-hasta-9-de-un-supermercado-a-otro/
- El Economista, mismo producto puede costar 9,2% más: https://eleconomista.com.ar/economia/supermercados-mismo-producto-puede-costar-92-mas-informe-revela-donde-conviene-comprar-n98704
- La Capital MdP, dispersión hasta 19%: https://www.lacapitalmdp.com/la-dispersion-de-precios-en-alimentos-llega-hasta-el-19/
- iProfesional, un producto puede tener más de 5 precios (2026-06-08): https://www.iprofesional.com/economia/456617-argentinos-sin-valores-de-referencia-un-producto-puede-tener-mas-de-5-precios-diferentes
- iProfesional, la fórmula de Mercado Pago frente a los bancos: https://www.iprofesional.com/actualidad/452434-cual-es-la-formula-de-mercado-pago-para-ganarle-la-batalla-a-los-bancos-en-supermercados
- El Observador, descuentos supermercados febrero 2026: https://www.elobservador.com.uy/argentina/economia-y-negocios/descuentos-supermercados-febrero-2026-banco-y-biletera-virtual-que-promociones-y-dias-tienen-rebajas-coto-carrefour-disco-jumbo-vea-dia-y-chango-mas-n6033262
- El Economista, Cuenta DNI octubre: https://eleconomista.com.ar/economia/cuenta-dni-renovo-sus-descuentos-octubre-hay-beneficios-40-reintegros-18000-n98555
- Tiempo Argentino, la inflación volvió a rondar el 2% en octubre: https://www.tiempoar.com.ar/ta_article/la-inflacion-volvio-a-rondar-el-2-en-octubre/
- Roomix, IPC octubre 2026: https://roomix.ai/blog/actualizacion-ipc-octubre-2026
- iProUP, el dólar cripto crece más rápido en Argentina: https://www.iproup.com/economia-digital/72504-el-dolar-cripto-crece-mas-rapido-en-argentina-que-en-la-region
- KuCoin, Argentina leads LatAm in crypto adoption: https://www.kucoin.com/news/flash/argentina-leads-latin-america-in-crypto-adoption-with-20-usage-rate-in-2026
- Stablecoin Insider, Argentina y Brasil: https://stablecoininsider.org/stablecoins-in-latin-america-why-argentina-and-brazil-are-going-all-in-this-year/
- Marval, New Bills for a Data Protection Law in Argentina: https://www.marval.com/publicacion/nuevos-proyectos-de-ley-de-datos-personales-en-argentina-17289?lang=en
- Digital Policy Alert, Bill 3397-D-2026: https://digitalpolicyalert.org/event/42320-chamber-of-deputies-introduced-personal-data-protection-law-bill-no-3397-d-2026-including-data-protection-regulation
- Diario Judicial, datos personales: libro y debate en agenda (2026-07-31): https://www.diariojudicial.com/news-99786-datos-personales-libro-y-debate-en-agenda
- Base interna: `../intake.md`, `../../competitors-report.md`, `../../pricing-landscape.md`
