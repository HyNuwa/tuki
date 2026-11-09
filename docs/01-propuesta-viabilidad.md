DOCUMENTO 01 · EQUIPO FUNDADOR

Propuesta de startup y viabilidad

Red de campañas y recompensas verificables para comercios independientes de Latinoamérica

**Versión 1.0 · 9 de noviembre de 2026**

> **DECISIÓN A TOMAR**
>
> Autorizar una validación comercial de cuatro semanas antes de invertir en el desarrollo de la plataforma completa.

*Nombre del proyecto provisional. Documento para discusión interna: hipótesis y cifras de simulación, no resultados comerciales confirmados.*

# 1. Resumen ejecutivo

**Una plataforma B2B2C donde marcas regionales financian promociones por compras elegibles, comercios independientes participan sin cambiar su sistema de cobros y consumidores reciben recompensas financiadas con presupuesto real.**

No proponemos una app que recompense cualquier ticket, una nueva billetera QR ni una base de datos generalista. Proponemos una herramienta para ejecutar campañas pequeñas, medir su rendimiento y conciliar incentivos con transparencia.

> **TESIS**
>
> La oportunidad no es digitalizar tickets por sí mismos, sino hacer que promociones medibles sean accesibles para marcas y distribuidores que operan a través de comercios pequeños, sin requerir integraciones POS complejas.

# 2. Problema, cliente y segmento inicial

| **Actor**                         | **Problema actual**                                 | **Propuesta**                                              |
|-----------------------------------|-----------------------------------------------------|------------------------------------------------------------|
| **Marca regional / distribuidor** | Promociones difíciles de ejecutar y medir por local | Campañas acotadas, presupuesto claro y compras verificadas |
| **Comercio independiente**        | Poco tiempo y baja disposición a instalar otro POS  | Participación desde web/WhatsApp y sin reemplazar cobros   |
| **Comprador**                     | Pocas recompensas útiles en compras habituales      | Descuento o reembolso comprensible en pesos                |

Segmento de entrada: marcas de productos envasados y de compra frecuente que venden en almacenes, despensas o pequeños autoservicios del NOA argentino. Se excluyen del arranque productos artesanales únicos, marketplaces amplios y consumidores sin una campaña activa.

# 3. Propuesta de producto

> **1.** La marca define productos, locales, vigencia, recompensa y presupuesto máximo de una campaña.
>
> **2.** El comercio exhibe la promoción y facilita una prueba de compra sin modificar su terminal de pago.
>
> **3.** El comprador paga con medios habituales y carga la evidencia mediante una web móvil.
>
> **4.** El sistema aplica controles de elegibilidad, duplicados y fraude; los casos dudosos se revisan.
>
> **5.** Un proveedor autorizado o la marca realiza el pago; la plataforma concilia incentivos y produce un reporte.

Ejemplo ilustrativo: campaña de 14 días en 10 comercios para 300 compras de un producto regional. La marca solo paga por operaciones que cumplen reglas previamente acordadas. No se promete que cada compra sea incremental.

# 4. Diferenciación y competencia

| **Referente**             | **Qué demuestra**                                             | **Qué no debemos copiar**                             |
|---------------------------|---------------------------------------------------------------|-------------------------------------------------------|
| **Scanntech / NielsenIQ** | Hay demanda de inteligencia sobre consumo y canal tradicional | Competir por el mayor volumen de datos o cobertura    |
| **Gelt / Ibotta**         | Existen campañas de recompensas financiadas por marcas        | Construir una app masiva antes de conseguir pagadores |
| **Crush Rewards**         | Es atractivo incentivar actividades de compra cotidianas      | Emitir un token antes de validar ingresos externos    |
| **Decal / Blackbird**     | Los comercios valoran recurrencia y relaciones con clientes   | Suponer que DeFi o tokens financian descuentos        |

Apuesta competitiva a validar: atención comercial local, campañas de bajo volumen y verificación adaptada a puntos de venta heterogéneos. Ninguno de esos atributos constituye una barrera de entrada hasta conseguir acuerdos y repetición comercial.

# 5. ¿Por qué podría ser un negocio?

Modelo propuesto: la marca paga una tarifa fija de lanzamiento más un precio por compra elegible validada. De ese presupuesto salen recompensa al comprador, incentivo al comercio, verificación y comisión de la plataforma. No vendemos datos personales identificables como fuente primaria de ingresos.

| **Supuesto por compra**          | **Conservador** | **Base** | **Favorable** |
|----------------------------------|-----------------|----------|---------------|
| **Cobro a marca (USD eq.)**      | 1,00            | 1,50     | 2,00          |
| **Recompensa comprador**         | 0,60            | 0,60     | 0,60          |
| **Incentivo comercio**           | 0,15            | 0,15     | 0,15          |
| **Validación + soporte + pagos** | 0,35            | 0,30     | 0,25          |
| **Contribución por compra**      | −0,10           | 0,45     | 1,00          |

Simulación, no proyección. Con una comisión de lanzamiento de USD 100 y costos fijos de USD 600/mes, el caso base requeriría aproximadamente 1.112 compras elegibles al mes para cubrir ese gasto fijo. No incluye sueldos completos, impuestos ni costos legales extraordinarios.

> **RIESGO ECONÓMICO CRÍTICO**
>
> Que el costo total de adquisición y verificación de una compra sea mayor que lo que una marca regional está dispuesta a pagar, especialmente si una proporción alta de las compras hubiera ocurrido sin promoción.

# 6. Viabilidad de producto y tecnología

La primera versión es técnicamente abordable con un monolito modular: PWA, panel de comercios, panel de marcas, backend TypeScript, PostgreSQL, almacenamiento seguro de comprobantes, workers y conciliación de pagos. No requiere entrenar modelos de IA ni construir blockchain desde el día uno.

El problema de ingeniería más importante es validar la realidad y elegibilidad de las compras: un comprobante de terminal puede indicar importe y comercio sin detalle de productos; el QR fiscal tampoco resuelve por sí solo la identificación del SKU. Se necesitan evidencias combinadas, límites y revisión manual.

# 7. Papel de Web3: hipótesis, no requisito de salida

La funcionalidad Web3 con mejor encaje sería un presupuesto promocional con reglas de liquidación públicas o verificables entre empresas independientes (p. ej., escrow de campaña y distribución de recompensas). La cadena podría registrar autorizaciones y pagos; los tickets y datos personales deben permanecer fuera.

- Fase 1: pagos convencionales en ARS mediante participantes autorizados y libro mayor interno auditable.

- Fase 2, condicionada: contrato CampaignEscrow sobre Celo, usando wARS si la ruta operativa y jurídica es viable.

- No utilizar token propio, NFTs, rendimiento DeFi, ni zkTLS como solución universal para compras presenciales.

# 8. Regulación, privacidad y operación

Antes de pagar recompensas reales se necesita revisar bases legales de promociones, protección de datos (Ley argentina 25.326), obligaciones fiscales, términos de la relación marca-comercio y responsabilidades del proveedor de pagos. Si se realizan actividades con activos virtuales por cuenta de terceros, se debe analizar el encuadre regulatorio CNV/PSAV. Esta planificación no reemplaza asesoría legal.

Principio de diseño: no custodiar fondos de terceros ni publicar tickets o datos identificables en blockchain durante el MVP. La información compartida con marcas será agregada y acotada a la campaña, con permisos y plazos definidos.

# 9. Plan de validación de 12 semanas

| **Tramo**     | **Objetivo**                                          | **Entregable / puerta de decisión**                  |
|---------------|-------------------------------------------------------|------------------------------------------------------|
| **Sem. 1–2**  | Entrevistar ≥12 marcas/distribuidores y ≥15 comercios | Una campaña con presupuesto y condiciones concretas  |
| **Sem. 3–4**  | Piloto concierge sin producto completo                | Costo real por compra y feedback de usuario/comercio |
| **Sem. 5–8**  | Construir MVP mínimo                                  | PWA + campañas + evidencia + conciliación            |
| **Sem. 9–12** | Repetir campaña con una marca pagadora                | Renovación o segunda contratación; margen medido     |

# 10. Criterios para continuar o detener

- Al menos una marca paga un piloto y existe señal de segunda campaña o renovación.

- Diez comercios aceptan operar sin reemplazar su POS, con confirmación simple y baja fricción.

- Costo variable, fraude y soporte dejan contribución positiva por redención.

- Las marcas observan una mejora comercial relevante, idealmente ventas incrementales frente a grupo comparable.

- El tratamiento de fondos y datos puede ejecutarse conforme a las exigencias legales aplicables.

# 11. Riesgos y respuesta

| **Riesgo**                          | **Nivel** | **Acción inicial**                                    |
|-------------------------------------|-----------|-------------------------------------------------------|
| **No hay compradores B2B**          | Crítico   | Conseguir marca pagadora antes de desarrollo          |
| **No se demuestra incrementalidad** | Crítico   | Comparación entre locales/periodos                    |
| **Fraude o colusión**               | Alto      | Límites, controles cruzados, auditoría y revisión     |
| **Fricción en comercios**           | Alto      | Flujos de menos de 20 segundos; observación de campo  |
| **Competencia establecida**         | Alto      | Enfocar pequeño nicho, no agregación de datos general |
| **Regulación de pagos/cripto**      | Alto      | Proveedor regulado y revisión legal temprana          |

# 12. Acuerdo que se propone al equipo

> **DECISIÓN DE ESTA REUNIÓN**
>
> Aprobar 4 semanas para validación comercial y operativa; nombrar un responsable comercial, uno de producto y uno técnico; elegir 1 categoría de producto; conseguir 1 marca financiadora y 10 comercios antes de invertir en una solución Web3.

No aprobar todavía: token, despliegue de smart contracts de dinero real, app nativa, integraciones POS masivas ni presupuesto de marketing de adquisición a escala.

## Notas y fuentes de trabajo

El documento resume la investigación previa del equipo sobre Decal, Crush Rewards, Sup Wallet y PayPerCard, junto con el análisis posterior sobre Scan-to-Earn, el canal tradicional y las campañas de recompensas. Referencias para contrastar: usedecal.com · crushrewards.app · heysynthia.ai · ibotta.com · scanntech.com · argentina.gob.ar/aaip · arca.gob.ar · argentina.gob.ar/cnv.
