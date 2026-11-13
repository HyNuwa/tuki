# Defensibilidad: "capa de interoperabilidad cripto → pagos locales" frente a P2P.me, Yodl y la infraestructura existente

*Agente: positioning / defensibilidad | Fecha de investigación: 2026-11-11 | Modo: Live (WebSearch y WebFetch) más contexto previo (`competitors-report.md`, `battle-cards/yodl.md`, `battle-cards/p2p-me.md`, `raw/strategic-signals.md`, `positioning/raw/category-trends.md`, `positioning/raw/alternatives-customer.md`) | Profundidad: 4 rondas de búsqueda*

> **Propuesta del fundador (textual):** "posicionarnos como una capa de interoperabilidad cripto → pagos locales, confiable y multichain por diseño, comenzando por un corredor concreto."
> **Visión:** cualquier cripto en cualquier cadena → pago en moneda local donde exista una ruta de conversión. **MVP:** USDC en Base. **Arquitectura:** adaptadores para activos, cadenas, proveedores de swap y proveedores de payout local. **Expansión:** por corredores. **Diferencial principal:** confiabilidad, reembolsos y experiencia ante fallas.

---

## 1. Veredicto

**La frase, tal como está escrita, no es un posicionamiento defendible para un equipo en etapa de hackathon. Fortaleza: Needs Work. Confianza: Media-Alta** [Opinion].

1. **"Capa de interoperabilidad cripto → pagos locales" ya existe y tiene dueños con capital.** Yodl (SDK, router que convierte "any token from any chain", 10 países, revenue share de 70/30), Borderless.xyz (red de proveedores de payout con ruteo y failover, 260 corredores medidos), SQRIL (switch QR de stablecoins con inversión de Tether, 11+ países), WalletConnect Pay, Circle CPN y Bridge/Stripe trabajan sobre esa misma idea en distintas capas [Data, fuentes en §3]. Presentarse con esa etiqueta es un **category-of-one aspiracional**, y un jurado técnico va a preguntar "¿en qué se diferencia de Yodl o de Borderless?" [Opinion].
2. **"Multichain por diseño" ya es un requisito mínimo, no un diferencial.** El router de Yodl ya convierte cualquier ERC-20 dentro del pago, y LI.FI (US$51,7M levantados, más de 800 integradores) vende esa misma función como commodity con un fee de 0,25% [Data]. Por eso conviene presentarlo como una decisión de arquitectura, no como algo que se promete al cliente.
3. **"Confiable" es el único elemento con espacio libre, pero hoy es una promesa sin pruebas y es copiable.** Ninguna app de consumo para QR argentino publica SLA ni failover (`competitors-report.md`, 2026-11-11) [Data]. Pero Yodl ya dice "Refunds are built in… timeouts are handled for you" (yodl.me/sdk, consultado el 2026-11-11) [Data], y Borderless ya vende el failover entre proveedores en B2B [Data]. La confiabilidad sirve como cuña. No es un foso.
4. **"Comenzando por un corredor concreto" es la parte más sólida de la propuesta.** Los orquestadores fiat que ganaron (Juspay en India, Yuno en LatAm) empezaron resolviendo un problema de éxito de cobro en un mercado fragmentado. No empezaron por la cobertura global [Opinion, basado en §5].

**Recomendación (detalle en §8):** reducir el posicionamiento a la **capa de ruteo y garantía de liquidación entre wallets y proveedores licenciados, en el corredor USDC (Base) → QR argentino interoperable (Transferencias 3.0)**. En la hackathon se demuestra con un frontend de consumo propio, y se vende primero como motor B2B2C a 1–2 wallets o mini-apps. Una formulación sugerida: *"Pagos QR en Argentina desde cualquier wallet, con liquidación garantizada: cotización bloqueada, failover entre proveedores licenciados y reembolso automático."* La palabra "interoperabilidad" y el mapa global quedan para la slide de visión, no para el posicionamiento.
**Confianza en que esta versión acotada pueda generar un foso:** Baja-Media. El foso depende de datos (tasa de falla real de los proveedores, disposición a pagar) que hoy no tenemos [Opinion].

---

## 2. Qué dice cada parte de la frase y cómo resiste

| Fragmento | Qué afirma | ¿Quién ya lo ofrece? | ¿Defendible? |
|---|---|---|---|
| "Capa de interoperabilidad" | Somos infraestructura entre cripto y rieles locales | Yodl, Borderless.xyz, SQRIL, WalletConnect Pay, Circle CPN, Bridge | **No.** Es una categoría ocupada y, en nuestra boca, aspiracional (no hay SDK ni integradores) [Data/Opinion] |
| "cripto → pagos locales" | Cualquier activo → pago fiat local | Yodl Router ("swaps any token from any chain into what the local provider needs, inside the payment") [Data] | **No** como diferencial |
| "confiable" | Garantía, reembolsos, manejo de fallas | Yodl lo afirma sin detallar mecánica ni SLA; Borderless ofrece failover B2B; nadie lo ofrece medible en QR AR de consumo [Data] | **Sí como cuña**, no como foso: es copiable si no hay datos operativos ni contratos detrás [Opinion] |
| "multichain por diseño" | Arquitectura de adaptadores | LI.FI, Squid, Across, Yodl Router [Data/Assumption para Squid y Across, no investigados en esta ronda] | **No**: es table stake. Es una buena decisión técnica y un mal mensaje |
| "comenzando por un corredor concreto" | Profundidad antes que amplitud | — | **Sí**: es el patrón de los orquestadores que ganaron [Opinion] |

**Contradicción con la evidencia de clientes:** en `alternatives-customer.md` (2026-11-11) ningún usuario pide "pagar desde mi wallet", "failover" ni "interoperabilidad". El dolor documentado es la falla del pago y el miedo a perder fondos [Data]. La frase del fundador usa el lenguaje del constructor, no el del comprador [Opinion].

---

## 3. Mapa del stack por capas (al 2026-11-11)

| Capa | Qué resuelve | Quién juega hoy | Notas para nosotros |
|---|---|---|---|
| **1. Wallet / app de UX** | Experiencia del usuario final | Bitget Wallet (QR AR desde may-2026), Binance Pay, Bybit Pay (vía Manteca), KuCoin Pay, MiniPay, Peanut, Moreta, CacaoCash, WanderWallet, app de Yodl, app de P2P.me [Data, `strategic-signals.md`] | Es la capa más saturada y la que el fundador quiere evitar ("otra wallet para turistas"). Las wallets grandes absorben la función país por país [Data/Opinion] |
| **2. Checkout / SDK para wallets** | Que una wallet existente pague QR | **Yodl SDK** (any EIP-1193, 10 países, fee del integrador de 0,10–1,0% con 70% para él, headless "on the roadmap") [Data, yodl.me/sdk, 2026-11-11]; **P2P.me SDK** (`@p2pdotme/sdk` v1.3.10, publicado hace ~16 días; módulos de órdenes, precios, fraude, ZK-KYC y **parsers QR para UPI, QRIS, PIX, MercadoPago y Pago Móvil**, más `@p2pdotme/widgets` con componentes de checkout y cashout; acceso con API key en developers.p2p.me) [Data, pkgstats/npm y mintlify, 2026-11-11]; **WalletConnect Pay** (compatibiliza wallets con flujos de PSP existentes; no encontramos evidencia de liquidación en ARS) [Data/Data gap]; SQRIL (switch QR, "crypto apps") [Data] | **Es la capa más disputada en infraestructura.** Yodl y P2P.me ya tienen SDK con soporte argentino. Entrar acá de frente es competir en su terreno |
| **3. Ruteo / agregación entre proveedores de swap y payout** | Elegir proveedor por transacción, failover, mejor precio | **Swap:** LI.FI (US$51,7M levantados, US$8B de volumen mensual en oct-2025, fee de 0,25% más el del integrador) [Data]; Squid y Across [Assumption, no verificado acá]. **Payout:** **Borderless.xyz** (pre-seed de US$3,3M, oct-2024; red de proveedores como alfred, Cobre, Koywe y Trace; "multi-provider routing with failover"; benchmark Q2-2026 con 260 corredores) [Data]; **Dfns Payouts** (mar-2026, "providers who compete for each transaction") [Data]; BlindPay (ARS vía Transferencias 3.0 a CBU/CVU) [Data, vendor]; Onramper (agregador, fuerte en onramp) [Data]; Yodl Router, que es interno [Data] | **Ya existe un agregador con failover, pero en B2B (remesas y tesorería), no para QR de comercio en Argentina** [Data/Opinion]. No sabemos si Borderless liquida QR argentino [Data gap] |
| **4. Acceso al riel local / PSP licenciado** | Pagar el QR o la transferencia en ARS y cumplir con la regulación | **Manteca** (API-first, rieles QR, rampas, cuentas virtuales, FX, compliance; potencia a Bybit Pay en AR, BR y BO) [Data]; Ripio, Settle Network (Stellar), PVS (Alipay+ → Transferencias 3.0, jul-2026) [Data]; Fiserv/Clover en el lado adquirente [Data]; BlindPay [Data, vendor]; **Circle CPN**: Argentina figuraba como mercado objetivo para 2025, pero **no encontramos un corredor ARS confirmado** al 2026-11-11 [Data gap]; **Bridge/Stripe**: cuentas en stablecoins y tarjetas Visa en AR, sin payout en ARS verificado [Data gap] | **Acá está el poder de negociación.** El PSP es un proveedor que también vende directo a wallets (Manteca–Bybit). En un futuro podríamos ser su cliente o competir con él [Opinion] |
| **5. Liquidez** | ARS disponible, FX y float para reembolsos | Los PSPs (Manteca, Ripio), los LPs P2P de P2P.me, desks OTC y, en Brasil, Trace o Avenia [Data] | Capital intensivo. Una garantía de cotización y de reembolso exige float propio o un acuerdo con el PSP [Estimate/Opinion] |

**Brasil / Pix como próximo corredor** [Data, 2026-11-11]: Avenia ofrece una API única para Pix y stablecoins (incluye "Pix without a Brazilian entity" para una fintech argentina), 4Pay está en el directorio de Circle, y Trace Finance provee liquidez BRL a Borderless. La Resolución BCB 561 prohíbe a proveedores eFX liquidar remesas cross-border con stablecoins desde el 1-oct-2026, según una fuente secundaria. Hay que verificarla antes de planificar Brasil [Data, confianza Baja].

---

## 4. ¿Existe ya un "agregador de proveedores de pago local con garantías de confiabilidad"?

**Sí en B2B, no en QR de consumo en Argentina** [Data/Opinion].

- **Borderless.xyz** es el análogo más directo: "a Visa for stablecoin-enabled FIs", con ruteo multiproveedor y failover. En su benchmark del Q2-2026 (publicado el 14-jul-2026), 82 corredores tenían al menos dos proveedores estables, y en USDT→BRL el proveedor más barato cambió 34 veces en 88 días. Calcula un "Routing Tax" de 23,3 bps, unos US$2.330 por millón, por usar el proveedor mediano en vez del mejor ([crypto.news](https://crypto.news/why-stablecoin-routing-now-matters-more-than-fx-spreads/)) [Data, cifra propia de Borderless, no auditada]. **No publica métricas de uptime ni de failover** [Data].
- **Dfns Payouts** (mar-2026) hace orquestación de payouts multiproveedor para instituciones [Data].
- **Yodl Router** agrega swap más PSP local con reembolso "built in". No está claro si hace failover entre PSPs dentro de un país [Data gap].
- **SQRIL** es un switch QR entre stablecoins y rieles nacionales (con inversión de Tether, monto no revelado). En 2026 sumó Asia, África y Asia Central, y amplió a bancos y neobancos en sep-2026 [Data, press releases propios].

**Hueco real** [Opinion]: nadie ofrece hoy, de forma medible y pública, **la garantía de que un QR argentino pagado con USDC se liquida al monto cotizado, o se reembolsa automáticamente dentro de un plazo**, con más de un proveedor licenciado detrás. Es un hueco **angosto**: es una función que Yodl, Borderless o un PSP como Manteca pueden agregar sin cambiar su modelo.

---

## 5. Análogos fiat: la orquestación de pagos

### Cómo ganaron
- **Juspay (India):** su producto central es un SDK de checkout y orquestación para grandes comercios, en un mercado de rieles fragmentados (UPI, wallets, netbanking) con tasas de éxito variables. Dice tener más de 500 empresas clientes y reporta mejoras de autorización de 2–15% [Data, vendor]. Levantó US$60M en abr-2025 liderados por Kedaara (unicornio) y una ronda adicional de US$50M de WestBridge a una valuación de US$1,2B (la fecha varía según la fuente: 2025 o ene-2026) [Data, Tier 2, cifras discrepantes].
- **Yuno (LatAm):** Global PayTech Ventures lideró una Serie B de US$45M (ago-2026), según una sola fuente secundaria [Data, confianza Baja]. Sus casos son inDrive (10 países en 8 meses, 90% de aprobación) y Reserva (+4 pp de aprobación). Reporta un uplift promedio de 8% con smart routing [Data, vendor].
- **Primer:** Serie C de US$100M (may-2026; Sofina y Peak XV), con pivote a "unified payment infrastructure" y agentes de IA [Data, Tier 2].
- **Spreedly:** su foso es el **vault de tarjetas**, porque los tokens quedan en Spreedly y migrarlos es costoso [Data/Opinion]. **Gr4vy:** infraestructura single-tenant [Data].

### Qué se volvió commodity
- La cantidad de conectores (1.000+ métodos en Yuno, 400+ en Gr4vy) "dejó de diferenciar" hacia 2024, y Datos Insights advierte que será cada vez más difícil diferenciarse [Data, Tier 2–3, ago-2026].
- Un estudio de PYMNTS y Spreedly describe una "capability trap": acumular funciones de orquestación sin mejorar la tasa de aprobación [Data, coautor vendor].
- La orquestación "compite en confiabilidad y precio solamente", lo que empuja a los orquestadores a reposicionarse como "payment intelligence" [Data, The Paypers].

### ¿El modelo se traslada a cripto → local?
| Fuente de foso en fiat | ¿Existe en cripto → QR AR? | Comentario |
|---|---|---|
| **Vault / tokens** (Spreedly) | **No** | En el modelo no custodial no hay credenciales que retener. El costo de cambio es casi nulo en ambas direcciones (`competitors-report.md`) [Opinion] |
| **Integración profunda en el checkout del comercio** | Parcial | Acá el "comercio" es la **wallet** que integra el SDK. Yodl ya compite por ese lugar con un 70% de revenue share [Data] |
| **Datos de ruteo entre muchos procesadores** | Débil al inicio | En Argentina hay pocos proveedores con QR interoperable (Manteca, Ripio, Settle, PVS y BlindPay, a confirmar) [Data/Assumption]. Para que el ruteo valga hacen falta al menos dos proveedores contratados y volumen |
| **Uplift medible de la tasa de éxito** | **Sí, es la parte que se traslada** | Es exactamente el argumento de Juspay en un mercado fragmentado. Requiere medir la tasa de falla base de los proveedores, que hoy desconocemos [Data gap] |
| **Neutralidad frente a los procesadores** | Sí | El PSP que vende directo (Manteca–Bybit) no es neutral; un orquestador sí. Ese argumento solo pesa si hay más de dos proveedores reales [Opinion] |

**Conclusión** [Opinion]: lo que se traslada es la parte "orquestación = más pagos completados". Lo que no se traslada son los costos de cambio, porque cripto no tiene vault. Por eso un orquestador cripto → local se defiende con **contratos y datos operativos**, no con lock-in técnico. Además, los orquestadores fiat ganaron con capital (US$45–170M) y ventas enterprise, que es lo opuesto a un equipo de hackathon.

---

## 6. Evaluación de fosos

| Foso | Quién lo tiene hoy | ¿Accesible para nosotros? | Tiempo estimado | Durabilidad |
|---|---|---|---|---|
| **Datos de ruteo multiproveedor** (tasas de falla, latencia, spread por proveedor y hora) | Borderless (multipaís B2B), Yodl (interno) | Sí, pero solo con volumen real y ≥2 PSPs contratados | 6–12 meses después de lanzar [Estimate] | Media. En un solo corredor el dato vale menos que en 260 |
| **SLA de confiabilidad publicado** (tasa de éxito, plazo de reembolso) | Nadie en QR AR de consumo [Data] | Sí. Es la cuña más barata | Demo en la hackathon con mocks; real en 3–6 meses [Estimate] | **Baja**: copiable apenas un competidor decida publicar el suyo |
| **Distribución vía wallets integradas** | Yodl (en curso), P2P.me (SDK y widgets) | Difícil: hace falta convencer a una wallet que ya puede integrar Yodl | 6–18 meses [Estimate] | Alta si se logra, pero es la carrera que Yodl tiene adelantada |
| **Licencias** (PSAV/CNV, PSP) | Manteca, Ripio y otros PSPs | No en etapa de hackathon. Al 9/2026 el registro PSAV de la CNV figuraba con 0 entidades registradas según BlindPay [Data, vendor, confianza Baja] | Años [Estimate] | Alta, pero no es nuestra |
| **Liquidez del corredor / float para garantía** | PSPs, LPs de P2P.me | No sin capital. La garantía de cotización exige asumir el riesgo FX o trasladarlo al PSP | — | Alta, pero no es nuestra |
| **Contratos con ≥2 PSPs argentinos + garantía firmada** | Nadie conocido en QR de consumo | Es el **único foso plausible** en 6–12 meses | 3–9 meses [Estimate] | Media: requiere relación comercial y volumen para que los PSPs prioricen |

**Costos de cambio** [Opinion]: para el usuario final son casi nulos. Para una wallet integradora son moderados: dejar un SDK implica reintegrar y migrar UX. Esa es la única capa donde el costo de cambio aparece, y es la que Yodl ya está ocupando.

---

## 7. ¿Qué impide a Yodl o P2P.me agregar lo mismo?

**Yodl: casi nada técnico** [Opinion]:
- Ya tiene el router, refunds "built in", timeouts manejados, 31 releases del SDK de RN en 5 meses y un modo headless en el roadmap [Data].
- Sus límites son de **prioridad y cobertura**: Argentina es 1 de 10 países, hoy solo cubre el QR de Mercado Pago, pide KYC en Argentina y no publica spread ni SLA [Data, `battle-cards/yodl.md`].
- **Si Yodl suma Transferencias 3.0 (p. ej. vía Manteca o PVS), publica un SLA y lanza el modo headless, nuestra cuña en Argentina desaparece** [Opinion]. No sabemos qué tan rápido puede reaccionar porque su equipo y su financiamiento son DATA GAP.

**P2P.me: limitado por su modelo** [Opinion]:
- Ya tiene SDK, widgets de checkout y cashout y un parser de QR de MercadoPago [Data, npm 2026-11-11]. Es decir, **sí ofrece API y SDK para integradores**, lo que corrige la duda del brief.
- Su liquidación depende de proveedores de liquidez humanos (lento, con límites de ~US$100 por orden, y el comercio recibe una transferencia de un particular) [Data, `battle-cards/p2p-me.md`]. Ofrecer "garantía de liquidación formal" contradice su arquitectura. Puede ofrecer escrow y reembolso on-chain, pero no la formalidad de un PSP.
- Riesgo: su precio es el mejor observado (+0,3%) y su SDK es MIT. Una wallet que priorice el precio lo va a preferir [Data/Estimate].

**PSPs (Manteca, etc.): el riesgo más subestimado** [Opinion]. Manteca ya vende a wallets (Bybit) "QR payment rails… FX… compliance through one integration" [Data]. Una wallet puede integrar Manteca directamente, sin nosotros. Nuestro valor por encima del PSP solo existe si hay **más de un PSP** y una **garantía** que ningún PSP individual da.

---

## 8. Opciones de capa y cuña

| Opción | Capa | Cuña | Competencia directa | Viabilidad en la hackathon | Defensibilidad a 12 meses | Veredicto |
|---|---|---|---|---|---|---|
| A. "Capa de interoperabilidad global multichain" (frase original) | 2–3, global | Visión | Yodl, Borderless, SQRIL, WC Pay, LI.FI | Baja: no se puede demostrar | Muy baja | **Descartar como posicionamiento**; sirve como slide de visión |
| B. App de consumo para extranjeros | 1 | Sin depósito + garantía | Peanut, Moreta, Bitget, Yodl app, CacaoCash | Alta | Muy baja (y el fundador no la quiere) | Útil solo como demo frontend |
| C. SDK de checkout para wallets (clon de Yodl con mejor AR) | 2 | Cobertura de Transferencias 3.0 | Yodl, P2P.me SDK | Media | Baja: Yodl cierra la brecha agregando un PSP | No como frente principal |
| **D. Motor de ruteo y garantía de liquidación para el corredor USDC → QR AR, B2B2C** | **3 (sobre PSPs de la capa 4)** | **Cotización bloqueada + failover entre ≥2 PSPs + reembolso automático con plazo + estado visible; cobertura de Transferencias 3.0** | Borderless (B2B, no QR), Yodl Router (interno) | **Alta** con mocks (máquina de estados quoted→signed→onchain→fiat_settled/refunded y dos adaptadores) | **Media-Baja**: depende de contratos con PSPs y datos operativos | **Recomendada** |
| E. Proveedor de liquidez / PSP propio | 4–5 | Mejor spread | Manteca, Ripio, P2P.me | Nula | Alta, pero inalcanzable | Descartar |

### Recomendación concreta [Opinion]
- **Capa:** ruteo y garantía (capa 3), apoyada en PSPs licenciados de terceros (capa 4). No construir wallet ni licencia.
- **Cuña:** "liquidación garantizada" en **un** corredor (USDC en Base → QR interoperable argentino), con estas promesas medibles: cotización all-in bloqueada por N segundos, monto exacto al comercio o reembolso automático en T minutos, failover a un segundo proveedor y estado visible.
- **Demo:** frontend de consumo propio (mini-app de Base App o web conectada por WalletConnect) **como cliente de referencia del motor**, no como producto final. Mostrar en vivo un proveedor que falla, el failover y un reembolso automático.
- **Primer comprador real después de la hackathon:** 1–2 wallets o mini-apps de Base que hoy no tienen QR argentino, ofrecidas con revenue share competitivo frente al 70% de Yodl. Antes hay que validar que la garantía cambia su decisión [Assumption].
- **Qué decir y qué no:** decir "motor de liquidación garantizada para pagos QR en Argentina, diseñado por adaptadores para sumar corredores". No decir "capa de interoperabilidad global" ni "multichain" como titular.
- **Coherencia con la arquitectura del fundador:** la arquitectura de adaptadores (activos, cadenas, swap, payout) es correcta y sirve como **evidencia de escalabilidad para jurados e inversores** [Opinion]. El error está en usarla como posicionamiento.

### Pruebas que harían cambiar el veredicto
- **A favor:** que Manteca, Ripio o Settle confirmen tasas de falla o rechazo materiales (p. ej. >2–3%, límites ocultos) y que dos wallets digan que integrarían por la garantía.
- **En contra:** que Yodl lance el modo headless con Transferencias 3.0, o que una wallet de Base anuncie integración con Yodl o Manteca.

---

## 9. Vacíos de datos

| Gap | Por qué importa | Cómo cerrarlo |
|---|---|---|
| **Tasa de falla real de los PSPs argentinos** (Manteca, Ripio, Settle, PVS) | Sin una falla base material, el failover no tiene valor comercial | Pedir métricas a los PSPs; probar pagos reales post-hackathon; minar quejas de Bybit Pay AR |
| Términos de la API de Manteca (pricing, mínimos, KYC a no residentes) | Define nuestro costo y si podemos ser una capa encima | docs.manteca.dev y contacto comercial |
| Si Yodl hace failover entre PSPs y qué PSP usa en Argentina | Define cuánto de nuestra cuña ya existe | Preguntar en su Discord; analizar las transacciones on-chain del Router |
| Si Borderless, WalletConnect Pay o Circle CPN liquidan QR o Transferencias 3.0 en ARS | Podrían ser proveedores o competidores directos | Docs por país; contacto comercial |
| Si Onramper, Ramp Network, Squid y Across tienen offramp ARS | No se investigaron en esta ronda | Una búsqueda dirigida por proveedor |
| Equipo y financiamiento de Yodl; detalle de rondas de SQRIL | Capacidad de reacción | LinkedIn, Crunchbase |
| Estado regulatorio del "referidor" (CNV RG 1172/2026) y del registro PSAV | Define si una capa que cobra fee necesita registrarse | Asesoría legal; texto oficial de la CNV |
| Disposición a pagar de wallets por una garantía | Es el supuesto central del modelo B2B2C | 5–10 entrevistas a wallets o mini-apps de Base |

---

## Flags

### Red Flags
- **Posicionamiento aspiracional:** "capa de interoperabilidad multichain" describe una infraestructura que hoy no existe (sin SDK, integradores ni PSP contratado) frente a jugadores que sí la tienen (Yodl, Borderless, SQRIL). Viola la regla de no posicionar sobre el roadmap [Data/Opinion].
- **Yodl puede cerrar la cuña sin cambiar de modelo:** ya tiene router, reembolsos "built in" y un SDK que itera semanalmente. Agregar Transferencias 3.0 y un SLA es una decisión de prioridad, no de arquitectura [Data/Opinion].
- **Dependencia del PSP:** el PSP (p. ej. Manteca) vende directamente a wallets. Si solo integramos un PSP, nuestra capa no agrega nada que la wallet no pueda conseguir yendo directo [Data/Opinion].

### Yellow Flags
- **La garantía requiere capital o contratos:** bloquear la cotización y reembolsar con plazo implica riesgo FX y float, que deben salir de nuestro balance o estar firmados con el PSP [Estimate/Opinion].
- **Valor del ruteo en un solo corredor:** con 2–4 proveedores, los "datos de ruteo" son un foso débil frente a Borderless, que mide 260 corredores [Data/Opinion].
- **Lenguaje del cliente:** nadie pide "interoperabilidad" ni "failover". El titular tiene que hablar del resultado ("tu pago llega o te devolvemos el dinero") [Data].
- **Varias cifras clave son de vendors o de una sola fuente:** la Serie B de Yuno, el "Routing Tax" de Borderless, los uplifts de Juspay y Yuno y la cobertura de SQRIL [Data].

---

## Fuentes (consultadas el 2026-11-11 salvo indicación)
- Yodl SDK: https://yodl.me/sdk/
- P2P.me SDK: https://www.pkgstats.com/pkg:@p2pdotme/sdk · https://www.pkgstats.com/pkg:@p2pdotme/widgets · https://www.mintlify.com/p2pdotme/docs/introduction · https://www.mintlify.com/p2pdotme/docs/whitepaper/accessing-protocol
- Manteca / Bybit: https://www.bybit.com/en/press/post/bybit-partners-with-manteca-to-scale-its-offering-in-argentina-and-brazil-blt40e86c4958295216 (18-jul-2025) · https://www.bybit.com/en/learn/bybit-pay/bybit-pay-argentina-qr-pix-qr · https://partners.circle.com/partner/manteca · https://thegrid.id/profiles/manteca · https://yellow.com/fr/press-releases/bybit-pay-propose-des-paiements-crypto-quotidiens-par-qr-code-en-bolivie-avec-yape (mar-2026)
- Borderless.xyz: https://crypto.news/why-stablecoin-routing-now-matters-more-than-fx-spreads/ (14-jul-2026) · https://www.theblock.co/post/322450/amity-ventures-leads-3-million-pre-seed-round-for-borderless-xyz (23-oct-2024) · https://solanacompass.com/projects/borderless · https://www.metatrader.com/it/news/1546062-cobre-is-now-live-on-the-borderlessxyz-network-expanding · https://thepaypers.com/crypto-web3-and-cbdc/news/borderlessxyz-integrates-trace-finance-for-better-payments
- Dfns Payouts: https://briefglance.com/articles/dfns-launches-payouts-api-to-reshape-institutional-crypto-fiat-off-ramps
- BlindPay: https://blindpay.com/resources/more/usdc-to-ars-routes-2026 (1-sep-2026, actualizado 6-nov-2026) · https://blindpay.com/resources/more/usdc-to-brl-routes-2026
- Circle CPN: https://www.circle.com/blog/cpn-momentum-and-upcoming-roadmap · https://www.circle.com/blog/circle-payments-network-expands-local-currency-payout-corridors-across-asia-the-middle-east-europe-and-the-us · https://theblock.co/post/402726/circle-partners-with-nium-to-connect-usdc-settlement-to-global-payout-rails · https://www.dlocal.com/press-releases/dlocal-joins-circle-payments-network-to-power-stablecoin-payouts-across-emerging-markets/
- WalletConnect Pay: https://walletconnect.com/blog/qr-payments-are-not-new-crypto-payments-aren-t-either
- Alipay+/PVS: https://thepaypers.com/payments/news/alipay-connects-to-argentinas-national-qr-payment-scheme (jul-2026) · KuCoin Pay: https://mercado.com.ar/negocios/kucoin-pay-amplia-pagos-con-qr-en-argentina-y-peru
- Bridge/Stripe: https://stripe.com/en-br/newsroom/news/deel-and-stripe · https://digitalmoneybox.com/news/cryptocurrency/stripe-rolls-out-stablecoin-accounts-in-over-100-countries · https://blockworks.co/news/visa-bridge-card-stablecoin-adoption-latin-america
- SQRIL: https://www.pymnts.com/newswire-announcements/sqril-supports-stablecoins-such-as-tethers-usdt-for-its-scan-to-pay-qr-switch-in-emerging-markets · https://tradeinformer.com/payments/sqril-expands-stablecoin-qr-payment-network-into-central-asia · https://www.pymnts.com/newswire-announcements/tether-backs-startup-sqril-the-scan-to-pay-qr-code-payment-switch-for-asia-africa-latin-america/
- Brasil/Pix: https://avenia.io/ · https://partners.circle.com/partner/4pay-finance · https://tracefinance.com · https://thedigitalbanker.com/brazils-pix-goes-global-while-crypto-faces-tighter-controls/
- LI.FI: https://www.theblock.co/news/deals/2025-12-11-multicoin-joins-as-lead-investor-in-li-fis-29-million-series-a-extension-round-382242 · https://fortune.com/2025/12/11/exclusive-crypto-startup-li-fi-raises-29-million/
- Orquestación: https://pulse2.com/primer-100-million-series-c-raised-to-accelerate-ai-payments-platform-and-us-expansion/amp/ · https://ai2.work/blog/yuno-s-45m-series-b-bets-big-on-ai-native-payment-orchestration · https://y.uno/post/we-analyzed-50-payment-orchestration-deployments-heres-the-real-roi · https://juspay.io/payment-orchestration · https://yourstory.com/2025/01/juspay-softbank-kedaara-capital-warburg-pincus-unicorn-funding · https://entrackr.com/news/juspay-raises-50-mn-from-westbridge-capital-at-12-bn-valuation-11023645 · https://www.digitaltransactions.net/payment-orchestration-platforms-now-must-figure-ways-to-set-themselves-apart-a-report-warns/ · https://thepaypers.com/payments/expert-views/from-connectivity-to-intelligence-where-payment-orchestration-competes-now · https://www.pymnts.com/news/payments-innovation/2026/the-smartest-payment-stack-may-be-the-simplest-one/ · https://techcrunch.com/?p=2257452
- Contexto interno: `../competitors-report.md`, `../battle-cards/yodl.md`, `../battle-cards/p2p-me.md`, `../battle-cards/peanut.md`, `../raw/strategic-signals.md`, `raw/category-trends.md`, `raw/alternatives-customer.md`
