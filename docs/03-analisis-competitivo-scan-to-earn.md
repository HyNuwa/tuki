# Competencia en Scan-to-Earn y Modelos de Fidelización: Lecciones de Madurez, Fallos de Diseño y la Frontera de Innovación Web3

El mercado global de automatización de rebajas y reembolsos post-compra se encuentra en una fase de transformación estructural, proyectando una expansión que pasará de 6,45 mil millones de dólares a más de 16,63 mil millones de dólares hacia 2034, impulsada por una tasa de crecimiento anual compuesta del 11,2%<sup>1</sup>. Este crecimiento responde a la necesidad de las marcas de consumo masivo (*Consumer Packaged Goods* o CPG) de optimizar el retorno de su inversión publicitaria a través de mecanismos de atribución directa basados en ventas reales<sup>2</sup>.

En este contexto, la convergencia entre los modelos de captura de compras (*Scan-to-Earn*), la inteligencia de datos comercial y las arquitecturas de pagos descentralizados presenta tanto oportunidades de disrupción operativa como riesgos severos de diseño económico<sup>4</sup>. El análisis comparativo de las aplicaciones consolidadas en el ámbito tradicional y los experimentos emergentes en la Web3 demuestra que la sostenibilidad a largo plazo no depende de la emisión de activos especulativos, sino de la capacidad técnica para verificar transacciones, reducir costos de adquirencia y estructurar incentivos financiados por valor comercial real<sup>2</sup>.

## 1. Diagnóstico del Mercado Web2: Mecánicas de Éxito y Límites de Escala

El examen de los líderes de la industria de incentivos al consumo en el entorno Web2 revela una marcada bifurcación entre las aplicaciones dirigidas directamente al usuario final y las infraestructuras de marketing de rendimiento B2B<sup>2</sup>. Los modelos de Ibotta y Fetch Rewards ofrecen el marco de referencia operativo sobre el cual deben medirse las soluciones blockchain<sup>1</sup>.

### Ibotta: La Transición hacia una Red de Atribución B2B

Ibotta completó su salida a bolsa alcanzando una valoración superior a los 3,000 millones de dólares, consolidándose como la plataforma de referencia en el sector de reembolsos minoristas en Estados Unidos<sup>7</sup>. La trayectoria de Ibotta demuestra un principio fundamental del sector: el modelo orientado directamente al consumidor (D2C), aunque logró acumular 50 millones de descargas, alcanzó un techo de expansión rentable cuando operaba de forma aislada<sup>2</sup>.

Para superar esta limitación de escala, la empresa pivotó hacia la creación de la *Ibotta Performance Network* (IPN), una plataforma tecnológica impulsada por inteligencia artificial que conecta directamente los presupuestos promocionales de más de 2,400 marcas de CPG con los canales digitales de grandes cadenas minoristas como Walmart<sup>2</sup>.

El modelo de monetización de Ibotta se basa en un esquema de pago por rendimiento (*pay-per-sale*), donde las marcas pagan exclusivamente cuando una venta calificada es completada y verificada<sup>2</sup>. Durante el ejercicio 2023, la compañía generó 320,0 millones de dólares en ingresos totales, experimentando un crecimiento interanual del 52%, de los cuales 243,9 millones (un 76%) provinieron directamente de las comisiones por reembolso de promociones<sup>3</sup>.

A pesar de afrontar fluctuaciones operativas reflejadas en su reporte del primer trimestre de 2026 con ingresos de 82,48 millones de dólares, el negocio mantiene un alto apalancamiento operativo debido a que el volumen incremental de redención fluye con un impacto directo hacia el beneficio neto una vez cubierta la infraestructura central<sup>7</sup>. Para sostener su propuesta de valor ante directores financieros y de marketing, Ibotta respalda sus métricas de conversión mediante estudios independientes de incremento de ventas (*sales lift*) elaborados por firmas analíticas como Circana<sup>2</sup>.

### Fetch Rewards: Lealtad Agnóstica y Monetización de Datos

Fetch Rewards construyó un modelo de negocio valorado en 2,500 millones de dólares mediante el desarrollo de una experiencia de usuario de baja fricción basada en el reconocimiento agnóstico de comprobantes de compra<sup>5</sup>. A diferencia de los esquemas que exigen la activación previa de ofertas puntuales, Fetch otorga un incentivo base (típicamente 25 puntos, equivalentes a 2,5 centavos de dólar) por cualquier ticket escaneado, aplicando multiplicadores de recompensa cuando detecta la compra de productos pertenecientes a sus más de 300 marcas asociadas<sup>5</sup>.

El sostenimiento económico de Fetch, que atiende a más de 17 millones de usuarios activos mensuales y ha distribuido más de 1,000 millones de dólares en recompensas acumuladas, descansa en la diversificación de sus vías de ingreso<sup>5</sup>. El 35% de sus ingresos totales proviene del licenciamiento de datos agregados y anonimizados sobre hábitos de consumo a marcas competidoras que buscan inteligencia competitiva en tiempo real<sup>5</sup>.

Entre un 15% y un 30% adicional se genera a través de comisiones de afiliación cuando los usuarios canjean sus puntos por tarjetas de regalo minoristas o realizan compras integradas<sup>5</sup>. Esta arquitectura permite a Fetch registrar una tasa de retención semanal del 70%<sup>5</sup>. Sin embargo, la operación enfrenta costos estructurales continuos vinculados al procesamiento mediante Reconocimiento Óptico de Caracteres (OCR), la validación de autenticidad de tickets y los algoritmos de detección de reclamos duplicados<sup>1</sup>.

| **Métrica / Dimensión**               | **Ibotta (IBTA)**                                                   | **Fetch Rewards**                                                                 |
|---------------------------------------|---------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| **Modelo de Negocio Dominante**       | Red de marketing de rendimiento B2B (*Pay-per-sale*)<sup>2</sup>    | Agregador de datos de lealtad agnóstica y licencias B2B<sup>5</sup>               |
| **Escala de Usuarios / Alcance**      | 50M+ descargas D2C integradas en redes minoristas (IPN)<sup>2</sup> | 17M+ usuarios activos mensuales (MAU)<sup>5</sup>                                 |
| **Valoración / Desempeño Financiero** | Valoración IPO \>\$3.000M; Ingresos 2023 de \$320M<sup>3</sup>      | Valoración privada de \$2.500M<sup>5</sup>                                        |
| **Fuentes Principales de Ingreso**    | Tarifas por conversión de venta (~76% de ingresos)<sup>3</sup>      | Licenciamiento de datos (35%), comisiones de afiliación y patrocinios<sup>5</sup> |
| **Mecanismo de Verificación**         | Integraciones POS directas y OCR en aplicación<sup>1</sup>          | Reconocimiento Óptico de Caracteres (OCR) multi-canal<sup>1</sup>                 |
| **Validación de ROAS**                | Estudios de incremento de ventas de terceros (Circana)<sup>2</sup>  | Analítica de consumo de productos en tiempo real<sup>5</sup>                      |

## 2. Evaluación de Competidores Web3: Lecciones, Fallos de Diseño y Mitos Financieros

La introducción de cadenas de bloques en las dinámicas de pagos y recompensas persigue eliminar la intermediación financiera tradicional, reducir los costos de adquirencia y otorgar soberanía de datos al usuario<sup>4</sup>. Sin embargo, la evidencia operativa revela importantes desajustes entre las teorías de incentivos tokenizados y la realidad de los ingresos corporativos<sup>4</sup>.

### Decal: Pagos en Stablecoins y la Falacia del Rendimiento de Tesorería

Decal opera como una plataforma de comercio para pequeñas y medianas empresas orientada a sectores de alta frecuencia como cafeterías, barberías y centros de entrenamiento personal<sup>4</sup>. Su oferta integra cobros en terminales físicas, gestión de reservas, paquetes prepagados y una administración de tesorería basada en monedas estables (*stablecoins*)<sup>4</sup>.

La plataforma registra más de 4,1 millones de dólares en pagos procesados a través de más de 42,000 operaciones, aplicando un modelo de cobro SaaS de 49 dólares mensuales más una comisión cercana al 1% en pagos procesados con stablecoins<sup>4</sup>.

El aspecto central de la arquitectura de Decal es la habilitación de saldos prepagados por parte de los clientes<sup>4</sup>. El usuario recarga un monto inicial (por ejemplo, US\$50) a cambio de saldo de regalo o beneficios comerciales, y el consumo posterior no genera comisiones de procesamiento de pago adicionales para el comercio<sup>4</sup>.

No obstante, la propuesta promocional de financiar los bonos de fidelidad a través del rendimiento financiero generado por los saldos depositados en protocolos de finanzas descentralizadas (DeFi) —que anuncian retornos no garantizados de hasta el 8% anual— presenta un desajuste matemático estructural<sup>4</sup>.

`Rendimiento mensual = $50 × (0,08 / 12) ≈ $0,33`

Un capital de 50 dólares depositado durante 30 días genera aproximadamente 0,33 dólares en rendimiento simple antes de considerar riesgos de liquidación, comisiones de red e impuestos<sup>4</sup>. Resulta imposible financiar un incentivo comercial relevante (como un bono de US\$5 por recarga) apoyándose únicamente en el rendimiento financiero de corto plazo de la tesorería<sup>4</sup>. Por lo tanto, los programas de bonificación deben ser absorbidos directamente por los márgenes de venta o los presupuestos de adquisición de clientes del propio comercio<sup>4</sup>.

### Crush Rewards: Tokenomics Especulativo frente a la Venta Real de Datos

Crush Rewards diseñó una aplicación *Scan-to-Earn* desplegada en la red Celo que recompensa la recolección de información comercial mediante cuatro mecanismos: escaneo de tickets impresos, fotografías de precios en góndolas, sincronización de tarjetas bancarias mediante Plaid y recolección de precios públicos vía extensión de navegador<sup>4</sup>. Con una aplicación pública en la App Store de Estados Unidos (calificación 4,5/5) y más de 1,87 millones de tokens \$CRUSH distribuidos, el proyecto intenta monetizar la información recopilada a través de Syntalic, una plataforma B2B que posteriormente evolucionó hacia Synthia AI<sup>4</sup>.

El flujo económico planteado para Crush Rewards establece que los colaboradores aportan datos de consumo e inteligencia de precios a cambio de unidades del token \$CRUSH<sup>4</sup>. Estos datos alimentan la plataforma Synthia AI, diseñada para vender análisis de mercado a empresas de consumo masivo<sup>4</sup>. En la teoría del protocolo, los compradores corporativos adquieren tokens \$CRUSH en el mercado abierto para pagar por las consultas de datos, activando un contrato inteligente que asigna el 75% de los fondos recibidos a la quema permanente (*token burn*) y el 25% restante al fondo de redistribución para los colaboradores<sup>4</sup>.

A pesar de haber ejecutado transacciones de prueba en mainnet durante julio de 2026 (destinando 84,10 tokens a quema y 28,03 a colaboradores), Crush Rewards no aporta evidencia pública de contratos comerciales B2B sostenidos a gran escala que generen una demanda orgánica del token<sup>4</sup>.

El modelo enfrenta fricciones operativas severas: los usuarios están expuestos a la volatilidad cambiaria de un token no estable, el proceso de retiro exige alcanzar niveles altos de verificación dentro de la app (Nivel 4) y la producción de datos por parte de los usuarios no garantiza la existencia automática de compradores corporativos dispuestos a pagar por dicha información<sup>4</sup>.

### Blackbird: Red de Fidelización Gastronómica y Pagos en Red

Blackbird representa la iniciativa de mayor volumen de capital de riesgo aplicada a la fidelización mediante tecnología blockchain en el sector gastronómico<sup>13</sup>. Fundada por Ben Leventhal, la compañía ha acumulado aproximadamente 85 millones de dólares en financiamiento a través de rondas respaldadas por fondos como a16z Crypto, Spark Capital, Coinbase y Union Square Ventures<sup>13</sup>.

La propuesta de Blackbird aborda la erosión estructural de los márgenes netos en la industria de restaurantes, los cuales han disminuido desde niveles del 20% hace dos décadas hasta un promedio actual del 4%, en un contexto donde el 60% de los establecimientos quiebra en su primer año de operación<sup>14</sup>. A través de su infraestructura de pagos (Blackbird Pay) y su activo de fidelidad ($FLY), la plataforma ofrece devoluciones de entre el 2x y el 7x en puntos según el nivel de gasto o depósito precargado por el usuario ($500, \$5,000 o \$10,000 anuales)<sup>15</sup>.

La diferencia clave de Blackbird radica en que no opera como una billetera aislada ni como un programa de puntos cerrado, sino como una alianza federada de fidelización<sup>14</sup>. La red permite a restaurantes independientes compartir datos de reconocimiento de clientes recurrentes (*regulars*) sin ceder sus márgenes operativos a las plataformas tradicionales de reservas o entregas a domicilio, utilizando la blockchain para coordinar la liquidación inter-comercio de las recompensas<sup>13</sup>.

| **Criterio Estratégico**      | **Decal**                                                                  | **Crush Rewards**                                                                                                                                        | **Blackbird**                                                                     |
|-------------------------------|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| **Problema Central Resuelto** | Reducción de costos de cobro y saldos prepagados programables<sup>4</sup>  | Captura atomizada de datos de precios en góndola y tickets<sup>4</sup>                                                                                   | Pérdida de margen e identificación de clientes en restaurantes<sup>13</sup>       |
| **Fuente Real de Ingresos**   | Abono SaaS (\$49/mes) + ~1% comisión en stablecoins<sup>4</sup>            | Venta B2B de inteligencia comercial vía Synthia AI<sup>4</sup>                                                                                           | Procesamiento de pagos, suscripciones y servicios de red<sup>13</sup>             |
| **Incentivo al Consumidor**   | Descuentos directos y saldo de regalo otorgado por el comercio<sup>4</sup> | Distribución de tokens $CRUSH por áreas de escaneo<sup>4</sup> | Puntos $FLY (2X a 7X) canjeables en la red gastronómica<sup>15</sup> |
| **Riesgo Estructural**        | Incapacidad de sostener incentivos mediante rendimiento DeFi<sup>4</sup>   | Volatilidad del token, fricción de retiro y falta de demanda B2B<sup>4</sup>                                                                             | Alta necesidad de capital de riesgo para escalar la red de comercios<sup>13</sup> |

## 3. La Frontera Tecnológica: Permisos Programables, Tarjetas Virtuales y zkTLS

Las ventajas competitivas de la arquitectura Web3 en el ecosistema de comercio e incentivos no provienen de los esquemas de puntos tokenizados, sino del desarrollo de primitives criptográficos que permiten la ejecución autónoma de pagos, el control delegado de fondos y la verificación de datos del mundo real sin intermediarios opacos<sup>4</sup>.

### Sup Wallet y PayPerCard: Permisos Delegados para Agentes de IA

Sup Wallet, desarrollado sobre la blockchain Sui, introduce el concepto de autorizaciones programables limitadas (*grants*)<sup>4</sup>. En lugar de otorgar acceso ilimitado a la clave privada de una billetera, el propietario define reglas contractuales estrictas que restringen la capacidad de gasto de un agente de software<sup>4</sup>. Estas restricciones incluyen el tipo de activo permitido (por ejemplo, wARS o USDC), el límite diario de gasto (como un máximo de \$5,000), la lista de direcciones de comercios autorizados y el tipo de función ejecutable<sup>4</sup>.

Aprovechando las garantías de ejecución atómica del lenguaje Move, la red rechaza automáticamente cualquier intento de transacción que viole estas reglas<sup>4</sup>. No obstante, la documentación técnica de Sup confirma que la firma totalmente autónoma mediante Entornos de Ejecución Confiables (TEE) basados en hardware sigue deshabilitada para producción, requiriendo la intervención del usuario en el flujo final<sup>4</sup>.

De manera complementaria, el proyecto PayPerCard aborda el problema de la aceptación en comercios tradicionales transformando saldos en stablecoins (USDC en Sui) en capacidad de gasto mediante la generación de tarjetas de débito virtuales restringidas a comercios específicos<sup>4</sup>. Esta solución permite que agentes programables o usuarios Web3 realicen pagos en infraestructura comercial convencional sin que el vendedor deba estar integrado a la blockchain<sup>4</sup>. La viabilidad comercial de PayPerCard depende, sin embargo, del cumplimiento normativo local (KYC/AML), la integración con emisores bancarios tradicionales y la gestión de contracargos<sup>4</sup>.

### zkTLS y la Verificación Criptográfica de Comprobantes

El mayor obstáculo operativo en las plataformas Web2 como Fetch o Ibotta es la dependencia del escaneo manual mediante OCR o las integraciones API privadas con cada cadena minorista<sup>1</sup>. La emergencia de protocolos **zkTLS** (tales como Reclaim Protocol, Opacity Network y TLSNotary) resuelve esta limitación al permitir que los usuarios demuestren la veracidad de sus compras digitales directamente a un contrato inteligente, sin revelar información personal sensible ni requerir la cooperación activa del comercio<sup>6</sup>.

Mediante la combinación de Computación Multi-Parte (MPC) y Pruebas de Cero Conocimiento (ZKPs), zkTLS permite certificar la autenticidad de una sesión cifrada bajo el protocolo HTTPS/TLS<sup>6</sup>. El proceso operativo se desarrolla en tres etapas continuas:

El usuario inicia sesión en la plataforma del comercio o entidad bancaria y realiza la transacción comercial correspondiente<sup>6</sup>. Durante la sesión, la infraestructura zkTLS intercepta la clave de sesión web y genera una prueba criptográfica (zkSNARK) que atestigua que los datos recibidos (por ejemplo, el detalle del producto, la fecha y el monto pagado) proceden de forma auténtica del servidor del comercio<sup>6</sup>.

Esta prueba se envía a la red de nodos verificadores para validar la firma digital de la sesión sin acceder al contenido privado del usuario<sup>6</sup>. Una vez validada, la atestación se publica en un contrato inteligente desplegado en la blockchain, el cual desencadena automáticamente la distribución del reembolso o incentivo en stablecoins<sup>6</sup>.

En paralelo, tecnologías de almacenamiento descentralizado como Lighthouse integradas con IPFS permiten vincular las transacciones de pago en stablecoins con el identificador de contenido (CID) del paquete de facturación encriptado<sup>23</sup>. La transacción de pago incluye el CID en sus datos de llamada (*calldata*), creando un registro auditable que une el flujo financiero con el documento comercial correspondiente, garantizando la privacidad mediante cifrado en el lado del cliente<sup>23</sup>.

## 4. Estrategia de Innovación y Oportunidades para el Mercado Latinoamericano

La aplicación de estos modelos en América Latina, y particularmente en Argentina, exige evaluar la infraestructura financiera existente para evitar la duplicación de soluciones maduras<sup>4</sup>.

### El Contexto Regional: Interoperabilidad QR frente a Infraestructura Blockchain

Los datos del Banco Central de la República Argentina registran que en agosto de 2026 se alcanzaron **117,2 millones de Pagos con Transferencia iniciados mediante códigos QR interoperables en pesos**<sup>4</sup>. La penetración masiva de esta infraestructura, sumada al dominio de actores consolidados como Mercado Pago, demuestra que intentar competir lanzando una billetera digital tradicional para pagos presenciales mediante QR carece de viabilidad comercial y diferenciación tecnológica<sup>4</sup>.

Para construir una propuesta de valor sustentable sobre Web3 en la región, las empresas deben enfocarse en resolver las ineficiencias estructurales que los sistemas bancarios tradicionales no atienden<sup>4</sup>:

El desarrollo de redes de fidelización federadas entre comercios independientes permite que pequeños negocios compartan un sistema común de incentivos administrado en stablecoins locales (como wARS sobre la red Celo), eliminando las comisiones de adquirencia de los programas cerrados tradicionales<sup>4</sup>.

Asimismo, la integración de zkTLS permite a las marcas de consumo masivo distribuir recompensas de marketing directamente a los consumidores que certifiquen sus compras mediante facturas electrónicas o resúmenes bancarios, omitiendo intermediarios publicitarios opacos<sup>4</sup>.

Por último, la implementación de permisos de gasto delegados mediante contratos inteligentes permite a pequeñas y medianas empresas automatizar presupuestos operativos o cajas chicas para empleados y agentes de software, garantizando límites de consumo no modificables<sup>4</sup>.

## 5. Conclusiones y Hoja de Ruta para la Validación de Producto

La síntesis de los datos comerciales y las arquitecturas técnicas analizadas permite establecer tres principios rectores para el diseño de productos de lealtad y pagos en la Web3:

Se debe desacoplar la capa de liquidación financiera de la capa de incentivos<sup>4</sup>. La emisión de tokens volátiles como mecanismo primario de recompensa destruye la retención del usuario cuando el activo pierde valor especulativo<sup>4</sup>. Las recompensas deben distribuirse en activos de valor estable (wARS o USDC) directamente financiados por los presupuestos de marketing de las marcas o por el ahorro de comisiones de adquirencia de los comercios<sup>4</sup>.

Asimismo, es necesario descartar el subsidio de recompensas mediante rendimientos de tesorería DeFi<sup>4</sup>. Las tasas de retorno sobre stablecoins resultan matemáticamente insuficientes para financiar incentivos comerciales de corto plazo<sup>4</sup>. La sostenibilidad económica del programa debe depender del margen comercial incremental del negocio<sup>4</sup>.

Finalmente, la validación de transacciones debe migrar del escaneo físico mediante OCR hacia la verificación de datos digitales mediante zkTLS<sup>1</sup>. Esto elimina los costos operativos de procesamiento de imágenes y la exposición al fraude por comprobantes duplicados<sup>1</sup>.

| **Fase de Experimentación**            | **Hipótesis a Validar**                                                                                   | **Criterio de Avance / Éxito**                                                                                  |
|----------------------------------------|-----------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| **Fase 1: Validación Comercial Local** | ¿Los comercios independientes ofrecen incentivos reales por pagos prepagados en stablecoins?<sup>4</sup>  | Comercios dispuestos a financiar sus propios incentivos sin subsidios de la plataforma<sup>4</sup>.             |
| **Fase 2: Demanda B2B de Datos**       | ¿Existen empresas de CPG dispuestas a pagar por datos de compra validados sin intermediarios?<sup>4</sup> | Contratos de compra B2B que cubran la totalidad de las recompensas distribuidas a los usuarios<sup>4</sup>.     |
| **Fase 3: Delegación de Gasto**        | ¿Los usuarios y PYMEs utilizan autorizaciones de gasto delegadas para automatizar compras?<sup>4</sup>    | Uso recurrente de contratos de gasto con límites programados sin asistencia técnica ni fricción UX<sup>4</sup>. |

La ruta de mayor viabilidad técnica y comercial consiste en integrar el modelo de negocio prepagado de Decal con las arquitecturas de permisos delegados de Sup Wallet y la verificación de datos vía zkTLS, desplegando la infraestructura sobre redes de bajo costo de transacción como Celo o Sui<sup>4</sup>. El factor determinante de éxito no reside en la complejidad de la cadena de bloques, sino en entregar una solución económica demostrablemente superior a los medios de pago y programas de lealtad tradicionales<sup>2</sup>.

#### Fuentes citadas

1.  Post-Purchase Rebate Automation Market - Dataintelo, [<u>https://dataintelo.com/report/post-purchase-rebate-automation-market</u>](https://dataintelo.com/report/post-purchase-rebate-automation-market)

2.  Ibotta at Goldman Sachs Communacopia + Technology Conference, [<u>https://uk.investing.com/news/stock-market-news/ibotta-at-goldman-sachs-communacopia--technology-conference-2026-growth-returns-93CH-4865572</u>](https://uk.investing.com/news/stock-market-news/ibotta-at-goldman-sachs-communacopia--technology-conference-2026-growth-returns-93CH-4865572)

3.  Ibotta Final Prospectus - SEC.gov, [<u>https://www.sec.gov/Archives/edgar/data/1538379/000162828024016660/ibotta424b4finalprospectus.htm</u>](https://www.sec.gov/Archives/edgar/data/1538379/000162828024016660/ibotta424b4finalprospectus.htm)

4.  investigacion_decal_crush_sup_paypercard (1).md

5.  What is Fetch App? How to Develop an App Like Fetch - TekRevol, [<u>https://www.tekrevol.com/blogs/app-like-fetch/</u>](https://www.tekrevol.com/blogs/app-like-fetch/)

6.  Understanding zkTLS With Opacity Network \| ep. 42, [<u>https://solanacompass.com/learn/Midcurve/understanding-zktls-with-opacity-network-ep-42</u>](https://solanacompass.com/learn/Midcurve/understanding-zktls-with-opacity-network-ep-42)

7.  Ibotta, Inc. (IBTA) Stock Analysis & Key Metrics - KoalaGains, [<u>https://koalagains.com/stocks/NYSE/IBTA</u>](https://koalagains.com/stocks/NYSE/IBTA)

8.  Crosshatch, [<u>https://crosshatch.io/</u>](https://crosshatch.io/)

9.  Corporate Governance - Ibotta, Inc. (IBTA), [<u>https://investors.ibotta.com/corporate-governance</u>](https://investors.ibotta.com/corporate-governance)

10. Ibotta, Inc. (IBTA) Q1 2026 Earnings Call Transcript \| Seeking Alpha, [<u>https://seekingalpha.com/article/4900099-ibotta-inc-ibta-q1-2026-earnings-call-transcript</u>](https://seekingalpha.com/article/4900099-ibotta-inc-ibta-q1-2026-earnings-call-transcript)

11. Ibotta (IBTA) Q1 2026 Earnings Transcript \| The Motley Fool, [<u>https://www.fool.com/earnings/call-transcripts/2026/05/06/ibotta-ibta-q1-2026-earnings-transcript/</u>](https://www.fool.com/earnings/call-transcripts/2026/05/06/ibotta-ibta-q1-2026-earnings-transcript/)

12. The 8 Best Receipt Scanning Apps to Get the Most Cash Back, [<u>https://www.sidehustlenation.com/best-receipt-scanning-apps/</u>](https://www.sidehustlenation.com/best-receipt-scanning-apps/)

13. \$85 million bet on dining Web3: How Blackbird, [<u>https://www.chaincatcher.com/en/article/2176919</u>](https://www.chaincatcher.com/en/article/2176919)

14. Blackbird: Scaling Restaurant Loyalty with Crypto and Making, [<u>https://www.gate.com/learn/articles/blackbird-scaling-the-regular-experience-and-making-restaurants-profitable/3786</u>](https://www.gate.com/learn/articles/blackbird-scaling-the-regular-experience-and-making-restaurants-profitable/3786)

15. Blackbird, [<u>https://www.blackbird.xyz/</u>](https://www.blackbird.xyz/)

16. Web3 also has Dianping? BlackBird received \$24 million ... - Binance, [<u>https://www.binance.com/en/square/post/1782609</u>](https://www.binance.com/en/square/post/1782609)

17. Crypto x AI, AI x Crypto: A Survey - arXiv, [<u>https://arxiv.org/html/2606.13892v2</u>](https://arxiv.org/html/2606.13892v2)

18. Beyond Web 3: Decentralizing Digital and Physical Marketplaces, [<u>https://medium.com/pangacapital/beyond-web-3-decentralizing-digital-and-physical-marketplaces-with-web3-technology-e14d8c42d7fb</u>](https://medium.com/pangacapital/beyond-web-3-decentralizing-digital-and-physical-marketplaces-with-web3-technology-e14d8c42d7fb)

19. AI Intelligence Layer Verona 2026.09.29 \| Verona, rebrande \| KuCoin, [<u>https://www.kucoin.com/news/insight/XION/6abc43e4381e3100076b85e8</u>](https://www.kucoin.com/news/insight/XION/6abc43e4381e3100076b85e8)

20. Orchestrating Trust into Mobility Ecosystems - Toyota Blockchain Lab, [<u>https://www.toyota-blockchain-lab.org/library/mon-orchestrating-trust-into-mobility-ecosystems</u>](https://www.toyota-blockchain-lab.org/library/mon-orchestrating-trust-into-mobility-ecosystems)

21. HANDSHAKE \| AKINDO, [<u>https://app.akindo.io/communities/MzjAl4jvztaQAdG6/products/o6qk20Pj4HzK8nWe</u>](https://app.akindo.io/communities/MzjAl4jvztaQAdG6/products/o6qk20Pj4HzK8nWe)

22. Cournot: AI-Native Oracle that Interprets Reality and Proves It, [<u>https://cournot.ai/</u>](https://cournot.ai/)

23. Lighthouse: Secure Web3 Storage for Your AI Data, [<u>https://www.lighthouse.storage/blogs/Lighthouse%3A%20Secure%20Web3%20Storage%20for%20Your%20AI%20Data</u>](https://www.lighthouse.storage/blogs/Lighthouse%3A%20Secure%20Web3%20Storage%20for%20Your%20AI%20Data)
