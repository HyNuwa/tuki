# 14 — Plan operativo: primeros siete días

**Estado:** propuesta (2026-11-12). Reemplaza el plan anterior, que giraba en torno al spike de escrow de la red RFQ de pagos QR (archivado en el tag `archive/qr-usdc-rfq`).

**Objetivo de la semana:** demostrar que un cliente automático puede comprar información útil (Modo A) y encargarla (Modo B), y obtener la primera señal de si existen compradores concretos que pagarían por ella. No es «terminar el producto».

**Límites de la semana:**

- Todo corre en Celo Sepolia o en local, con USDC de testnet. Sin fondos reales ni contribuyentes externos: solo tickets del equipo.
- Pagos con x402 `exact` a través del facilitator de testnet `https://api.x402.sepolia.celo.org` (solo USDC `0x01C5C0122039549AD1493B8220cABEdD739BC44E`, red `eip155:11142220`). Requiere `X402_API_KEY` creada en `https://x402.celo.org`. `exact` no es un escrow.
- Fuera de la semana: `auth-capture`, World ID, MiniPay, otras redes, zkTLS, regalías y recompensas avanzadas.
- El código es de demo; se reescribe lo que haga falta si hay piloto.

## Plan

| Día | Objetivo                                                                |
| --- | ----------------------------------------------------------------------- |
| 1   | Congelar PRD, vertical inicial y contratos de datos de la API           |
| 2   | Construir API de cobertura y catálogo de información                    |
| 3   | Probar extracción, normalización y deduplicación con tickets del equipo |
| 4   | Implementar una compra x402 de datos existentes                         |
| 5   | Crear el flujo de encargo y recepción de observaciones                  |
| 6   | Probar verificación, privacidad, ledger, pagos de prueba y fallas       |
| 7   | Demo completa y evaluación de viabilidad comercial                      |

Revisión del usuario (cita textual):

> En paralelo, investigaría qué información pagarían por obtener compradores concretos. No esperaría a terminar la demo para validar esa pregunta.

## Día 1: congelar PRD, vertical inicial y contratos de datos

- Leer los docs [03](03-prd-mvp.md), [04](04-arquitectura-tecnica.md), [15](15-stack-tecnologico.md) y [16](16-modelo-seguridad-verificacion-pagos.md), y los ADR [0001](adr/0001-red-y-custodia-de-presupuestos.md) y [0002](adr/0002-verificacion-de-observaciones.md). Anotar desacuerdos.
- Elegir la vertical inicial: categorías (por ejemplo, almacén básico: leche, yerba, aceite), zona y tipos de comercio.
- Congelar el contrato de `DataProduct`: cobertura, antigüedad, origen, nivel de verificación, cantidad de observaciones y contribuyentes, licencia y precio.
- Congelar el contrato de `Task`: requisitos, presupuesto, vencimiento, umbral k, tope por contribuyente y regla de reembolso para encargos incompletos.
- Esquema inicial en PostgreSQL y esqueleto del monolito TypeScript con Hono.
- Crear la `X402_API_KEY` de testnet y comprobar `GET /supported` del facilitator.
- Asignar responsables: API y pagos, ingesta y extracción, ledger y recompensas, cliente automático y demo, validación con compradores.

**Entregable:** PRD congelado por una semana, contratos de API escritos (OpenAPI), vertical elegida y responsables.
**Chequeo:** el facilitator responde con `exact` en `eip155:11142220` usando nuestra clave.

## Día 2: API de cobertura y catálogo

- Cargar en PostgreSQL un conjunto de observaciones de prueba, marcadas como tales, para poblar el catálogo.
- Endpoint gratuito de catálogo: lista de `DataProduct` con su contrato de datos.
- Endpoint gratuito de cobertura: dada una consulta (producto, zona, período), responde si hay datos suficientes y a qué precio.
- Exponer las mismas operaciones como tools MCP.
- Primera versión del cliente automático: lista el catálogo, consulta cobertura y decide comprar o no según reglas fijas.

**Entregable:** catálogo y cobertura consultables por REST y MCP; cliente que toma una decisión registrada en el log.
**Chequeo:** la consulta de cobertura nunca devuelve precios individuales ni datos de contribuyentes.

## Día 3: extracción, normalización y deduplicación

- Juntar tickets reales del equipo (objetivo: 10 a 30) con consentimiento interno.
- Spike de extracción (S3 del doc 15) con LLM de visión: comercio, fecha, ítems, precios, promociones legibles y total.
- Decodificar el QR fiscal de ARCA y comparar su total con el extraído; descartar los datos del comprador que trae el QR.
- Normalizar productos y unidades contra la vertical elegida.
- Dedupe: clave fiscal única, `sha256` de la imagen y `pHash` para recortes o recompresiones.
- Cola de revisión manual para los casos dudosos.

**Entregable:** nota con resultados por ticket: totales correctos, ítems correctos, ítems inventados detectados o no, duplicados detectados.
**Chequeo:** el criterio completo de S3 pide 100 tickets; con la muestra del equipo solo se obtiene una señal temprana y así se informa.

## Día 4: compra x402 de datos existentes (Modo A)

- Integrar `@x402/hono` en el endpoint pago del agregado.
- Flujo: pedido → `402 Payment Required` → firma del cliente → verificación y liquidación vía facilitator → agregado con metadatos de calidad.
- Si la cobertura es insuficiente, responder con error antes de liquidar.
- Usar `payment-identifier` para que un reintento no cobre dos veces.
- Registrar el cobro en el ledger interno.

**Entregable:** el cliente automático compra un agregado de punta a punta en Celo Sepolia.
**Chequeo:** una compra sin cobertura no se cobra; un reintento con el mismo identificador no se cobra dos veces.

## Día 5: flujo de encargo y recepción de observaciones (Modo B)

- Cotización gratuita del encargo: viabilidad, presupuesto sugerido y regla de reembolso.
- Financiación con x402 `exact` hacia el tesoro de tareas en testnet (custodia temporal); el ledger registra el presupuesto retenido.
- App web mínima del contribuyente: aceptar condiciones (texto versionado), ver encargos, subir ticket, ver estado.
- Conectar la subida al pipeline del día 3; solo `accepted` consume presupuesto.
- Cierre del encargo: resultado al cliente y devolución del presupuesto no usado.

**Entregable:** el cliente automático crea y financia un encargo; el equipo aporta tickets; el encargo cierra con resultado.
**Chequeo:** el presupuesto nunca se excede; al cerrar, presupuesto = capturado + reembolsado.

## Día 6: verificación, privacidad, ledger, pagos de prueba y fallas

- Pagos de recompensa en lote con USDC de testnet desde el tesoro: una obligación idempotente por observación aceptada.
- Conciliación: un pago en estado `unknown` no se reintenta sin revisar la cadena.
- Umbral k y supresión: un agregado que no lo cumple no expone precios.
- Correr los escenarios del PRD: presupuesto agotado, encargo incompleto por debajo de k con reembolso, ticket duplicado, falla de extracción, x402 cobrado sin resultado entregable, retiro del consentimiento.
- Revisar que no haya datos personales ni imágenes en logs, respuestas ni cadena.

**Entregable:** guion de la demo y registro del resultado de cada escenario.
**Chequeo:** el ledger cuadra por encargo y ningún escenario entrega imágenes ni datos personales al comprador.

## Día 7: demo completa y evaluación de viabilidad comercial

- Demo de punta a punta: Modo A, Modo B y los escenarios de falla, con la marca «DEMO — TESTNET, SIN DINERO REAL».
- Reunión de 60 minutos: resultados técnicos, resultados de la validación con compradores y decisión.

**Salida:** informe de la semana, ADR actualizados con los resultados (siguen como propuestas) y tres riesgos prioritarios con responsable.

## Validación con compradores (en paralelo, desde el día 1)

No espera a que la demo esté terminada.

- **Día 1:** lista de 10 a 15 compradores posibles: gerentes comerciales o de trade de marcas regionales de consumo masivo, distribuidores con venta en canal tradicional y consultoras de inflación. Guion de entrevista.
- **Días 2 a 5:** al menos 5 entrevistas. Preguntas: qué información de precio, promociones o disponibilidad no consiguen hoy; cómo la obtienen (fuerza de ventas, agencias, Scanntech, SEPA, intuición); qué decisión cambiaría con ese dato; cuánto pagan hoy por algo parecido; si pagarían por un primer lote chico y cuánto; si usan o usarían agentes para obtenerlo.
- **Días 5 y 6:** ofrecer a quienes mostraron interés un primer lote concreto (producto, zona, cantidad de observaciones, plazo, precio).
- **Día 7:** síntesis con citas textuales de los entrevistados y lista de compromisos obtenidos.

Las conclusiones se registran con la evidencia que las sostiene; una opinión favorable no cuenta como demanda validada.

## Decisión del día 7

**Avanzar hacia la preparación de un piloto** si se cumplen todos:

- Modo A y Modo B corren de punta a punta en testnet con el cliente automático.
- Los seis escenarios de falla obligatorios dan el resultado esperado y el ledger cuadra.
- La extracción da una señal aceptable en los tickets del equipo (totales coinciden con el QR; ningún ítem inventado sin detectar).
- Al menos **dos compradores concretos** describen, en sus palabras, un dato que hoy no consiguen y que cambiaría una decisión, y al menos **uno** acepta pagar (o firma un compromiso de pagar) un primer lote.

**Reformular** (segmento, tipo de dato o precio) si la demo funciona pero:

- los entrevistados solo quieren datos que ya obtienen gratis (SEPA, scraping) o los quieren sin pagar; o
- el precio que mencionan no cubre recompensa, procesamiento, revisión y reserva por resultado entregable.

**Detener** esta dirección si:

- ningún comprador entrevistado identifica un dato que pagaría por obtener; o
- la extracción no es confiable ni con revisión manual a un costo razonable; o
- no hay forma de entregar agregados útiles respetando los umbrales de privacidad.
