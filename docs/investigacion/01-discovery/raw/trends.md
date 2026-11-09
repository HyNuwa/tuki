# A2 — Tendencias de industria y timing

**Proyecto:** Recompensas verificables NOA (promos de "primera prueba" financiadas por marcas, reembolso en pesos, escrow on-chain en Celo/wARS, piloto en San Salvador de Jujuy)
**Fecha de corte:** 9 de noviembre de 2026
**Método:** 4 rondas, 27 búsquedas web y lecturas de páginas. Cada fuente lleva su Tier: **T1** = fuente primaria u oficial (BCRA, ARCA, SEC, Boletín Oficial, el propio emisor); **T2** = prensa económica o especializada reconocida (Infobae, Cronista, iProfesional, Forbes, Revista Mercado, iProUP); **T3** = blogs, agregadores o contenido patrocinado.
**Regla:** donde no encontré un dato verificable, lo marqué como **DATA GAP**. Los cálculos propios están marcados como tales.

---

## 0. Respuesta corta a la pregunta central

> **¿Se puede verificar qué SKU se compró en un almacén de Jujuy con lo que existe hoy (ticket fiscal, factura electrónica, QR)?**

**No por la vía fiscal o de pagos, al menos no de forma automática ni con verificación criptográfica.** Hoy la infraestructura argentina permite verificar *que hubo una venta* (quién vendió, cuándo y por cuánto), pero no *qué producto se vendió*:

| Fuente de evidencia | Qué se puede verificar | ¿Trae el SKU? | Notas |
|---|---|---|---|
| **QR fiscal de ARCA** en factura electrónica (RG 4892/2020) | Fecha, CUIT del emisor, punto de venta, tipo y número de comprobante, **importe total**, moneda, cotización, documento del receptor (si lo hay), tipo y código de autorización (CAE) | **No** | El QR lleva solo campos de cabecera ([Contadores en Red, T3](https://contadoresenred.com/ya-esta-operativo-el-qr-de-los-comprobantes-de-afip-que-informacion-muestra/amp/); norma: [RG 4892/2020, T1](https://www.argentina.gob.ar/normativa/nacional/norma-345661/texto)). Con eso se puede consultar en ARCA si el comprobante existe y es auténtico. |
| **Web service WSFEv1** (la vía que usan casi todos los sistemas de facturación de pymes y monotributistas) | Totales, neto e IVA por alícuota | **No** (hasta donde muestra la documentación) | Los ejemplos de `FECAESolicitar` traen solo `ImpTotal`, `ImpNeto` e `ImpIVA`, sin ningún campo de ítem ([AfipSDK docs, T3](https://docs.afipsdk.com/paso-a-paso/web-services/factura-electronica)). Existe un web service con detalle de ítems (WSMTXCA), pero no confirmé su alcance ni su uso en comercios chicos → **DATA GAP**. |
| **PDF o impresión de la factura C** (Comprobantes en línea / app Facturador) | Lo que el comercio escriba en la descripción | **A veces, como texto libre** | El detalle impreso no está firmado: ARCA no lo valida contra el CAE, así que se puede editar. Solo sirve como evidencia blanda, vía OCR. |
| **Ticket de controlador fiscal** (caja registradora homologada) | Ítems impresos, totales | **Sí, impreso** (los tickets de caja listan ítems) | Los equipos emiten ticket-factura A, B, C y M ([Cronista sobre RG 5679/2025, T2](https://www.cronista.com/economia-politica/cajas-registradoras-para-facturar-la-medida-de-arca-que-deben-deben-conocer-todos-los-comerciantes)). La obligación de usar controlador para monotributistas que venden a consumidor final depende de la categoría (H a L, según normas de 2017) o del rubro (los autoservicios sí están alcanzados) ([Blog del Contador 2017, T3, desactualizado](https://blogdelcontador.com.ar/monotributistas-estan-obligados-a-factura-electronica-yo-controlador-fiscal-por-ventas-masivas-a-consumidor-final)). **DATA GAP:** cuántos almacenes de Jujuy tienen controlador fiscal. |
| **Pago por transferencia con QR interoperable** (comprobante en la billetera) | Monto, comercio que cobró (CVU/CBU, CUIT), fecha y hora | **No** | Sirve como prueba de pago, no de producto. |
| **zkTLS** (Reclaim, Opacity) sobre la web de una billetera o banco | Que un dato salió de una sesión HTTPS real, por ejemplo "pagué $X a CUIT Y" | **No**, salvo que la fuente HTTPS tenga el ítem | Mejora la prueba de **pago**, no la del **SKU**. **DATA GAP:** no encontré conectores de Reclaim u Opacity para Mercado Pago, Ualá o Cuenta DNI. |

**Implicancia de diseño:** la verificación del SKU tiene que venir de algo que agregue la startup. Hay tres opciones:
- **(a)** OCR o IA sobre el ticket impreso, cuando lo hay;
- **(b)** confirmación del comercio, ya sea con un código o un QR propio de la campaña que se entrega junto con el producto, o con la foto del producto escaneado;
- **(c)** monto exacto más CUIT del comercio adherido más franja horaria, cruzado con el precio del SKU (sirve como heurística, no como prueba).

Lo más sólido para un piloto es combinar **(b) + QR fiscal o comprobante de pago para validar comercio, fecha y monto + topes por comprador**. El ticket sin respaldo es cada vez menos confiable: a mediados de mayo de 2026, el 70,8 % de los recibos fraudulentos que detectó AppZen estaban generados por IA, cuando en marzo de 2025 eran el 0 % (ver 1.6).

---

## 1. Tendencias tecnológicas

| # | Tendencia | Etapa de adopción | Impacto | Datos clave (fechados) | Fuente (Tier) |
|---|---|---|---|---|---|
| 1.1 | **ARCA amplía la factura electrónica obligatoria y elimina el talonario de papel** | Mayoría temprana / regulatoria | **Oportunidad moderada:** habrá más comprobantes con CAE y QR, por lo que mejora la verificación de comercio, fecha y monto. **No resuelve el SKU.** | RG 5893/2026 (31/08/2026): el papel queda solo para contingencias. Desde el **01/11/2026** quedan obligados los monotributistas sociales y del Monotributo Promovido. Desde el **01/03/2027**, los sujetos no alcanzados por IVA, solo con emisión electrónica. ARCA habilita de oficio un punto de venta electrónico a quien no lo tenga. | [Tributum, T2](https://tributum.news/res-gral-5893-2026-arca-facturacion-comprobantes-electronicos-nuevos-sujetos-obligados-y-eliminacion-de-comprobantes-impresos/); [Canal 26, 09/10/2026, T2](https://www.canal26.com/economia/2026/10/09/arca-cambia-la-facturacion-quienes-deberan-dejar-de-usar-comprobantes-en-papel-y-desde-cuando/) |
| 1.2 | **QR fiscal en comprobantes** (RG 4892/2020) | Madura | **Neutral:** permite validar la autenticidad del comprobante, pero no los ítems. | Campos: fecha, CUIT, punto de venta, tipo, número, importe, moneda, cotización, documento del receptor y CAE. | [RG 4892, T1](https://www.argentina.gob.ar/normativa/nacional/norma-345661/texto); [Contadores en Red, T3](https://contadoresenred.com/ya-esta-operativo-el-qr-de-los-comprobantes-de-afip-que-informacion-muestra/amp/) |
| 1.3 | **Pagos con transferencia (PCT) por QR interoperable** | Mayoría temprana, con crecimiento acelerado | **Oportunidad:** el QR ya es el riel de pago cotidiano del comercio chico. El reembolso en pesos a un CVU es natural para el usuario. | **Julio de 2026:** 116,9 millones de PCT (+70,7 % interanual). El **98,9 %** se inició con QR (115,6 millones, +72,4 % interanual). El monto con QR fue de $2,96 billones (+68,8 % real). Ticket promedio QR ≈ **$25.600** (cálculo propio). Del lado del pagador, el 46,4 % usa CVU; del lado del comercio, el 53,4 % cobra en CVU. | [BCRA, Informe Mensual de Pagos Minoristas, julio 2026, T1](https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/Informes/informe-mensual-pagos-minoristas-2026-07.pdf) |
| 1.4 | **wARS (peso tokenizado de Ripio) en Celo** | Innovadores / temprana | **Oportunidad técnica, con riesgo de liquidez:** existe la infraestructura (rampas sin costo en Celo), pero el volumen es muy chico. | Ripio desplegó su stack wFIAT en Celo con 6 monedas, entre ellas wARS, y rampas de entrada y salida "at no cost" ([blog Celo, T1 del emisor, sin fecha visible](https://blog.celo.org/ripio-deploys-wfiat-stack-on-celo-with-no-cost-on-off-ramps-expanding-the-leading-stablecoin-9f801b82b899)). wARS también corre en Ethereum, Base y World Chain. Volumen de wARS: ≈ US$200 mil en diciembre de 2025 y ≈ US$160 mil en enero de 2026 (parcial). Ripio apunta a US$100 millones en activos bajo gestión y describe una "perspectiva cautelosa para 2026" ([Pulse/Cointelegraph, T3](https://www.pulse.bot/crypto/news/argentine-exchange-ripio-bets-on-peso-stablecoins-amid-cautious-2026-outlook-420b7da9-dd1a-4e18-8d7c-84d07b304163)). **DATA GAP:** supply de wARS en Celo, reservas auditadas y dirección del contrato. | ver celda |
| 1.5 | **Celo como L2 de Ethereum, enfocado en stablecoins y pagos** | Mayoría temprana dentro de cripto | **Oportunidad:** es una cadena alineada con pagos cotidianos y monedas locales, con un ecosistema activo en Argentina. | Desde la migración a L2 en **marzo de 2025**: más de US$65 mil millones en volumen de stablecoins y más de 1.300 millones de transacciones, según Celo ([blog Celo, T1 del emisor, cifras autodeclaradas](https://blog.celo.org/ripio-deploys-wfiat-stack-on-celo-with-no-cost-on-off-ramps-expanding-the-leading-stablecoin-9f801b82b899)). En septiembre de 2026, Celo promovía corredores de pago con stablecoins locales en LatAm ([Descubre.vc, 10/09/2026, T2](https://www.descubre.vc/noticia/celo-impulsa-pagos-con-stablecoins-en-corredores-de-am-rica-latina-2026-09-10)). | ver celda |
| 1.6 | **Recibos falsos generados por IA** | Mayoría (en el lado del fraude) | **AMENAZA ALTA** para cualquier modelo "subí la foto del ticket". | A mediados de mayo de 2026, el **70,8 %** de los recibos fraudulentos detectados por AppZen eran generados por IA (0 % en marzo de 2025). La base es de 1.471 recibos falsos de 174 empresas. El 40 % de los encuestados en EE. UU. admite haber generado un recibo falso con IA (Emburse/Atomik, mayo de 2026). El 32 % de los profesionales de finanzas no podría detectarlos. Las defensas recomendadas son metadatos, cruce con datos del comercio y detección de anomalías. | [LetsDataScience, 26/06/2026, T3, cita a AppZen y Emburse](https://letsdatascience.com/news/ai-generated-receipts-drive-majority-of-expense-fraud-af43c62a) |
| 1.7 | **OCR e IA para leer tickets** | Madura como tecnología | **Oportunidad:** extraer el texto es barato y confiable. El problema ya no es leer, sino probar que el ticket es auténtico. | **DATA GAP:** no encontré benchmarks de precisión de 2026 sobre tickets argentinos térmicos o escritos a mano. | — |
| 1.8 | **zkTLS** (Reclaim Protocol, Opacity, TLSNotary) | Innovadores | **Oportunidad a mediano plazo:** sirve para probar un pago desde una billetera sin compartir credenciales. No prueba el SKU. | Hay literatura académica de 2026 ([IACR ePrint 2026/2187, T1 académica](https://eprint.iacr.org/2026/2187)) y explicadores ([BlockEden, 19/03/2026, T3](https://blockeden.xyz/zh/blog/2026/03/19/zktls-zero-knowledge-transport-layer-security-privacy-preserving-identity-web3/); [Reclaim blog, T3](https://blog.reclaimprotocol.org/posts/what-is-reclaim-protocol)). **DATA GAP:** casos productivos de zkTLS aplicados a recibos de retail y conectores con billeteras argentinas. | ver celda |

---

## 2. Actividad de inversión

### 2.1 Cashback, rebates y fidelización (referentes globales)

**Ibotta (NYSE: IBTA), T1, SEC/Business Wire**
- **Resultados del segundo trimestre de 2026** (reportados el 03/08/2026):
  - Ingresos de US$88,9 millones (+3 % interanual).
  - Ingresos por canjes de US$80,2 millones (+10 %).
  - Canjes en publishers de terceros: 74,4 millones (+27 %).
  - Canjes en su app propia: 17,1 millones (−22 %).
  - Redeemers: 20,9 millones (+21 %).
  - Ingreso por canje: US$0,88 (−4 %).
- **Alianzas:** exclusividad con 7-Eleven (más de 11.500 tiendas) y lanzamientos con Uber y Giant Eagle.
- **Guía para el tercer trimestre de 2026:** US$86–90 millones.
- **Lectura:** el modelo de "marca paga por venta verificada" funciona, pero crece mediante la distribución en redes de terceros, no con apps propias de consumidor.
- Fuente: [Business Wire, T1](https://www.businesswire.com/news/home/20260803571507/en/Ibotta-Reports-Second-Quarter-2026-Financial-Results).
- **DATA GAP:** no pude abrir el 8-K del tercer trimestre de 2026 (error en sec.gov). El enlace queda en la sección 7.

**Fetch Rewards:** la última ronda grande que encontré es la Serie E de US$240 millones (2022), con valuación de más de US$2.500 millones, y una inversión estratégica de NielsenIQ (abril de 2022) ([BizTimes, T2](https://biztimes.com/madison-based-fetch-rewards-raises-240-million-grows-valuation-to-over-2-5-billion/); [Business Wire 2022, T1](https://www.businesswire.com/news/home/20220407005676/en/NielsenIQ-Announces-Strategic-Investment-in-Fetch-Rewards-the-Nation%E2%80%99s-Leading-Consumer-Rewards-App)). **DATA GAP:** rondas o adquisiciones de Fetch en 2025-2026.

**Upside:** los usuarios superaron US$1.000 millones en cashback acumulado (26/08/2025) ([Upside, T1 del emisor](https://www.upside.com/newsroom/press-releases/upside-users-earn-more-than-1-billion-in-cash-back)). La última ronda conocida es de US$165 millones (2022). **DATA GAP:** rondas de 2025-2026.

**Gelt** (cashback por ticket en Argentina y Brasil): solo encontré notas viejas de iProUP. **DATA GAP:** si sigue operando en Argentina en 2026. Es un antecedente directo del modelo "subí tu ticket" en el país.

### 2.2 B2B para el canal tradicional en LatAm: quiénes siguen vivos

| Empresa | Estado conocido | Fuente |
|---|---|---|
| **Frubana** (Colombia; B2B para restaurantes y comercios) | **Cerrada.** Cerró su último mercado, Brasil, el **14/08/2025**, tras recaudar unos US$271 millones. Antes había salido de Colombia y México. | [Forbes Colombia, 14/08/2025, T2](https://forbes.co/2025/08/14/negocios/frubana-pone-fin-a-sus-operaciones); [Descubre.vc, T2](https://www.descubre.vc/noticia/el-fin-de-frubana-cierra-su-ltimo-mercado-activo-en-brasil-2025-08-14) |
| **Merqueo** | Cerrada (se menciona junto con Frubana) | [El Colombiano, T2](https://www.elcolombiano.com/negocios/historia-detras-cierre-frubana-y-merqueo-colombia-america-latina-LP29733329) |
| **Chiper** (tiendas de barrio en Colombia y México) | La última ronda pública es la Serie B de US$53 millones (noviembre de 2021). **DATA GAP:** estado en 2025-2026. | [LatamList, T2](https://latamlist.com/chiper-raises-53m-for-corner-shop-e-commerce-platform/) |
| **Tul** (ferreterías) | La última ronda pública es la Serie B de US$181 millones (2022, valuación de unos US$800 millones). **DATA GAP:** estado en 2026. | [Bloomberg Línea, T2](https://www.bloomberglinea.com/2022/01/11/colombiana-tul-ahora-esta-valuada-en-us800-millones-tras-cerrar-nueva-ronda/) |
| **Yom, Wabi (FEMSA), Jüsto** | **DATA GAP:** no encontré información de 2025-2026. | — |

**Lectura:** el capital para modelos B2B de logística e inventario en el canal tradicional se secó después de 2022 y hubo cierres visibles. Los modelos *asset-light* (datos, promociones, pagos) son los que se pueden defender ante un inversor hoy. Dos ejemplos en Argentina: MiBarrio.chat, ventas por WhatsApp con más de 7.000 comercios según [iProfesional, T2](https://www.iprofesional.com/economia/314906-ventas-por-whatsapp-mibarrio-chat-suma-a-mas-de-7-000-comercios-de-todo-el-pais) (la fecha original de la nota no está clara), y grupos de almaceneros que coordinan precios por WhatsApp.

### 2.3 Celo y Ripio en Argentina (grants y hackatones)
- **Workshops "Stable Agents: LatAm"** de Celo y Ripio en Argentina (17/10/2026): integración de stablecoins wFIAT y del facilitador x402 nativo de Celo, con un pozo de **US$2.000** en premios ([Descubre.vc, 08/10/2026, T2](https://www.descubre.vc/noticia/celo-y-ripio-lanzan-talleres-para-desarrolladores-en-argentina-2026-10-08)).
- **"Onchain Agents Hackathon: Real-World Payments"** de Celo ([Notion de Celo, T1 del emisor](https://celoplatform.notion.site/Onchain-Agents-Hackathon-Build-for-Real-World-Payments-Everyday-Applications-364d5cb803de800c9502d8a384716324?pvs=74)). **DATA GAP:** fechas y montos.
- **Lectura:** el ecosistema empuja justo este tipo de casos (pagos reales con wARS). Es buen timing para pedir un grant, aunque los montos visibles son chicos.

### 2.4 Retail media en LatAm
- Para 2026 se habla de un "año de madurez" del retail media en LatAm: los datos transaccionales pasan a ser el activo clave y la medición pasa a ser incrementalidad y ventas ([Revista Mercado, 14/01/2026, T2, opinión del CEO de Adsmovil](https://mercado.com.ar/marketing/retail-media-en-latinoamerica-perspectivas-de-madurez-y-consolidacion-de-un-modelo-regional-para-2026)).
- **DATA GAP:** montos de inversión en retail media en LatAm y Argentina para 2026 (las fuentes que leí no los traen). Tampoco confirmé cifras de Mercado Ads.

---

## 3. Cambios de comportamiento

### 3.1 Pagos digitales
**Nacional** (fuente: [BCRA, Informe de Inclusión Financiera de octubre de 2026, datos a junio de 2026, T1](https://www.bcra.gob.ar/archivos/Pdfs/publicacionesestadisticas/informes/informe-inclusion-financiera-2026-S1.pdf)):
- 38,1 millones de personas tienen cuenta.
- 30,5 millones usaron pagos electrónicos en el segundo trimestre de 2026.
- Cada adulto hace en promedio **32,8 pagos electrónicos por mes** (+15 % interanual).
- Las **extracciones de efectivo por adulto bajaron un 33 % interanual**, a mínimos históricos.
- El 76,5 % de los titulares tiene a la vez cuenta bancaria y cuenta de pago.

**Jujuy y NOA:**
- **DATA GAP:** el informe del BCRA no desagrega por provincia. No encontré datos de uso de QR o billeteras en Jujuy en 2026.
- Hay indicios indirectos: en 2025, la compra de bienes durables en Jujuy subió **+61,3 %** contra 2023, la segunda provincia del país según MAP ([Cronista, 27/03/2026, T2](https://www.cronista.com/economia-politica/la-revancha-del-interior-cuales-son-los-sectores-cuyas-ventas-vuelan-fuera-de-buenos-aires)).
- **Para validar en campo:** la proporción de almacenes de Jujuy que cobran con QR frente a los que cobran en efectivo.

### 3.2 Cripto y stablecoins en Argentina
- **Actividad cripto (julio de 2025 a junio de 2026):** US$88.500 millones (+15,3 % interanual), segundo lugar en LatAm detrás de Brasil (US$252.500 millones). El promedio regional creció 9,8 %. Las billeteras con al menos US$10.000 en stablecoins aumentaron 82 % desde julio de 2024 ([iProUP, 21/10/2026, T2, cita a Chainalysis 2026](https://www.iproup.com/economia-digital/72504-el-dolar-cripto-crece-mas-rapido-en-argentina-que-en-la-region)).
- **Penetración:** cerca del 20 % de la población, unos 8,6 millones de personas ([Bitcoin.com News, 03/01/2026, T3, basado en Chainalysis 2025](https://news.bitcoin.com/argentina-enters-2026-with-cryptocurrency-adoption-levels-reaching-20/?rand=52384)).
- **Lectura:**
  - La adopción es de **stablecoins en dólares** para ahorro y cobertura, no de pesos tokenizados para gastar (el volumen de wARS es de unos US$200 mil por mes).
  - **El comprador de almacén no debería ver nada cripto:** el reembolso tiene que llegar en pesos a su CVU o alias.
  - wARS sirve como riel del escrow del lado de la marca, no como experiencia del consumidor.

### 3.3 Consumo masivo y canal tradicional (2025-2026)
- **Participación por canal (NIQ, ~abril de 2026):**
  - Canal tradicional: **34 %**.
  - Supermercados de cadena: 31 %.
  - Kioscos y minimercados: 15 %.
  - Autoservicios independientes: 14 %.
  - Fuente: [Los Andes, 07/04/2026, T2](https://www.losandes.com.ar/economia/consumo-los-almacenes-les-ganan-la-pulseada-los-supermercados-n5986731).
  - En el último bimestre de 2025, los almacenes crecieron +8 % y las cadenas cayeron −4 %.
- **Septiembre de 2026 (Scentia), volumen interanual:**
  - Total: **−1,2 %**.
  - Autoservicios independientes: −3,7 %.
  - Supermercados: −2,6 %.
  - Kioscos y comercios tradicionales: **0 %** (contra agosto, **+2,3 %**: el mejor canal físico).
  - E-commerce: +30,5 %.
  - Acumulado enero-septiembre: total −2,7 %; kioscos −2,4 %; supermercados −3,8 %.
  - Por categoría: impulsivos +4 %, alimentación +1,7 %, bebidas sin alcohol −8 %, perecederos −10,2 %.
  - Precios de consumo masivo: +27,2 % interanual, contra un IPC de 33,4 %.
  - Fuente: [iProfesional, 22/10/2026, T2](https://www.iprofesional.com/economia/467247-consumo-masivo-cayo-septiembre-2026-preocupa-impacto-bolsillo-argentinos).
- **Forma de comprar:**
  - En el cuarto trimestre de 2025, la frecuencia de visitas cayó −8,2 % y el volumen −4,7 % (Worldpanel by Numerator).
  - Hay polarización: las marcas premium sostienen volumen con promociones, las segundas marcas y marcas propias ganan terreno y las marcas medias quedan "en el medio".
  - Ejemplos de brecha de precio: pan lactal 56 %, gaseosa 2,25 l $5.450 contra $4.183.
  - CAME describe compras fraccionadas y uso de promociones bancarias.
  - Fuente: [Infobae, 09/05/2026, T2](https://www.infobae.com/economia/2026/05/09/consumo-en-tension-aumentan-las-compras-fraccionadas-y-de-marcas-propias-ante-la-perdida-de-poder-adquisitivo-de-los-hogares/).
- **Lectura:** se combinan **alta sensibilidad al precio y migración entre marcas** con un **canal tradicional que retiene participación**. Es un contexto favorable para una promo de prueba con reembolso: el consumidor está dispuesto a cambiar de marca, y la marca regional o desafiante necesita lograr esa primera prueba frente a las líderes.
- **DATA GAP:** ticket promedio y frecuencia del canal tradicional específicos del NOA o de Jujuy.

### 3.4 WhatsApp y comercios
- Los almaceneros se organizan en **varios grupos de WhatsApp** para compartir precios y promociones y rechazar aumentos de los preventistas. En casos puntuales lograron bajas de precio: una chocolatada pasó de $4.500 a $3.000 y una gaseosa de $2.600 a $2.000 ([Cronista, 03/08/2025, T2](https://www.cronista.com/economia-politica/quieren-vender-bajen-los-precios-el-grupo-de-whatsapp-que-hace-temblar-a-las-grandes-marcas)).
- WhatsApp funciona como "infraestructura crítica" del comercio en Argentina ([Revista Mercado, T2](https://mercado.com.ar/tendencias/whatsapp-se-consolida-como-infraestructura-critica-para-operaciones-comerciales-en-argentina)).
- **Lectura:** el onboarding y la confirmación del comercio deberían hacerse por WhatsApp, no con una app nueva. Los grupos de almaceneros son un canal de distribución.
- **DATA GAP:** porcentaje de almacenes que usan WhatsApp Business en Jujuy.

---

## 4. Predicciones

| Predicción | Horizonte | Confianza | Base |
|---|---|---|---|
| El retail media en LatAm se mide cada vez más por **incrementalidad y ventas atribuidas a transacciones** (atribución de ciclo cerrado) | 2026-2027 | Media | [Revista Mercado, 14/01/2026, T2](https://mercado.com.ar/marketing/retail-media-en-latinoamerica-perspectivas-de-madurez-y-consolidacion-de-un-modelo-regional-para-2026); en EE. UU., Ibotta muestra que la distribución en redes de terceros (+27 %) supera a las apps propias (−22 %) |
| El canal tradicional mantiene una participación de alrededor de un tercio del consumo masivo y supera a las cadenas en un contexto de bolsillo ajustado | 2026-2027 | Media-alta | NIQ (34 % contra 31 %); Scentia de septiembre de 2026 (kioscos 0 %, el mejor canal físico) |
| La factura electrónica llega a casi todo el universo de pequeños contribuyentes para el **01/03/2027** | 2027 | Alta (es normativa) | RG 5893/2026 |
| ARCA **no** va a exigir detalle de ítems a monotributistas en el corto plazo | 2027 | Baja-media (inferencia, sin fuente) | **DATA GAP:** no encontré ningún anuncio en esa dirección |
| Los recibos falsos generados por IA vuelven inviable verificar solo con una foto del ticket | Ya ocurre | Alta | AppZen y Emburse, 2026 |
| Los pesos tokenizados siguen siendo un nicho en el consumo minorista, con volumen chico | 2026-2027 | Media | Ripio "cautelosa 2026"; unos US$200 mil por mes |

**DATA GAP:** no encontré predicciones cuantitativas (consultoras como Kantar, NIQ o Euromonitor) sobre el futuro del canal tradicional en Argentina más allá de 2026.

---

## 5. Evaluación de timing

**Veredicto: el timing es bueno para el mercado y para el riel de pagos, regular para la verificación y prematuro para el componente cripto visible al usuario.**

**A favor (ahora):**
1. El QR interoperable es masivo: 115,6 millones de pagos por mes, +72 % interanual. El efectivo cae −33 % interanual. Reembolsar en pesos a un CVU no genera fricción.
2. El canal tradicional retiene participación y el consumidor cambia de marca por precio. Las marcas regionales necesitan pruebas de producto verificables y no tienen acceso a la atribución de las cadenas.
3. ARCA está digitalizando a los pequeños contribuyentes ahora mismo (desde el 01/11/2026 y el 01/03/2027). Cada mes hay más tickets con QR y CAE validables.
4. Celo y Ripio promueven activamente casos de pagos reales con wFIAT en Argentina, con workshops y hackatones en octubre de 2026.
5. El modelo "marca paga por venta verificada" está probado en EE. UU.: Ibotta tiene 20,9 millones de redeemers.

**En contra o riesgos:**
1. **No hay verificación del SKU desde la infraestructura fiscal ni de pagos.** El QR y WSFE solo traen totales. Hay que construir la prueba del SKU con el comercio.
2. Los recibos generados por IA crecieron de 0 % a 70,8 % del fraude detectado en 14 meses. Sin anclas externas (CAE, pago, confirmación del comercio), el fraude es barato.
3. wARS tiene volumen muy chico, lo que trae riesgo de liquidez y de rampa para el escrow. Hay que tener un plan B con USDC o cUSD en Celo y conversión fuera de la cadena.
4. El consumo masivo acumula −2,7 % en enero-septiembre de 2026, así que los presupuestos de trade marketing de las marcas regionales pueden estar ajustados.
5. Los B2B del canal tradicional en LatAm (Frubana, Merqueo) cerraron: el apetito inversor por el segmento es bajo.

**Ventana:** entre noviembre de 2026 y marzo de 2027, en coincidencia con la obligatoriedad de la factura electrónica, para pilotear la validación "QR fiscal o comprobante QR de pago + confirmación del comercio".

---

## 6. Data gaps (consolidado)

1. Porcentaje de almacenes de Jujuy o del NOA con controlador fiscal, factura electrónica o cobro con QR.
2. Uso de QR y billeteras desagregado por provincia (el BCRA no lo publica en los informes revisados).
3. Alcance y uso real de WSMTXCA (factura con ítems) en comercios chicos.
4. Si ARCA planea exigir el detalle de ítems a monotributistas.
5. Supply, reservas auditadas y contrato de wARS en Celo; fecha del despliegue de wFIAT en Celo.
6. Conectores zkTLS (Reclaim u Opacity) para Mercado Pago, Ualá, Cuenta DNI o bancos argentinos.
7. Benchmarks de precisión de OCR o IA de 2026 sobre tickets argentinos.
8. Rondas o adquisiciones de Fetch, Upside y Gelt en 2025-2026; estado en 2026 de Chiper, Tul, Yom, Wabi y Jüsto.
9. Resultados del tercer trimestre de 2026 de Ibotta (el 8-K no abrió).
10. Montos de retail media en LatAm y Argentina para 2026.
11. Ticket promedio y frecuencia del canal tradicional en el NOA.
12. Uso de WhatsApp Business por comercios en Jujuy.
13. Fechas y montos de los hackatones y grants de Celo en LatAm a fines de 2026.

---

## 7. URLs

**Tier 1**
- https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/Informes/informe-mensual-pagos-minoristas-2026-07.pdf
- https://www.bcra.gob.ar/archivos/Pdfs/publicacionesestadisticas/informes/informe-inclusion-financiera-2026-S1.pdf
- https://www.argentina.gob.ar/normativa/nacional/norma-345661/texto (RG 4892/2020)
- https://www.businesswire.com/news/home/20260803571507/en/Ibotta-Reports-Second-Quarter-2026-Financial-Results
- https://www.sec.gov/Archives/edgar/data/0001538379/000162828026068884/earningsrelease93026.htm (tercer trimestre de 2026, no se pudo abrir)
- https://blog.celo.org/ripio-deploys-wfiat-stack-on-celo-with-no-cost-on-off-ramps-expanding-the-leading-stablecoin-9f801b82b899
- https://www.upside.com/newsroom/press-releases/upside-users-earn-more-than-1-billion-in-cash-back
- https://eprint.iacr.org/2026/2187
- https://celoplatform.notion.site/Onchain-Agents-Hackathon-Build-for-Real-World-Payments-Everyday-Applications-364d5cb803de800c9502d8a384716324?pvs=74

**Tier 2**
- https://tributum.news/res-gral-5893-2026-arca-facturacion-comprobantes-electronicos-nuevos-sujetos-obligados-y-eliminacion-de-comprobantes-impresos/
- https://www.canal26.com/economia/2026/10/09/arca-cambia-la-facturacion-quienes-deberan-dejar-de-usar-comprobantes-en-papel-y-desde-cuando/
- https://www.cronista.com/economia-politica/cajas-registradoras-para-facturar-la-medida-de-arca-que-deben-deben-conocer-todos-los-comerciantes
- https://www.iprofesional.com/economia/467247-consumo-masivo-cayo-septiembre-2026-preocupa-impacto-bolsillo-argentinos
- https://www.losandes.com.ar/economia/consumo-los-almacenes-les-ganan-la-pulseada-los-supermercados-n5986731
- https://www.infobae.com/economia/2026/05/09/consumo-en-tension-aumentan-las-compras-fraccionadas-y-de-marcas-propias-ante-la-perdida-de-poder-adquisitivo-de-los-hogares/
- https://www.cronista.com/economia-politica/la-revancha-del-interior-cuales-son-los-sectores-cuyas-ventas-vuelan-fuera-de-buenos-aires
- https://www.cronista.com/economia-politica/quieren-vender-bajen-los-precios-el-grupo-de-whatsapp-que-hace-temblar-a-las-grandes-marcas
- https://mercado.com.ar/tendencias/whatsapp-se-consolida-como-infraestructura-critica-para-operaciones-comerciales-en-argentina
- https://www.iprofesional.com/economia/314906-ventas-por-whatsapp-mibarrio-chat-suma-a-mas-de-7-000-comercios-de-todo-el-pais
- https://mercado.com.ar/marketing/retail-media-en-latinoamerica-perspectivas-de-madurez-y-consolidacion-de-un-modelo-regional-para-2026
- https://www.iproup.com/economia-digital/72504-el-dolar-cripto-crece-mas-rapido-en-argentina-que-en-la-region
- https://www.descubre.vc/noticia/celo-y-ripio-lanzan-talleres-para-desarrolladores-en-argentina-2026-10-08
- https://www.descubre.vc/noticia/celo-impulsa-pagos-con-stablecoins-en-corredores-de-am-rica-latina-2026-09-10
- https://forbes.co/2025/08/14/negocios/frubana-pone-fin-a-sus-operaciones
- https://www.descubre.vc/noticia/el-fin-de-frubana-cierra-su-ltimo-mercado-activo-en-brasil-2025-08-14
- https://www.elcolombiano.com/negocios/historia-detras-cierre-frubana-y-merqueo-colombia-america-latina-LP29733329
- https://latamlist.com/chiper-raises-53m-for-corner-shop-e-commerce-platform/
- https://www.bloomberglinea.com/2022/01/11/colombiana-tul-ahora-esta-valuada-en-us800-millones-tras-cerrar-nueva-ronda/
- https://biztimes.com/madison-based-fetch-rewards-raises-240-million-grows-valuation-to-over-2-5-billion/

**Tier 3**
- https://contadoresenred.com/ya-esta-operativo-el-qr-de-los-comprobantes-de-afip-que-informacion-muestra/amp/
- https://docs.afipsdk.com/paso-a-paso/web-services/factura-electronica
- https://blogdelcontador.com.ar/monotributistas-estan-obligados-a-factura-electronica-yo-controlador-fiscal-por-ventas-masivas-a-consumidor-final (2017, desactualizado)
- https://www.pulse.bot/crypto/news/argentine-exchange-ripio-bets-on-peso-stablecoins-amid-cautious-2026-outlook-420b7da9-dd1a-4e18-8d7c-84d07b304163
- https://letsdatascience.com/news/ai-generated-receipts-drive-majority-of-expense-fraud-af43c62a
- https://news.bitcoin.com/argentina-enters-2026-with-cryptocurrency-adoption-levels-reaching-20/?rand=52384
- https://blockeden.xyz/zh/blog/2026/03/19/zktls-zero-knowledge-transport-layer-security-privacy-preserving-identity-web3/
- https://blog.reclaimprotocol.org/posts/what-is-reclaim-protocol
