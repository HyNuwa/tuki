# Tuki: síntesis estratégica de la red cripto → pagos locales

**Fecha y consulta de fuentes:** 2026-11-12. **Estado:** investigación y propuestas para validar; no decisión de arquitectura ni aprobación de producción.
**Dirección vigente:** instrucciones del fundador (2026-11-12, investigación interna no versionada), por encima del intake anterior. Sin commit, despliegues, contacto con proveedores ni movimientos de fondos en esta investigación.

## Conclusión ejecutiva

**La red es una hipótesis comercial razonable, pero RFQ no es una categoría propia ni una ventaja competitiva demostrada.** Paycrest documenta proveedores independientes, escrow y ruteo; Circle Payments Network agrega cotizaciones institucionales; Yodl documenta varios procesadores, selección por costo total y pagos desde la wallet existente. La combinación general ya tiene comparables cercanos. ([Paycrest: arquitectura](https://docs.paycrest.io/concepts/architecture), [CPN: cotizaciones y flujo](https://developers.circle.com/cpn/fiat-payouts), [Yodl: precios](https://docs.yodl.me/pricing), [Yodl: SDK](https://docs.yodl.me/))

La oportunidad a investigar no es «inventamos que varios proveedores compitan», sino **si podemos ofrecer a una wallet una ejecución local materialmente mejor y condiciones de fallo más claras que integrar Yodl o un proveedor directamente**. La recuperación verificable podría contribuir, pero hoy es diseño pendiente, no un resultado propio.

Recomendación: continuar con validación comercial y de condiciones de participación, no invertir todavía en desarrollar una red de producción. Mantener la demo como demostración simulada. No adoptar «liquidación garantizada» y no definir el producto como una wallet para turistas argentinos.

## Cómo interpretar la evidencia

| Marca | Qué demuestra | Qué no demuestra |
|---|---|---|
| **D — documentación técnica** | La fuente oficial describe una capacidad o un flujo concreto | Que lo probamos, que funcione para todo usuario o que tenga un SLA efectivo |
| **A — afirmación del proveedor** | El proveedor publica una promesa comercial o sus términos | Auditoría independiente, volumen real, calidad operativa o cobertura exhaustiva |
| **C — código inspeccionado** | El archivo público contiene la condición indicada | Correspondencia con un despliegue, auditoría o comportamiento de todo el sistema |
| **H — hipótesis / diseño** | Un objetivo de Tuki, una inferencia o un supuesto de cálculo explícito | Capacidad existente, compromiso de un tercero o requisito ya aprobado |
| **SD — sin dato suficiente** | No se obtuvo prueba adecuada en esta pasada | Que la capacidad no exista |

Las fuentes web se consultaron en la fecha de cabecera; salvo fecha explícita, no publican fecha de actualización. Son fotografías documentales, no pruebas operativas. Los tres informes de categoría y de economía (investigación interna no versionada) y de [usuario](research/b2c-beneficio-vs-alternativas.md) se conservan como antecedentes; esta síntesis no hereda automáticamente sus etiquetas de «verificado».

Tuki no tiene código de producto ni proveedores reales confirmados según la dirección vigente. La demo prevista usa dos proveedores y un PSP simulados. [ADR 0001](adr/0001-escrow-y-autorizaciones.md) y [ADR 0002](adr/0002-verificacion-fiat.md) siguen como propuestas pendientes. **Una demo exitosa no valida disposición de proveedores, precio real ni acreditación bancaria.**

## Correcciones importantes a los antecedentes

| Afirmación anterior | Tratamiento en esta síntesis |
|---|---|
| «La tarjeta compra 10,5% menos pesos» y la brecha creció en 2026 | No se reutiliza como dato comercial: no se reconstruyó una comparación ejecutable, contemporánea y con todos los cargos. Las capturas anteriores mezclan horas, fechas y tasas de venta de cripto con pagos QR. No se afirma que sea falso; queda sin validar |
| Tasas minoristas de venta de USDC ≈ margen del PSP y precio QR | No son equivalentes. Faltan cotizaciones B2B de pago, reposición, mínimos, costos del rail y riesgo. No se deduce un take «realista» de esa captura |
| «Con margen de 1%, el fallo de prueba debe ser menor que 0,1%» | No existe ese umbral universal: la pérdida esperada es probabilidad × exposición. Una pérdida total en 0,1% de pagos consume 0,1% del volumen, es decir, 10% de un margen bruto de 1%, antes de otros costos |
| Yodl sería solo una wallet o no tendría varios procesadores argentinos | Sus docs listan Argentina con Transferencias/Mercado Pago y dos procesadores; la integración permite pagar desde la wallet existente. Son capacidades documentadas, no ensayadas aquí ([países](https://docs.yodl.me/supported-countries), [SDK](https://docs.yodl.me/)) |
| Yodl exige siempre KYC en Argentina | La documentación granular actual lista siete mercados, incluido Argentina, sin KYC inicial; sus términos permiten requisitos por proveedor. No prometer elegibilidad universal ni usar la afirmación anterior como diferenciador ([países](https://docs.yodl.me/supported-countries), [términos](https://yodl.me/terms-of-service)) |
| Binance QR podría estar disponible para cualquier turista verificado | Su FAQ limita esta función a personas residentes en Argentina con verificación de identidad. Actualización publicada: 2026-06-09; no generalizar a otros exchanges ([Binance: FAQ ARS](https://www.binance.com/en/support/faq/detail/9e3a768dc3ce47a0bce2488cfb31aab8)) |
| P2P.me tiene spread fijo y asignación por reputación, confirmado | No se usa como hecho: el espejo del whitepaper es autogenerado, su enlace al repositorio devolvió 404 y una nueva lectura devolvió 410. La mecánica actual de precio/asignación queda SD |
| CPN no soporta Base | No se reafirma: la página de redes consultada no entregó una lista utilizable. La lista pública de métodos sí muestra Argentina como WIRE en USD; eso no demuestra QR en ARS ([métodos](https://developers.circle.com/cpn/references/payments/supported-payment-methods)) |
| Más proveedores necesariamente produce un foso; con menos de tres no hay competencia | No demostrado. Dos ofertas independientes pueden competir; muchos proveedores registrados pueden no cotizar el mismo pago. Se debe medir concurrencia efectiva, correlación de fallos y mejora neta |
| Equilibrio = costo fijo / fee bruto | Solo vale si el fee ya es margen de contribución. Se corrige abajo descontando distribución y costos variables; los volúmenes resultantes siguen siendo escenarios, no pronósticos |

## Dónde podría existir valor comercial

### Comprador, oferta y usuario no son la misma persona

- **Comprador B2B propuesto:** wallet o aplicación con usuarios que ya poseen cripto y necesitan pagar localmente. Decide integrar por conversión de usuarios, costo operativo, cobertura, ingresos y responsabilidad ante fallos; no por la palabra RFQ.
- **Oferta necesaria:** proveedores capaces de cotizar, disponer de moneda local, ejecutar el rail y entregar evidencia bajo condiciones aceptadas. Un exchange que vende USDC no es automáticamente un proveedor de pagos QR. Acceso, elegibilidad y obligaciones no están confirmados.
- **Usuario B2C inicial propuesto:** persona con saldo en una wallet compatible que encuentra fricción para pagar QR o transferencias locales. Extranjeros de estadía larga pueden servir para investigar ese problema; no constituyen una estimación fiable del mercado total.
- **Comercio:** beneficiario del pago local. No se presupone una nueva integración comercial ni se propone una prueba de campo con comercios, conforme a la restricción del fundador.

### Beneficio frente a las alternativas

| Alternativa | Cuándo puede seguir siendo mejor | Beneficio de Tuki que habría que demostrar |
|---|---|---|
| Tarjeta | Ya disponible y aceptada, sin una nueva experiencia de cripto; costo depende de emisor, cambio y cargos | Acceso a un pago local que la tarjeta no resuelve, o menor costo final medido. No afirmar ahorro porcentual permanente |
| Efectivo | Ya en poder del usuario o con descuento del comercio; no exige conexión ni firma de wallet | Evitar retiro/cambio y gestión de efectivo. No suponer que QR recibe el mismo descuento que efectivo |
| Exchange con QR | El usuario ya tiene allí el saldo y cumple los requisitos; Binance documenta el flujo para residentes argentinos | Evitar traslado a un exchange para quien ya tiene fondos en su propia wallet. No venderlo como necesidad del usuario ya servido ([Binance](https://www.binance.com/en/support/faq/detail/9e3a768dc3ce47a0bce2488cfb31aab8)) |
| Apps cripto → pagos locales | Ya tienen acceso operativo, cobertura y usuarios; Yodl documenta precisamente wallet propia y precio por pago | Mejor resultado medido o condiciones de recuperación superiores, no simplemente «también pagamos QR» ([Yodl SDK](https://docs.yodl.me/), [precios](https://docs.yodl.me/pricing)) |

El beneficio inicial a contrastar es **pagar desde el saldo que ya se tiene, con costo total visible y requisitos conocidos antes de confirmar**. No es exclusivo: debe ganar por ejecución o por menor fricción para un segmento identificable. Si el saldo está en otra red o en un exchange, «sin cargar saldo» puede dejar de aplicar. Velocidad, aprobación y asistencia importan tanto como precio; aún no tenemos medidas propias.

### Arranque de oferta y demanda: propuesta, no operación aprobada

1. **Precisar un solo caso de pago inicial:** USDC en Base → un método QR/transferencia argentino explícitamente soportado. Evitar «todos los QR». Validar condiciones con posibles proveedores antes de pedirles construir un nodo.
2. **Investigar proveedores y distribución en paralelo, sin fingir liquidez existente:** una wallet candidata aporta escenarios y demanda potencial; dos proveedores candidatos permiten contrastar ofertas y restricciones. Todavía no hay acuerdos ni contactos realizados en esta investigación.
3. **Reducir el costo de entrada del proveedor:** proponer reutilizar su API y evidencia disponibles, conocer mínimos, prefondos, límites y responsabilidad. Esto no autoriza modificar las reglas del protocolo: si nadie acepta las actuales, es evidencia para volver al fundador.
4. **Comparar ofertas equivalentes sin mover fondos:** mismo importe local, beneficiario/tipo de rail, perfil elegible, tiempo y condiciones. Una tasa pública de venta de cripto sirve como referencia secundaria, no como cotización ejecutable de pago.
5. **No confundir subsidiar con validar:** una comisión exonerada o integración financiada puede facilitar el arranque, pero se registra separada del margen recurrente. No emitir un token ni vender prioridad al proveedor para maquillar falta de demanda.

El incentivo del proveedor sería **flujo incremental rentable**, menor costo comercial y un mecanismo previsible para cobrar; no «participar de una red» en abstracto. Debe descontar conversión/reposición, pago local, capital, conciliación y pérdidas. Si `q` es la probabilidad de pagar sin poder capturar y `L` la pérdida no recuperable, el costo esperado es `q × L`. La tolerancia a ese riesgo y a sus colas de pérdida requiere su aceptación explícita; no la determina esta investigación.

El incentivo de la wallet sería añadir utilidad/retención o ingresos sin operar cada integración. Debe compararlo con Yodl, Paycrest cuando corresponda y un contrato directo con un proveedor. El competidor también puede ser **no integrar nada** si la demanda es baja.

## Alcance internacional y efecto de red

**Unidad de mercado:** corredor y perfil elegible, no país ni blockchain por separado. Que una red liste Argentina, o soporte USDC en Base, no prueba que ejecute ese QR para ese usuario. CPN, por ejemplo, publica WIRE/USD para Argentina; Paycrest publica cuatro corredores africanos. ([CPN: métodos](https://developers.circle.com/cpn/references/payments/supported-payment-methods), [Paycrest: corredores](https://docs.paycrest.io/resources/supported-currencies))

Mantener la ambición multichain/multipaís sin cambiar el diseño. Base → Argentina es un punto de entrada para aprender. Una segunda expansión debería justificarse por demanda de un integrador, proveedores dispuestos y economía positiva, no por completar un mapa. La abstracción técnica no elimina nuevos riesgos, permisos, liquidez, verificación ni soporte por corredor.

**Hipótesis de efecto de red cruzado:** más demanda útil puede atraer oferta; oferta realmente solapada puede mejorar precio, disponibilidad o límites; eso puede atraer demanda. No es un hecho ya medido en Tuki. Un proveedor adicional que atiende otro corredor aporta cobertura, no competencia para el pago existente.

Las defensas potencialmente acumulables serían distribución integrada, datos propios de ejecución, integración reutilizable y confianza ganada resolviendo incidentes. Hoy no existen. El proveedor puede vender por varias vías y la wallet puede integrar varias redes; la no exclusividad es una posibilidad a validar, no un defecto que debamos impedir. Los datos solo serán un foso si mejoran resultados y no son fácilmente replicables. No se presupone un efecto global de «el ganador se lleva todo».

## Bloqueantes que la estrategia no cierra

El [modelo de seguridad](16-modelo-seguridad-liquidacion.md) y los ADR mantienen la autoridad sobre el diseño técnico. Esta tabla conserva riesgos; no cambia la arquitectura ni selecciona garantías.

| Bloqueante | Consecuencia comercial que debe conservarse |
|---|---|
| Solver comprometido que no paga ni libera | El pagador puede esperar hasta `authorizationExpiry`; restringir quién se compromete limita acceso, no demuestra ausencia de bloqueo |
| Solver que paga pero no prueba antes del vencimiento | Puede perder el USDC frente al `reclaim`. Alargar el plazo protege al proveedor, pero agrava la espera del pagador; no hay plazo aprobado |
| Vínculo verificable entre EIP-3009 e intención mostrada | Un nonce derivado del pago no garantiza que la wallet muestre un beneficiario e intención comprensibles. No prometer autorización informada extremo a extremo sin verificar ese vínculo |
| Congelamiento o pausa del emisor | Puede impedir transferencias y recuperación, incluido `reclaim`. Un vencimiento no elimina riesgo de USDC ni de la red |
| Reembolsos posteriores a captura | Necesitan fondos y reglas de responsabilidad/disputa. Ninguna de las alternativas de garantía del doc 16 fue elegida ni financiada |
| Confirmación fiat | La declaración firmada del PSP simulado identifica al declarante; no prueba independientemente la acreditación al comercio. No nombrarla «liquidación verificable» sin explicar qué verifica |

La formalización jurídica sigue diferida en esta etapa de investigación, no resuelta ni declarada innecesaria. La elegibilidad de cada actor y los permisos de operación quedan abiertos. Ningún resultado comercial habilita por sí solo fondos reales.

## 1. Propuestas de posicionamiento B2B y B2C

### B2B — categoría de compra propuesta

**Infraestructura de ejecución de pagos locales con cripto para wallets y aplicaciones.**

> Tuki propone conectar wallets y aplicaciones con proveedores independientes de pagos locales. La red buscaría comparar ofertas por cada pago y coordinar su ejecución con reglas explícitas de confirmación y recuperación.

**Versión técnica de apoyo:** red RFQ de payment solvers para cripto → moneda local. Explica el mecanismo a un interlocutor técnico; no reclama una categoría inventada ni una red operativa.

El comprador es la wallet/aplicación; los proveedores son el lado de oferta. La ventaja prometida a investigar es menor carga operativa y mejor ejecución que las alternativas, no «desintermediación» sin responsables. Hoy debe presentarse como propuesta en validación, con primer corredor Base → Argentina y sin SLA, cobertura global ni garantía de pago.

### B2C — propuesta para probar, no promesa vigente

> Paga en moneda local con las criptomonedas de tu wallet. Conoce el costo total antes de confirmar.

**Mensaje permitido hoy en investigación:** «Estamos diseñando esa experiencia y evaluando si mejora tus alternativas actuales». No usar RFQ, solver, intent o escrow en la pieza comercial. No agregar «siempre», «todos los QR», «sin KYC», «más barato» o «tu dinero nunca queda bloqueado».

Esta propuesta solo corresponde al usuario con saldo compatible y elegibilidad confirmada; no obliga a cambiarle de wallet. «Sin cargar saldo en otra app» puede probarse como beneficio secundario, pero Yodl ya lo documenta y no es una exclusividad de Tuki. ([Yodl: SDK](https://docs.yodl.me/))

## 2. Matriz competitiva basada en capacidades documentadas

**Lectura:** D/A/C verifican la existencia de esa evidencia, no una prueba nuestra de funcionamiento. H marca solo diseño de Tuki. SD nunca significa «no existe». No se comparan cifras comerciales de volumen porque no se validaron sus períodos, alcance ni metodología.

### Precio, ejecución y caso de uso

| Actor | Selección de proveedores/precio | Ejecución cripto → local | Evidencia de Argentina/QR |
|---|---|---|---|
| **Tuki [H]** | RFQ por pago y proveedores independientes propuestos; dos simulados en la demo prevista | Diseño de escrow, compromiso, declaración y captura; sin producto | Primer corredor propuesto USDC/Base → QR argentino; PSP simulado (dirección del fundador, 2026-11-12) |
| **Paycrest [D]** | Libro público y cola priorizada de hasta tres proveedores; no equivalente a una subasta RFQ por orden | Nodos independientes conectan PSP; escrow Gateway y agregador ([arquitectura](https://docs.paycrest.io/concepts/architecture), [tasas](https://docs.paycrest.io/api-reference/general/get-token-rate)) | Lista NGN, KES, UGX y TZS; incluye canales de comercio kenianos. No lista ARS; QR argentino no demostrado ([corredores](https://docs.paycrest.io/resources/supported-currencies)) |
| **Yodl [D/A]** | Docs comparan costo total de varios procesadores por pago; no demuestran RFQ abierto ni acceso de cualquier proveedor | SDK desde wallet propia, con procesador local ([SDK](https://docs.yodl.me/), [precios](https://docs.yodl.me/pricing)) | Docs listan Transferencias/Mercado Pago y dos procesadores en Argentina; no implica todo QR ni todo perfil ([países](https://docs.yodl.me/supported-countries)) |
| **P2P.me [A/SD]** | Publica red de liquidity partners; mecanismo actual de competencia de precios SD | Declara pagos QR con USDC y canales locales; no probado aquí ([producto](https://p2p.me/en)) | La web muestra Alias/ARS y la app lista Argentina. Alcance de QR interoperable y condiciones por usuario SD ([web](https://p2p.me/en), [app](https://app.p2p.me/)) |
| **Peer / ZKP2P [D]** | Makers depositan USDC y fijan tasas; comprador selecciona liquidez | Intercambio entre saldo offchain y tokens; no equiparar automáticamente con pagar un QR comercial de tercero ([makers](https://docs.peer.xyz/guides/for-sellers/provide-liquidity-sell-usdc)) | Pago de QR argentino bajo el flujo propuesto por Tuki: SD en las fuentes consultadas |
| **Circle CPN [D]** | Agrega cotizaciones de varios BFI; OFI selecciona y se fija FX | El BFI paga fiat después de confirmar el tramo onchain ([flujo](https://developers.circle.com/cpn/fiat-payouts)) | Tabla pública: WIRE en USD, no evidencia de QR en ARS; disponibilidad depende de ruta/configuración ([métodos](https://developers.circle.com/cpn/references/payments/supported-payment-methods)) |
| **UniswapX / intents [D]** | RFQ y fillers competitivos en swaps; no innovación exclusiva de Tuki | Flujo documentado de tokens. No aporta por sí mismo acreditación bancaria ni proveedor local ([RFQ](https://developers.uniswap.org/docs/liquidity/uniswapx/concepts/uniswaprfq)) | SD para QR fiat argentino; no se afirma imposibilidad futura |

### Confirmación, fallos y límites de la comparación

| Actor | Evidencia de ejecución / confianza | Recuperación y dependencia |
|---|---|---|
| **Tuki [H]** | Declaración EIP-712 del PSP simulado; no prueba de acreditación | `void`/`reclaim` diseñados para fondos no capturados; reembolso posterior exige financiación. Todo pendiente ([ADR 0001](adr/0001-escrow-y-autorizaciones.md), [ADR 0002](adr/0002-verificacion-fiat.md)) |
| **Paycrest [D/C]** | El proveedor confirma entrega y el agregador coordina settlement ([ciclo](https://docs.paycrest.io/concepts/transaction-lifecycle)) | Docs describen devolución automática; la cola agotada no significa devolución inmediata. En el `Gateway.sol` inspeccionado, `refund` es `onlyAggregator`; no se verificó el despliegue ni se auditó toda vía de recuperación ([tasas](https://docs.paycrest.io/api-reference/general/get-token-rate), [código](https://raw.githubusercontent.com/paycrest/contracts/main/contracts/Gateway.sol)) |
| **Yodl [A]** | Términos identifican proveedores AEON, Holdstation y Manteca; la contraparte de payout es el proveedor | Marketing ofrece devoluciones integradas; términos §5d no aseguran si, cuándo ni cuánto vuelve y remiten el reclamo al proveedor. Diferencia documental relevante, no garantía de que Tuki sea mejor ([SDK](https://yodl.me/sdk/), [términos](https://yodl.me/terms-of-service)) |
| **P2P.me [A/SD]** | Red de partners y verificación privada según proveedor; prueba actual de acreditación para el corredor objetivo SD | Publica cobertura por determinados congelamientos bancarios, sujeta a revisión de soporte. No equivale a una recuperación autónoma ni a cobertura de congelamiento del emisor USDC ([FAQ](https://p2p.me/en)) |
| **Peer / ZKP2P [D]** | V3 documenta verificación en AWS Nitro y atestación EIP-712 vinculada al intent; no es simplemente una declaración de nuestro PSP | Escrow y políticas de disputa documentados; no se auditó exhaustivamente recuperación ni equivalencia con comercio argentino ([protocolo](https://docs.peer.xyz/protocol/zkp2p-protocol)) |
| **Circle CPN [D/A]** | Notificación del BFI sobre inicio/completitud del fiat; reglas institucionales | La guía describe devoluciones como transacciones nuevas acordadas, no chargebacks automáticos. Guía publicada 2025-11-07, no sustituye contrato de participante ([flujo](https://developers.circle.com/cpn/fiat-payouts), [guía](https://www.circle.com/blog/circle-payments-network-cpn-a-concise-field-guide-for-prospective-network-participants)) |

**Contexto de estándares:** SEP-38 ya especifica una API RFQ para activos on/offchain; no resuelve el mecanismo de intercambio. El borrador ERC-7683 estandariza una interfaz para solvers, no exige escrow o liquidación comunes ni prueba pagos bancarios. No se propone adoptarlos ni cambiar arquitectura. ([SEP-38](https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0038.md), [ERC-7683](https://eips.ethereum.org/EIPS/eip-7683))

**Veredicto de categoría:** hay evidencia suficiente para rechazar «RFQ como novedad defendible». No hay evidencia suficiente para afirmar que ningún competidor combina todas las capacidades o que la recuperación de Tuki será superior. Yodl es el contraste comercial más directo; Paycrest, el comparable de red más cercano entre las fuentes revisadas. CPN y Peer aportan modelos distintos de distribución, financiación y confianza.

## 3. Hipótesis de ventaja competitiva

> Para wallets con usuarios que necesitan pagar localmente desde cripto, una red con proveedores realmente solapados y condiciones comprobables de ejecución/recuperación podría entregar mejores resultados netos y menor carga operativa que una integración directa o un agregador existente.

**Es una hipótesis conjunta, no una lista de diferenciales disponibles.**

| Componente | Estado propio | Qué lo convertiría en ventaja y no en paridad |
|---|---|---|
| Competencia entre proveedores | Diseño | Mejora neta frente al mejor proveedor fijo comparable, después de todos los fees; no basta mostrar dos cotizaciones |
| Confirmación verificable | Declaración simulada prevista | Evidencia relevante para el beneficiario y reglas aceptadas por proveedores; una firma válida no basta para demostrar cobro |
| Recuperación ante fallos | Diseño con bloqueantes | Una mejora demostrable respecto de alternativas, plazos entendibles y responsables/fondos identificados; sin ocultar casos no recuperables |
| Varios corredores | Ambición, primero sin implementar | Demanda real que ahorre al integrador trabajo recurrente; no contar países sin el rail/perfil necesario |
| Datos y distribución | Inexistentes hoy | Integraciones utilizadas y aprendizaje de ejecución que mejore resultados; podrían ser copiables o poco valiosos |

La arquitectura sola es replicable. El posible foso sería una combinación adquirida de oferta operable, demanda distribuida y ejecución confiable. **Hoy no hay foso probado.** Si la wallet prefiere Yodl o un proveedor directo con igual resultado y menor costo, esa es una refutación comercial válida; «integrar o asociarse» sigue siendo alternativa a construir una red propia, sin decidirla ahora.

## 4. Modelo de ingresos preliminar

**Propuesta para investigar:** comisión transparente por pago efectivamente completado, con reparto negociado al integrador. Puede incorporarse al precio total visible, sin comisión oculta ni doble conteo del spread del proveedor. No se fija tarifa ni mecanismo contractual/onchain en esta etapa.

- **Proveedor:** cobra su cotización, que debe cubrir pago local, liquidez/reposición, operación y riesgo. Ese spread no es ingreso de Tuki.
- **Tuki:** retiene una parte de la comisión de red después del reparto de distribución; paga sus costos variables y fijos. No llamar «neto» a un fee antes de esos descuentos.
- **Integrador:** podría participar del fee por aportar demanda. Existe precedente comercial: Yodl documenta una comisión configurable con 30% para Yodl y fee de protocolo de 0,10% hoy exonerado; no extrapolar esos términos a Tuki. ([Yodl: precios](https://docs.yodl.me/pricing))
- **No contar al inicio:** rendimiento de fondos ajenos, venta de prioridad que contradiga la mejor ejecución, token o subsidios como ingresos orgánicos. Un fee de integración/SaaS solo tendría sentido si un comprador lo acepta; no hay evidencia aún.

### Modelo de contribución: todos los números siguientes son supuestos

Sea `V` el nominal equivalente en USD de cada pago local, `t` la comisión bruta de red, `d` la fracción de esa comisión para distribución, `c` el costo variable medio soportado por Tuki y `F` sus costos fijos mensuales.

```text
Ingreso bruto de red por pago = V × t
Ingreso de Tuki tras distribución = V × t × (1 − d)
Contribución por pago m = V × t × (1 − d) − c
Pagos de equilibrio N = techo(F / m), solo si m > 0
Volumen de equilibrio = N × V
```

Ejemplo puramente ilustrativo: `V = US$30`, `d = 40%`, `c = US$0,03` y `F = US$6.000/mes`. Los tres centavos son una hipótesis agregada de relay, soporte y pérdidas ordinarias; no una medición ni una garantía financiada. La comisión se suma al precio del proveedor y puede volvernos no competitivos.

| Comisión bruta de red `t` | Bruto por pago | Tras distribución | Contribución `m` | Pagos/mes de equilibrio | Volumen/mes aproximado |
|---|---|---|---|---|---|
| 0,30% | US$0,090 | US$0,054 | US$0,024 | 250.000 | US$7,50 M |
| 0,50% | US$0,150 | US$0,090 | US$0,060 | 100.000 | US$3,00 M |
| 0,80% | US$0,240 | US$0,144 | US$0,114 | 52.632 | US$1,58 M |

**Sensibilidad:** en el escenario de 0,50%, si `c` sube a US$0,06, hacen falta 200.000 pagos y US$6 M mensuales; con `F = US$15.000` y `c = US$0,03`, 250.000 pagos y US$7,5 M. Con ticket de US$10, los mismos `t`, `d` y `c = US$0,03` dejan contribución cero: ningún volumen cubre costos fijos.

Estos cálculos **no demuestran cuánto volumen conseguiremos ni cuánto acepta pagar el mercado**. Faltan presupuesto, precios B2B, adquisición de usuarios, onboarding/KYC, costos por incidente y exposición al riesgo. Los gastos de adquisición deben incluirse como costo variable/amortizado o fijo según corresponda, sin contarlos dos veces. Reservas, colateral y capital de trabajo son además necesidades de caja; pérdida esperada baja no financia una pérdida extrema ni un reembolso exigible.

El número de proveedores necesario se determina por ofertas válidas, disponibilidad y demanda simultánea, no por un umbral mágico. La expansión internacional puede aportar volumen, pero también costos y riesgos nuevos. No concluir rentabilidad global ni inviabilidad de un nicho a partir de estos escenarios.

## 5. Las tres hipótesis que validar antes de invertir más desarrollo

**Umbrales propuestos para discusión, no requisitos aprobados ni actividades ya realizadas.** Se pueden investigar sin pagos reales ni prueba con comercios. Esta síntesis no envía mensajes, publica encuestas ni contacta terceros; esas acciones necesitan su autorización específica.

### H1 — Existe oferta dispuesta a operar bajo reglas aceptables

**Hipótesis:** al menos dos proveedores independientes con acceso efectivo al corredor pueden cotizar y aceptar explícitamente cómo comprometen, pagan, prueban y cobran.

**Evidencia propuesta:** después de autorizar contacto, obtener de cinco candidatos pertinentes una respuesta escrita sobre rail/cobertura, elegibilidad, precio, mínimos, evidencia, plazos, prefondos y riesgo de pagar sin capturar. Pedir dos expresiones no vinculantes de interés con condiciones concretas; «nos interesa» sin condiciones no cuenta. No equiparar interés con contrato ni operación habilitada.

**Pasa provisionalmente si:** dos aceptan avanzar con el mismo caso de pago y con una asignación de riesgos explícita compatible con el diseño, sin esconder excepciones. **Se refuta comercialmente** si todos los que responden exigen condiciones incompatibles. Si no responden suficientes candidatos o no acreditan capacidad, queda inconclusa; no se sustituye evidencia por simulación. Cualquier cambio necesario a las reglas vuelve al fundador antes de modificar arquitectura.

### H2 — La red mejora el resultado y deja contribución positiva

**Hipótesis:** con cotizaciones realmente comparables, el ruteo aporta una mejora que supera su costo frente al mejor proveedor fijo disponible y a la alternativa integrable, sin trasladar riesgo oculto al usuario o proveedor.

**Evidencia propuesta:** con acceso autorizado a cotizaciones no ejecutadas, comparar durante diez días y tres tamaños de pago (equivalentes a US$10, US$30 y US$100), a las mismas horas, rail y perfil. Registrar ofertas inválidas, límites, costo total, vencimiento y proveedor ganador. Elegir el proveedor fijo con la primera mitad de la muestra y evaluar contra él en la segunda, sin optimizar retrospectivamente el benchmark. No usar solo APIs minoristas de venta de cripto.

**Pasa provisionalmente si:** en la muestra de evaluación hay al menos dos ofertas ejecutables por condiciones documentadas en 80% de solicitudes elegibles; el ahorro mediano neto es al menos 0,30% frente al benchmark fijo y la contribución de Tuki es positiva con costos y reparto explícitos. Son umbrales de investigación propuestos, no una promesa de precio. **Se refuta** si el ahorro desaparece al incluir fees/costos, solo depende de subsidios o las ofertas no se solapan. Cotizaciones favorables no prueban éxito, latencia ni recuperación reales: eso sigue pendiente antes de producción.

### H3 — Una distribución concreta prefiere esta propuesta a las existentes

**Hipótesis:** wallets con demanda pertinente y usuarios de ese segmento perciben una mejora suficiente para cambiar su conducta, no solo para elogiar una demo.

**Evidencia propuesta:** tras autorizar investigación con terceros, contrastar el concepto con cinco equipos de wallets/aplicaciones y diez usuarios del segmento. Mostrar alternativas reales, requisitos y limitaciones con igual claridad; usar prototipo no transaccional. Pedir al integrador un caso de uso, responsable, rango de volumen respaldado por su actividad y próximo paso definido; al usuario, completar y comparar el flujo, no solo registrarse en una lista.

**Pasa provisionalmente si:** dos integradores dejan por escrito un interés condicionado de evaluación con responsable y un problema que su proveedor actual no resuelve, y seis de diez usuarios prefieren el flujo para una necesidad propia con motivo concreto distinto de un descuento subsidiado. El interés y las preferencias no son pagos ni volumen comprometido. **Se refuta** si los integradores eligen Yodl/proveedor directo o no identifican demanda, o si los usuarios no ven mejora al conocer los límites. Sin acceso suficiente, queda inconclusa.

**Decisión posterior:** si H1–H3 producen evidencia favorable, presentar los resultados y recién entonces decidir la próxima inversión. Si alguna falla o es inconclusa, no reemplazarla por más desarrollo. Incluso con las tres favorables, los bloqueantes técnicos, las garantías financiadas y la revisión de elegibilidad siguen impidiendo aprobar producción o «liquidación garantizada».
