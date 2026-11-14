# Filecoin como almacenamiento de evidencia y modelo de procedencia

**Fecha:** 2026-11-13 · **Alcance:** investigación. No implementa nada, no despliega contratos ni mueve fondos.

**P0 no cambia:** sigue con almacenamiento privado convencional (Cloudflare R2 o Supabase Storage), cifrado, con URL firmadas de vida corta y eliminación por ciclo de vida. Este informe evalúa Filecoin Onchain Cloud (FOC), Synapse SDK y Proof of Data Possession (PDP) como **[Spike / Pendiente]**. No modifica la red de pagos, el PRD ni el spike S0.

> **Filecoin prueba conservación e integridad de datos, no que una compra haya sucedido ni que el ticket pertenezca al colaborador.**

**Etiquetas:** [Verificado en fuente] (con número de fuente, §12) · [Afirmación del proveedor] (lo dice el proveedor y no lo comprobamos) · [Inferencia] (razonamiento propio) · [Pendiente] · [Pendiente: revisión legal].

---

## Resumen y decisión

**Decisión: NO-GO** para guardar imágenes de tickets en Filecoin, tanto en P0 como en el piloto.

Motivos:

1. **PDP no cubre nuestro riesgo principal.** Prueba que un proveedor conserva bytes íntegros. Nuestro riesgo es otro: que el ticket sea falso, ajeno o repetido. Eso lo cubren las capas L1-L3 del doc 16, §2. PDP tampoco garantiza recuperación, confidencialidad ni SLA (§1).
2. **Choca con la regla "Nada onchain" del doc 16, §7.** Cada ticket subido deja un PieceCID (hash del texto cifrado), un tamaño y un evento públicos en la cadena, asociados a nuestra wallet (§2).
3. **El borrado es incierto.** Con la Ley 25.326 (art. 16, supresión en 5 días hábiles) no podemos probar que dos proveedores de terceros destruyeron todas las copias. Solo nos queda el borrado criptográfico (§4) [Pendiente: revisión legal].
4. **Para nuestro volumen cuesta más que R2.** Lo caro son las tarifas fijas por pieza, no el almacenamiento: entre USD 620 y 2.200 de alta para 100.000 tickets, contra USD 6-19 en R2 en 12 meses (§5).
5. **No hace falta.** Para vincular un resultado vendido con su evidencia alcanzan hashes con sal, una raíz de Merkle por agregado y un registro firmado de solo agregado, guardados en almacenamiento privado. Opcionalmente, la raíz se ancla en Celo (§3, §7).

**Condiciones concretas que justificarían revisar la decisión:**

- Un comprador o regulador exige **prueba independiente, verificable por terceros, de que la evidencia se conservó** durante N meses, y una auditoría de nuestro registro firmado no le alcanza.
- Hay una **opinión legal escrita** que acepta el borrado criptográfico como supresión bajo la Ley 25.326 y avala la transferencia a proveedores fuera de Argentina (art. 12).
- Se pueden **agrupar** muchos tickets por pieza sin romper el borrado individual. Por ejemplo, una pieza por agregado cerrado, con claves por ticket.
- El spike S8 (§11) da resultados reproducibles en la red de prueba Calibration.

**Actualización (2026-11-13): Lighthouse como segunda vía.** El equipo propone probar Filecoin también mediante Lighthouse. Lo verificado en su documentación ([llms-full.txt](https://lighthouse.storage/llms-full.txt), consultado el 2026-11-13):

- **Costo:** suscripción mensual (gratis hasta 5 GB en Filecoin; US$12 por mes hasta 500 GB; US$49 por mes hasta 2,5 TB). Los planes de pago único "permanentes" están retirados. Con precio plano, el costo por pieza del §5 deja de dominar: 100.000 tickets de 300 KB (~30 GB) entran en el plan de US$12 por mes [Verificado en fuente; el cálculo es Inferencia]. **Esto corrige la conclusión de costo del punto 4 para Lighthouse, no para Synapse.**
- **Cifrado:** Kavach cifra en el cliente antes de subir y divide la clave con criptografía umbral BLS; el acceso se puede revocar [Afirmación del proveedor].
- **Privacidad:** "Anyone holding a CID can retrieve the file" y Kavach mantiene los datos "gateway retrievable": el texto cifrado es descargable por quien tenga el CID [Verificado en fuente].
- **Borrado:** "deletion is supported through the SDK and dashboard", pero "Content already propagated across public IPFS cannot be recalled from third-party nodes that have cached it". No dice si se eliminan las copias en Filecoin [Verificado en fuente; borrado en Filecoin Pendiente].
- **No documentado:** uso de PDP, agregación de archivos chicos, país de almacenamiento.

**Lectura:** Lighthouse simplifica la integración y el costo, pero no resuelve la condición principal: privacidad y borrado verificables. La decisión para tickets sigue en NO-GO; se prueban **Synapse y Lighthouse** en el spike S8, con R2 como base de comparación.

**Uso que sí tiene sentido evaluar:** publicar en Filecoin los **resultados agregados ya vendidos** (sin datos personales, con k ≥ 5 y m ≥ 3) o las raíces de compromiso. Ahí la persistencia pública es una ventaja y no hay datos personales en juego [Inferencia].

---

## 1. Qué garantiza PDP y qué no

| Propiedad | ¿PDP la garantiza? | Detalle |
|---|---|---|
| **Posesión** | Sí, de forma probabilística y periódica | Desafío-respuesta: un contrato genera desafíos aleatorios (drand + ID del data set), y el proveedor responde con pruebas de inclusión de Merkle sobre bloques elegidos al azar. Las verifica el contrato. [Verificado en fuente] (1), (14) |
| **Integridad** | Sí, respecto del PieceCID registrado | La prueba se verifica contra el compromiso de cada pieza; el contenido no puede cambiarse ni reemplazarse sin que falle. [Verificado en fuente] (1). Además, la descarga del SDK verifica el PieceCID mientras llegan los bytes (`DownloadPieceError` si no coincide). [Verificado en fuente] (5) |
| **Frecuencia** | Una prueba cada 24 h | "PDP proofs verify data on-chain every 24 hours." [Afirmación del proveedor] (10). La documentación técnica no fija el valor de `challengeDelay`. [Pendiente] |
| **Consecuencia de una falla** | Económica, no de restauración | Si fallan las pruebas, baja el pago y se aplican penalidades; tras un umbral de fallas se termina el rail. Solo se paga por las épocas probadas. [Verificado en fuente] (2) |
| **Recuperación** | **No** | PDP prueba que el proveedor tiene una copia sin sellar, no que vaya a servirla. La documentación dice que los datos están "physically present and retrievable when challenged" (1), pero la propia FilOz describe PDP como un paso que hace la entrega "más probable", no garantizada (fuente secundaria del equipo FilOz, §12 nota). Que se pueda recuperar depende de la voluntad del proveedor y del pago. [Inferencia] |
| **SLA de disponibilidad** | **No** | No hay SLA ni porcentaje publicado. La hoja de ruta dice "GA: Hardening on SLA and tooling". [Verificado en fuente] (2), (7), (10) |
| **Confidencialidad** | **No** | PDP no cifra nada. El cifrado es del cliente (Keysmith / Filecoin Encryption Envelope) y "public envelope metadata remains visible". [Verificado en fuente] (6) |
| **Autenticidad del contenido** | **No** | PDP prueba que hoy se conservan los mismos bytes que se subieron. No dice nada sobre si el ticket es real, si la compra existió o si la foto es del colaborador. [Inferencia] |

**Conclusión:** PDP reemplaza "confiá en que el proveedor guarda tus datos" por una prueba periódica. En R2, esa confianza es contractual y la integridad la verificamos nosotros con `sha256`. PDP no aporta ninguna de las garantías que el doc 16 necesita para decir que una observación está "verificada".

## 2. ¿Se pueden guardar tickets cifrados sin publicar datos personales?

**El contenido, sí. Los metadatos, no del todo.**

| Elemento | ¿Queda público? | Fuente |
|---|---|---|
| Contenido del ticket | No, si se cifra en el cliente antes de subir | [Verificado en fuente] (6) |
| Texto cifrado | **Puede descargarlo cualquiera**: "Encrypted bytes may be publicly retrievable" | [Verificado en fuente] (6) |
| PieceCID (digest de 32 bytes del texto cifrado) y tamaño de cada pieza | Sí, en el estado del verificador PDP (`pieces`, `size`, `totalSize`) | [Verificado en fuente] (1), (14) |
| Evento `PieceAdded` con metadatos de pieza (máx. 3 claves) y metadatos del data set (máx. 10 claves) | La metadata de pieza "can't be read from contract getters": se lee de la API de Filecoin o de los eventos `PieceAdded`. Es decir, es legible por terceros | [Verificado en fuente] (2), (5); que sea pública: [Inferencia] |
| Metadatos del sobre de cifrado: ID del keyspace y compromiso | Se registran en los metadatos del data set; "no encryption keys are written on-chain" | [Verificado en fuente] (6) |
| Wallet pagadora, rail de pago, cantidad de piezas, fechas de alta y baja | Sí: los pagos y las operaciones se liquidan en la cadena con Filecoin Pay | [Verificado en fuente] (8) |
| URL de FilBeam (CDN) | Llevan la wallet que subió la pieza y el PieceCID | [Verificado en fuente] (7) |

**Reglas mínimas si algún día se usa** [Inferencia]:

- Cifrar en el servidor de la plataforma (o en el cliente) con AES-256-GCM y una **clave única por ticket**. Nunca subir nada en claro.
- No poner en los metadatos de pieza ni de data set nombres de archivo, `observationId`, CUIT del comercio, fecha, zona ni `sha256` de la imagen en claro. Solo un identificador opaco y aleatorio.
- Rellenar (padding) a tamaños fijos para que el tamaño no permita distinguir tickets.
- Subir por lotes con horario fijo, porque la frecuencia de alta revela actividad.
- Nunca subir la imagen original sin enmascarar. Subir, como mucho, la versión con datos del comprador y de tarjeta ya enmascarados (doc 16, §7, "Minimización en ingesta").

**Conflicto con el diseño actual:** el doc 16, §7 fija "Nada onchain: ni imágenes, ni hashes de imágenes". Un PieceCID es un hash del texto cifrado, no de la imagen. Con clave y sal únicas no se vincula con el `sha256` de la imagen, pero **sí es un identificador público por ticket**. Adoptar Filecoin obligaría a reabrir esa regla. [Inferencia]

## 3. Vincular un resultado vendido con su evidencia sin revelar tickets

**Mecanismo propuesto (independiente de Filecoin y de la red de pagos)** [Inferencia]:

1. Por cada observación aceptada se calcula una **hoja**: `leaf = SHA-256(0x00 ‖ salt_obs ‖ evidenceDigest ‖ observationId ‖ verificationLevel ‖ extractionHash)`.
   - `evidenceDigest` es el `sha256` del texto cifrado guardado.
   - `salt_obs` tiene 32 bytes aleatorios y se guarda en privado.
   - `extractionHash` es el hash del JSON normalizado y desidentificado.
   - La sal impide los ataques de diccionario sobre hojas publicadas y evita que una hoja revele el hash de una imagen.
2. Por cada agregado se arma un **árbol de Merkle** con las hojas de las observaciones que lo componen, ordenadas por `observationId`. Los nodos internos usan el prefijo `0x01`, para separar dominios. El resultado es `evidenceRoot`.
3. El resultado que se vende por x402 incluye un **recibo de procedencia** firmado por la plataforma (Ed25519 o EIP-712): `{ dataProductId, version, evidenceRoot, leafCount (redondeado o rango), minVerificationLevel, methodologyVersion, createdAt, logIndex }`.
4. Cada recibo se agrega a un **registro de solo agregado** (append-only log) firmado y encadenado por hash, al estilo de Certificate Transparency. Su cabeza (`logHead`) se publica periódicamente.
5. **Opcional:** anclar `logHead`, o la raíz de las `evidenceRoot` de un período, en Celo con una transacción al día. Así nadie, ni siquiera la plataforma, puede reescribir el pasado sin que se note. Una raíz de hojas con sal no revela datos personales ni hashes de imágenes [Inferencia]. Igual conviene que el doc 16 lo diga explícitamente.

**Quién puede auditar qué:**

| Actor | Ve | Puede verificar |
|---|---|---|
| Agente comprador | Resultado agregado + recibo firmado (`evidenceRoot`, nivel mínimo, versión de metodología) | Que la firma es de la plataforma; que el recibo está en el registro (prueba de inclusión contra `logHead`); y, si hay anclaje, que `logHead` está en Celo. **No ve ni puede reconstruir tickets** |
| Auditor autorizado (bajo NDA, rol `auditor`) | Para una muestra de hojas: `salt_obs`, `observationId`, `evidenceDigest`, `extractionHash` y acceso temporal a la evidencia descifrada en un entorno controlado | Que cada hoja muestreada se recalcula y pertenece a `evidenceRoot` (prueba de Merkle); que el texto cifrado guardado tiene `evidenceDigest`; que la extracción coincide con la imagen; que el nivel L1/L2 se cumplió |
| Colaborador | Sus observaciones y el estado de su consentimiento | Que una observación suya retirada no aparece en agregados creados después del retiro (doc 16, §7.1) |
| Público | `logHead` anclado (opcional) | Solo que el registro no se reescribió |

**Flujo del auditor autorizado** [Inferencia]:

1. El auditor pide un `dataProductId`.
2. La plataforma registra la solicitud en el log.
3. Se eligen hojas al azar, con una semilla que el auditor fija.
4. Se emiten URL firmadas de 5 minutos o una sesión de visualización sin descarga.
5. El auditor recalcula las hojas y las pruebas.
6. El acceso queda registrado (quién, qué, cuándo) y la sesión expira.

Las observaciones ya borradas por retiro del consentimiento o por retención no pueden auditarse en su contenido: solo queda su hoja. El informe de auditoría lo dice. [Pendiente: revisión legal sobre conservar la sal y la hoja después del retiro]

## 4. Borrado, vencimiento y revocación de acceso (Ley 25.326)

**Marco legal** [Verificado en fuente] (17):

- Art. 2 define datos personales como información sobre personas "determinadas o determinables".
- Art. 4, inc. 7: los datos "deben ser destruidos cuando hayan dejado de ser necesarios o pertinentes".
- Art. 9 exige medidas técnicas y organizativas de seguridad.
- Art. 12 prohíbe transferir datos a países sin protección adecuada.
- Art. 16: derecho a la supresión, con un plazo máximo de **cinco días hábiles**. No procede si perjudica derechos de terceros o hay obligación legal de conservar.

**Qué ofrece FOC:**

| Operación | Comportamiento | Fuente |
|---|---|---|
| Borrar una pieza | `deletePiece()` envía una transacción. "Piece deletion is irreversible and cannot be canceled once initiated." **No dice cuándo se borra físicamente ni si el proveedor lo garantiza** | [Verificado en fuente] (5) |
| Terminar el servicio | Por relay del proveedor: termina al instante si se puede liquidar. Por vía directa (`skipProvider`): sigue hasta `endEpoch`, unos 30 días. Al terminar, "the provider may delete all data" | [Verificado en fuente] (5) |
| Falta de fondos | Si el saldo cae por debajo del lockup de 30 días, el proveedor puede terminar y borrar unos 30 días después | [Verificado en fuente] (2), (3) |
| Copias | `upload()` guarda **2 copias en proveedores independientes** por defecto, cada una con su data set | [Verificado en fuente] (5) |
| Revocación de acceso | El texto cifrado puede ser públicamente descargable. El control de acceso con "claims" que vencen figura como **"coming soon"** | [Verificado en fuente] (6), (18) |

**Consecuencias:**

- **Borrar de un data set PDP no garantiza que desaparezcan todas las copias.** El estado de la cadena deja de pedir pruebas, pero el borrado físico en dos proveedores, en sus cachés de FilBeam y en cualquier tercero que haya descargado el texto cifrado público queda fuera de nuestro control. [Inferencia]
- **El borrado criptográfico es la única mitigación técnica.** Cada ticket se cifra con su propia clave, guardada en nuestro KMS. Suprimir equivale a destruir esa clave y registrar la destrucción en el log. Con AES-256-GCM, sin la clave el texto cifrado es computacionalmente indescifrable. [Inferencia]
- **¿El texto cifrado sigue siendo dato personal?** Mientras alguien tenga la clave, el dato es "determinable": es dato personal y su almacenamiento en terceros es tratamiento y posible transferencia internacional (art. 12). Sin ninguna clave, puede sostenerse que deja de serlo, pero la ley no lo dice. [Pendiente: revisión legal]
- **¿El borrado criptográfico cumple el art. 16?** [Pendiente: revisión legal]
- **¿Proveedores de Filecoin fuera de Argentina?** Hay que analizar el art. 12 y la lista de países adecuados. No elegimos dónde residen los proveedores salvo que fijemos proveedores concretos. [Pendiente: revisión legal]
- **En R2 o Supabase:** el borrado de un objeto y las reglas de ciclo de vida se ejecutan bajo contrato con un solo encargado del tratamiento, y se puede pedir un acuerdo de tratamiento de datos (DPA). Es un camino legal mucho más conocido. [Inferencia]

## 5. Costo: 1.000, 10.000 y 100.000 tickets frente a Cloudflare R2

### Supuestos

- **Tamaño por ticket:** 300 KB (JPEG comprimido, escenario chico) y 1 MB (escenario grande). 1 KB = 1.000 bytes. Para Filecoin, 1 TiB = 2^40 bytes. Para R2 se usa 1 GB = 10^9 bytes; si R2 factura en GiB, el costo baja alrededor de 7 %. [Inferencia]
- **Retención:** 12 meses, sin renovación. Es un escenario de techo: el doc 16, §7 prevé borrar imágenes a los N días, lo que reduce todos los costos.
- **Operaciones por ticket:** 2 escrituras (original enmascarado cifrado + miniatura para revisión) y 3 lecturas en 12 meses (extracción, revisión y auditoría ocasional).
- **Filecoin:** configuración por defecto de **2 copias**, un data set por copia (2 data sets), 1 USDFC ≈ 1 USD. Lecturas por CDN (FilBeam), con todo como cache miss, a USD 14/TiB. El costo de leer directo del proveedor sin CDN **no está publicado**. [Pendiente]
- No se incluyen cifrado, KMS, cómputo ni red propia, que cuestan lo mismo en ambos casos.

### Precios publicados

| Concepto | Filecoin Onchain Cloud (Warm Storage) | Cloudflare R2 Standard |
|---|---|---|
| Almacenamiento | USD 2,50 / TiB / mes **por copia** | USD 0,015 / GB-mes |
| Cargo fijo | Prueba PDP: USD 0,12 / data set / mes | — |
| Alta | Crear data set USD 0,025; agregar piezas USD 0,008 por llamada + USD 0,003 por pieza | Clase A (escritura): USD 4,50 / millón |
| Lectura | CDN: hasta USD 14 / TiB (≈ la mitad si viene de caché); directa: [Pendiente] | Clase B: USD 0,36 / millón; salida gratis |
| Borrado | USD 0,007 por llamada de borrado programado | Gratis [Inferencia: DELETE no figura como operación facturable] |
| Mínimos y reservas | Sin piso mensual. Reserva reembolsable de ≈ USD 0,50 por data set; con CDN ≈ 1,50. Lockup de 30 días de servicio | Sin mínimo. Free tier: 10 GB-mes, 1 M Clase A y 10 M Clase B al mes |
| Gas | Lo cubren las tarifas por operación. La terminación directa se paga en FIL | No aplica |
| Fuente | [Verificado en fuente] (3), (4), (8). Los precios se leen de una lista on-chain (`getUploadCosts()`) y pueden cambiar. El anuncio de 2025 los presentó como precio de lanzamiento [Afirmación del proveedor] (15) | [Verificado en fuente] (16) |

No encontramos que el precio varíe por proveedor dentro de FOC: la lista de precios es la del contrato de servicio (3). Fuera de FOC, en los acuerdos de almacenamiento clásicos de Filecoin, cada proveedor fija su precio. [Inferencia]

### Cálculo

**Filecoin, costo recurrente mensual** = `bytes / 2^40 × 2,50 × 2 copias + 0,12 × 2 data sets`.

**Filecoin, alta** = `2 copias × (0,025 + llamadas × 0,008 + tickets × 0,003)`. Dos casos:
- Peor caso: una llamada por ticket, es decir 0,011 por ticket y copia.
- Lote: 80 piezas por llamada, que es el tope de los data sets legados.

**R2:** `GB × 0,015 × 12` + `tickets × 2 / 10^6 × 4,50` + `tickets × 3 / 10^6 × 0,36`.

Ejemplo, 100.000 tickets de 1 MB = 10^11 bytes = 0,0909 TiB:
- Filecoin, almacenamiento: 0,0909 × 2,50 × 2 = 0,4547 / mes; más 0,24 de prueba = 0,69 / mes → **8,34 en 12 meses**.
- Filecoin, alta en lote: 2 × (0,025 + 1.250 × 0,008 + 100.000 × 0,003) = **620,05**. Una llamada por ticket: 2 × (0,025 + 100.000 × 0,011) = **2.200,05**.
- Filecoin, lecturas por CDN: 3 × 10^11 bytes = 0,273 TiB × 14 = **3,82**.
- R2: 100 GB × 0,015 × 12 = **18,00**, más operaciones (200.000 × 4,5 / 10^6 + 300.000 × 0,36 / 10^6 = 0,90 + 0,11) = **1,01** → **19,01**.

### Resultados (USD, 12 meses, sin free tier de R2)

| Tickets | Tamaño | Datos | FOC recurrente 12 m | FOC alta (lote 80 / 1 por llamada) | FOC lecturas CDN | **FOC total (lote)** | R2 almacenamiento 12 m | R2 operaciones | **R2 total** |
|---|---|---|---|---|---|---|---|---|---|
| 1.000 | 300 KB | 0,3 GB | 2,90 | 6,25 / 22,05 | 0,01 | **9,16** | 0,05 | 0,01 | **0,06** |
| 10.000 | 300 KB | 3 GB | 3,04 | 62,05 / 220,05 | 0,11 | **65,20** | 0,54 | 0,10 | **0,64** |
| 100.000 | 300 KB | 30 GB | 4,52 | 620,05 / 2.200,05 | 1,15 | **625,72** | 5,40 | 1,01 | **6,41** |
| 1.000 | 1 MB | 1 GB | 2,93 | 6,25 / 22,05 | 0,04 | **9,22** | 0,18 | 0,01 | **0,19** |
| 10.000 | 1 MB | 10 GB | 3,43 | 62,05 / 220,05 | 0,38 | **65,86** | 1,80 | 0,10 | **1,90** |
| 100.000 | 1 MB | 100 GB | 8,34 | 620,05 / 2.200,05 | 3,82 | **632,21** | 18,00 | 1,01 | **19,01** |

**Otros puntos:**

- **Borrado:** borrar tickets uno por uno (retiro del consentimiento) cuesta USD 0,007 por llamada y copia, es decir 2 × 0,007 = 0,014 por ticket. Para 100.000 tickets son 1.400 USD; en lotes de 80, 17,50. R2 no cobra borrados.
- **Free tier de R2:** con el free tier (10 GB y 1 M Clase A al mes), los escenarios de hasta 10 GB **cuestan USD 0**.
- **Reservas de Filecoin:** se necesitan además ≈ 1,00 USDFC de reserva reembolsable (2 data sets) o ≈ 3,00 con CDN, más el lockup de 30 días de almacenamiento.
- **Agrupar no resuelve el costo de alta.** Empaquetar muchos tickets en una sola pieza baja ese costo a casi cero, pero entonces borrar un ticket obliga a volver a subir el paquete, o a depender del borrado criptográfico. [Inferencia]

**Lectura del resultado:** a este volumen el almacenamiento es casi gratis en los dos casos. En FOC dominan las tarifas por pieza (USD 0,003-0,011 por pieza y copia). R2 es entre 30 y 150 veces más barato en el horizonte analizado. [Inferencia a partir de precios verificados]

## 6. Latencia, disponibilidad y dependencia operativa

| Aspecto | Filecoin Onchain Cloud | Fuente |
|---|---|---|
| Latencia | Directa del proveedor: "seconds" (en otra página, "seconds to minutes"). Con FilBeam: milisegundos | [Verificado en fuente] (2), (7) |
| Disponibilidad | Sin SLA. Con varias copias, "retrieval succeeds as long as any one of them is reachable". Los gateways IPFS públicos son "best-effort" | [Verificado en fuente] (7) |
| Proveedores | 2 réplicas en proveedores independientes por defecto. No hay un número publicado de proveedores activos. [Pendiente] | [Verificado en fuente] (5), (10) |
| Pagos | Hace falta una wallet con **USDFC** (y FIL para gas en algunas operaciones), un depósito en Filecoin Pay y el lockup de 30 días. Si falta saldo, se borran los datos | [Verificado en fuente] (3), (4), (5) |
| Red | Mainnet figura como "Live". GA aparece como hito sin fecha ("Hardening on SLA and tooling"). El testnet lanzó en noviembre de 2025 y el anuncio preveía mainnet en enero de 2026 | [Afirmación del proveedor] (10), (15) |
| Madurez del SDK | `@filoz/synapse-sdk` `latest` = **3.0.0**, publicada el 2026-11-13 (el mismo día de esta consulta). Primera versión de junio de 2025. Hay una línea `next` 0.35.0-dev. Mayor reciente: hay que esperar cambios incompatibles | [Verificado en fuente] (12) |
| Contratos | Los contratos PDP están "still in beta testing and might be upgraded", con una auditoría de Zellic (abril de 2025). La página de direcciones de contratos no muestra contenido | [Verificado en fuente] (13), (9) |
| Cifrado | Keysmith y el envelope en versión 0.1.0. El control de acceso figura como "coming soon" | [Verificado en fuente] (6), (18) |

**R2:** servicio administrado, API S3 compatible con el SDK de TypeScript que ya usaríamos, URL prefirmadas, reglas de ciclo de vida, sin wallet y sin token. Cloudflare publica un SLA para planes pagos. [Pendiente: no lo consultamos en esta investigación]

**Dependencia nueva que traería FOC:** una segunda cadena (Filecoin) además de Celo, un segundo token operativo (USDFC/FIL) y la tesorería y el monitoreo de saldos para no perder datos por falta de fondos. Todo eso aumenta la superficie operativa de un equipo chico. [Inferencia]

## 7. ¿Necesitamos almacenamiento descentralizado?

**No.** [Inferencia]

| Necesidad real | ¿La cubre Filecoin? | ¿La cubre almacenamiento privado + compromisos? |
|---|---|---|
| Que el ticket sea real, actual y propio | No | No: la cubren L1-L3 y la prueba de humano (doc 16, §2) |
| Que la evidencia no cambie después de vender | Sí (PDP + PieceCID) | Sí: `evidenceDigest` en la hoja + raíz de Merkle en el recibo firmado |
| Que la plataforma no reescriba el historial | Parcial: solo prueba que se conservan bytes | Sí: log encadenado + anclaje diario de `logHead` en Celo |
| Que un auditor verifique sin exponer datos personales al comprador | No por sí mismo | Sí: pruebas de Merkle + acceso controlado (§3) |
| Borrado en 5 días hábiles | Incierto | Sí: borrado del objeto + ciclo de vida + borrado criptográfico |
| No publicar identificadores por ticket | No: PieceCID y tamaño públicos | Sí: en la cadena solo raíces de hojas con sal |
| Costo bajo a 1.000-100.000 tickets | No (§5) | Sí |

**Recomendación:**

- Mantener R2 (o Supabase Storage) cifrado como almacén de evidencia.
- Agregar, cuando haya resultados vendidos, el **recibo de procedencia** con `evidenceRoot` y el **registro firmado de solo agregado**.
- El anclaje en Celo es opcional y barato. Aporta credibilidad frente a terceros sin publicar nada por ticket.
- Filecoin solo para el uso del Resumen (agregados publicados o raíces), y solo si un comprador lo pide.

---

## 8. Modelo de procedencia de la evidencia

```
 Colaborador
     │ foto del ticket (TLS) + consentimiento versionado
     ▼
[1] Ticket ──► [2] Verificación ──► [3] Extracción ──► [4] Evidencia cifrada
   sha256,        L1 QR ARCA,          JSON normalizado,    AES-256-GCM, clave por ticket (KMS),
   pHash          L2 constatación,     sin tipoDocRec /     original enmascarado;
   (privado)      L3 corroboración     nroDocRec            evidenceDigest = sha256(cifrado)
                                                            → almacenamiento privado (R2)
     ▼
[5] Compromiso criptográfico: leaf = H(0x00‖salt‖evidenceDigest‖observationId‖nivel‖extractionHash)
     ▼                                  (salt y leaf en base privada)
[6] Agregado (k ≥ 5, m ≥ 3): evidenceRoot = Merkle(leaves) ──► recibo firmado ──► log append-only
     ▼                                                                    │ logHead
[7] Resultado vendido por x402 (o cualquier otro riel)                    ▼ (opcional)
    = datos agregados + recibo { evidenceRoot, nivel mínimo, metodología, logIndex, firma }
                                                                anclaje diario en Celo
```

| Etapa | Qué se guarda | Dónde | Quién lo ve | Vida útil |
|---|---|---|---|---|
| 1. Ticket | Imagen original, `sha256`, `pHash` | Almacenamiento privado (objeto cifrado); hashes en Postgres | Sistema; revisor ve solo la versión enmascarada | Imagen: N días [Pendiente]; hashes: para dedupe [Pendiente: revisión legal] |
| 2. Verificación | `Verification` por capa (`pass` / `fail` / `review`), versión de cada verificador | Postgres | Sistema, revisor, auditor | Igual que la observación |
| 3. Extracción | JSON normalizado y desidentificado, `extractionHash`, `modelVersion` | Postgres | Sistema, auditor | Hasta el retiro o la retención |
| 4. Evidencia cifrada | Texto cifrado, `evidenceDigest`, ID de clave (la clave vive en KMS) | R2 / Supabase (P0); Filecoin solo en el spike S8 | Nadie en claro, salvo con una sesión autorizada | Borrado por ciclo de vida o al retirar el consentimiento; destrucción de clave registrada |
| 5. Compromiso | `salt_obs`, `leaf` | Postgres (tabla separada de la identidad del colaborador) | Sistema; auditor solo para la muestra | Mientras existan agregados que la referencian [Pendiente: revisión legal] |
| 6. Agregado | `evidenceRoot`, cantidad de hojas, recibo firmado, entrada del log | Postgres + log; `logHead` opcional en Celo | Comprador (recibo), público (`logHead`) | Permanente (no contiene datos personales) |
| 7. Resultado vendido | Datos agregados + recibo | Respuesta x402; copia en Postgres | Comprador | Según la licencia (doc 16, §7.2) |

**Lo que ve el agente comprador:** solo el agregado y el recibo con `evidenceRoot`, nivel mínimo, versión de metodología, firma e índice del log. Nunca imágenes, hashes de imágenes, `observationId`, wallets ni sales.

**Lo que verifica un auditor autorizado:** que las hojas muestreadas se recalculan y pertenecen a `evidenceRoot`, que el texto cifrado tiene el `evidenceDigest` comprometido, que la extracción coincide con la imagen y que el recibo está en el log no reescrito.

**Independencia del riel de pago:** el recibo es un objeto firmado por la plataforma. Funciona igual con x402 en Celo, en Base o con cualquier otro medio de pago. [Inferencia]

**Cambios de datos que sugiere el modelo** (para el doc 04, sin implementar): en `MediaRef`, `evidenceDigest` y `keyId`; en `Observation`, `leafSalt` y `leaf`; en `DataProduct`, `evidenceRoot` y `provenanceReceipt`. [Pendiente]

> **Filecoin prueba conservación e integridad de datos, no que una compra haya sucedido ni que el ticket pertenezca al colaborador.**

## 9. Comparación técnica: Filecoin Onchain Cloud frente a Cloudflare R2

| Criterio | Filecoin Onchain Cloud (Warm Storage + PDP) | Cloudflare R2 |
|---|---|---|
| **Garantías** | Prueba criptográfica periódica (cada 24 h) de posesión e integridad, verificable por terceros. Pago condicionado a las pruebas | Integridad y durabilidad contractuales. La integridad la verificamos nosotros con `sha256` |
| **Privacidad** | Contenido protegido solo con cifrado propio. El texto cifrado puede descargarse públicamente. PieceCID, tamaño, eventos y wallet son públicos | Bucket privado, URL prefirmadas de vida corta, sin rastro público |
| **Borrado** | `deletePiece` irreversible, pero sin garantía documentada de borrado físico. 2 proveedores, caché CDN y posibles copias de terceros. Depende del borrado criptográfico | Borrado de objeto y reglas de ciclo de vida, con un solo encargado del tratamiento |
| **Revocación de acceso** | Control de acceso "coming soon". Hoy solo se revoca al no compartir la clave | Vence la URL firmada; se revocan credenciales |
| **Costo (100.000 × 1 MB, 12 m)** | ≈ USD 632 (lote) a 2.212 (una llamada por ticket) + reservas | ≈ USD 19 |
| **Latencia** | Segundos (hasta minutos) directo; milisegundos con CDN pago | Milisegundos a cientos de ms [Pendiente: no medido] |
| **Dependencia** | Cadena Filecoin, USDFC/FIL, Filecoin Pay, lockup de 30 días, monitoreo de saldo, proveedores que no elegimos | Una cuenta de Cloudflare y la API S3 |
| **Madurez** | Mainnet "Live", GA sin fecha. SDK 3.0.0 publicado el día de la consulta. Contratos PDP en beta con una auditoría | Servicio administrado en producción desde hace años [Inferencia] |
| **Encaje con Ley 25.326** | Incierto: supresión, transferencia internacional y encargados múltiples [Pendiente: revisión legal] | Camino conocido, con DPA y región configurable [Pendiente: revisión legal] |

## 10. Riesgos de privacidad

| # | Riesgo | Con Filecoin | Mitigación |
|---|---|---|---|
| R1 | Datos del comprador (nombre, DNI/CUIT, últimos dígitos de tarjeta, dirección) en la imagen | Si la clave se filtra, el texto cifrado ya es público y no se puede retirar | Enmascarar antes de cifrar; clave por ticket; nunca subir originales |
| R2 | Identificador público por ticket (PieceCID) ligado a la wallet de la plataforma | Siempre | Lotes, padding y una wallet dedicada; aun así contradice el doc 16, §7 |
| R3 | Metadatos que filtran contexto (nombre de archivo, fecha, comercio, zona) | Los metadatos de pieza y de data set son legibles por terceros | Solo identificadores opacos aleatorios |
| R4 | Patrones de actividad (frecuencia de alta, tamaño, horario) | Visibles en la cadena | Lotes a horario fijo y tamaños fijos |
| R5 | Supresión incompleta (2 proveedores, CDN, descargas de terceros) | Alta | Borrado criptográfico + registro de destrucción [Pendiente: revisión legal] |
| R6 | Transferencia internacional (art. 12) | Proveedores en jurisdicciones que no elegimos | Fijar proveedores conocidos o no usar Filecoin [Pendiente: revisión legal] |
| R7 | Criptografía futura ("guardar ahora, descifrar después") | El texto cifrado público puede conservarse indefinidamente | AES-256 y sin publicar evidencia; en R2 el texto cifrado no es público |
| R8 | Reidentificación por compromisos | Bajo, si las hojas llevan sal | Sal de 32 bytes por hoja; nunca publicar hojas sueltas; `leafCount` redondeado para no revelar el tamaño exacto del agregado |
| R9 | Pérdida de datos por falta de USDFC | Real: si el saldo cae del lockup, el proveedor puede borrar | Alertas de saldo; no usar Filecoin como única copia |

## 11. Propuesta de spike S8

**Vías a comparar (las tres con los mismos 50 tickets sintéticos y el mismo recibo de procedencia):**

| Vía | Qué aporta | Qué medir en particular |
|---|---|---|
| A. Synapse SDK (Filecoin Onchain Cloud, PDP) | Pruebas de posesión verificables on-chain; mayor control | Metadata on-chain, costo por pieza, borrado con `deletePiece` |
| B. Lighthouse (SDK + Kavach) | Integración más simple, precio plano, cifrado y revocación de acceso | Si el CID cifrado es descargable por un gateway público; si el borrado elimina las copias en Filecoin y en IPFS; qué prueba de conservación ofrece al auditor (PDP u otra) |
| C. Cloudflare R2 (base) | Almacenamiento privado convencional, borrado inmediato | Costo y latencia de referencia; el recibo de procedencia funciona igual |

**Criterio de adopción:** A o B se adoptan solo si muestran una ventaja real sobre C en integridad, auditoría o conservación, a un costo razonable, **y** cumplen la condición de privacidad y borrado verificables. Usar blockchain no es por sí solo una justificación.

**Pregunta:** ¿podemos guardar evidencia cifrada sintética en FOC (red de prueba Calibration) sin que aparezca en la cadena ningún dato vinculable a un ticket, salvo el PieceCID y el tamaño del texto cifrado? ¿Podemos además emitir y verificar un recibo de procedencia (`evidenceRoot`) independiente del almacenamiento?

**Condiciones:**
- Solo Calibration testnet, con USDFC y tFIL de faucet.
- Wallet nueva, sin fondos reales.
- 50 tickets **sintéticos** generados por nosotros, sin datos personales reales.
- Sin contratos propios.
- Código en `spikes/s8-filecoin-evidence/`, fuera del backend.
- Se hace después del S0, sin bloquearlo.

**Pasos:**

1. Cifrar cada ticket sintético con AES-256-GCM, clave por archivo y padding a tamaño fijo. Subir con `@filoz/synapse-sdk` fijado a una versión exacta: primero 1 pieza por llamada y después en lotes.
2. Inspeccionar la cadena y los eventos `PieceAdded` desde una cuenta ajena. Listar todo lo visible.
3. Descargar el texto cifrado sin credenciales, solo con el PieceCID, para confirmar si es público.
4. Medir la latencia de alta y de descarga (directa y con CDN, p50 y p95) sobre 50 descargas.
5. Llamar a `deletePiece` y medir cuándo dejan de responder los proveedores y si el texto cifrado sigue disponible por otra vía después de 24 h y de 7 días.
6. Comparar los costos reales de `getUploadCosts()` con los de §5.
6b. Repetir los pasos 1-6 con Lighthouse (vía B): subir con Kavach, descargar el CID desde un gateway público sin credenciales, revocar el acceso, borrar y volver a consultar el CID a las 24 h y a los 7 días desde gateways de terceros.
7. Con los mismos 50 tickets, construir `evidenceRoot`, firmar el recibo, generar el log y una prueba de inclusión, y verificarla con un script independiente. Repetirlo con R2 como almacenamiento para mostrar que el recibo no depende de Filecoin.

**Éxito:**
- Ningún metadato on-chain revela datos del ticket.
- Las pruebas de Merkle verifican.
- Los costos medidos quedan dentro de ±20 % de §5.
- La descarga p95 con CDN es menor a 2 s.
- Hay un comportamiento de borrado documentado y reproducible.

**Fracaso** (confirma el NO-GO):
- El texto cifrado sigue descargable después de `deletePiece` más allá del plazo legal de 5 días hábiles.
- El SDK no permite controlar los metadatos.
- Los costos superan en más de 2 veces los de §5.
- La operación requiere intervención manual de un proveedor.

**Duración:** 3 a 4 días de una persona (las dos vías), más 7 días de espera pasiva para observar el borrado.

**Entregable:** `spikes/s8-filecoin-evidence/REPORT.md` con mediciones, capturas de la cadena y una actualización del veredicto de este informe.

## 12. Fuentes

Todas consultadas el **2026-11-13**.

1. Filecoin Onchain Cloud, *Proof of Data Possession*: https://docs.filecoin.cloud/core-concepts/pdp-overview.md
2. Filecoin Onchain Cloud, *Filecoin Warm Storage Service*: https://docs.filecoin.cloud/core-concepts/fwss-overview.md
3. Filecoin Onchain Cloud, *Storage Costs*: https://docs.filecoin.cloud/developer-guides/storage/storage-costs.md
4. Filecoin Onchain Cloud, *Payments & Storage*: https://docs.filecoin.cloud/cookbooks/payments-and-storage.md
5. Filecoin Onchain Cloud, *Storage Operations*: https://docs.filecoin.cloud/developer-guides/storage/storage-operations.md
6. Filecoin Onchain Cloud, *Encrypt a file*: https://docs.filecoin.cloud/developer-guides/encryption/encrypt-a-file.md
7. Filecoin Onchain Cloud, *Retrieval*: https://docs.filecoin.cloud/core-concepts/retrieval.md
8. Filecoin Onchain Cloud, *About*: https://docs.filecoin.cloud/introduction/about.md
9. Filecoin Onchain Cloud, *Contract Addresses*: https://docs.filecoin.cloud/resources/contracts.md
10. Filecoin Onchain Cloud, sitio del producto (estado de la red y hoja de ruta): https://filecoin.cloud
11. FilOzone, repositorio Synapse SDK: https://github.com/FilOzone/synapse-sdk
12. Registro npm, `@filoz/synapse-sdk` (dist-tags y fechas): https://registry.npmjs.org/@filoz/synapse-sdk
13. FilOzone, repositorio de contratos PDP: https://github.com/FilOzone/pdp
14. FilOzone, diseño de PDP: https://github.com/FilOzone/pdp/blob/main/docs/design.md
15. Filecoin, anuncio de Filecoin Onchain Cloud (18-11-2025): https://filecoin.io/blog/introducing-filecoin-onchain-cloud-verifiable-developer-owned-infrastructure
16. Cloudflare, *R2 pricing*: https://developers.cloudflare.com/r2/pricing/
17. Ley 25.326 de Protección de los Datos Personales, texto actualizado en InfoLEG: https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm
18. Filecoin Onchain Cloud, índice de documentación (incluye *Access Control*, "coming soon"): https://docs.filecoin.cloud/llms.txt

**Nota sobre fuentes:**
- La afirmación de que PDP "no garantiza la recuperación" aparece en notas públicas del equipo FilOz en Notion (https://filoznotebook.notion.site/An-Overview-of-PDP-Integration-for-FIL-Deals-1bcdc41950c180539891d38c38285363). No pudimos leer la página directamente; la conocemos por el extracto de un buscador, así que la tratamos como [Pendiente] de cita textual.
- La documentación canónica de FOC está en docs.filecoin.cloud (según el repositorio del SDK), no en docs.filecoin.io.
- Halo (doc `lecciones-halo-x402.md`) usa Filecoin con Synapse para imágenes cifradas: es un antecedente de uso, no una validación del modelo legal.
