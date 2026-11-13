# zkMe MeID como prueba de persona única: informe técnico

**Fecha:** 2026-11-13 · **Alcance:** investigación con fuentes primarias. **No es una integración aprobada.** El P0 sigue congelado y MeID no entra en él. S0 (x402 en Celo Sepolia) mantiene la prioridad; este informe no lo bloquea.

**Documentos relacionados:** [16 — Modelo de seguridad, verificación y pagos](../../docs/16-modelo-seguridad-verificacion-pagos.md) (riesgo R2, granja de cuentas), [odd/tasks/research-meid-filecoin.md](../../odd/tasks/research-meid-filecoin.md) (specs S1, S2, S5).

**Etiquetas de evidencia:**
- **[Verificado en fuente]**: comprobado en documentación oficial, código publicado del SDK o página del proveedor (enlace incluido).
- **[Afirmación del proveedor]**: texto comercial o de diseño del proveedor que nadie verificó de forma independiente.
- **[Pendiente]**: no se encontró en fuentes públicas; requiere spike o respuesta escrita del proveedor.
- **[Inferencia]**: conclusión propia a partir de las fuentes; puede estar equivocada.

## Resumen y veredicto

**Veredicto para "MeID como primera opción a validar en un spike": INCONCLUSO.**

Tiene sentido hacer el spike S7, porque es barato y tiene preguntas concretas que solo una prueba puede contestar. Pero la documentación pública **no alcanza** para tratar a MeID como garantía de unicidad entre wallets:

1. **La unicidad que se documenta es por rostro, no por cuenta de nuestra app.** zkMe compara el rostro cifrado contra su base y rechaza un "faceprint" similar a otro usuario [Verificado en fuente, 1, 2, 3]. Ninguna fuente dice si **una misma persona con un solo MeID puede autorizar varias wallets o cuentas** de la misma app. Para R2 esta es la pregunta central y sigue sin respuesta [Pendiente].
2. **El resultado que recibe nuestro backend es un booleano, sin identificador.** La consulta de MeID del SDK envía `{ userAccount, mchNo }` a un endpoint de zkMe **sin API key** y devuelve `isGrant: boolean` [Verificado en fuente, 7]. No trae nullifier por aplicación, identificador estable, firma, vencimiento ni revocación [Verificado en fuente, 6, 7]. El mecanismo de nullifiers del sistema de credenciales de zkMe existe en la documentación, pero no se presenta como salida de MeID [Verificado en fuente, 4].
3. **No hay certificaciones públicas de detección de ataques de presentación** (iBeta, ISO/IEC 30107-3) ni de inyección [Pendiente, 15].
4. **El widget no ofrece español** (`locale: 'en' | 'zh-hk'`) [Verificado en fuente, 7].
5. **La política de privacidad de la app es de 2023** y no menciona Argentina ni la Ley 25.326 [Verificado en fuente, 12].
6. **Los costos públicos se contradicen.** La página de precios anuncia un plan gratuito de hasta 1.000 verificaciones por mes, y la guía de facturación exige US$ 25 por mes de acceso productivo más US$ 0,50 por credencial [Verificado en fuente, 10, 11].

**Pasa a GO si se cumplen las cuatro condiciones:**
- El spike S7 muestra que la misma persona **no** consigue `isGrant = true` para dos cuentas o wallets distintas de la misma app, o que zkMe expone un identificador estable por aplicación que permite detectarlo.
- zkMe responde por escrito sobre retención y borrado del faceprint cifrado, país de almacenamiento y encargados del tratamiento, y firma un acuerdo de tratamiento de datos.
- Hay un resultado verificable del lado del servidor: consulta autenticada, respuesta firmada o prueba criptográfica.
- El precio queda confirmado por escrito para el volumen previsto.

**Pasa a NO-GO** si en S7 una segunda cuenta de la misma persona obtiene `isGrant = true` sin una clave que las vincule. En ese caso MeID solo sirve como señal de humanidad o fricción (`humanityVerified`) y **nunca** como `uniquenessVerified` (spec S3). Según S5, no se adopta solamente porque sea fácil de integrar.

## 1. Unicidad real

| Hallazgo | Etiqueta |
|---|---|
| El flujo declarado es: prueba de vida → generación del "face graph" → cifrado totalmente homomórfico (FHE) → comparación cruzada del face graph cifrado → creación de un DID único de zkMe → control del informe final. | [Verificado en fuente, 1] |
| Durante el registro, el servidor compara el faceprint cifrado contra los ya registrados y produce un "ciphertext" de similitud. **El frontend lo descifra y decide si el rostro ya estaba registrado.** Si no estaba, se guardan el DID y el faceprint cifrado. | [Verificado en fuente, 3] |
| El widget tiene una pantalla de error "Existing Faceprint Error", definida como "the user's faceprint is similar to another user's". | [Verificado en fuente, 2] |
| **Alcance de la unicidad:** la comparación es contra la base de zkMe, no contra una base por app (1:N global). Así se lee "One Face, One MeID" y el error de faceprint existente. | [Inferencia, 1, 2, 3] |
| **Varias wallets por persona:** no está documentado. El widget asocia el MeID a un `associatedAccount`, que es la wallet o el identificador que devuelve nuestro `getUserAccounts()`, y la consulta se hace por `(mchNo, userAccount)`. Nada indica si un MeID ya creado puede autorizar una segunda wallet de la misma app. El buscador de la documentación de zkMe responde lo mismo: "The MeID docs don't establish whether one person can authorize multiple accounts under the same `mchNo`". | [Pendiente, 2, 7, 16] |
| En zkKYC, la API `getUsersList` devuelve por cada `zkmeId` un **arreglo** `clientUserIdentifier`, o sea, varios identificadores de cliente por usuario de zkMe. No está documentado si esa API cubre MeID. | [Verificado en fuente para zkKYC, 6]; [Pendiente para MeID] |
| No hay tasas de falsa coincidencia ni de falsa no coincidencia publicadas para la deduplicación facial. | [Pendiente] |
| La decisión de "ya registrado" se descifra en el cliente. La documentación no explica cómo impide el servidor que un cliente modificado declare "no registrado". | [Inferencia, 3]; pregunta para el proveedor |

**Prueba de vida frente a unicidad.** Son dos garantías distintas y no conviene suponer que una implica la otra:
- **La prueba de vida** dice que hay una persona viva frente a la cámara en ese momento. La guía de integración de MeID solo describe esto: "users are required to undergo facial liveliness detection to prove that they are real human users" [Verificado en fuente, 2].
- **La unicidad** dice que esa persona no tiene otra cuenta. En MeID depende de la comparación 1:N contra la base de zkMe y de cómo se vinculan las wallets. Lo primero es [Afirmación del proveedor]; lo segundo, [Pendiente].
- **Referencia útil:** World documenta su propia verificación por selfie ("Proof of Presence") como de garantía media, que "does not provide a strict one-person-one-account guarantee", y en lugar de un veredicto devuelve un `sybil_score` como señal de riesgo [Verificado en fuente, 18]. Es razonable esperar límites parecidos de cualquier deduplicación hecha solo con el rostro y la cámara del teléfono [Inferencia].

## 2. Identificador y nullifier por aplicación

| Hallazgo | Etiqueta |
|---|---|
| El evento `meidFinished` devuelve `{ isGrant: boolean, associatedAccount: string }`. `verifyMeidWithZkMeServices` devuelve `{ isGrant: boolean }`. No hay nullifier ni ID de persona. | [Verificado en fuente, 7] |
| El sistema de credenciales de zkMe documenta nullifiers deterministas: `Hash(userKey, credential, verifierID, sessionID)`, con un `nullifierSessionID` que fija el verificador y un registro de nullifiers usados que mantiene la app, onchain u offchain. **No se documenta como salida del widget o la API de MeID.** | [Verificado en fuente, 4] |
| En la ruta de autenticación "ETH" de ese circuito, la identidad se deriva de la dirección Ethereum (`calcIdFromEthAddress`). Si el nullifier depende de esa identidad, dos wallets podrían dar dos nullifiers distintos, salvo que la credencial facial las ate. | [Inferencia, 4] |
| `zkmeId` ("Unique zkMe user ID") aparece en las APIs de zkKYC y es global de zkMe, no por aplicación. Si se usara como clave de deduplicación, permitiría correlacionar a la persona entre apps. La misma API también devuelve `zkmeAccount`, que es el email con el que la persona entra a zkMe. | [Verificado en fuente para zkKYC, 6] |

**Cómo vincular recompensas sin guardar biometría propia** [Diseño, condicionado a S7]:
- Pasar como `userAccount` nuestro `contributorId` interno en modo email/identificador, no la wallet. El SDK acepta "e-mail address, phone number or any other unique identifier" [Verificado en fuente, 2]. Así la unidad que se deduplica es nuestra cuenta, y las wallets de cobro cuelgan de ella.
- Guardar solo `(contributorId, proveedor, isGrant, verificadoEn)` en la tabla de identidad separada de las observaciones (doc 16 §7).
- Esto **solo** resuelve R2 si S7 demuestra que un mismo rostro no puede producir `isGrant = true` en dos `contributorId`. Si no lo demuestra, no hay ninguna clave con la que detectar el duplicado.

## 3. Accesibilidad

| Hallazgo | Etiqueta |
|---|---|
| MeID usa la cámara (rostro). No requiere pasaporte, NFC ni hardware externo. | [Verificado en fuente, 1, 2] |
| La integración de MeID es un widget web (`@zkmelabs/widget`, que abre `widget.zk.me`). La sección "Mobile SDK" solo lista zkOBS; **no hay SDK nativo de MeID**. | [Verificado en fuente, 7, 9] |
| No se encontró documentación sobre si funciona en navegadores móviles de gama media o baja (Android Go, WebViews), ni sobre requisitos mínimos de cámara. | [Pendiente] |
| La pantalla "Camera Permission Denied Error" cubre el caso de cámara denegada o ausente. | [Verificado en fuente, 2] |
| Idioma: `Language = 'en' \| 'zh-hk'`. **No hay español.** | [Verificado en fuente, 7] |
| No hay lista de países donde está disponible ni exclusiones. | [Pendiente] |
| Existe la app zkMe (SSI wallet) en Google Play y App Store. No está documentado si MeID exige instalarla. | [Afirmación del proveedor, 13]; [Pendiente] |

## 4. Privacidad

| Hallazgo | Etiqueta |
|---|---|
| Datos que se recolectan: "nodal point faceprint" a partir de "multiple pictures of your face". | [Verificado en fuente, 12] |
| Dónde se guardan: el perfil de zkMe, que incluye el "FH encrypted nodal point faceprint", "is stored on zkMe servers". | [Verificado en fuente, 12] |
| "FH encryption ensures that zkMe servers can identify faceprint uniqueness without the ability to decrypt". | [Afirmación del proveedor, 12] |
| Retención: "as long as it is needed to provide the Services". Para el archivo descentralizado, "as long as required by law". No fija un plazo. | [Verificado en fuente, 12] |
| Borrado: "Any request to delete all or any personal data … is fulfilled within 30 days". El SBT con el DID se puede borrar en cualquier momento. Un DID registrado onchain "cannot be fully revoked". | [Verificado en fuente, 5, 12] |
| No se nombran el país de almacenamiento, el proveedor de prueba de vida ni otros encargados. Las referencias normativas son el RGPD y la CCPA. Entidad: "zkMe Technology Limited". Última actualización: "2023/09/15". | [Verificado en fuente, 12] |
| En el modelo de identidad autosoberana de zkMe para cumplimiento normativo, un "Regulator" tiene una parte de la clave para desanonimizar en casos legales (umbral 2/2). No está claro si esto aplica a MeID. | [Verificado en fuente, 14]; [Pendiente para MeID] |
| Las APIs de zkKYC devuelven al integrador el email de la persona en zkMe (`zkmeAccount`). | [Verificado en fuente, 6] |
| La consulta de estado de MeID no exige API key. Cualquiera que conozca nuestro `mchNo` (es público en el frontend) podría consultar si una wallet o identificador tiene MeID en nuestra app. | [Inferencia a partir del código del SDK, 7] |

**Ley 25.326.** El equipo trata los datos biométricos como datos sensibles (supuesto de trabajo, pendiente de confirmación legal). Con eso:
- La política de zkMe no menciona Argentina, no fija plazos de retención y no identifica dónde se almacenan los datos ni quién más los trata. Faltan los elementos que necesitaríamos para informar al contribuyente y documentar la transferencia internacional [Inferencia].
- El faceprint cifrado lo guarda zkMe, no nosotros. Igual seguimos siendo responsables de cómo ofrecemos el flujo y del consentimiento [Inferencia; requiere asesoría legal].
- **Antecedente:** la AAIP investigó en 2023 el tratamiento de datos biométricos de Worldcoin en Argentina. La fuente es prensa, no la resolución, y el estado actual está [Pendiente] [19]. Conviene esperar el mismo escrutinio para cualquier proveedor biométrico.

## 5. Costos

| Fuente | Qué dice | Etiqueta |
|---|---|---|
| Página de precios | Starter "Passport & Personhood": US$ 0, "No credit card required", "Up to 1,000 verifications / month", incluye "Personhood proof (MeID)". "Passport and Personhood verification is permanently free up to 1,000 verifications per month." Las credenciales se facturan "per issuance, per year"; si la persona vuelve a verificar después del vencimiento, se emite y factura una nueva. Descuento por volumen desde 10.000 credenciales por mes. | [Verificado en fuente, 10] |
| Guía de facturación (docs) | Modelo prepago de créditos (1 crédito = US$ 1), que se compran en USDC. "Production API Access" cuesta 25 créditos por mes por cuenta del dashboard. "Credential Fee": 0,50 créditos por credencial facturable, cobrada al iniciar la sesión y no según el resultado. "On-chain Mint" suma el gas del SBT; el modo "Cross-chain" no suma gas. | [Verificado en fuente, 11] |
| Página de MeID | Remite a las "Pricing & Billing Rules" del dashboard como fuente de verdad y ofrece igualar precios. | [Verificado en fuente, 1] |

**Contradicción sin resolver:** no se sabe si MeID dentro de las 1.000 verificaciones mensuales del plan gratuito exige igual los US$ 25 por mes de acceso productivo, ni si se cobra por sesión iniciada (que incluye los intentos fallidos) [Pendiente: respuesta escrita de zkMe]. La compra de créditos en USDC y el soporte por Telegram son operativos, pero agregan fricción de tesorería [Inferencia].

**Orden de magnitud** si rige la guía de facturación [Inferencia]: 1.000 contribuyentes nuevos por mes cuestan unos US$ 25 + 1.000 × US$ 0,50 = **US$ 525 por mes**, más las sesiones fallidas. Si rige la página de precios, cuestan US$ 0.

## 6. Integración

| Aspecto | Hallazgo | Etiqueta |
|---|---|---|
| SDK web | `@zkmelabs/widget` 0.3.6 (publicado el 2025-05-16), licencia MIT, tipos TypeScript incluidos (`index.d.ts`), repositorio `zkMeLabs/zkme-sdk-js`, unas 30.500 descargas semanales. | [Verificado en fuente, 7, 8] |
| Token | El backend obtiene un `accessToken` con `POST https://nest-api.zk.me/api/token/get` y `{ apiKey, appId, apiModePermission, lv: 2 }`. | [Verificado en fuente, 2] |
| Modos | Login por email o por wallet. Con `checkAddress: true` se exige firma de la wallet. | [Verificado en fuente, 2] |
| Verificación en el backend | `verifyMeidWithZkMeServices(appId, userAccount)` hace `POST https://popupapi.zk.me/appUserGrantMch/queryBindingMeId` con `{ userAccount, mchNo }`, **sin API key ni firma**, y devuelve un booleano. Se puede llamar desde Hono con `fetch`, pero el resultado vale lo que vale la confianza en el servidor de zkMe. No es una prueba que podamos verificar nosotros. | [Verificado en fuente, 7] |
| Vencimiento y revocación | Para MeID no están documentados. Para las credenciales reutilizables de zkKYC sí: vencimiento en el circuito y un árbol de revocación onchain. | [Pendiente para MeID]; [Verificado en fuente para zkKYC, 17] |
| Repetición (replay) | Para MeID no hay prueba que repetir: la consulta es un booleano por cuenta. En las pruebas ZK de zkKYC el nonce del verificador ata la prueba a una interacción. | [Verificado en fuente, 7, 17] |
| Cadenas | El README del SDK dice que con "Anti-Sybil(MeID)" no hace falta implementar los métodos de cadena. **Celo no figura** en las cadenas de zkMe (las mainnet incluyen Arbitrum, Base, BNB, Ethereum, Polygon, Solana y TON, entre otras). Como la verificación de MeID es offchain, la cadena no debería importar, aunque el constructor del widget igual pide `chainId`; qué valor usar queda [Pendiente]. | [Verificado en fuente, 6, 7, 25]; [Inferencia] |
| Independencia de la blockchain | Usar MeID offchain mantiene la identidad separada de la red de pagos y de la verificación de tickets (spec S1). | [Inferencia] |
| Límite de llamadas a la API | 10 llamadas por segundo por key en el plan Standard. | [Verificado en fuente, 20] |

## 7. Seguridad

| Hallazgo | Etiqueta |
|---|---|
| El widget detecta "eyes closed" y "art mask" (pantalla "Face Recognition Error"). | [Verificado en fuente, 2] |
| La documentación dice que la prueba de vida "can prevent malicious users from uploading photos of others". No da detalles sobre videos, deepfakes ni inyección de cámara virtual. | [Afirmación del proveedor, 3] |
| No se encontraron certificaciones iBeta PAD ni ISO/IEC 30107-3, ni evaluaciones de inyección (CEN/TS 18099), en la web, la documentación ni búsquedas. La home de zk.me solo menciona alineación con "FATF · MiCA · GDPR". | [Pendiente, 13, 15] |
| Hay un bug bounty para contratos y aplicaciones, de US$ 500 a US$ 10.000. No se encontraron auditorías publicadas del sistema facial. | [Verificado en fuente, 21]; [Pendiente: auditorías] |
| Registros repetidos: se bloquean por similitud de faceprint (sección 1). Los límites de esa comparación (gemelos, parecidos, cambios de aspecto) y la decisión en el cliente no están documentados. | [Pendiente] |
| Los contadores de la home muestran "0.0M+ Unique Credentials" y "0+ Protocol Integrations" (sin renderizar), junto con "90+ Protocols" y "30+ Supported Blockchains". No hay cifras auditables. | [Afirmación del proveedor, 13] |

## Comparación breve

| Criterio | zkMe MeID | World ID: Proof of Human (Orb) | World ID: Proof of Presence (selfie) | Human Passport |
|---|---|---|---|---|
| Fuerza de la unicidad | Deduplicación facial 1:N declarada; multi-wallet sin documentar | "each human can only have one PoH credential" (iris, Orb) [18] | Garantía media; "does not provide a strict one-person-one-account guarantee"; `sybil_score` [18] | Puntaje por stamps; deduplicación **por instancia de scorer**, que "allows users to create multiple personas" [22] |
| Nullifier por app | No en MeID; existe en el sistema de credenciales [4] | Sí: usuario + `app_id` + `action` [18] | Sí, con solicitud de unicidad por acción [18] | `hash` por stamp para deduplicar; no es un nullifier de persona [22] |
| Hardware | Teléfono con cámara | Visitar un Orb | Teléfono con cámara y World App | Ninguno (stamps); verificación biométrica opcional [23] |
| Acceso en LatAm/NOA | Sin español; países sin documentar | Orbs en Buenos Aires en 2023; investigación de la AAIP; disponibilidad en NOA [Pendiente] [19] | Cualquiera con World App [18] | Stamps web; sin datos regionales [Pendiente] |
| Privacidad | Faceprint cifrado con FHE en servidores de zkMe; retención sin plazo; política de 2023 [12] | La app recibe una prueba ZK, no datos personales [18] | Igual que Proof of Human; validez de 90 días [18] | La app solo ve aprobado o rechazado [23] |
| Costo | Contradictorio: gratis hasta 1.000 por mes o US$ 25 por mes + US$ 0,50 por credencial [10, 11] | [Pendiente]: no aparece en la documentación revisada | [Pendiente] | [Pendiente]: API key + scorer; precios no publicados [24] |
| Integración | Widget web (TypeScript); booleano sin autenticar | IDKit (React, Swift, Kotlin), firma de la app en el backend y verificación en el Developer Portal u onchain [18] | IDKit con el preset `selfieCheck` [18] | Stamps API v2, Embed, contratos en Optimism y Base [23, 24] |

**Lectura** [Inferencia]:
- En unicidad, MeID se parece más a Proof of Presence de World que a Proof of Human. La diferencia es que World pone el límite por escrito y MeID no.
- World Proof of Human es la opción con unicidad más fuerte, pero depende de los Orbs, que tienen problemas de cobertura en el NOA y de aceptación regulatoria.
- Human Passport no da unicidad fuerte. Sirve como capa complementaria.

## Limitaciones y riesgos

1. **Documentación escasa justo donde importa:** cómo se vinculan las wallets, el nullifier, el vencimiento y la revocación de MeID.
2. **Confianza en el proveedor:** el resultado es un booleano que devuelve un endpoint público de zkMe, sin prueba que podamos verificar. Si zkMe falla o cambia, no tenemos evidencia propia.
3. **Fuga de membresía:** la consulta sin API key permite enumerar qué cuentas tienen MeID en nuestra app [Inferencia].
4. **Riesgo regulatorio:** los datos biométricos los trata un tercero con una política desactualizada y sin mención de Argentina.
5. **Riesgo de producto:** sin español, la tasa de abandono puede ser alta en el NOA. No hay datos de funcionamiento en teléfonos de gama baja.
6. **Riesgo de costos:** las fuentes se contradicen y el pago es en USDC.
7. **Riesgo de dependencia:** zkMe es un proveedor pequeño; el último publish del SDK es de 2025-05-16.
8. **Lo que este informe no probó:** que el flujo funcione de punta a punta, la tasa de aceptación real y la resistencia a ataques. Todo eso requiere S7.

## Propuesta de spike S7: identidad (independiente de S0)

**Pregunta:** ¿MeID impide que una misma persona obtenga `isGrant = true` en dos cuentas o wallets distintas de nuestra app? ¿Y lo hace con condiciones de privacidad y costo aceptables?

**Reglas:**
- Solo participan integrantes del equipo (2 o 3 personas), con consentimiento escrito previo.
- No participan terceros ni usuarios reales. No se recolecta biometría de usuarios.
- Nuestros servidores **no** reciben ni guardan imágenes, videos ni plantillas biométricas. El flujo facial corre en el widget de zkMe.
- Se guarda solo `(cuentaDePrueba, isGrant, timestamp)` en un archivo de trabajo fuera del repositorio, que se borra al terminar.
- Cada participante pide a zkMe el borrado de sus datos al cierre y se registra cuánto tarda la confirmación.
- No toca S0, el P0, contratos ni fondos reales. Se usa el plan gratuito o de prueba. Si exige pago, el spike se detiene y se pide decisión al equipo.

**Pruebas:**

| # | Prueba | Resultado esperado para GO |
|---|---|---|
| T1 | La persona A verifica con la wallet A1 (modo wallet) | `isGrant = true` |
| T2 | La misma A, con la misma cuenta de zkMe, autoriza la wallet A2 en la misma app | Rechazo, o una clave visible que vincule A1 y A2 |
| T3 | La misma A crea una cuenta de zkMe nueva (otro email) y verifica con la wallet A3 | "Existing Faceprint Error" |
| T4 | Modo email/identificador: la misma A con dos `contributorId` distintos | El segundo se rechaza o queda vinculado |
| T5 | La persona B (distinta) verifica | `isGrant = true` (sin falso duplicado) |
| T6 | Ataques básicos con el propio rostro del participante: foto impresa, foto en pantalla, video grabado de sí mismo. Sin deepfakes ni rostros de terceros | Rechazo en todos los casos |
| T7 | Consulta `queryBindingMeId` desde el backend: ¿exige autenticación? ¿`getUsersList` devuelve usuarios de MeID con un `zkmeId` común? | Documentar la respuesta real |
| T8 | Pedido de borrado de datos y nueva consulta de `isGrant` | Confirmación en 30 días o menos; `isGrant` pasa a `false` |
| T9 | Android de gama media o baja e iPhone, en navegador móvil; registrar la experiencia sin español | Completa el flujo en 3 minutos o menos |
| T10 | Cuestionario escrito a zkMe: vinculación de varias wallets, nullifier por app, retención, país, encargados, certificaciones PAD, precio de MeID y acuerdo de tratamiento de datos | Respuestas escritas |

**Criterio de éxito:** T2, T3 y T4 bloquean o vinculan el duplicado; T6 rechaza los ataques; T8 funciona; T10 confirma precio y privacidad. Con esto, MeID puede marcar `uniquenessVerified` en la interfaz `IdentityVerificationProvider` (spec S3).

**Criterio de fracaso:** cualquiera de T2, T3 o T4 da `isGrant = true` sin una clave que vincule las cuentas, o zkMe no responde T10 en el plazo. Entonces MeID queda, como mucho, en `humanityVerified`, y se evalúan World ID (Proof of Human) o una combinación con Human Passport.

**Duración:** 3 a 5 días hábiles, incluida la espera de respuestas de zkMe. Se ejecuta después de S0 o en paralelo, sin quitarle tiempo.

## Fuentes

Todas consultadas el 2026-11-13.

1. zkMe Docs, "Proof-of-Personhood (MeID)": https://docs.zk.me/hub/what/zkkyc/meid
2. zkMe Docs, "Proof-of-Personhood (MeID)", integración con el JS SDK: https://docs.zk.me/hub/start/onboarding/integration/js-sdk/zkkyc/meid
3. zkMe Docs, "Faceprint DID Creation": https://docs.zk.me/hub/how-built/id-infra/did-method/did-creation
4. zkMe Docs, "Anti-Sybil Mechanisms": https://docs.zk.me/hub/how-built/credential-sys/anti-sybil-mech
5. zkMe Docs, "zkMe DID Method": https://docs.zk.me/hub/how-built/id-infra/did-method
6. zkMe Docs, "Verify zkKYC Status": https://docs.zk.me/hub/start/onboarding/integration/api/verify-zkkyc
7. Paquete npm `@zkmelabs/widget` 0.3.6, `index.d.ts`, `dist/verify.js` y README (tarball del registro): https://registry.npmjs.org/@zkmelabs/widget
8. Descargas en npm de `@zkmelabs/widget` (2026-11-06 a 2026-11-12): https://api.npmjs.org/downloads/point/last-week/@zkmelabs/widget
9. zkMe Docs, "Mobile SDK": https://docs.zk.me/hub/start/onboarding/integration/mobile-sdk
10. zkMe, página de precios: https://www.zk.me/pricing/
11. zkMe Docs, "Billing & Credits": https://docs.zk.me/hub/start/onboarding/dashboard/billing-and-credits
12. zkMe, "App Privacy Policies" (última actualización 2023/09/15): https://www.zk.me/app-privacy-policies
13. zkMe, página principal: https://www.zk.me/
14. zkMe Docs, "zkMe Self-Sovereign Identity": https://docs.zk.me/hub/how-built/id-infra/ssi
15. Búsqueda web "zkMe MeID liveness iBeta ISO 30107-3 deepfake injection attack certification" (sin resultados de zkMe)
16. Buscador de la documentación de zkMe (GitBook "ask") sobre varias cuentas por `mchNo`: https://docs.zk.me/hub/what/zkkyc/meid.md?ask=...
17. zkMe Docs, "Reusable Credentials": https://docs.zk.me/hub/how-built/credential-sys/reusable-credentials
18. World Docs: "World ID Overview" https://docs.world.org/world-id/overview, "Proof of Human" https://docs.world.org/world-id/credentials/1, "Proof of Presence" https://docs.world.org/world-id/credentials/11, "Core Concepts" https://docs.world.org/world-id/concepts, "IDKit integrate" https://docs.world.org/world-id/idkit/integrate
19. Prensa argentina sobre la investigación de la AAIP a Worldcoin (fuente secundaria): https://www.iprofesional.com/legales/387110-investigan-a-worldcoin-por-tratamiento-de-datos-sensibles, https://www.forbesargentina.com/innovacion/worldcoin-jaque-argentina-brasil-suspenden-operaciones-deben-explicar-hacen-datos-registrados-n38686/amp
20. zkMe Docs, "zkMe API": https://docs.zk.me/hub/start/onboarding/integration/api
21. zkMe Docs, "zkMe Bug Bounty Program": https://docs.zk.me/hub/explore/bounty
22. Human Passport Docs, "Deduplicating Stamps": https://docs.passport.human.tech/building-with-passport/stamps/major-concepts/deduplicating-stamps
23. Human Passport Docs, "Individual Verifications": https://docs.passport.human.tech/building-with-passport/individual-verifications/introduction
24. Human Passport Docs, "Getting access to the Stamps API v2": https://docs.passport.human.tech/building-with-passport/stamps/passport-api/getting-access
25. zkMe Docs, "zkMe Supported Chains": https://docs.zk.me/hub/how-works/architecture/chains
