# 13 — Resumen ejecutivo para presentar al equipo

**Estado: propuesta de startup para validar, no compañía operativa. Actualizado: 11 de noviembre de 2026.**

**Cambio de dirección:** la versión anterior proponía una app que integraba un único PSP, sin escrow. La dirección actual es una **red RFQ de payment solvers** con un escrow onchain que bloquea el USDC hasta que el pago se liquida o se devuelve. **La arquitectura no está aprobada para fondos reales.** «Liquidación garantizada» no es una promesa ni una categoría adoptada: no hay confirmación bancaria probada, garantías financiadas ni proveedores reales que acepten las reglas ([doc 17](17-posicionamiento.md)).

## La idea en 30 segundos

Una persona con USDC escanea el QR de un comercio argentino. Varios **payment solvers** (proveedores que pagan pesos) cotizan el pago. El USDC del pagador queda bloqueado en un escrow, el solver elegido paga ARS al comercio y cobra el USDC cuando presenta un comprobante firmado. Si nadie toma el pago, el USDC vuelve enseguida. Si algo queda incierto, el pagador tiene un plazo máximo después del cual recupera sus fondos sin depender de nosotros.

Lo que buscamos diferenciar no es el riel ni la wallet. La hipótesis es que proveedores que compiten de verdad por cada pago, con reglas comprobables de ejecución y recuperación ante fallos, le den a una wallet un mejor resultado neto que integrar un proveedor directo o Yodl. Hoy es una hipótesis, no un foso ([doc 17](17-posicionamiento.md), §3).

## Tres cosas distintas

| | Qué es | Estado |
|---|---|---|
| **Demo de hackathon** | Dos solvers y un PSP simulados, escrow de prueba en testnet, pago fiat simulado | Es lo que vamos a construir primero |
| **Protocolo RFQ objetivo** | Solvers licenciados, registro y revocación, garantías, evidencia más fuerte | Diseño en los docs 04 y 16 |
| **Piloto real** | Pagos reales en un segmento pequeño | Condicionado a proveedores, cumplimiento, pruebas y garantías. Nada de eso está resuelto |

## Primer mercado

- Destino: Argentina.
- Usuario inicial: viajero internacional o freelance con USDC en una wallet propia.
- Primer formato: QR interoperable argentino.
- Activo y red: USDC en Base. Otros activos y redes entran después, mediante adaptadores, si hay demanda.
- Es un mercado de entrada para validar. La ambición es expandir por corredores de pago.

## Lo que NO vamos a construir aún

- No procesamos ARS nosotros ni captamos depósitos. No custodiamos fondos.
- No construimos un escrow propio: probamos uno existente (`AuthCaptureEscrow`) en un spike, sin aprobarlo para producción.
- No desplegamos contratos con fondos reales.
- No sumamos integraciones Web3 para premios, salvo que resuelvan una necesidad identificada o un track específico.
- No prometemos KYC cero, anonimato, instantaneidad garantizada ni que el comercio cobró: el comprobante es una declaración firmada del proveedor.

## Qué probará la demo

1. El flujo completo: Payment Intent → RFQ con dos solvers simulados → autorización USDC → ejecución fiat simulada → comprobante verificable → liquidación.
2. El reembolso rápido cuando ningún solver toma el pago.
3. El cambio al solver de respaldo sin pedir otra firma.
4. **El caso más importante:** el solver pagó y la confirmación se perdió. No hay reembolso automático ni doble pago.
5. Que el pagador recupera sus fondos sin nuestro backend.

La demo no prueba que un PSP real acepte el modelo, ni que haya demanda.

## Riesgos centrales

- **Ningún PSP confirmó que acepte el modelo.** El solver se compromete antes de pagar, adelanta los pesos y asume la pérdida si no logra probar el pago a tiempo. Sin un proveedor que lo acepte, no hay piloto.
- **La ventaja es copiable.** Yodl, P2P.me o un PSP como Manteca pueden agregar una garantía parecida. Las reglas de recuperación ante fallos son, como mucho, una cuña, no un foso.
- **Los reembolsos después de liquidar necesitan financiación.** No hay garantía automática sin fondos o sin responsabilidad contractual (doc 16, §9).
- **No tenemos prueba de acreditación.** Solo la declaración firmada de quien pagó (doc 16, §7).

## Modelo de ingresos

Sin validar. La propuesta es una comisión transparente por pago completado, compartida con la wallet o el integrador que aporta la demanda. Con supuestos ilustrativos, el volumen de equilibrio va de US$1,6M a US$7,5M por mes según la comisión ([doc 17](17-posicionamiento.md), §4). El ejemplo de la versión anterior (reparto de fee con un único PSP) ya no aplica.

## Camino

1. **Hackathon:** spike del escrow y demo con actores simulados.
2. **Después de la hackathon:** conversaciones con proveedores, revisión de cumplimiento normativo, elección de la garantía y revisión de seguridad.
3. **Go/no-go del piloto real:** solo si se cumplen las condiciones del PRD.

## La visión futura

Una capa de liquidación entre cripto y pagos locales: multiactivo y multired mediante adaptadores, con solvers que compiten y responden con una garantía, y expansión por corredores (por ejemplo, Pix). Es visión, no lo que entregamos hoy. Los beneficios con comercios adheridos quedan fuera de esta etapa.

## La decisión que necesitamos tomar

**¿Existe al menos un proveedor dispuesto a operar como solver bajo estas reglas, y un grupo de usuarios para el que la garantía haga una diferencia real?** Si no, hay que cambiar el modelo o el segmento antes de escribir infraestructura financiera para producción.

Ver [03 — PRD](03-prd-mvp.md), [04 — Arquitectura](04-arquitectura-tecnica.md), [15 — Stack](15-stack-tecnologico.md), [16 — Seguridad y liquidación](16-modelo-seguridad-liquidacion.md) y [14 — Primeros siete días](14-primeros-7-dias.md).
