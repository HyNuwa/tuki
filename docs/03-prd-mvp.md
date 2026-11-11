# 03 — PRD del MVP: pagar QR argentino con USDC

**Owner:** Producto | **Versión:** 0.1 | **Estado:** propuesta no aprobada | **Target:** experimento controlado

## Objetivo

Probar que un usuario que ya tiene USDC puede completar un pago QR argentino elegible **con menos incertidumbre y fricción** que sus alternativas, con liquidación realizada por proveedor autorizado y sin exigir abrir una cuenta bancaria local. El MVP no evalúa aún fidelización entre comercios.

## Persona y escenario

**Persona A — visitante internacional con cripto:** saldo USDC en wallet EVM; llega a un comercio que acepta QR argentino; requiere información clara del importe, comisiones y confirmación. Puede necesitar verificación de identidad dependiendo del proveedor.

**Escenario crítico:** quiere pagar en caja en conectividad móvil imperfecta. El vendedor espera confirmación sin demoras arbitrarias.

## Alcance P0 (MVP)

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| P0-01 | Wallet EVM existente conectada | El usuario conecta/desconecta y ve red/activo sin exponer claves |
| P0-02 | Captura QR desde cámara | Rechaza datos no compatibles antes de iniciar pago |
| P0-03 | Validación del QR | Diferencia soportado, no soportado, inválido y expirado |
| P0-04 | Cotización total | Mostrar ARS al comercio, USDC a debitar, FX, fees, expiración y proveedor cuando disponible |
| P0-05 | Confirmación explícita | No se firma/transfiere sin aceptación de costo y receptor |
| P0-06 | Estados claros | `submitted`, `processing`, `success`, `failure`, `unknown` según proveedor |
| P0-07 | Confirmación de liquidación | Nunca mostrar éxito solo por el hash onchain |
| P0-08 | Historial básico | Identificador, fecha, importe, estado, referencia del proveedor |
| P0-09 | Ayuda y soporte | Texto accionable y canal de reclamo para pago pendiente/fallido |
| P0-10 | Privacidad | Consentimiento, minimización y datos retenidos según necesidad aprobada |
| P0-11 | Observabilidad | Tiempos, tasas de error y logs sin datos sensibles |

## No alcance

Pago NFC contactless, merchant POS propio, múltiples países simultáneos, puntos, ENS, NFT, AMM, bridges, yield, token de la plataforma, programa de referidos monetizado, garantía de compatibilidad universal, KYC propio, custodias.

## Flujo UX

1. Abrir app y leer explicación sobre país/red/activo soportados.
2. Conectar wallet compatible o seguir el flujo autorizado de proveedor.
3. Autorizar cámara; escanear QR o cargar cadena QR de pruebas.
4. Validar soporte; si no es válido, mostrar motivo y alternativa.
5. Consultar cotización vigente: ARS, USDC, fee total, tiempo estimado y vencimiento.
6. Confirmar de forma explícita; proveedor tramita autorización y procesamiento.
7. Mostrar «Procesando» hasta estado fiable de liquidación.
8. En `success`, comprobante y referencia; en `failure/unknown`, soporte/conciliación.

## Prototipo visual sin dinero real

Todas las pantallas tendrán sello **«DEMO — NO ES UN PAGO REAL»** y un proveedor `MockPaymentAdapter`. QR de prueba, cotizaciones y callbacks se simulan de modo determinístico. No se presenta «pago exitoso» como evidencia de red fiat.

## Historias de usuario

- US-01: «Como viajero, quiero saber si mi QR está soportado *antes* de transferir tokens».
- US-02: «Quiero ver exactamente cuánto USDC se debita y cuánto ARS recibe el negocio».
- US-03: «Quiero cancelar antes de confirmar sin perder fondos».
- US-04: «Si la conexión se corta, quiero retomar el estado sin repetir el pago».
- US-05: «Si pagué pero el comerciante no ve el dinero, quiero una referencia útil de soporte».
- US-06: «Quiero que mi wallet no quede conectada si cierro sesión».
- US-07: «Como equipo operativo, quiero investigar operaciones sin acceder a semillas ni KYC innecesario».

## Casos límite obligatorios

- QR sin monto; QR dinámico con monto; QR caducado; variante no soportada.
- Quote expirado antes de firmar; saldo insuficiente; red incorrecta.
- Usuario deniega firma; emite transacción pero pierde conexión.
- Pago onchain confirmado y fiat pendiente; rechazo de proveedor; callback duplicado.
- Devolución posterior; pago repetido; error de cámara; conectividad intermitente.
- Usuario bloqueado por política del socio; error KYC; QR de comercio no elegible.

## Criterios no funcionales (objetivos a medir)

- Ningún secreto de proveedor en el cliente.
- Estados idempotentes y recuperables tras reiniciar aplicación.
- Métricas `p50/p95` de cotización y confirmación; los umbrales no se prometen sin baseline.
- Disponibilidad y seguridad dependientes de SLAs del proveedor; fijar objetivos tras due diligence.
- Idiomas iniciales: español e inglés; verificar copy de costos y soporte.
- Accesibilidad: tipografía legible, estados no diferenciados solo por color.

## Analítica mínima y privacidad

Eventos: `wallet_connected`, `qr_scanned`, `qr_supported`, `quote_requested`, `quote_presented`, `payment_confirmed_by_user`, `payment_processing`, `payment_succeeded`, `payment_failed`, `help_opened`.

No emitir en analítica pública: QR completos, nombres de comercios, documentos, emails, direcciones personales, claves, tokens, secretos. Ids pseudónimos y retención definida con legal.

## Criterios de éxito del piloto

- Debe existir primero acuerdo técnico/contractual y revisión de cumplimiento.
- Se verifican pagos reales en un segmento pequeño y autorizado, incluidos fallos y resoluciones.
- Se mide número de intentos, pagos correctos, soportados/no soportados, completitud, costo all-in y tiempos reales.
- Al menos un canal está dispuesto a recomendar la app y los usuarios la prefieren por un motivo observado.

**No-go:** QR se rechazan sin explicación, pagos sin confirmación fiat, costo no competitivo, dependencia de KYC/proveedor incompatible con propuesta, o inexistencia de demanda de usuarios.
