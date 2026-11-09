DOCUMENTO 02 · PRODUCTO Y TECNOLOGÍA

MVP: especificación funcional y técnica

Campañas de recompensas por compras verificadas · Alcance de una primera versión operable

**Versión 1.0 · 9 de noviembre de 2026**

> **DECISIÓN A TOMAR**
>
> Construir solamente después de asegurar al menos una campaña financiada y validar manualmente que se pueden confirmar compras sin fricción excesiva.

*Documento preparado para estimación de esfuerzo, división de tareas y discusión de arquitectura. Separa MVP comercial de una fase Web3 condicionada.*

# 1. Objetivo y resultado medible

**Permitir que una marca cree una promoción limitada, que comercios adheridos registren compras elegibles y que compradores soliciten recompensas; todo con validación, trazabilidad y conciliación, sin reemplazar los medios de pago actuales.**

> **NORTH-STAR DEL MVP**
>
> Compras elegibles verificadas y financiadas por una marca, con costo unitario conocido y evidencia utilizable para decidir una segunda campaña.

# 2. Usuario, contexto y propuesta

| **Rol**                      | **Acción principal**                                    | **No debe hacer**                                                   |
|------------------------------|---------------------------------------------------------|---------------------------------------------------------------------|
| **Marca (admin de campaña)** | Definir campaña, presupuesto y ver resultados           | Gestionar wallets ni calcular recompensas a mano                    |
| **Comercio (operador)**      | Confirmar o aportar evidencia mínima                    | Cambiar POSNET, aprender cripto o instalar software pesado          |
| **Comprador**                | Ver oferta y reclamar su beneficio                      | Crear wallet, comprar tokens o ingresar datos fiscales innecesarios |
| **Operador de plataforma**   | Revisar fraude, conciliar fondos y resolver incidencias | Transferir dinero sin trazabilidad y aprobaciones                   |

# 3. Hipótesis y restricciones del piloto

- Una marca financia campaña real para 1–2 SKU de compra frecuente, en hasta 10 comercios y por 14 días.

- Primera meta de volumen: 100–300 reclamos; no equivale a usuarios activos o ingresos proyectados.

- Pagos cotidianos fuera de la app (efectivo, transferencia o tarjeta); la plataforma no procesa la venta.

- Los reembolsos se efectúan por marca o PSP autorizado. La app registra los estados y conciliación.

- Piloto geográficamente concentrado para poder auditar comercios y resolver incidentes en persona.

# 4. Alcance: adentro / afuera

| **Incluido en MVP (P0)**                          | **Explícitamente fuera del MVP**               |
|---------------------------------------------------|------------------------------------------------|
| **PWA responsive para reclamar promociones**      | App Android/iOS nativa y marketplace           |
| **Login ligero y consentimiento versionado**      | Identidad descentralizada / NFT / token propio |
| **Alta de marcas, comercios y productos**         | Integraciones POS masivas                      |
| **Creación de campaña con presupuesto y límites** | Campañas abiertas sin patrocinador             |
| **Captura de evidencia, controles y revisión**    | IA autónoma que aprueba pagos                  |
| **Libro mayor de recompensas y exportación**      | Custodia de cripto para consumidores           |
| **Dashboard de marca y operaciones**              | Venta generalista de historiales de consumo    |

# 5. Flujos esenciales

## 5.1 Configurar campaña

> **1.** Administrador incorpora una marca y hasta 10 comercios aprobados.
>
> **2.** Carga productos elegibles, recompensa, monto máximo, presupuesto, vigencia y reglas por comprador.
>
> **3.** Adjunta términos de la campaña y canal de contacto de soporte.
>
> **4.** El sistema calcula un máximo de compromisos y no permite activar una campaña sin fuente de financiación confirmada.
>
> **5.** La campaña pasa de borrador a activa mediante aprobación de operador.

## 5.2 Solicitar recompensa

> **1.** Comprador abre enlace/QR de promoción y ve condiciones en lenguaje claro.
>
> **2.** Identifica la compra y adjunta ticket detallado o código/confirmación del comercio.
>
> **3.** Acepta términos y permisos de datos necesarios; envía solicitud.
>
> **4.** El sistema entrega un folio y el estado «en revisión».
>
> **5.** Tras aprobarse, ve el beneficio y la forma prevista de acreditación.

## 5.3 Revisar y pagar

> **1.** Reglas automáticas filtran campaña vencida, SKU inválido, exceso de presupuesto y evidencia duplicada.
>
> **2.** Operador revisa reclamos de riesgo o evidencia insuficiente y deja razón de decisión.
>
> **3.** Los reclamos aprobados reservan el incentivo en el ledger.
>
> **4.** Se crea una orden de pago con clave de idempotencia y aprobación de operador.
>
> **5.** La conciliación marca acreditación o error según comprobante de PSP o de marca.

# 6. Requisitos funcionales y criterios de aceptación

| **ID**    | **Requisito**           | **Criterio de aceptación**                                                               |
|-----------|-------------------------|------------------------------------------------------------------------------------------|
| **RF-01** | Crear y editar campañas | Presupuesto \>0; fecha inicio/fin; límites; SKU; locales; estado borrador/activa/cerrada |
| **RF-02** | Alta de comercios       | Invitación, operador, teléfono, dirección comercial y estado aprobado                    |
| **RF-03** | Publicar ofertas        | Landing móvil con reglas, premio, ubicación y fecha visibles                             |
| **RF-04** | Presentar compra        | Reclamo con ID, timestamp, comercio y evidencia; recibe acuse                            |
| **RF-05** | Verificación            | Bloquea duplicados obvios, producto no elegible y exceso de límites                      |
| **RF-06** | Revisión humana         | Permite aprobar/rechazar con motivo y actor de la decisión                               |
| **RF-07** | Recompensa              | Ledger reserva, libera o anula; nunca acredita dos veces la misma claim                  |
| **RF-08** | Conciliación            | Exporta órdenes y consume confirmación de pago; estados trazables                        |
| **RF-09** | Tablero marca           | Muestra redenciones por fecha/comercio, gasto y pendiente, sin revelar PII               |
| **RF-10** | Soporte y disputa       | Operador puede abrir caso, pausar pago y resolver con auditoría                          |

# 7. Requisitos no funcionales

| **Área**           | **Criterio mínimo**                                                                   |
|--------------------|---------------------------------------------------------------------------------------|
| **Seguridad**      | RBAC por marca/comercio/operador; secretos fuera de repositorio; auditoría de cambios |
| **Privacidad**     | Minimización, cifrado, consentimientos y no exposición de tickets a marcas            |
| **Fiabilidad**     | Idempotencia de reclamos/pagos, reintentos seguros y reconciliación diaria            |
| **Experiencia**    | Formulario accesible en móvil; estados y errores comprensibles                        |
| **Operación**      | Exportación CSV, filtros de reclamos y trazabilidad por ID                            |
| **Escala**         | 100–300 reclamos piloto sin optimización prematura; workers para tareas lentas        |
| **Observabilidad** | Logs estructurados, métricas de latencia/error y alertas de pagos fallidos            |

# 8. Verificación de compras y antifraude

No se considera suficiente un ticket de POSNET con solo importe; para promociones por SKU se requiere evidencia del artículo. Tampoco se asume que zkTLS sea aplicable a compras presenciales sin fuente digital del detalle.

| **Nivel**          | **Fuente**                                                             | **Regla de tratamiento**                                      |
|--------------------|------------------------------------------------------------------------|---------------------------------------------------------------|
| **A · Más sólida** | Integración POS o comprobante digital detallado de fuente confiable    | Aprobar por reglas si coincide SKU y no hay señales de fraude |
| **B · Media**      | Ticket con renglones + validación de formato + comparación con campaña | Revisión automatizada y muestreo manual                       |
| **C · Riesgosa**   | Declaración de comprador + confirmación del comercio                   | Revisión adicional, límites estrictos y auditoría aleatoria   |
| **Insuficiente**   | Monto de tarjeta/QR sin artículos                                      | No aprobar promoción por SKU sin evidencia complementaria     |

## 8.1 Reglas P0

- Rechazar campaña cerrada, comercio no adherido, SKU no elegible o reclamo fuera de vigencia.

- Generar huella de evidencia y detectar duplicados exactos o tickets reutilizados.

- Aplicar límite por comprador, por comercio y por campaña; reservar presupuesto antes de pago.

- Detectar patrones anómalos: repetición de importe/fecha, volumen inusual por comercio y concentración de compradores.

- Enviar a revisión todo reclamo de evidencia insuficiente; registrar motivo estructurado de cada decisión.

## 8.2 Estados y transiciones

draft → submitted → under_review → approved \| rejected → payout_pending → paid \| payout_failed. Un reclamo aprobado puede pasar a disputed y, con autorización, a reversed/adjusted. Solo transiciones permitidas por reglas; cada transición genera evento de auditoría.

# 9. Arquitectura de software

> **PRINCIPIO DE DISEÑO**
>
> Monolito modular con separación clara entre dominio de campañas, verificación, libro mayor y pagos. El módulo de liquidación permite cambiar el proveedor sin alterar las reglas de negocio.

| **Capa / módulo**    | **Responsabilidad**                          | **Tecnología sugerida**    |
|----------------------|----------------------------------------------|----------------------------|
| **Web / PWA**        | Landing de ofertas, reclamos, tableros       | Next.js, TypeScript        |
| **API / Auth**       | RBAC, sesiones, consentimientos, endpoints   | Node.js + Fastify/NestJS   |
| **Campaigns**        | Reglas, vigencia, presupuesto, ofertas       | Servicio de dominio        |
| **Claims**           | Recepción, estados y evidencia               | Servicio de dominio        |
| **Verification**     | OCR/validación, riesgo y revisión            | Workers + reglas           |
| **Ledger / Payouts** | Reservas, movimientos, órdenes, conciliación | PostgreSQL + adaptador PSP |
| **Storage**          | Comprobantes y archivos privados             | Object storage cifrado     |
| **Observabilidad**   | Logs, errores, alertas, informes             | Telemetry sencilla         |

## 9.1 Estructura del repositorio

apps/web (PWA y paneles); apps/api (backend); apps/worker (procesos asíncronos); packages/domain (tipos y reglas); packages/db (migraciones); packages/ui (componentes); infra/ (despliegues).

## 9.2 Diagrama de secuencia simplificado

| **Paso** | **Servicio**                 | **Resultado**                              |
|----------|------------------------------|--------------------------------------------|
| **1**    | Web → API / Claims           | Crear reclamo idempotente                  |
| **2**    | API → Object Storage         | Almacenar evidencia con acceso restringido |
| **3**    | Worker → Verification        | Aplicar reglas de fraude y elegibilidad    |
| **4**    | Operador → API               | Aprobar o rechazar reclamo dudoso          |
| **5**    | API → Reward Ledger          | Reservar saldo y crear instrucción de pago |
| **6**    | Payout Adapter → PSP / Marca | Enviar/conciliar pago                      |
| **7**    | API → Dashboard              | Actualizar estado agregado de campaña      |

# 10. Modelo de datos mínimo

| **Tabla**                         | **Campos relevantes (resumen)**                                           |
|-----------------------------------|---------------------------------------------------------------------------|
| **brands / merchants**            | id, estado, owner, contacto, consentimientos comerciales                  |
| **products / campaigns / offers** | sku, reward, eligible_store_ids, start_at, end_at, budget_cap, rules_json |
| **users / consents**              | id pseudónimo, contacto verificado, version, accepted_at                  |
| **purchase_claims**               | id, campaign_id, merchant_id, user_id, status, claimed_at, fingerprint    |
| **evidence / validation_events**  | storage_key, type, extracted_fields, risk_score, reviewer, reason         |
| **reward_ledger / payouts**       | claim_id, amount, currency, entry_type, idempotency_key, provider_ref     |
| **audit_events / support_cases**  | actor, action, timestamp, old/new state, case_reason                      |

Reglas de integridad: unique(claim_id, recompensa); unique(idempotency_key) en órdenes; claves foráneas; no eliminación física de movimientos financieros; PII separada de reporting agregado.

# 11. API mínima (propuesta)

| **Operación**                | **Ruta orientativa**                        |
|------------------------------|---------------------------------------------|
| **Crear / listar campañas**  | POST /v1/campaigns · GET /v1/campaigns      |
| **Activar campaña**          | POST /v1/campaigns/{id}/activate            |
| **Consultar ofertas**        | GET /v1/offers?merchantId=...               |
| **Crear reclamo**            | POST /v1/claims (Idempotency-Key)           |
| **Subir evidencia**          | POST /v1/claims/{id}/evidence               |
| **Revisar reclamo**          | POST /v1/claims/{id}/decision               |
| **Generar pago / conciliar** | POST /v1/payouts · POST /v1/payouts/webhook |
| **Reporte campaña**          | GET /v1/campaigns/{id}/report               |

Autorización obligatoria en cada endpoint: compradores solo sus reclamos; comercios solo su actividad; marcas solo datos de sus campañas; operadores con privilegios auditados.

# 12. Backlog priorizado por entregables

| **Etapa**                 | **Historias / tareas**                                           | **Criterio de salida**                           |
|---------------------------|------------------------------------------------------------------|--------------------------------------------------|
| **Pre-MVP (sem. 1–4)**    | Marca financiadora, acuerdos, campaña concierge, medición manual | Un presupuesto real y costo por reclamo conocido |
| **Sprint 1 (sem. 5–6)**   | Auth, modelos, campañas, comercios, landing promociones          | Campaña creada y visible en móvil                |
| **Sprint 2 (sem. 7–8)**   | Reclamos, evidencia, reglas básicas, panel revisión              | Compra procesable sin planilla manual            |
| **Sprint 3 (sem. 9–10)**  | Ledger, pagos/exportación, conciliación, dashboard               | Trazabilidad desde compra hasta beneficio        |
| **Sprint 4 (sem. 11–12)** | QA, seguridad, observabilidad, piloto repetido                   | Marca puede evaluar y decidir repetir            |

# 13. Plan de pruebas y aceptación final

| **Prueba**                              | **Resultado esperado**                                |
|-----------------------------------------|-------------------------------------------------------|
| **Campaña sin presupuesto confirmado**  | No puede activarse                                    |
| **Mismo ticket enviado dos veces**      | Segundo reclamo se bloquea o revisa                   |
| **Producto o comercio ajeno a campaña** | Reclamo no elegible                                   |
| **Compras cerca del tope**              | No se supera el presupuesto por carreras concurrentes |
| **Webhook de pago duplicado**           | Un solo registro de acreditación                      |
| **Payout fallido**                      | Permanece pendiente/reintentable, sin marcar pagado   |
| **Marca consulta reportes**             | Solo ve información autorizada y agregada             |
| **Cancelación / reversa**               | Ledger registra asiento compensatorio y auditoría     |
| **Operador bloquea reclamo**            | Se detiene envío de pago                              |

# 14. Métricas y cuadro de mando

- B2B: marcas contactadas, conversión a campaña pagada, ticket por campaña, tasa de repetición.

- Operación: reclamos enviados/aprobados, costo por validación, tiempo de confirmación en comercio, tiempo de pago, disputas.

- Calidad: duplicados, fraude detectado, falsos rechazos, intervención manual por reclamo.

- Resultado comercial: compradores nuevos, frecuencia de compra, costo por compra validada y señal de incrementalidad.

- Economía: contribución por compra, costo total de soporte y caja disponible frente a incentivos comprometidos.

# 15. Equipo, presupuesto y decisiones abiertas

| **Responsable**                  | **Trabajo prioritario**                            |
|----------------------------------|----------------------------------------------------|
| **Comercial / operaciones**      | Marcas, comercios, campañas, pagos y soporte       |
| **Producto / UX**                | Flujos móviles, pruebas de campo y métricas        |
| **Full-stack**                   | Frontend, API, base de datos, reglas y dashboard   |
| **Seguridad / asesoría externa** | Privacidad, pagos, contratos y revisión de riesgos |

Presupuesto: primero presupuestar el piloto concierge por separado (incentivos cubiertos por marca + operación manual). El MVP técnico requiere hosting, almacenamiento, OCR opcional, mensajería, cobro/payout, asesoría legal y trabajo del equipo; no fijar una cifra sin cotizar proveedores y alcance contractual.

> **DECISIONES QUE FALTAN**
>
> (1) Marca y producto piloto; (2) mecanismo de evidencia principal; (3) quién paga la recompensa y bajo qué contrato; (4) criterio de elegibilidad; (5) cuánto cuesta confirmar una compra; (6) soporte ante fraudes y devoluciones.

# 16. Fase 2 opcional: liquidación Web3

Solo si el piloto demuestra la necesidad de coordinar presupuestos entre actores independientes. Diseñar CampaignEscrow con roles, límites, fondos reservados, distribución por lotes, pausa y devolución. Celo/wARS es candidato de evaluación, no una dependencia del MVP. El contrato verifica reglas de gasto, pero la evidencia de la venta sigue verificándose fuera de cadena.

Puerta de entrada: un cliente pide explícitamente trazabilidad o liquidación compartida y está dispuesto a pagar por ella; existe ruta regulatoria y operativa clara; el costo es competitivo frente a una solución convencional.

# 17. Criterio Go / No-Go

> **GO**
>
> La primera campaña es financiada, 10 comercios participan, la validación opera con costos medidos, las recompensas se pagan sin incidentes graves y al menos una marca quiere repetir. El negocio deja contribución positiva por compra.

> **NO-GO / PIVOT**
>
> Nadie compra campañas, los comercios necesitan demasiado esfuerzo, no se puede verificar el SKU con costo razonable o las compras no muestran valor comercial incremental. En ese caso, no ampliar alcance ni integrar Web3: reformular nicho o modelo.

## Anexo: trazabilidad de supuestos

Los valores de recompensas, volumen piloto, tiempos de confirmación, costos fijos y precios por redención son objetivos/ejemplos para experimentar, no resultados comprobados. El proyecto se basa en el documento estratégico complementario y en la investigación previa de modelos de fidelización, datos de consumo y pagos programables. La revisión jurídica y de proveedores debe completarse antes de manejar dinero real.
