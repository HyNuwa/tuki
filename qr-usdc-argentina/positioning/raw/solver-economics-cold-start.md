# Economía del solver y arranque en frío: red RFQ cripto → pago local (corredor USDC en Base → QR argentino)

*Fecha de investigación: 2026-11-12 | Modo: Live (26 consultas web + API pública de CriptoYa) más investigación previa del repo | Etiquetas: **[Data]** dato con fuente · **[Estimate]** cálculo con método explícito · **[Assumption]** supuesto sin verificar · **[Opinion]** juicio analítico. Las cifras de un proveedor sobre sí mismo llevan **(VENDOR)**. Lo legal solo se señala; el análisis jurídico está diferido.*

*Dirección vigente: `positioning/direction-2026-11-12.md`. No se adopta "liquidación garantizada" ni se cambia la arquitectura. Estado real: no existe código; la demo usa solvers y PSP simulados.*

## Resumen

1. Vender el USDC del pagador contra pesos deja hoy un margen bruto de ~0,5% (Fiwind, DolarApp) a ~1,0% (belo, Ripio Exchange); la mediana de 28 venues es 1,2% y los más caros llegan a 2–3,8% (Ripio app, Lemon) [Estimate sobre CriptoYa, 2026-11-12].
2. Por pago: ~US$0,15–0,60 brutos con ticket de US$30 y ~US$0,50–2,00 con US$100. Lo que puede quedar para la red es ~0,1–0,2% del volumen (US$0,03–0,06 por pago de US$30) si el precio final no debe superar la mediana del mercado [Estimate].
3. Nuestras reglas ("compromete, paga, prueba y recién cobra", con pérdida total si no prueba a tiempo) son peores para el proveedor que las de Circle CPN o Bitso Business, donde la institución recibe el USDC antes de pagar. El único análogo que paga primero con proveedores verificados es Paycrest, sin fianza y con verificación federada [Data].
4. Con un margen de 1%, la regla de pérdida total (R1) solo es racional si la prueba falla en menos de ~0,1% de los pagos [Estimate].
5. Todas las redes comparables arrancaron con oferta propia o patrocinada: en Across un agente del equipo llenaba el 92,8% del flujo dos años después del lanzamiento; CoW DAO financia la fianza de los solvers nuevos; Wise usó capital propio cuando no había calce [Data].
6. Con menos de 3 proveedores la competencia RFQ es mayormente cosmética: la mejora medible por rutear entre los mejores es ~0,2–0,5% [Estimate]; en Across el 98,6% de las órdenes no tuvo competencia [Data, 2024].
7. Punto de equilibrio: con un take de 0,2% y un equipo mínimo de US$6.000/mes hacen falta US$3M/mes (35 veces el volumen de P2P.me en Argentina). Un solo corredor turístico no sostiene la operación [Estimate].
8. Efecto de red: débil y de saturación rápida; hay multi-homing en ambos lados. La defensa posible viene de la distribución en wallets y de los datos de confiabilidad, no de la cantidad de solvers [Opinion].

---

## A. Economía del solver en el corredor argentino

### A.1 Qué gana hoy quien convierte USDC del pagador en pesos

**Referencia mayorista (W):** el libro de Binance USDC/ARS marcaba compra 1.660,90 y venta 1.663,15 (medio ~1.662); el CCL AL30 estaba en 1.663,41 y el MEP AL30 en 1.549,71 [Data, CriptoYa `/api/usdc/ars/100` y `/api/dolar`, 2026-11-12 ~00:09 ART]. Se usa **W = 1.660 ARS/USDC** como el valor al que un proveedor con escala puede deshacerse del USDC [Assumption: opera en libro con comisión ~0,1%; no verificado].

`totalBid` es lo que recibe en pesos quien vende 1 USDC en cada venue, neto de comisiones, para 100 USDC. Margen implícito = (W − totalBid) / W.

| Venue | totalBid (ARS) | Margen implícito del proveedor vs W | Brecha compra-venta propia |
|---|---|---|---|
| P2P.me | 1.657,20 | 0,17% | 2,3% (venta a 1.694,91) |
| Fiwind | 1.651,70 | 0,50% | 0,9% |
| DolarApp | 1.651,31 | 0,52% | 0,4% |
| Cocos Crypto | 1.650,00 | 0,60% | 1,3% |
| Nexo | 1.648,18 | 0,71% | 1,5% |
| belo | 1.644,21 | 0,95% | 1,7% |
| Ripio Exchange | 1.644,04 | 0,96% | 1,3% |
| Binance (con comisiones y retiro) | 1.643,06 | 1,02% | 1,3% |
| Bitso Alpha | 1.641,82 | 1,10% | 1,4% |
| **Mediana de 28 venues** | **1.640,1** | **1,20%** | — |
| Peanut | 1.631,84 | 1,70% | 3,7% |
| Ripio (app) | 1.627,56 | 1,95% | 3,4% |
| Lemon | 1.597,09 | 3,79% | 5,4% |

[Data: precios de CriptoYa; Estimate: márgenes]. Los resultados para 30 USDC son idénticos salvo decimales. Para USDT el orden es similar (mediana 1.640,3) [Data].

Lecturas:

- **El rango competitivo es 0,5–1,0%.** Un solver que cotice peor que 1,2% queda por debajo de la mediana del mercado; uno que cotice mejor que 0,5% compite con los venues más eficientes [Estimate].
- **P2P.me no gana en el lado que nos interesa.** Paga casi precio mayorista a quien vende USDC (0,17%) y cobra ~2,1% sobre W a quien compra ((1.694,91 − 1.660) / 1.660) [Estimate]. Sus proveedores de liquidez viven del flujo de compra de dólares de residentes. Un solver que solo paga QR de extranjeros tiene flujo en un solo sentido y no puede replicar ese precio [Opinion].
- **Advertencia:** son tasas de off-ramp listadas, no tasas de pago QR ni precios B2B por API. El precio B2B de Manteca, Ripio y Bitso Business no es público [Data gap].

### A.2 Tarifas publicadas por los actores pedidos

| Actor | Lo que se sabe | Base |
|---|---|---|
| **Manteca** | Sin precios públicos. `docs.manteca.dev` redirige a un portal externo; un directorio dice "sin costo inicial de integración" (promocional). Potencia Bybit Pay en AR | [Data gap]; thegrid.id (VENDOR) |
| **Yodl** | App: sin fee propio, spread no publicado. SDK: fee del integrador de 0,10–1,0%, 70% para el integrador y 30% para Yodl; fee de protocolo de 0,10% exonerado | [Data] yodl.me/sdk (investigación previa, 2026-11-10) |
| **P2P.me** | Presentación de transparencia H1 2026: "approximately 3% take-rate, 1% protocol net"; 20% del ingreso al tesoro y 80% a operadores. Comisión del merchant de 1,8% (FAQ no oficial) a 2% (sitio) | [Data] Blockworks Token Transparency; p2pme-faq (confianza Baja) |
| **Binance Pay QR** | "Sin comisiones por pago"; el costo va en la tasa. Solo usuarios verificados residentes | [Data] Finextra, Cronista (lanzamiento 30-oct-2025) |
| **Bybit Pay, KuCoin Pay** | Comisión o spread en Argentina: no encontrados | [Data gap] |
| **Lemon / belo / Ripio** | Márgenes implícitos de 3,8% / 0,95% / 1,95% (tabla A.1) | [Estimate] |
| **Peer (ex ZKP2P)** | Los LP fijan su tasa sobre el mercado; la guía sugiere 2–4% y advierte que por debajo de 0,5% se pierde dinero | [Data] blog de un LP (autodeclarado) |

### A.3 Costos del lado del pago en pesos

- **Comisión del QR interoperable (pago con transferencia, PCT):** el pagador nunca paga; el comercio paga a su aceptador un máximo de 0,8% (rango habitual de 0,6–0,8%; Mercado Pago cobra 0,6%) [Data, prensa de 2021 que cita al BCRA; **más de 12 meses**; la norma vigente, Com. "A" 8303 de 2025, no se pudo leer].
- **Tasa de intercambio hacia la cuenta del pagador:** un boletín CIMPRA del BCRA (versión de transición) fija que el proveedor de la cuenta de origen percibe hasta el 75% de lo cobrado al comercio; la prensa de 2021 se contradice sobre el reparto 75/25 según el tamaño del comercio [Data, contradictorio y antiguo]. Si sigue vigente, el PSP que inicia el pago podría **cobrar** hasta ~0,45–0,6% en lugar de pagar [Estimate: 75% de 0,6–0,8%]. Es un ingreso potencial del PSP licenciado, no necesariamente trasladable a un integrador [Assumption].
- **Costo del float en pesos:** plazo fijo a 30 días en ~24% TNA en un grupo de bancos (inicio de nov-2026) [Data, DolarHoy]. Con un costo de capital de 24–35% TNA [Assumption: tasa activa por encima de la pasiva], cada día de demora entre pagar ARS y recuperar el USDC cuesta 0,07–0,10% del monto [Estimate: TNA / 365]. Una hora cuesta ~0,003–0,004%.
- **Riesgo de precio entre cotizar y cubrir:** el dólar cripto se movió +1,14% en el día para USDC [Data, CriptoYa]. Con volatilidad diaria de ~1%, una hora de exposición equivale a ~0,2% [Estimate: 1% / √24]. Un margen de 0,5% cubre ~2,5 desvíos de una hora.
- **Gas en Base:** US$0,01–0,03 por pago entre relay, compromiso y captura [Assumption; no medido].
- **KYC del pagador:** US$1–2 por verificación [Assumption: precio de mercado no verificado]. Con 10 pagos de US$30 y 1% de margen (US$3 brutos por turista), el KYC consume 30–60% del margen del primer viaje [Estimate].

### A.4 Tickets típicos

| Fuente | Ticket | Base |
|---|---|---|
| PCT interoperable, julio de 2026: 116,9M de operaciones por ARS 3 billones | ARS ~25.700 ≈ US$15,5 a 1.660 | [Data] BCRA; [Estimate] división |
| Global66, turistas extranjeros (oct-2025 a jul-2026) | US$21,88 | [Data] DolarHoy (investigación previa) |
| P2P.me Argentina (snapshot sin fecha) | US$237 por orden (86.195 / 363) | [Estimate] sobre ops.p2p.me; hoy el panel no fue legible |

El ticket de US$30 es optimista para consumo cotidiano; US$15–22 es lo observado [Opinion].

### A.5 Margen por pago de un solver (PSP licenciado con liquidez propia)

Costos variables supuestos: gas US$0,02; float de 1 día a 30% TNA (0,082%); pérdida esperada por R1 con probabilidad de 0,1% (0,1% del monto). [Estimate; supuestos en la sección "Supuestos del modelo"].

| Spread bruto cotizado | Bruto US$30 | Neto US$30 | Bruto US$100 | Neto US$100 |
|---|---|---|---|---|
| 0,5% (nivel Fiwind) | 0,15 | ~0,08 | 0,50 | ~0,30 |
| 1,0% (nivel belo) | 0,30 | ~0,22 | 1,00 | ~0,80 |
| 2,0% (nivel Ripio app) | 0,60 | ~0,52 | 2,00 | ~1,80 |

**Qué se puede compartir con la red o el integrador** [Estimate]: para que el precio final al pagador no supere ~1,2–1,5% sobre W (mediana del mercado y techo del SDK de Yodl), el reparto plausible es solver 0,6–0,8%, wallet integradora 0,3–0,5% y red 0,1–0,2%. Eso deja a la red **US$0,03–0,06 por pago de US$30 y US$0,10–0,20 por pago de US$100**. El precedente de Yodl (70% del fee para el integrador) fija la expectativa de la wallet: quien distribuye cobra más que quien rutea [Data/Opinion].

---

## B. Qué arriesga y qué necesita un solver bajo nuestras reglas

### B.1 Exigencias de nuestro diseño (docs/16 §1.4, §8, §9)

| Exigencia | Efecto económico | Orden de magnitud |
|---|---|---|
| Compromete onchain y adelanta los ARS antes de cobrar | Capital de trabajo en pesos igual al volumen de un ciclo de reposición | Con 100 pagos/día de US$30 (US$3.000/día) y captura en minutos: US$500–3.000 [Estimate] |
| Cobra recién en `capture`, tras presentar la declaración | Demora de cobro: minutos si su API firma sola; horas si hay conciliación manual | 0,003% por hora, 0,08% por día [Estimate] |
| R1: pagó y no probó antes de `authorizationExpiry` → pierde el 100% | Pérdida esperada = probabilidad × monto | Con margen de 1%, una tasa de falla de 1% consume todo el margen; para que cueste menos del 10% del margen debe ser < 0,1% [Estimate] |
| R9: Base o el relayer caen cerca del vencimiento | Mismo efecto que R1 | Mitigable con un vencimiento con margen |
| Alternativa A, fianza onchain | Capital inmovilizado adicional | ≥ volumen de 1 día (~US$3.000 en el ejemplo) [Estimate, `payment-guarantee.md`] |
| Alternativa B, retención hasta `refundExpiry` | Costo financiero sobre pesos ya adelantados | 7 días: ~0,6%; 30 días: ~2,5% del monto [Estimate a 30% TNA]. **Mayor que el margen** |
| Alternativa C, responsabilidad contractual | Sin capital; exige contrato | Es lo que usa CPN (ver abajo) |

### B.2 Qué aceptan los proveedores en otras redes

| Red | ¿Quién adelanta? | Demora y prueba | Fianza o sanción | Qué volvió racional participar |
|---|---|---|---|---|
| **Across (relayers)** | El relayer adelanta capital propio en destino | Reembolso al finalizar el bundle, cada ~1,5 h, tras un período de impugnación. La prueba es objetiva y onchain | El relayer no pone fianza; la pone quien propone el bundle. Un fill inválido no se reembolsa | El fee cubre gas, costo del capital y fee del LP; el capital rota hasta ~16 veces por día [Data, docs de Across; Estimate de rotación]. Márgenes por fill: [Data gap] |
| **UniswapX (quoters y fillers)** | El filler entrega en la misma transacción (atómico) | Sin demora | Sin fianza. El "fade" dispara un corte temporal desde 15 min, exponencial; con tasa de fade > ~10% se lo excluye. Exclusividad de 24 s en mainnet | Sin riesgo de principal; el acceso al flujo exclusivo es el premio [Data, docs de Uniswap] |
| **1inch Fusion (resolvers)** | El resolver entrega atómicamente | Sin demora | Lista blanca; ≥ 5% del Unicorn Power total (1INCH en staking); verificación previa | Acceso exclusivo al flujo de órdenes [Data, fuentes secundarias y docs de 1inch] |
| **CoW (solvers)** | El solver ejecuta el lote | Pagos semanales en COW | Fianza completa: US$500.000 en stablecoins + 1.500.000 COW. Reducida: US$50.000 + 500.000 COW, a subir a US$100.000 + 1.000.000 COW en un año. **La mayoría entra bajo la fianza del propio CoW DAO**, con un cargo de 15% de las recompensas semanales desde el mes 6 y 25% de recompensas retenidas. Hubo slashing real (CIP-22; CIP-55 por US$76.783) | La red patrocina la fianza; el solver nuevo no inmoviliza capital [Data, docs y foro de CoW] |
| **Peer / ZKP2P (LP)** | El LP bloquea USDC por adelantado y espera el fiat | El USDC se libera con una prueba zk del pago; no hay riesgo de principal por contraparte | Sin sanción; el capital queda ocioso mientras no hay demanda | Spread de 2–4%. Un LP declara US$12.700 en 9 meses sobre US$6.300 promedio ("152% APY"). En total: TVL de US$73.669 (26-oct-2026) y comisiones de ~US$21–27 mil por mes para todos los LP [Data: autodeclarado y DefiLlama] |
| **Paycrest (nodos de provisión)** | **El proveedor paga el fiat primero**, con liquidez "just in time" en sus propias cuentas y su propio PSP | El stablecoin del remitente queda en escrow y se libera al proveedor "once payout is verified" | Sin fianza publicada. Proveedores con KYB; un único agregador federado verifica. Los fees de protocolo los pagan los proveedores | Fijan su propia tasa. Volumen y % de fee: [Data gap]. 4 corredores (NGN, KES, UGX, TZS); pre-seed de US$404.000 (ene-2026) [Data, docs.paycrest.io y prensa] |
| **P2P.me (merchants)** | El merchant paga fiat desde su cuenta bancaria personal | Ventanas de disputa de 1 a 48 h; veredicto de administradores | Stake de ~US$250 (recomendado US$700–1.000); recorte en disputas | 1,8–2% por orden sobre un stake chico. En Argentina, todo el flujo daría ~US$1.700/mes a repartir entre todos los merchants (363 órdenes × US$237 × 2%) [Estimate sobre snapshot sin fecha] |
| **Circle CPN (BFI)** | **La institución recibe el USDC primero** y después paga | El OFI pide cotizaciones a varias BFI y elige; si el fiat falla, la BFI devuelve onchain | Sin fianza: solo instituciones financieras bajo reglas de la red (responsabilidad contractual) | Fee de payout más spread de FX; sin riesgo de principal [Data, guía y docs de CPN] |
| **Bitso Business (payout ARS)** | El cliente prefondea en cripto | — | — | El proveedor cobra antes de pagar [Data, investigación previa] |

### B.3 ¿Aceptaría un PSP argentino licenciado "compromete, paga, prueba y cobra"?

[Opinion, apoyada en la tabla]

- **Hay dos familias de redes.** En las cripto-nativas (Across, UniswapX, Peer) la prueba es objetiva, y el proveedor solo arriesga su ejecución. En las que tienen tramo fiat, la prueba no es objetiva y la confianza se resuelve de tres maneras: institución licenciada que cobra primero (CPN, Bitso), verificación federada sin fianza (Paycrest) o stake chico con tickets chicos y árbitro humano (P2P.me).
- **Nuestro diseño le pide a una institución licenciada condiciones de proveedor anónimo.** Paga primero, pierde todo si no prueba y además podría tener que depositar fianza. Es peor que lo que el mismo tipo de institución obtiene en CPN.
- **El precedente favorable es Paycrest:** proveedores con KYB aceptan pagar primero contra un escrow. Lo hacen sin fianza y confiando en un verificador federado.
- **Lo que haría racional aceptar:** flujo incremental que el PSP no alcanza por su cuenta; R1 bajo su control (su propia API firma la declaración y cualquiera puede enviarla); captura en minutos; sin retención; responsabilidad contractual (alternativa C) en lugar de fianza.
- **Lo que pediría a cambio** [Assumption, a validar en entrevistas]: que el adaptador lo construyamos nosotros sobre su API actual; `authorizationExpiry` de horas; una vía de conciliación para los casos R1 (hoy el diseño no la tiene); mínimos de volumen o exclusividad temporal; y que el KYC del pagador le sirva. Este último punto es estructural: cada solver regulado necesita identificar a su cliente, y con varios solvers eso exige KYC reutilizable o un acuerdo de delegación [Assumption; legal diferido]. Yodl ya declara que los usuarios verificados con Sumsub no repiten el control [Data, investigación previa].

**Flujo mínimo para que a un solver le convenga integrarse** [Estimate: costo de integración / margen neto, recupero en 12 meses]:

| Costo de integración del solver [Assumption] | Margen neto 0,5% del volumen | Margen neto 0,75% del volumen |
|---|---|---|
| US$5.000 (el adaptador lo hacemos nosotros) | US$83.000/mes | US$56.000/mes |
| US$20.000 (integra el PSP) | US$333.000/mes | US$222.000/mes |
| US$40.000 (con revisión legal y de cumplimiento) | US$667.000/mes | US$444.000/mes |

Referencia: todo P2P.me en Argentina mueve ~US$86.000/mes [Data, snapshot sin fecha]. Con ese volumen y 1% de spread, el ingreso bruto de **todos** los solvers juntos sería ~US$860/mes [Estimate]. Ningún PSP licenciado se integra por eso; el primer solver real solo aparece si el costo de integración para él es casi nulo.

---

## C. Arranque en frío: cómo consiguieron sus primeros proveedores las redes comparables

| Red | Cómo arrancó la oferta | Fuente y fecha |
|---|---|---|
| **Across** | El equipo operó el relayer dominante. Del 26-ene al 2-feb-2024, un agente de Risk Labs llenó el 92,8% del flujo (US$133,2M de US$142,6M); en órdenes > US$25.000, más de 97%; el 98,6% de las transacciones no tuvo competidor. Además, el pool de LP hace "slow fill" como capital de última instancia | [Data] LI.FI; **más de 12 meses**. Cifras de terceros, no de Across |
| **UniswapX** | La cotización RFQ exige ser dado de alta como quoter; el llenado por subasta es abierto. El conjunto inicial fue de market makers admitidos | [Data] docs de Uniswap (alta y exclusión); [Assumption] el detalle del lanzamiento de 2023 no se verificó; fuentes secundarias lo llaman "permissionless" |
| **CoW** | El DAO financia la fianza común (US$500.000 USDC transferidos del tesoro en 2023) y avala a los solvers nuevos. Los primeros solvers los operó el equipo, varios como envoltorios de APIs de agregadores DEX | [Data] foro y docs de CoW para la fianza; [Assumption] el origen de los primeros solvers es conocimiento previo, no verificado en esta sesión |
| **Peer / ZKP2P** | 318 LP y 943 compradores entre el 1-dic-2025 y el 15-ene-2026, con US$3,91M de volumen (~US$100.000/día). Liquidez inicial del equipo: no verificada | [Data] blog de un LP (autodeclarado); [Data gap] |
| **Paycrest** | Un solo agregador operado por el equipo; proveedores con KYB que conectan su propio PSP; empezó por NGN. Quiénes fueron los primeros nodos: no publicado | [Data] docs.paycrest.io; [Data gap] |
| **P2P.me** | Reclutó individuos con cuenta bancaria ofreciendo "earn 2%", con stake bajo (~US$250). Empezó en India (UPI) en 2024 y agregó países. 80% del ingreso va a operadores; venta pública de token en 2026; equipo de 25 personas y US$2,33M pre-TGE | [Data] Blockworks Token Transparency H1 2026; sitio de P2P.me |
| **Yodl** | No tiene oferta propia: conecta PSP licenciados de terceros y distribuye por SDK con 70% del fee para el integrador | [Data] yodl.me/sdk |
| **Wise** | El calce entre pares solo funcionaba en corredores densos; cuando no había calce, usó capital corporativo propio para comprar divisa en el mercado mayorista, con cuentas locales fondeadas en cada país. ~€10M transferidos el primer año | [Data] fuentes secundarias (Harvard Digital, Substack); **más de 12 meses** |
| **Trust Wallet (contraejemplo)** | Lanzó pagos QR en feb-2026 y los discontinuó el 31-mar-2026 "por un cambio de proveedor de pagos" | [Data] blog de Trust Wallet |
| **Uber y similares** | Oferta primero: ingreso garantizado a los primeros conductores | [Assumption] conocimiento general, no verificado en esta sesión |
| **Borderless.xyz** | Solo 82 de 260 corredores medidos tienen ≥ 2 proveedores estables | [Data] (VENDOR), investigación previa |

**Patrón común** [Opinion]: ninguna red arrancó con competencia real entre proveedores independientes. La oferta inicial fue del equipo (Across, CoW, Wise), admitida a mano (UniswapX, 1inch, CPN) o integrada desde APIs existentes (Yodl, primeros solvers de CoW). La competencia llegó después del flujo.

### Patrones aplicados a nuestro caso

| Patrón | Capital | Licencias en Argentina (solo señalado) | Realismo en etapa hackathon | ¿RFQ real o cosmético? |
|---|---|---|---|---|
| **1. El equipo opera el primer solver** vía la API de un PSP (p. ej. Manteca) | Float en pesos o saldo prefondeado en el PSP; fianza si se exige | Si el USDC capturado llega a una dirección nuestra y lo vendemos, se parece a la categoría 1 de PSAV (CNV RG 1172/2026: patrimonio mínimo de US$150.000, o 50% menos con bajo volumen) [Data secundario; legal diferido]. Si la dirección de cobro es del PSP y nosotros solo operamos software, el encuadre cambia [Assumption] | Bajo sin contrato con el PSP; medio con un PSP que firme | **Cosmético**: un solo proveedor detrás |
| **2. Un proveedor ancla y después un segundo** | Ninguno propio si el ancla usa su liquidez | El ancla opera con su registro; nuestro rol sería software o referidor [Assumption; legal diferido] | Medio: depende de una sola negociación | Cosmético con 1; **parcial con 2** (precio de segundo mejor, colusión tácita fácil) |
| **3. Agregador de APIs existentes presentadas como solvers** (Manteca, Ripio, Bitso Business, Yodl) | Ninguno o prefondeo según cada API | Cada proveedor liquida bajo su registro | **El más realista**: es lo que hicieron Yodl y los primeros solvers de CoW. Límite: esas APIs cobran primero (prefondeo), al revés de nuestro escrow | Real en precio si hay ≥ 2 APIs con cotización en vivo; no prueba que acepten nuestras reglas |
| **4. Demanda primero** vía integraciones en wallets | Ninguno | — | Medio-bajo: Yodl ya ofrece 70% del fee a wallets | No aplica; da poder de negociación frente a proveedores |

**¿Cuánta competencia hace falta para que el RFQ signifique algo?** [Estimate/Opinion]

- Hoy, en CriptoYa, el mejor comprador de USDC supera al segundo por 0,33% y los puestos 2 a 5 están dentro de 0,2%. La mediana queda 1,0% por debajo del mejor [Data, una sola captura].
- Borderless mide un "impuesto de ruteo" de 23,3 puntos básicos por usar el proveedor mediano en lugar del mejor, y en USDT→BRL el más barato cambió 34 veces en 88 días [Data (VENDOR), investigación previa].
- Mejora esperable por rutear entre 3 o más proveedores comparables: **~0,2–0,5% del monto** (US$0,06–0,15 por pago de US$30). Con 2 proveedores la mejora depende de que no se coordinen. Con 1 proveedor o con solvers propios, el RFQ es una interfaz, no una competencia.

---

## D. Volumen necesario

### D.1 Punto de equilibrio de la red

Costo fijo mensual [Assumption en todos los escenarios]:

| Escenario | Composición supuesta | US$/mes |
|---|---|---|
| E1. Hackathon | 3 fundadores sin sueldo; infraestructura y herramientas | 500 |
| E2. Mínimo | 3 personas a US$1.500 + US$1.500 de infraestructura y contabilidad | 6.000 |
| E3. Operación real mínima | 3 personas a US$3.000 + legal y cumplimiento US$2.000 + infraestructura US$1.500 + auditoría amortizada US$2.500 | 15.000 |
| E4. Semilla | 5 personas a US$4.500 + US$7.500 de otros gastos | 30.000 |

Volumen mensual de equilibrio = costo fijo / take rate [Estimate]:

| Escenario | Take 0,2% | Take 0,5% | Take 1,0% |
|---|---|---|---|
| E1 (US$500) | US$250.000 | US$100.000 | US$50.000 |
| E2 (US$6.000) | US$3.000.000 | US$1.200.000 | US$600.000 |
| E3 (US$15.000) | US$7.500.000 | US$3.000.000 | US$1.500.000 |
| E4 (US$30.000) | US$15.000.000 | US$6.000.000 | US$3.000.000 |

Pagos mensuales de equilibrio según ticket (US$20 / US$30 / US$60) [Estimate]:

| Escenario | Take 0,2% | Take 0,5% | Take 1,0% |
|---|---|---|---|
| E1 | 12.500 / 8.333 / 4.167 | 5.000 / 3.333 / 1.667 | 2.500 / 1.667 / 833 |
| E2 | 150.000 / 100.000 / 50.000 | 60.000 / 40.000 / 20.000 | 30.000 / 20.000 / 10.000 |
| E3 | 375.000 / 250.000 / 125.000 | 150.000 / 100.000 / 50.000 | 75.000 / 50.000 / 25.000 |
| E4 | 750.000 / 500.000 / 250.000 | 300.000 / 200.000 / 100.000 | 150.000 / 100.000 / 50.000 |

Sensibilidad: si la red paga el gas del relay (US$0,01 por pago [Assumption]), con ticket de US$20 y take de 0,2% el ingreso por pago baja de US$0,04 a US$0,03, y el volumen de equilibrio sube ~33% [Estimate].

**El take realista es 0,2%, no 1%** (ver A.5): con 1% más el spread del solver el pagador queda por encima de la mediana del mercado y del techo del SDK de Yodl [Opinion].

### D.2 Comparación con señales de mercado

| Señal | Valor | Base |
|---|---|---|
| QR interoperable (PCT), todo el país | 116,9M de operaciones por ARS 3 billones en julio de 2026 (~US$1.800M/mes); 117,2M de operaciones por QR en agosto de 2026 | [Data] BCRA, informes de julio y agosto de 2026 |
| Turistas por Ezeiza y Aeroparque | 2.251.100 en 2025 con US$2.687M; 562.500 en el 2.º trimestre de 2026 (~187.500/mes), 12,4 noches, US$87,3/día | [Data] INDEC ETI (investigación previa) |
| Gasto turístico pagable con QR | ~US$800M/año (~US$67M/mes) | [Estimate] 30% del gasto; el 30% es [Assumption] |
| Global66, QR de turistas (con fiat) | US$1,7M en 10 meses (~US$170.000/mes) | [Data] DolarHoy |
| P2P.me Argentina | ~US$86.000/mes, 363 órdenes, 108 usuarios activos | [Data] snapshot sin fecha; hoy no legible |
| Peer / ZKP2P, global | ~US$100.000/día a comienzos de 2026 | [Data] autodeclarado |
| Binance Pay QR Argentina | "+200% de transacciones" y "70%+ de retorno a 30 días"; sin volumen absoluto | [Data] (VENDOR) |
| Yodl, Bybit Pay, KuCoin Pay, Lemon QR, Manteca | Sin volumen publicado | [Data gap] |
| Actividad cripto en Argentina | US$88.500M entre jul-2025 y jun-2026 | [Data] Chainalysis (investigación previa) |

Volumen de equilibrio frente al mercado observable [Estimate]:

| Caso | Volumen/mes | Veces P2P.me AR | Veces Global66 turistas | % del gasto turístico pagable con QR |
|---|---|---|---|---|
| E1 con take 1,0% | US$50.000 | 0,6 | 0,3 | 0,07% |
| E1 con take 0,2% | US$250.000 | 2,9 | 1,5 | 0,4% |
| E2 con take 1,0% | US$600.000 | 7 | 3,5 | 0,9% |
| E2 con take 0,2% | US$3.000.000 | 35 | 18 | 4,5% |
| E3 con take 0,5% | US$3.000.000 | 35 | 18 | 4,5% |
| E3 con take 0,2% | US$7.500.000 | 87 | 44 | 11% |

### D.3 Usuarios activos que eso implica

- **Turista:** US$1.082 por viaje × 30% por QR ≈ US$325 por viaje, unos 15 pagos de US$22 [Estimate; el 30% es Assumption].
- **Nómada o residente extranjero:** US$500/mes [Assumption: 25 pagos de US$20].

| Volumen/mes | Turistas por mes | % de las llegadas aéreas mensuales | Nómadas activos equivalentes |
|---|---|---|---|
| US$50.000 | ~150 | 0,08% | 100 |
| US$250.000 | ~770 | 0,4% | 500 |
| US$600.000 | ~1.850 | 1,0% | 1.200 |
| US$3.000.000 | ~9.200 | 4,9% | 6.000 |

P2P.me tiene 108 usuarios activos en Argentina. La estimación previa del nicho cripto-nativo en Buenos Aires era de 550–1.650 personas (`direction-2026-11-12.md`), es decir, US$275.000–825.000/mes si **todos** pagaran por nosotros [Estimate].

**Conclusión** [Opinion]: el corredor argentino de turistas alcanza para validar (escenario E1) y no para sostener un equipo, ni siquiera el mínimo, con un take realista. La sostenibilidad exige varios corredores y flujo B2B de wallets con usuarios residentes, o financiamiento externo mientras tanto. Esto coincide con la dirección del fundador de no definir la empresa por el nicho.

---

## E. Opciones de modelo de ingresos

| Opción | Precedente | A favor | En contra | ¿Compatible con no custodia? | ¿Funciona con pocos solvers? |
|---|---|---|---|---|---|
| **1. Take rate sobre volumen liquidado**, cobrado onchain en la captura | Fee de protocolo de Yodl (0,10%, exonerado); LI.FI (0,25%) | Automático y verificable; no depende de reportes del solver | Si se suma al spread, empeora el precio frente a Fiwind o P2P.me | Sí, si el reparto ocurre en la captura sin que nadie retenga fondos [Assumption: confirmar en el spike que el escrow admite un receptor de fee] | Sí, pero el fee es chico (0,1–0,2%) |
| **2. Parte del spread del solver** | P2P.me (~3% de take, 1% neto al protocolo; 20/80 tesoro y operadores); CoW (15% de las recompensas por usar la fianza común) | Invisible para el pagador; alinea a la red con el volumen | No es verificable si depende del reporte del solver; con un solo solver el poder de negociación es nulo | Sí | Débil: un único solver fija las condiciones |
| **3. B2B con wallets**: fee de API o reparto con el integrador | Yodl: el integrador fija 0,1–1,0% y se queda con el 70%. Orquestadores fiat (Primer, Yuno, Juspay) cobran por transacción a comercios grandes | Alinea la distribución, que es el recurso escaso | El precedente indica que hay que **pagarle** a la wallet, no cobrarle; un fee SaaS no es creíble sin volumen | Sí | Sí; es independiente de la cantidad de solvers |
| **4. Fee de ruteo o prioridad pagado por solvers** | Staking de resolvers en 1inch Fusion; pago por flujo de órdenes | Ingreso sin tocar el precio visible | Sin escasez de flujo no hay nada que vender; contradice "gana la mejor cotización" | Sí | **No**: con menos de 3 solvers no hay puja |
| **5. Float o rendimiento** sobre fondos retenidos o fianzas | Exchanges y wallets custodiales | Ingreso sin fee explícito | **Conflicto directo con la propiedad P5 (sin custodia)** y con el costo financiero del solver | **No** | — |
| **6. Fee fijo por pago** (US$0,15–0,25) | WanderWallet (US$0,20) | Claro en tickets chicos; rinde más que 0,2% con US$20–60 | Se ve caro en tickets muy chicos; es un fee visible | Sí | Sí |

**Más compatible con no custodia y pocos solvers** [Opinion]: las opciones 1 y 2 implementadas como una sola cosa. Un porcentaje fijo en puntos básicos se descuenta en la captura y sale del spread que el solver cotiza, de modo que el pagador ve un único precio final. De ese fee se paga el reparto a la wallet integradora (opción 3). Al inicio conviene tenerlo en cero o exonerado, como hace Yodl con su fee de protocolo, porque con uno o dos solvers el fee solo empeora el precio. Las opciones 4 y 5 se descartan en esta etapa.

---

## F. Efectos de red: ¿reales o débiles?

| Evidencia | Qué muestra | Base |
|---|---|---|
| Across: 92,8% del flujo en un agente; 98,6% de órdenes sin competidor | Más relayers registrados no implica más competencia efectiva; el inventario y la escala concentran el llenado | [Data] LI.FI, 2024 (más de 12 meses) |
| Borderless: 23,3 puntos básicos de "impuesto de ruteo"; el más barato cambió 34 veces en 88 días; solo 82 de 260 corredores con ≥ 2 proveedores | El ruteo tiene valor, pero es chico (~0,2%) y la mayoría de los corredores no tiene competencia | [Data] (VENDOR) |
| CriptoYa: del 2.º al 5.º mejor comprador de USDC hay 0,2% | El beneficio de sumar proveedores satura rápido: de 1 a 3 mejora, de 5 a 10 casi nada | [Data/Estimate], una captura |
| Agregadores de on/off-ramp: Onramper (30+ proveedores; integrado en Exodus y Coinbase Wallet) y Meld (MoonPay, Banxa, Sardine, Simplex, Transak) | Los mismos proveedores aparecen en varios agregadores: multi-homing del lado de la oferta. El agregador vale por las integraciones en wallets y por rutear según "precio, cobertura y probabilidad de aprobación" | [Data] sitios propios (VENDOR); la inferencia de multi-homing es [Opinion] |
| Orquestación fiat (Primer, Yuno, Juspay, Spreedly) | La cantidad de conectores "dejó de diferenciar"; los fosos fueron el vault de tarjetas, la integración profunda con el comercio, el capital y las ventas enterprise | [Data] investigación previa (`defensibility-interop-layer.md`) |
| Manteca vende directo a Bybit; Yodl ofrece su SDK a cualquier wallet | Multi-homing en ambos lados: el PSP puede saltearnos y la wallet puede integrar a un competidor | [Data] |
| Trust Wallet discontinuó sus pagos QR por un cambio de proveedor | Depender de un único proveedor es un dolor real de las wallets | [Data] |
| Agregadores DEX y redes de intents | Los fillers atienden a varias redes a la vez y los usuarios llegan vía meta-agregadores | [Assumption] conocimiento general, no verificado en esta sesión |

**Veredicto** [Opinion]: el efecto cruzado "más solvers → mejor precio y confiabilidad → más pagadores → más solvers" existe, pero es débil y se agota con 3 a 5 proveedores por corredor. La capa tiende a ser ruteo de commodity con multi-homing en ambos lados. Lo que podría acumularse y no ser portable:

1. **Economía de alcance entre corredores:** una wallet integra una vez y obtiene N corredores. Es el efecto más real, y Yodl ya lo explota con 10 países.
2. **Datos de confiabilidad por proveedor** (tasa de éxito, latencia, fallas), que permiten rutear por probabilidad de éxito y no solo por precio. Exige volumen real.
3. **KYC reutilizable y reglas comunes entre solvers**, que bajan el costo de sumar un proveedor [Assumption; legal diferido].
4. **Un estándar de liquidación** (escrow, declaración y adaptadores) que reduzca el costo de integración de cada proveedor nuevo.

Ninguno de los cuatro existe hoy en nuestro producto; son hipótesis de ventaja, no capacidades.

---

## G. Hipótesis de validación candidatas

Todas se pueden probar sin prueba de campo con comercios y sin formalización legal.

| # | Hipótesis | Cómo se prueba | Se considera falsa si | Costo | Tiempo |
|---|---|---|---|---|---|
| **H1** | Al menos 2 proveedores argentinos con licencia aceptarían "comprometer, pagar, probar y cobrar" sin fianza, con responsabilidad contractual | Cuestionario de 8 preguntas y una llamada a ≥ 6 proveedores (Manteca, Ripio B2B, Bitso Business, belo, Fiwind, Cocos, Settle, BlindPay, Koywe). Pedir respuesta escrita con sus condiciones | Menos de 2 respuestas afirmativas entre ≥ 5 que contesten, o todos exigen prefondeo o cobrar el USDC antes de pagar | US$0 | 2–3 semanas |
| **H2** | La competencia entre proveedores existentes da una mejora de precio material | Script que consulta CriptoYa cada 5 minutos durante 14 días para los 3–5 proveedores con API B2B. Mide la ventaja del mejor de 3 frente al mejor proveedor fijo y cuántas veces cambia el líder | La ventaja media es < 0,15%, o el mismo proveedor es el mejor más del 80% del tiempo. Pasa con ≥ 0,30% y al menos un cambio de líder por día | US$0 | 2 semanas |
| **H3** | El precio B2B de los proveedores deja lugar para solver (≥ 0,5%), wallet y red (≥ 0,2%) con un precio final ≤ 1,2% sobre la mejor tasa de CriptoYa | Pedir en las entrevistas de H1 la tarifa B2B para pago QR (spread, fijo, mínimos) y compararla con la captura de CriptoYa del mismo momento | Las tarifas implican un precio final > 1,5%, o ningún proveedor informa su tarifa | US$0 | 2–3 semanas (junto con H1) |
| **H4** | Hay wallets que integrarían la red por algo que el SDK de Yodl o Manteca directo no les dan | Contactar 8–10 equipos de wallets o mini-apps (ecosistema Base y LatAm) con una página de una carilla. Pedir carta de intención no vinculante y el motivo. Usar el caso Trust Wallet como disparador | 0 o 1 cartas, o el motivo declarado es "ya tenemos Yodl o Manteca" | US$0 | 3–4 semanas |
| **H5** | El riesgo R1 (pérdida total si no prueba a tiempo) es tolerable para un proveedor | En las entrevistas de H1: pedir disponibilidad de API y webhooks, tiempo hasta la confirmación y si aceptarían la regla con vencimiento ≤ 24 h. Revisar páginas de estado públicas de 90 días | El proveedor exige una vía de conciliación manual o rechaza la regla; o su confirmación falla o se demora en > 0,1% de los pagos | US$0 | 2 semanas |
| **H6** | Existe demanda de pagadores por la promesa B2C (precio final visible antes de firmar y devolución automática si falla), más allá del nicho | Landing con lista de espera y una pregunta sobre wallet y cadena, difundida en comunidades cripto (Farcaster/Base, grupos de nómadas) | Conversión visita→registro < 5%, o menos de 50 registros con ≥ 200 visitas en 3 semanas. Pasa con ≥ 10% | US$0–100 | 2–3 semanas |

**Las tres que más mueven la decisión** [Opinion]: H1 (sin proveedor dispuesto no hay red), H2 junto con H3 (sin mejora de precio y sin margen no hay propuesta ni ingreso) y H4 (sin distribución no hay flujo que ofrecerle al proveedor). H6 es la señal más débil: un registro en una landing no predice pagos.

---

## Supuestos del modelo

| # | Supuesto | Valor | Dónde se usa | Cómo verificarlo |
|---|---|---|---|---|
| S1 | Valor mayorista del USDC para un solver con escala | 1.660 ARS (libro de Binance menos ~0,1%) | A.1, A.5 | Cotización B2B real |
| S2 | Las tasas de off-ramp de CriptoYa aproximan el precio de un pago QR | Igual | A.1, C | Pagos de prueba o tarifas B2B |
| S3 | Gas por pago en Base | US$0,01–0,03 | A.3, A.5, D.1 | Medir en testnet y mainnet |
| S4 | Costo del capital en pesos | 24–35% TNA; 30% en los cálculos | A.3, A.5, B.1 | Tasa activa real del proveedor |
| S5 | Ciclo de reposición del solver | 1 día (conservador); minutos si automatiza | A.5, B.1 | Entrevista (H5) |
| S6 | Probabilidad de R1 | 0,1% | A.5 | Datos de disponibilidad del proveedor |
| S7 | Costo de KYC por usuario | US$1–2 | A.3 | Precio de un proveedor de KYC |
| S8 | Costo de integración para un solver | US$5.000–40.000 | B.3 | Entrevista (H1) |
| S9 | Costos fijos de los escenarios E1 a E4 | US$500 / 6.000 / 15.000 / 30.000 | D.1 | Presupuesto real del equipo |
| S10 | Parte del gasto turístico pagable con QR | 30% (rango 20–40%) | D.2, D.3 | Sin fuente; encuesta |
| S11 | Gasto mensual por QR de un nómada | US$500 | D.3 | Sin fuente |
| S12 | Reparto del precio final | Solver 0,6–0,8%, wallet 0,3–0,5%, red 0,1–0,2% | A.5, D, E | H3 y H4 |
| S13 | El PSP que inicia el pago puede percibir tasa de intercambio | Hasta 75% de 0,6–0,8% | A.3 | Com. "A" 8303 y el propio PSP |

---

## Contradicciones entre fuentes

- **P2P.me, fee de protocolo:** su FAQ decía que el protocolo no cobra fee (investigación previa); la presentación de transparencia de Blockworks (H1 2026) declara ~3% de take y 1% neto al protocolo. Se toma la presentación por ser más reciente y formal; puede describir el modelo objetivo y no el vigente en Argentina.
- **P2P.me, comisión del merchant:** 1,8% (FAQ no oficial) frente a 2% (sitio). **Capital levantado:** US$2,33M pre-TGE (presentación) frente a US$2M de seed más US$6,7M comprometidos en MetaDAO (prensa); la diferencia es la venta pública. **Volumen global:** US$4,5M frente a US$31,4M (investigación previa).
- **Reparto de la comisión del QR:** dos notas de 2021 asignan el 75% a partes opuestas según el tamaño del comercio; el boletín CIMPRA fija "hasta 75%" para la cuenta de origen. La norma vigente no se leyó.
- **UniswapX:** fuentes secundarias lo describen como "permissionless, sin lista blanca"; la documentación oficial habla de quoters dados de alta y excluibles. Ambas son compatibles: el llenado es abierto y la cotización RFQ es admitida.
- **Fianza de CoW:** US$500.000 + 1.500.000 COW (documentación actual) frente a "US$1M equivalente" (propuesta de gobernanza sin fecha). Se toma la documentación.
- **Peer / ZKP2P:** "152% APY" autodeclarado frente a un TVL total de US$73.669. No se contradicen (capital chico con rotación alta), pero el retorno no escala: todos los LP juntos generan ~US$25.000 por mes.
- **Tipo de cambio:** el MEP AL30 (1.549,71) quedó ~7% por debajo del CCL (1.663,41) y del dólar cripto (~1.650–1.660); el mayorista de CriptoYa (1.545,5) tiene marca de tiempo del 5-nov. El dólar cripto sigue al CCL, no al MEP.
- **Across:** un artículo de terceros menciona "más de 40 relayers" en 2026 frente al 92,8% concentrado en un agente en 2024. No hay dato reciente de concentración.

---

## Data gaps

| Gap | Por qué importa | Cómo cerrarlo |
|---|---|---|
| **Precio B2B de Manteca, Ripio, Bitso Business y Settle** para pago QR (spread, fijo, mínimos, prefondeo) | Es el insumo principal del margen del solver y del take posible | Entrevistas (H1, H3). La documentación de Manteca cambió de dominio |
| **Si algún PSP argentino acepta pagar antes de cobrar** | Define si la arquitectura es comercializable | H1 |
| **Volúmenes de Yodl, Bybit Pay, KuCoin Pay, Binance Pay QR, Lemon QR y Manteca** | Sin ellos, el tamaño de la demanda cripto→QR se apoya solo en P2P.me y Global66 | Pedirlos en entrevistas; informes de la CNV |
| **Panel de P2P.me** (ops.p2p.me) | El dato de US$86.000/mes es un snapshot sin fecha y hoy no se pudo leer | Abrirlo con navegador |
| **Texto vigente de la Com. "A" 8303** (comisiones y tasa de intercambio del PCT) | Puede sumar o restar ~0,5% al margen del PSP | Leer el PDF del BCRA |
| **Tasa de falla y tiempo de confirmación de los PSP** | Determina R1 y el valor del failover | H5 |
| **Márgenes por fill de relayers de Across y fee de protocolo de Paycrest** | Comparación de retornos | Paneles de Dune; documentación de Paycrest |
| **Primeros nodos de Paycrest y liquidez inicial de ZKP2P** | Precedentes de arranque incompletos | Contacto directo |
| **Lanzamiento de UniswapX y primeros solvers de CoW** | Citados desde conocimiento previo | Anuncios originales de 2021–2023 |
| **Costo de capital real de un PSP y tasa de fondos money market en nov-2026** | Costo del float | BCRA; entrevista |
| **Proporción de turistas con cripto y gasto pagable con QR** | El 30% y los usuarios implicados son supuestos | Encuesta |
| **Costo de KYC y posibilidad de reutilizarlo entre solvers** | Puede anular el margen del primer viaje | Proveedores de KYC; asesoría legal (diferida) |

---

## Flags

### Red Flags

- **El take realista (0,1–0,2%) no sostiene ni un equipo mínimo en un solo corredor:** hacen falta US$3M/mes, 35 veces P2P.me en Argentina [Estimate].
- **Pedimos a instituciones licenciadas peores condiciones que las que ya tienen** en CPN o Bitso (cobran antes de pagar). Sin una concesión (conciliación para R1, sin fianza), es probable que H1 falle [Opinion].
- **Con el flujo inicial, el ingreso de todos los solvers juntos sería de cientos de dólares por mes.** El primer proveedor real solo entra si integrarse le cuesta casi nada [Estimate].
- **"Competencia RFQ" con 1 o 2 proveedores es cosmética.** Presentarla como ventaja actual violaría la regla de no posicionar sobre el roadmap [Opinion].

### Yellow Flags

- Todos los márgenes salen de **una sola captura** de CriptoYa y de tasas de off-ramp, no de pagos QR ni de precios B2B.
- Varios precedentes clave son de **vendors, autodeclarados o de más de 12 meses** (LI.FI 2024, blog del LP de Peer, comisiones del QR de 2021).
- El **KYC por solver** puede romper el modelo de varios proveedores para un mismo pagador [Assumption; legal diferido].
- Operar el primer solver nosotros puede caer en **registro PSAV** (CNV RG 1172/2026) [solo señalado].
- La **tasa de intercambio** del PCT podría mejorar el margen del PSP, pero no está verificada.

---

## Fuentes

Consultadas el 2026-11-12 salvo indicación.

**Precios y tasas**
- CriptoYa: https://criptoya.com/api/usdc/ars/100 · https://criptoya.com/api/usdc/ars/30 · https://criptoya.com/api/usdt/ars/100 · https://criptoya.com/api/dolar
- Plazo fijo, nov-2026: https://dolarhoy.com/herramientas-de-inversion/plazo-fijo-las-tasas-de-noviembre-arrancan-con-una-brecha-de-hasta-8-puntos-entre-bancos-202611513560

**QR interoperable y BCRA**
- Informes de pagos minoristas 2026: https://www.bcra.gob.ar/publicaciones/informe-mensual-de-pagos-minoristas-julio-de-2026/ · https://www.bcra.gob.ar/publicaciones/informe-de-pagos-minoristas-agosto-de-2026/ · https://www.bcra.gob.ar/publicaciones/informe-de-pagos-minoristas-marzo-de-2026/
- Transferencias 3.0: https://www.bcra.gob.ar/transferencias-3-0/ · https://eleconomista.com.ar/economia/el-sistema-transferencias-30-comienza-funcionar-plenamente-argentina-n48307 (2021) · https://www.letrap.com.ar/letrae/economia-finanzas/pesce-y-galperin-la-alianza-menos-pensada-n5339977 (2021) · https://www.cronista.com/finanzas-mercados/codigo-qr-en-la-mira-el-bcra-busca-limitar-las-comisiones-de-los-pagos-digitales
- Boletín CIMPRA: https://www.bcra.gob.ar/archivos/Pdfs/SistemasFinancierosYdePagos/SNP3525.pdf · Com. "A" 8303 (no leída): https://www.bcra.gob.ar/archivos/Pdfs/comytexord/A8303.pdf · Com. "A" 7153: https://www.bcra.gob.ar/archivos/Pdfs/comytexord/A7153.pdf

**Proveedores y competidores**
- Manteca: https://thegrid.id/profiles/manteca · https://simetrik.com/wp-content/uploads/2026/04/Manteca-Success-Case-ES.pdf · https://docs.manteca.dev (redirige a theneo.io)
- Yodl: https://yodl.me/sdk/ (2026-11-10) · https://www.alchemy.com/dapps/yodl
- P2P.me: https://blockworks.com/token-transparency/filing/p2p-protocol · https://p2pme-faq.pages.dev/merchants (no oficial) · https://www.mintlify.com/p2pdotme/docs/whitepaper/liquidity-market-design · https://iq.wiki/wiki/p2pme · https://ops.p2p.me/ (no legible)
- Binance Pay QR: https://www.finextra.com/pressarticle/107767/binance-lunches-qr-payments-in-argentina · https://www.cronista.com/infotechnology/finanzas-digitales/el-gigante-cripto-binance-lanza-pagos-con-qr-en-argentina-como-funcionan · https://www.binance.com/de/square/post/349968431999409 (VENDOR)
- Trust Wallet: https://trustwallet.com/blog/announcements/introducing-qr-payments-spend-stablecoins-in-the-real-world

**Redes comparables**
- Across: https://docs.across.to/introduction/fees · https://docs.across.to/reference/actors-in-the-system · https://docs.across.to/concepts/intents-architecture-in-across · https://li.fi/knowledge-hub/the-untold-trade-offs-in-intent-based-bridges (datos de ene–feb 2024) · https://eco.com/support/en/articles/14799839-across-protocol-solver-architecture-deep-dive
- UniswapX: https://developers.uniswap.org/docs/liquidity/uniswapx/filling/faq · https://li.fi/knowledge-hub/what-is-uniswapx-a-deep-dive
- 1inch Fusion: https://business.1inch.com/portal/documentation/resolvers/introduction · https://gov.1inch.network/t/increase-numeber-of-whilisted-resolvers/431
- CoW: https://docs.cow.fi/cow-protocol/reference/core/auctions/bonding-pools · https://docs.cow.fi/cow-protocol/tutorials/solvers/onboard · https://forum.cow.fi/t/cip-22-slashing-of-the-barter-solver-responsible-for-a-hack-causing-cow-dao-a-loss-of-1-week-fee-accrual/1440 (2023) · https://forum.cow.fi/t/cip-55-slashing-of-the-gluex-solver/2649 · https://forum.cow.fi/t/cip-26-solver-bond-funds-switch/1709 (2023)
- Peer / ZKP2P: https://defillama.com/protocol/peer · https://docs-nzed.vercel.app/blog/how-i-made-152-apy · https://docs-nzed.vercel.app/guides/for-sellers/
- Paycrest: https://docs.paycrest.io/ · https://github.com/paycrest/aggregator · https://writing.lavavc.io/p/liquidity-will-find-a-way · https://www.wearetech.africa/en/fils-uk/brief/brief-simple/nigeria-s-paycrest-raises-404-000-to-help-users-convert-stablecoins-into-local-money
- Circle CPN: https://www.circle.com/blog/circle-payments-network-cpn-a-concise-field-guide-for-prospective-network-participants · https://developers.circle.com/cpn/fiat-payouts · https://transak.com/blog/what-is-circle-payments-network-cpn
- Wise: https://d3.harvard.edu/platform-digit/?p=3842 · https://uniteconomics.substack.com/p/how-transferwise-beat-banks-at-their · https://aika.substack.com/p/transferwise-and-its-many-pivots
- Agregadores de rampas: https://docs.onramper.com/ · https://onramper.com/ · https://www.meld.io/crypto-stack

**Investigación previa del repo (reutilizada)**
- `qr-usdc-argentina/pricing-landscape.md` · `raw/pricing-intelligence.md` · `raw/strategic-signals.md` · `raw/gtm-analysis.md` · `positioning/raw/defensibility-interop-layer.md` · `positioning/raw/payment-guarantee.md` · `research_notes/Pagos QR con USDC en Argentina/demanda_y_mercado.md` y `proveedores_y_regulacion.md` · `docs/16-modelo-seguridad-liquidacion.md` (§1.4, §8, §9)
