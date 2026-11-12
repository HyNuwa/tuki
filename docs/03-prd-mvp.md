# 03 — PRD del MVP: pagar QR argentino con USDC

**Owner:** Producto | **Versión:** 0.2 | **Estado:** propuesta no aprobada | **Target:** demo de hackathon con solvers y PSP simulados

**Cambio respecto de la versión 0.1:** la versión anterior describía una app que integraba el SDK de un único PSP, sin escrow. La dirección actual es una **red RFQ de payment solvers** con el USDC bloqueado en un escrow onchain. La arquitectura está en los docs [04](04-arquitectura-tecnica.md), [15](15-stack-tecnologico.md) y [16](16-modelo-seguridad-liquidacion.md), y **no está aprobada para fondos reales**.

## Tres alcances

| Alcance | Qué es | Este PRD |
|---|---|---|
| **Demo de hackathon** | Dos solvers simulados, PSP simulado, escrow de prueba en Base Sepolia. No se mueve dinero real | **Es lo que especifica** |
| **Protocolo RFQ objetivo** | Solvers licenciados que cotizan y liquidan, con registro, garantías y evidencia más fuerte | Lo describe el doc 16; acá solo se referencia |
| **Piloto real** | Pagos reales en un segmento pequeño | Condicionado; ver "Condiciones para un piloto real" |

## Objetivo

Demostrar de punta a punta, con actores simulados, que un usuario con USDC puede pagar un QR argentino con **menos incertidumbre** que sus alternativas, y que el sistema se comporta de forma correcta y honesta **cuando algo falla**. El caso más importante es el del solver que pagó cuando la confirmación se perdió.

La demo no prueba que un PSP real acepte el modelo, ni que el comercio cobre: eso corresponde al piloto.

## Persona y escenario

**Persona A — visitante internacional con cripto:** tiene USDC en Base, en una wallet propia (EOA o smart account como Base Account). Llega a un comercio que cobra con QR argentino. Quiere ver el importe, el costo total y una confirmación clara.

**Escenario crítico:** paga en la caja con conectividad móvil imperfecta. El vendedor espera una confirmación sin demoras arbitrarias.

## Flujo que la demo tiene que mostrar

```text
Payment Intent → RFQ con dos solvers simulados → autorización USDC → ejecución fiat simulada
→ comprobante verificable → liquidación o manejo de fallo
```

## Alcance P0 (demo)

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| P0-01 | Wallet existente conectada | El usuario conecta y desconecta; ve red y activo; no se exponen claves. Funciona con una EOA y con una smart account (resultado del spike) |
| P0-02 | Captura del QR | Se rechazan los datos no compatibles antes de iniciar el pago |
| P0-03 | Validación del QR | Distingue soportado, no soportado, inválido y vencido |
| P0-04 | Payment Intent | Un intent por escaneo; si hay un pago en curso para ese QR, se muestra ese pago |
| P0-05 | RFQ | Se piden cotizaciones a dos solvers simulados; se muestra la elegida: ARS al comercio, USDC a debitar, tipo de cambio, fees, vencimiento y solver |
| P0-06 | Autorización explícita | Una sola firma (EIP-3009), sin gas para el usuario. No se firma nada sin aceptar el costo y el plazo máximo de espera |
| P0-07 | Estados claros | `autorizado`, `comprometido`, `liquidado`, `reembolsado`, `en verificación`, `recuperado`. "En verificación" nunca se muestra como fallido |
| P0-08 | Confirmación de liquidación | Nunca se muestra éxito solo por un hash onchain; hace falta la declaración firmada |
| P0-09 | Comprobante | Declaración firmada del proveedor simulado, verificable por cualquiera. Se nombra así, nunca "prueba de acreditación" |
| P0-10 | Manejo de fallas | Se demuestran las cuatro ramas de "Escenarios de falla" |
| P0-11 | Historial básico | Identificador, fecha, importe, estado y referencia |
| P0-12 | Ayuda | Texto accionable para un pago en verificación: qué pasa, cuánto puede tardar y cómo recuperar los fondos sin nosotros |
| P0-13 | Privacidad | Onchain solo hashes; no se registran QR completos ni datos personales |
| P0-14 | Observabilidad | Tiempos, tasas de error y logs sin datos sensibles |

## Escenarios de falla que la demo tiene que mostrar

1. **Ningún solver se compromete:** el escrow se anula y el USDC vuelve en el momento (reembolso rápido).
2. **El solver principal no responde:** el de respaldo toma el pago con la misma firma.
3. **El solver pagó y la confirmación se perdió:** el pago queda "en verificación". **No hay reembolso automático.** Si la declaración llega antes del plazo, se liquida. Si no llega, el pagador recupera sus fondos al vencer el plazo y la pérdida es del solver.
4. **Intento de usar dos veces la misma autorización o la misma declaración:** se rechaza.

## No alcance

- Dinero real, ARS reales y PSP reales.
- Escrow propio: se usa un escrow de prueba de un tercero (candidato del spike, no aprobado).
- Garantías de solvers, disputas reales y reembolsos posteriores a la liquidación (en la demo solo se muestra el estado).
- Otros activos y redes, swaps y bridges.
- Integraciones de sponsors (ENS, World ID, CCTP, x402, Arkiv, Hedera y similares), salvo que resuelvan una necesidad identificada o un track específico.
- Pago NFC, POS propio, varios países a la vez, puntos, NFT, yield, token propio, referidos, KYC propio, custodia.

## Flujo UX

1. Abrir la app y leer qué país, red y activo se soportan.
2. Conectar una wallet compatible.
3. Autorizar la cámara; escanear el QR o cargar un QR de prueba.
4. Validar el soporte; si no es válido, mostrar el motivo.
5. Ver la cotización elegida del RFQ: ARS, USDC, fee total, vencimiento y plazo máximo de espera.
6. Confirmar y firmar una vez.
7. Ver "Procesando" hasta un estado confiable.
8. En `liquidado`, ver el comprobante y la referencia. En `en verificación`, ver el plazo y la ayuda. En `reembolsado` o `recuperado`, ver la transacción de devolución.

## Prototipo sin dinero real

Todas las pantallas llevan el sello **«DEMO — NO ES UN PAGO REAL»**. Los solvers, el PSP, las cotizaciones y las declaraciones se simulan de forma determinística. Una liquidación en la demo **no es evidencia** de que la red fiat funcione ni de que un comercio cobre.

## Historias de usuario

- US-01: «Como viajero, quiero saber si mi QR está soportado *antes* de autorizar nada».
- US-02: «Quiero ver exactamente cuánto USDC se debita y cuánto ARS recibe el negocio».
- US-03: «Quiero cancelar antes de confirmar sin perder fondos».
- US-04: «Si la conexión se corta, quiero retomar el estado sin repetir el pago».
- US-05: «Si mi pago queda en verificación, quiero saber cuánto puede tardar y que mis fondos no se perdieron».
- US-06: «Si nadie toma mi pago, quiero mis USDC de vuelta enseguida».
- US-07: «Quiero poder recuperar mis fondos aunque la app deje de existir».
- US-08: «Como equipo operativo, quiero investigar operaciones sin acceder a semillas ni a datos personales innecesarios».

## Casos límite obligatorios

- QR sin monto; QR dinámico con monto; QR vencido; variante no soportada.
- Cotización vencida antes de firmar; saldo insuficiente; red incorrecta.
- El usuario rechaza la firma; firma y pierde la conexión.
- USDC bloqueado y ningún solver comprometido; solver comprometido que no paga; solver que pagó sin confirmación.
- La declaración llega tarde pero antes del plazo; llega después del plazo; llega duplicada; llega con una clave revocada.
- El usuario vuelve a escanear el mismo QR con un pago en curso.
- Firma con EOA, con smart account desplegada y sin desplegar.

## Criterios no funcionales

- Ningún secreto en el cliente.
- Estados idempotentes y recuperables después de reiniciar la app.
- Métricas `p50/p95` de cotización y de liquidación; no se prometen umbrales sin una línea de base.
- Idiomas iniciales: español e inglés; verificar los textos de costos, plazos y ayuda.
- Accesibilidad: tipografía legible y estados que no se distinguen solo por color.

## Analítica mínima y privacidad

Eventos: `wallet_connected`, `qr_scanned`, `qr_supported`, `rfq_requested`, `quote_presented`, `payment_authorized`, `solver_committed`, `payment_settled`, `payment_voided`, `payment_unknown`, `payment_reclaimed`, `help_opened`.

No se emiten en analítica: QR completos, nombres de comercios, documentos, emails, direcciones personales, claves, tokens ni secretos. Se usan IDs seudónimos.

## Criterios de éxito de la demo

- El flujo feliz y los cuatro escenarios de falla corren de punta a punta en testnet.
- En el escenario 3 no hay reembolso automático ni doble pago.
- El pagador puede recuperar sus fondos sin pasar por nuestro backend.
- La demo dice de forma explícita qué está simulado.

## Condiciones para un piloto real

Ninguna está cumplida hoy:

- Spike del escrow aprobado y revisión de seguridad del `SettlementOperator` (ADR 0001; doc 16, §11).
- Al menos un proveedor real que acepte el modelo: comprometerse antes de pagar, idempotencia, entrega de evidencia y el riesgo de no poder probar a tiempo.
- Garantía del solver elegida y financiada (doc 16, §9.1).
- Revisión de cumplimiento normativo de la actividad.
- Un segmento pequeño y autorizado, con topes.

**No-go:** no hay proveedor que acepte el modelo, el costo total no es competitivo, la evidencia disponible no alcanza para sostener la promesa, o no existe demanda de usuarios.
