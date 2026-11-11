# 14 — Plan operativo: primeros siete días

**Objetivo de la semana:** eliminar incertidumbre crítica, no «terminar la app».

## Día 1: acordar foco y tareas

- Confirmar segmento inicial (viajeros con USDC en Argentina), mercado y no-objetivos del README.
- Designar responsables de producto/entrevistas, integración SDK y proveedores/cumplimiento.
- Crear tablero de tareas con estados `todo / doing / blocked / done`.
- Abrir registro de dudas en `12-riesgos-y-decisiones.md`.

**Entregable:** scope congelado por una semana y dueños por tarea.

## Día 2: estudiar competidores como usuarios

- Revisar flujos públicos de Yodl, P2P.me, Bitget y CacaoCash.
- Anotar qué problemas del viajero ya resuelven, qué exigen para operar y cómo tratan pagos pendientes.
- No realizar pagos reales sin control de riesgos y aceptación contractual.

**Entregable:** matriz de diferencia de valor; no inventar ventaja competitiva.

## Día 3: entrevistar cinco usuarios

- Conseguir 5 relatos de pagos recientes en Argentina, idealmente con un error o alternativa documentable.
- Registrar frecuencia, volumen, tiempo perdido, costo y herramienta utilizada.
- No preguntarle a la gente solamente si «le gusta la idea».

**Entregable:** evidencia real de dolor o primera señal de que no hay demanda.

## Día 4: llamadas a proveedores

- Enviar mismo cuestionario a Yodl y dos alternativas B2B.
- Pedir integración de pruebas, pricing all-in, contractabilidad y estado de KYC.
- Abrir revisión legal de la actividad concreta en Argentina.

**Entregable:** tabla de hechos, dudas y obstáculos. Si falta compatibilidad contractual, marcar `BLOCKED`.

## Día 5: UX de prueba

- Diseñar screens: scan, unsupported, quote, confirm, processing, success, unknown/failure, soporte.
- Asegurarse de que el prototipo distinga claramente simulación de pago real.
- Mostrarlo a dos usuarios entrevistados.

**Entregable:** prototipo navegable y problemas de comprensión detectados.

## Día 6: spike de integración

- Instalar SDK elegido en app de prueba, únicamente con parámetros y entornos habilitados.
- Probar wallet EIP-1193, cambio de red, QR mock y los eventos documentados.
- Registrar incompatibilidades de entorno nativo, dispositivo y versiones.

**Entregable:** nota técnica reproducible con pasos, capturas y blockers.

## Día 7: decisión de segunda semana

Reunión de 45 minutos. Revisar: casos reales, cobertura proveedor, precio, UX, dificultades de SDK y respuesta legal preliminar. Elegir:

- **Avanzar:** hay problemas observados y una ruta de integración plausible.
- **Reformular:** usuarios o proveedor indican otro nicho.
- **Detener:** solo copiamos competencia sin diferencia de valor.

**Salida:** backlog revisado, tres riesgos prioritarios y siguiente experimento con responsable.
