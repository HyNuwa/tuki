# A3 — Regulatory & Compliance (Argentina / Jujuy)

**Fecha de elaboración:** 9 de noviembre de 2026
**Alcance:** plataforma B2B2C de reembolsos por compra de un SKU en almacenes (piloto San Salvador de Jujuy), con escrow on-chain en Celo con wARS para una hackatón Web3.
**Método:** 15 búsquedas web y 14 lecturas de fuentes, en 4 rondas (promociones/consumidor, datos, pagos/fiscal, activos virtuales).

> **AVISO:** Este documento es investigación preliminar para hacer discovery de producto. **No es asesoría legal, contable ni impositiva.** Antes de lanzar con dinero real o datos reales hay que validarlo con un abogado y un contador matriculados en Argentina (idealmente con experiencia en Jujuy).

**Tiers de fuentes:** T1 = boletín oficial o sitio de gobierno o regulador · T2 = estudio jurídico o prensa · T3 = blog o sitio de un proveedor o comunidad.

---

## 0. Resumen ejecutivo

| Tema | ¿Aplica al piloto? | Riesgo | Nota clave |
|---|---|---|---|
| Lealtad Comercial (DNU 274/2019) | Sí | Bajo–Medio | Un reembolso **garantizado** por compra no depende del azar, así que no cae en la prohibición de sorteos con obligación de compra (art. 14). Si se agrega un sorteo, cambia todo. |
| Defensa del Consumidor (Ley 24.240) | Sí | Medio | La oferta publicada obliga. Hay que pagar en plazo, con bases claras, cupos visibles y un canal de reclamos. |
| Jujuy: INPROJUY (Ley 6.234 / Res. 063-P/2021) | Solo si hay azar | Bajo (sin sorteo) / Alto (con sorteo) | Los sorteos de incentivo a las ventas necesitan autorización y pagan un arancel del 10% del premio. Que un reembolso sin azar quede afuera es **DATA GAP**. |
| Datos personales (Ley 25.326) | Sí | Medio | Hace falta consentimiento informado, inscribir la base ante la AAIP y tener consentimiento específico para ceder datos a las marcas. Hay un proyecto de reforma en Diputados (3397-D-2026). |
| Pagos (BCRA, PSP) | Depende del diseño | Bajo si paga la marca o un PSP; Alto si la plataforma retiene fondos | No conviene que la plataforma tenga saldos de terceros. Lo mejor es que pague un PSP registrado (por ejemplo, Mercado Pago Money Out) desde una cuenta de la marca. |
| Fiscal | Sí | Medio (incertidumbre) | Tratamiento del reembolso para la marca y para el consumidor: **DATA GAP**, hay que consultar a un contador. La comisión de la plataforma paga IVA, Ganancias e IIBB. |
| Activos virtuales (CNV PSAV, UIF) | Solo en la versión Web3 | Alto si se usa con usuarios reales | Transferir o custodiar AV "para o en nombre de" terceros "como negocio" es actividad de PSAV (RG 1058/2025, actualizada por la RG 1172/2026). La demo tiene que ser testnet, sin custodia y sin dinero real. |

---

## 1. Regulaciones vigentes (promociones y consumidor)

### 1.1 Régimen de Lealtad Comercial: DNU 274/2019 (reemplazó a la Ley 22.802)
- **Qué exige.** El art. 14 prohíbe: (a) ofrecer o entregar premios o regalos vinculados a una compra **cuando dependan del azar**; (b) organizar concursos, certámenes o sorteos cuya participación dependa de comprar un producto. El art. 26 inc. c) delega en la autoridad de aplicación los requisitos de concursos y sorteos. El control de la publicidad es **posterior**: no hay autorización previa nacional (art. 12). [T1, InfoLEG, texto del DNU 274/2019]
- **Sanciones (art. 57).** Apercibimiento; multa de 1 a 10.000.000 de "Unidades Móviles", que se actualizan por IPC; clausura de hasta 30 días; rectificación publicitaria. Las provincias juzgan las infracciones de su jurisdicción (art. 27), salvo que haya afectación interjurisdiccional (art. 29). Valor actual de la Unidad Móvil en pesos: **DATA GAP**. [T1]
- **Reglamentación.** La Res. SCI 241/2020 (BO 24/8/2020) reglamenta el DNU. Para concursos y sorteos remite al Decreto 961/2017 y a la Res. 89/1998 de la ex SICM. [T2, Abeledo Gottheil / abogados.com.ar, 26/8/2020]. Los requisitos detallados de las bases según esas normas no se verificaron en esta sesión: **DATA GAP parcial**.
- **¿Es sorteo o reembolso?** Un reembolso de $X **garantizado** a todo comprador que acredite la compra dentro de las bases **no involucra azar**. Por eso, en principio, no está alcanzado por la prohibición del art. 14 ni por el régimen de sorteos. Funciona como un descuento o bonificación diferida que financia la marca (interpretación propia sobre el texto T1; **no hay** dictamen específico sobre cashback por foto de ticket: **DATA GAP**).
  - **Zona gris:** los cupos ("primeros 500") o la validación discrecional. Hay que definir criterios objetivos y publicados para que no se lea como azar.
  - Si la marca suma un sorteo ("subí tu ticket y participá"), pasa a ser una promoción con azar: en Jujuy requiere autorización del INPROJUY (ver 1.3) y a nivel nacional tiene que cumplir el art. 14 (participación sin obligación de compra).
- **Aplica a:** piloto y escala. **Costo:** redactar las bases (honorarios: **DATA GAP**; estimación propia, sin fuente: un abogado lo hace en pocos días). **Tiempo:** 1–2 semanas.
- **Responsable:** la marca como anunciante y la plataforma como organizadora u operadora. El contrato tiene que repartir responsabilidades.

### 1.2 Defensa del Consumidor: Ley 24.240
- Conocimiento general, sin verificar en esta sesión contra el texto oficial: la oferta dirigida a consumidores obliga a quien la emite durante su vigencia (art. 7); lo que dice la publicidad integra el contrato (art. 8); rige el deber de información y de trato digno. Si no se paga un reembolso prometido, el consumidor puede reclamar ante Defensa del Consumidor de Jujuy o ante la Nación.
- Como referencia de que los organismos sancionan el incumplimiento de cashback: el Indecopi (Perú, 2026) multó al BCP por no pagar un cashback prometido. [T2, LP Derecho / Gestión]. No es aplicable en Argentina; solo ilustra el riesgo.
- **Qué exige en la práctica:** bases y condiciones accesibles antes de participar (vigencia, SKU, monto, tope por persona, cupo total, plazo de pago, medio de pago, causales de rechazo, canal de reclamos), comunicación clara de los rechazos y pago dentro del plazo.
- **Aplica a:** piloto y escala. **Costo:** bajo, se resuelve con buenas bases y un buen proceso. Normativa de consumo propia de Jujuy y autoridad local: **DATA GAP**.

### 1.3 Jujuy: INPROJUY
- La **Ley 6.234** (sancionada el 26/8/2021, BO de Jujuy 3/9/2021) creó el Instituto Provincial de Juegos de Azar de Jujuy. La **Res. 063-P/2021** (21/12/2021, publicada el 5/1/2022) aprobó el reglamento de bingos, rifas y "promociones o sorteos de incentivación a las ventas" (arts. 50–51):
  - autorización "en forma excepcional", pedida por nota al Gerente General con las bases, la duración y la provincia;
  - **arancel del 10% del valor del premio sorteado**;
  - no hay exención para premios de bajo valor;
  - no se fijan plazos de trámite.

  [T2, Marcelo E. Gallo, Abeledo Gottheil, abogados.com.ar, 13/6/2022, que cita normas T1 provinciales no consultadas directamente]
- **Aplica si** la promoción tiene sorteo. Si un reembolso garantizado sin azar entra en "promociones de incentivación a las ventas": **DATA GAP**. Conviene hacer una consulta informal o formal al INPROJUY antes del piloto.
- **Puede haber cambiado:** la fuente es de 2022. Hay que verificar si se modificó la Res. 063-P/2021.

---

## 2. Datos y privacidad

### 2.1 Ley 25.326 y AAIP (vigente)
- **Obligaciones** [T1, argentina.gob.ar, "Obligaciones de los responsables de bases de datos", actualizada al 25/6/2026]:
  - informar antes de recolectar datos: finalidad, destinatarios, existencia de la base, identidad y domicilio del responsable, si responder es obligatorio y los derechos de acceso, rectificación y supresión. Según la Res. AAIP 14/2018, esa información tiene que estar visible;
  - inscribir las bases en el Registro Nacional de Bases de Datos Personales; no hacerlo puede dar lugar a sanciones;
  - adoptar medidas de seguridad técnicas y organizativas;
  - ciertas transferencias internacionales requieren autorización de la AAIP (por ejemplo, si el contrato se aparta de las cláusulas modelo).
- La inscripción se tramita por TAD (instructivo oficial de bases privadas) [T1]. Costo de inscripción: **DATA GAP**, no figura en la página consultada.
- **Lo que guarda la plataforma:**
  - fotos de tickets, que pueden incluir el CUIT del almacén, hora, otros productos y, a veces, datos de la tarjeta;
  - teléfono o email del comprador;
  - CBU, CVU o alias, si se paga por transferencia;
  - ledger de recompensas;
  - geolocalización, si se captura.

  Hábitos de consumo más pagos identificables forman un perfil personal, así que requieren consentimiento expreso para la finalidad de la promoción.
- **Cesión a marcas:** compartir datos identificables con la marca es una **cesión** y requiere consentimiento específico y separable. Recomendación: que la marca reciba solo **reportes agregados o seudonimizados**, salvo opt-in explícito. (Interpretación propia sobre el régimen general; el artículo puntual sobre cesión no se re-verificó en esta sesión.)
- **Seguridad:** cifrado, retención limitada de los tickets (por ejemplo, borrar o difuminar las imágenes después de validar y conservar solo los metadatos), control de accesos y registro de auditoría.
- **On-chain:** **nunca** escribir datos personales en la blockchain (ni teléfono ni hash de teléfono sin salt). El derecho de supresión choca con la inmutabilidad.
- **Aplica a:** piloto (desde el primer dato real) y escala. **Costo:** política de privacidad, formulario de consentimiento e inscripción. Inscripción: **DATA GAP**. Tiempo estimado: 1–3 semanas.

### 2.2 Cambios próximos en datos
- El **Proyecto 3397-D-2026** se presentó en Diputados el 16/7/2026. Reproduce, con cambios, la reforma integral que el Ejecutivo y la AAIP presentaron en 2023: análisis de proporcionalidad cuando se invoca interés legítimo, consentimiento propio de adolescentes desde los 16 años, ajustes en transferencias internacionales y en supresión. Está en etapa temprana y no se puede anticipar su aprobación. [T2, Allende & Brea, 12/8/2026]
- Qué cambiaría en registro, sanciones y DPO: **DATA GAP**, la fuente no lo detalla. Antecedentes: el proyecto AAIP 2023 [T1, slides AAIP] y Marval o abogados.com.ar sobre proyectos previos [T2].
- **Implicancia:** diseñar ya con estándar "tipo GDPR" (minimización, bases legales documentadas, supresión) reduce el retrabajo si se aprueba.

---

## 3. Pagos y fiscal

### 3.1 ¿La plataforma tiene que ser PSP ante el BCRA?
- Las Comunicaciones "A" 6859 y 6885 del BCRA definen como PSP a las personas jurídicas que, sin ser entidades financieras, cumplen al menos una función en un esquema de pago minorista. Los que **ofrecen cuentas de pago** (cuentas de libre disponibilidad para ordenar o recibir pagos) tienen que inscribirse en el registro de la SEFyC. El registro se habilitó el 1/3/2020. [T2, Marval, 4/3/2020; T1, BCRA A 6885 PDF y texto ordenado "t-snp-psp"]
- **Análisis (propio, para validar):**
  - Si la plataforma **recibe el presupuesto de la marca en su propia cuenta y lo redistribuye** a consumidores, o les mantiene saldos ("tenés $500 acumulados"), se acerca a ofrecer cuentas de pago o a administrar fondos de terceros. **Riesgo alto**, y además es probable que haya obligaciones UIF.
  - Si **la marca paga directamente**, o el pago sale de una cuenta de la marca en un PSP registrado y la plataforma solo emite la **instrucción** ("pagar $X al CVU Y por el claim Z"), la plataforma funciona como proveedor de software y validación. **Riesgo bajo**.
- **Alternativa práctica:** Mercado Pago Money Out / Payouts, que transfiere a cuentas de Mercado Pago o a cuentas bancarias externas. Requiere una cuenta de vendedor con fondos suficientes y una app en el panel de integraciones [T3, documentación de MP Developers, consultada el 9/11/2026]. KYC, límites y comisiones para Argentina: **DATA GAP**, hay que consultar con MP comercial. Ualá u otros PSP con API de transferencias para empresas: **DATA GAP**, no se investigó.
- **Recomendación:** la cuenta pagadora es **de la marca** (o de una agencia promocional de la marca), y la plataforma opera con un token API de alcance limitado. Plan B: pagos manuales de la marca contra un lote exportado (CSV) durante el piloto.
- **Costo y tiempo:** registrarse como PSP no tiene sentido para un piloto (requisitos y tiempos de inscripción: **DATA GAP**). Con un PSP de terceros: integración de 1–2 semanas y comisiones según el PSP.

### 3.2 Fiscal
- **Impuesto a los premios (Ley 20.630):** según el análisis de Gallo (Abeledo Gottheil, 7/8/2019) [T2], alcanza a premios de juegos de azar autorizados. Los sorteos promocionales gratuitos no estarían alcanzados, aunque la AFIP (hoy ARCA) podría tener otro criterio. La alícuota es del 31% sobre el 90% del premio (retención efectiva del 27,9%). Un **reembolso sin azar** quedaría, por razonamiento, fuera de este impuesto (**no confirmado: DATA GAP**).
- **Para la marca:** cómo trata el reembolso (gasto de promoción o publicidad deducible en Ganancias, o bonificación sobre el precio con efecto en IVA) y qué comprobante respalda cada pago a una persona física consumidora final: **DATA GAP**. Es la pregunta central para el contador.
- **Para el consumidor:** un reintegro chico vinculado a su propia compra económicamente es un descuento sobre el precio pagado, no un ingreso. No se encontró ninguna fuente oficial que lo confirme: **DATA GAP**. Riesgo práctico: si los reembolsos van a CVU o CBU, se suman a los movimientos que ven los regímenes de información bancarios. Con montos chicos el impacto es mínimo, pero no está cuantificado.
- **Para la plataforma:** su comisión o fee a la marca es un servicio gravado. Lleva factura con IVA (21% general), paga Ganancias y paga Ingresos Brutos en Jujuy, o Convenio Multilateral si opera en varias jurisdicciones. Alícuota de IIBB en Jujuy para servicios digitales: **DATA GAP**. Recomendación: **cobrar solo el fee** y que el presupuesto de reembolsos no pase por la plataforma. Si pasa, puede inflar la base de IIBB y abrir la discusión de si actúa como intermediaria.

---

## 4. Activos virtuales / Web3

### 4.1 Marco PSAV (CNV) y UIF
- **Definición legal (art. 4° bis, Ley 25.246, incorporado por la Ley 27.739):** es PSAV "cualquier persona humana o jurídica que, **como negocio**, realiza una o más de las siguientes actividades **para o en nombre de otra persona**":
  1. cambio entre AV y moneda de curso legal;
  2. cambio entre AV;
  3. **transferencia de AV**;
  4. **custodia o administración de AV**, o de instrumentos que permitan controlarlos;
  5. servicios financieros vinculados a la oferta o venta de AV.

  [T1, RG CNV 1058/2025, texto en argentina.gob.ar]
- **Exclusiones (art. 1, RG 1058):** quien opera "para sí"; quien recibe o entrega AV como **contraprestación por sus productos o servicios**; los protocolos descentralizados sin proveedor identificable; los proveedores **exclusivamente** de billeteras de autocustodia. La emisión de un AV no es actividad de PSAV. [T1]
- **Requisitos (RG 1058, BO 14/3/2025)** [T2, Beccar Varela, 31/3/2025]:
  - forma de SA o SRL (una SAS tiene que transformarse) [T1];
  - patrimonio neto mínimo de USD 150.000 (categorías 1, 2 y 4), USD 75.000 (categoría 3, transferencia) y USD 35.000 (categoría 5); 50% si el volumen o la custodia de los últimos 12 meses fue menor a USD 2,5 M;
  - segregación de fondos de clientes y registro de billeteras.
- **RG CNV 1172/2026** (15/10/2026, vigente desde el día siguiente) reemplaza el capítulo PSAV e incorpora los criterios interpretativos 95–97. Exige capital integrado e inscripto, informe mensual PSAV_014 (clientes, operaciones y custodia, con nuevo esquema desde el 1/11/2026) y, **si se usan contratos inteligentes, una auditoría de su seguridad y funcionamiento**. Para cesar, hay que avisar con 30 días. [T2, Redelico & Gorla, abogados.com.ar, 27/10/2026; T1, PDF RG 1172/26 en el Colegio de Escribanos]. **Cambio muy reciente**: hay que revisar el texto completo.
- **UIF:** los PSAV son sujetos obligados de prevención de lavado (Ley 27.739; Res. UIF 49/2024, BO 25/3/2024) y tienen deberes de KYC, monitoreo, ROS y travel rule. [T1, Boletín Oficial; T2, Beccar Varela, 27/3/2024]. Si hubo actualizaciones de UIF en 2025–2026: **DATA GAP**, no se verificó.

### 4.2 ¿El escrow on-chain con wARS convierte a la plataforma en PSAV?
Análisis propio, para validar con un abogado:
- **Riesgo alto** si la plataforma (como negocio, cobrando un fee):
  - despliega y controla el contrato (tiene las admin keys u oracle keys que deciden a quién se libera);
  - recibe wARS de la marca;
  - **transfiere wARS a consumidores en nombre de la marca**.

  Eso encaja en las categorías 3 (transferencia) y 4 (custodia o administración de "instrumentos que permitan controlar" AV). Además, la RG 1172 menciona expresamente la auditoría de smart contracts.
- **Riesgo menor (no nulo)** si:
  - el contrato es **no custodial** y lo despliega y fondea la **marca** desde su propia wallet;
  - la plataforma solo provee software y una firma de "atestación" que no puede redirigir fondos a cualquier destino (el contrato solo paga a la wallet del comprador validada y devuelve el remanente a la marca);
  - no hay upgradeability ni admin con poder de retiro.

  Aun así, quien firma las liberaciones podría verse como "administración": zona gris, **DATA GAP**, sin criterio CNV específico.
- **Otros problemas para usuarios reales:**
  - el consumidor de almacén en Jujuy necesita una wallet y un off-ramp a pesos, y quien le cambie wARS por ARS tiene que ser un PSAV registrado;
  - KYC y travel rule;
  - costos de gas: en Celo son bajos, pero alguien los paga.

### 4.3 wARS (stablecoin en pesos)
- La lanzó **Ripio**, respaldada 1:1 en ARS. El Cronista (31/10/2025) reportó que está en Ethereum, World Chain y Base [T2]. El blog de Celo informa que Ripio desplegó su stack wFIAT (wARS, wBRL y otras) en **Celo**, con on y off-ramp sin costo y colateral 1:1 en moneda local e instrumentos en moneda local "en instituciones reguladas" [T3, blog.celo.org, sin fecha visible].
- **Estatus regulatorio específico de la stablecoin** (si hay un régimen argentino de emisión de stablecoins en pesos, opinión del BCRA o la CNV, auditoría de reservas): **DATA GAP**. No se encontró ninguna norma específica sobre stablecoins en Argentina. Que Ripio esté registrada como PSAV es probable, pero **no se verificó** en esta sesión.
- **Puede haber cambiado:** la cobertura de wARS es de fines de 2025 y el mercado de stablecoins en pesos se mueve rápido.

---

## 5. Cambios próximos y cosas que pueden haber cambiado

1. **RG CNV 1172/2026** (15/10/2026): régimen PSAV recién reescrito; el informe mensual cambió el 1/11/2026.
2. **Proyecto de ley de datos 3397-D-2026** (Diputados, 16/7/2026): etapa temprana.
3. **Lealtad Comercial:** la autoridad de aplicación cambió de nombre con las reestructuraciones ministeriales (hoy la órbita es la Secretaría de Industria y Comercio). Si hubo cambios en los requisitos de bases después de la Res. 241/2020: **DATA GAP**.
4. **Jujuy, Res. 063-P/2021 del INPROJUY:** la fuente es de 2022; vigencia y modificaciones: **DATA GAP**.
5. **PSP del BCRA:** el marco viene de 2020 y tuvo actualizaciones posteriores que no se revisaron una por una. **DATA GAP**.

---

## 6. Costo mínimo de cumplimiento para un piloto (estimación)

Supuestos: el piloto en Jujuy no tiene sorteo, la marca paga a través de su propio PSP, no hay cripto con usuarios reales y la plataforma no retiene fondos. **Ninguna cifra de honorarios tiene fuente: DATA GAP. Son rangos de orden de magnitud para pedir cotización.**

| Ítem | Necesario | Costo | Tiempo |
|---|---|---|---|
| Bases y condiciones de la promoción (revisión legal) | Sí | Honorarios: DATA GAP | 1–2 semanas |
| Términos de uso, política de privacidad y consentimiento | Sí | Honorarios: DATA GAP (suele ir en paquete con el ítem anterior) | 1–2 semanas |
| Inscripción de la base en el registro de la AAIP (TAD) | Sí | Arancel: DATA GAP | Días a semanas |
| Contrato plataforma–marca (responsabilidades, quién paga, datos, rol de encargado de tratamiento) | Sí | Honorarios: DATA GAP | 1–2 semanas |
| Consulta al INPROJUY (para confirmar que un reembolso sin azar no requiere autorización) | Recomendable | Bajo | DATA GAP |
| Consulta contable (tratamiento fiscal de reembolsos para la marca y la plataforma) | Sí | Honorarios: DATA GAP | 1 semana |
| Sociedad (SAS) e inscripción en ARCA e IIBB de Jujuy | Sí, para facturar a la marca | DATA GAP | Semanas |
| Registro PSP en el BCRA | **No** (se evita con el diseño) | — | — |
| Registro PSAV en la CNV | **No** para el piloto fiat (USD 35k–150k de patrimonio neto + SA/SRL + auditoría si se hiciera) | — | — |

---

## 7. Nivel de riesgo

| Escenario | Nivel | Justificación |
|---|---|---|
| Piloto fiat, reembolso garantizado sin azar, la marca paga vía PSP, datos con consentimiento y bases claras | **Bajo–Medio** | No hay sorteo (art. 14 del DNU 274 no aplica). No hay fondos de terceros. Los riesgos que quedan son de consumo (pagar en plazo), de datos (inscripción y consentimiento) y la duda sobre la interpretación del INPROJUY. |
| La plataforma recibe y redistribuye el presupuesto en pesos | **Medio–Alto** | Puede parecer actividad de PSP o administración de fondos de terceros, con exposición a UIF y a IIBB sobre el total. |
| Se agrega un sorteo o premio con azar en Jujuy | **Alto** sin autorización | Autorización del INPROJUY y arancel del 10% del premio, más las condiciones del art. 14. |
| Escrow on-chain con wARS y usuarios reales, la plataforma controla las liberaciones | **Alto** | Probable actividad de PSAV (transferencia o administración "para o en nombre de" terceros, como negocio). Implica patrimonio neto mínimo, SA o SRL, KYC/UIF, auditoría de smart contracts (RG 1172/2026) y off-ramp regulado. |
| Demo de hackatón en testnet con tokens sin valor y datos ficticios | **Bajo** | No hay negocio con terceros reales ni valor económico. |

**Global: MEDIO.** El producto fiat es viable con un cumplimiento liviano. La capa cripto, llevada a producción, es la que eleva el riesgo a alto.

---

## 8. Cómo diseñar la demo de hackatón para minimizar el riesgo regulatorio

1. **Solo testnet (Celo Alfajores o la testnet vigente de Celo).** Usar un **token mock "wARS-test"** propio, sin valor ni convertibilidad, y no el wARS real de Ripio. Decirlo en el pitch: "en producción, el rail de pago es fiat vía PSP; on-chain solo va la prueba de reglas".
2. **Escrow no custodial y desplegado por la "marca":** en la demo, una wallet "Marca" fondea y despliega. El contrato solo puede (a) pagar al beneficiario validado hasta un tope por claim y por campaña, y (b) devolver el remanente a la marca al vencer. Sin owner con retiro arbitrario y sin proxy upgradeable.
3. **Separar "verificación" de "dinero":** la plataforma firma una **atestación** (claim válido para un SKU, monto y campaña) y el contrato verifica la firma. Mensaje para producción: el ledger on-chain sirve como **registro auditable de reglas y atestaciones**, y el pago real lo hace la marca o un PSP en pesos. Así se evita el rol de PSAV.
4. **Cero datos personales on-chain:** solo IDs de claim aleatorios, hashes de tickets **con salt** guardados off-chain y montos. Usar tickets ficticios o anonimizados.
5. **Datos de la demo sintéticos:** no subir tickets reales de vecinos de Jujuy ni teléfonos reales. Si se usan fotos reales, que sean propias y con los datos del comercio tapados.
6. **Bases de la promo de demostración** visibles en la UI (monto fijo, sin azar, cupo, plazo) para mostrar el diseño compliance-by-default.
7. **Disclaimer en la demo:** "Prototipo con fines de demostración, sin valor económico; no constituye una oferta al público".
8. **Hoja de ruta regulatoria en el pitch:** piloto fiat sin cripto → evaluar un PSAV aliado (por ejemplo, el emisor del stablecoin o un exchange registrado) que haga la custodia y el off-ramp si se quiere pagar en stablecoin. La plataforma nunca tiene las llaves.

---

## 9. Data gaps (consolidado)

- Valor en pesos de la Unidad Móvil del DNU 274/2019 en 2026.
- Requisitos actuales de bases para promociones según la Res. 89/1998 y el Decreto 961/2017, y si hubo cambios posteriores a la Res. 241/2020.
- Si un reembolso garantizado **sin azar** requiere autorización del INPROJUY en Jujuy; vigencia de la Res. 063-P/2021; plazos del trámite.
- Normativa y autoridad de defensa del consumidor propias de Jujuy.
- Arancel de inscripción de bases en la AAIP; contenido del proyecto 3397-D-2026 sobre registro, sanciones y DPO.
- KYC, límites y comisiones de Mercado Pago Money Out en Argentina; APIs de pago a terceros de Ualá y otros PSP.
- Requisitos y tiempos actuales de inscripción como PSP en el BCRA, y actualizaciones 2021–2026.
- Tratamiento fiscal del reembolso: para la marca (IVA, Ganancias, comprobante) y para el consumidor (si es ingreso o descuento). Alícuota de IIBB en Jujuy para la plataforma.
- Criterio CNV sobre smart contracts de escrow no custodiales y sobre quién firma las liberaciones; si existe un régimen específico para stablecoins en pesos; si Ripio está registrada como PSAV; auditoría de reservas de wARS.
- Actualizaciones de la UIF para PSAV en 2025–2026.
- Honorarios legales y contables de mercado para todos los ítems de la sección 6.

---

## 10. Fuentes (con Tier y fecha)

**Promociones / consumidor**
- [T1] DNU 274/2019, texto (InfoLEG/argentina.gob.ar), consultado el 9/11/2026: https://www.argentina.gob.ar/normativa/nacional/decreto-274-2019-322236/texto
- [T2] M. E. Gallo, "Los sorteos y concursos en la nueva reglamentación del Régimen de Lealtad Comercial", abogados.com.ar, 26/8/2020: https://abogados.com.ar/los-sorteos-y-concursos-en-la-nueva-reglamentacion-del-regimen-de-lealtad-comercial/26627
- [T2] M. E. Gallo, "Promociones de venta con premios: ahora Jujuy", abogados.com.ar, 13/6/2022: https://abogados.com.ar/promociones-de-venta-con-premios-ahora-jujuy/30649
- [T2] "DNU 274/2019: El tratamiento de las promociones de venta…", abogados.com.ar (2019; el cuerpo no se pudo leer): https://abogados.com.ar/dnu-2742019-el-tratamiento-de-las-promociones-de-venta-en-el-nuevo-regimen-de-lealtad-comercial/23403
- [T2] Marval, "Nueva reglamentación del régimen sobre lealtad comercial" (2020): https://www.marval.com/publicacion/nueva-reglamentacion-del-regimen-sobre-lealtad-comercial-13776
- [T2] LP Derecho, Indecopi multa al BCP por cashback incumplido (2026, Perú, referencia comparada): https://lpderecho.pe/multan-bcp-incumplir-beneficio-cash-back-ofrecido-usuario-tarjeta-credito-resolucion-final-0014-2026-indecopi-aqp/

**Datos personales**
- [T1] AAIP, "Obligaciones de los responsables de bases de datos personales", actualizada al 25/6/2026: https://www.argentina.gob.ar/node/53779
- [T1] AAIP, instructivo TAD para inscribir bases privadas: https://www.argentina.gob.ar/sites/default/files/instructivo_tad_inscripcionymodificacion_basesprivadas_3.pdf
- [T2] Allende & Brea, "Se reintroduce en el Congreso el proyecto de reforma integral…", 12/8/2026: https://allende.com/privacidad-y-ciberseguridad/se-reintroduce-en-el-congreso-el-proyecto-de-reforma-integral-del-regimen-argentino-de-proteccion-de-datos-personales-08-12-2026/
- [T1] AAIP, presentación del proyecto de ley de datos (2023): https://argentina.gob.ar/sites/default/files/slyt_proyecto_de_ley_de_datos_personales_aaip.pdf
- [T2] Marval, "Nuevo proyecto de ley de protección de datos": https://www.marval.com/publicacion/nuevo-proyecto-de-ley-de-proteccion-de-datos-17691

**Pagos / fiscal**
- [T1] BCRA, Comunicación "A" 6885: https://www.bcra.gob.ar/archivos/Pdfs/comytexord/A6885.pdf
- [T1] BCRA, texto ordenado PSP: https://www.bcra.gob.ar/archivos/Pdfs/Texord/t-snp-psp.pdf
- [T2] Marval, "Nueva regulación sobre Prestadores de Servicios de Pago", 4/3/2020: https://www.marval.com/Publicacion/nueva-regulacion-sobre-prestadores-de-servicios-de-pago-13528
- [T3] Mercado Pago Developers, prerrequisitos de Money Out (consultado el 9/11/2026): https://www.mercadopago.com.ar/developers/es/docs/money-out/prerequisites
- [T2] M. E. Gallo, "¿El impuesto a los premios es aplicable a los sorteos y concursos promocionales?", abogados.com.ar, 7/8/2019: https://abogados.com.ar/el-impuesto-a-los-premios-es-aplicable-a-los-sorteos-y-concursos-promocionales/24022

**Activos virtuales**
- [T1] RG CNV 1058/2025, texto: https://www.argentina.gob.ar/normativa/nacional/norma-410635/texto
- [T1] Boletín Oficial, aviso RG 1058 (14/3/2025): https://www.boletinoficial.gob.ar/detalleAviso/primera/322539/20250314
- [T2] Beccar Varela, "Resolución General CNV N°1058…", abogados.com.ar, 31/3/2025: https://abogados.com.ar/resolucion-general-cnv-n1058-regulacion-de-proveedores-de-servicios-de-activos-virtuales-psav/36529
- [T2] Marval, "Nuevo Criterio Interpretativo sobre el régimen PSAV" (CI 96), 17/7/2025: https://www.marval.com/Publicacion/nuevo-criterio-interpretativo-sobre-el-regimen-psav-17255?lang=es
- [T2] Redelico & Gorla, "Del registro a la gestión del riesgo… RG 1172/2026", abogados.com.ar, 27/10/2026: https://abogados.com.ar/del-registro-a-la-gestion-del-riesgo-la-nueva-agenda-legal-de-los-psav-tras-la-rg-11722026-de-la-cnv/40354
- [T1] RG CNV 1172/26 (PDF, Colegio de Escribanos), 15/10/2026: https://www.colegio-escribanos.org.ar/noticias/2026_10_15_CNV-Res-Gral-1172-26.pdf
- [T1] Boletín Oficial, Res. UIF 49/2024 (25/3/2024): https://www.boletinoficial.gob.ar/detalleAviso/primera/305110/20240325
- [T2] Beccar Varela, nueva regulación UIF para PSAV, 27/3/2024: https://beccarvarela.com/novedades/nueva-regulacion-uif-para-proveedores-de-servicios-de-activos-virtuales-psav-y-creacion-de-registro-psav/
- [T2] El Cronista, "Del dólar al peso digital: nace la primera moneda local respaldada 1:1 en blockchain", 31/10/2025: https://www.cronista.com/finanzas-mercados/del-dolar-al-peso-digital-nace-la-primera-moneda-local-respaldada-11-en-blockchain
- [T3] Celo Blog, "Ripio deploys wFIAT stack on Celo…" (sin fecha visible): https://blog.celo.org/ripio-deploys-wfiat-stack-on-celo-with-no-cost-on-off-ramps-expanding-the-leading-stablecoin-9f801b82b899
- [T2] Cointelegraph, Ripio y las stablecoins en pesos: https://cointelegraph.com/news/argentine-exchange-ripio-peso-stablecoins
