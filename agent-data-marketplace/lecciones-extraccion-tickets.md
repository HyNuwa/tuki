# Extracción de tickets en producción: qué aprendemos de Fetch, Ibotta, Ramp, Expensify y las dApps X2Earn

**Fecha:** 2026-11-13 · **Fuente:** análisis externo aportado por el equipo (resumen con fuentes secundarias en su mayoría). Solo se verificó en fuente primaria lo indicado abajo.

**Alcance:** aprendizajes para el spike S3 (extracción) y el pipeline de ingesta. **No cambia el P0, que sigue congelado.**

## 1. Qué está verificado

| Afirmación | Estado |
|---|---|
| Gemini 3.1 Flash-Lite cuesta US$0,25 por millón de tokens de entrada (texto o imagen) y US$1,50 de salida; Batch tiene 50 % de descuento. Gemini 3.5 Flash-Lite: US$0,30 / US$2,50 | [Verificado en fuente]: [precios de Gemini API](https://aistudio.google.com/docs/pricing), consultado el 2026-11-13 |
| Estimación propia: ~1.500 tokens de entrada (imagen + instrucciones) y ~500 de salida por ticket → ~US$1,10 cada 1.000 tickets, ~US$0,55 en Batch. El análisis externo dice ~US$0,73 | [Inferencia]: el número de tokens por imagen hay que medirlo en el S3 |
| El QR fiscal de ARCA trae emisor, punto de venta, tipo y número de comprobante, fecha, importe y CAE, pero no ítems | Ya verificado en el doc 16, §2 (especificación ARCA) |
| Prácticas de Fetch (modelos propios + resolución de entidades con Sentence Transformers), Ibotta (Scandit + revisión humana), Ramp (Azure Document Intelligence + LLM fine-tuneado, −34 % de revisión manual), Expensify (98,6 % declarado), 73 % de capturas fallidas según Veryfi, precios de Veryfi, Tabscanner, Taggun, Textract y Mistral | [Pendiente: fuente externa no verificada] |

## 2. Lo que ya teníamos y sale confirmado

- **Leer el QR fiscal antes que el OCR.** Resuelve emisor, fecha e importe con exactitud y sin costo; el OCR solo hace falta para los ítems (doc 15, doc 16 §2 capa L1).
- **`sha256` + `pHash`** para detectar el mismo ticket subido dos veces o recortado (doc 04, Política de integridad; doc 16 §3).
- **Reconciliación aritmética:** suma de ítems = total = `importe` del QR (doc 15; doc 16 R3).
- **LLM de visión con salida JSON por esquema** como motor del MVP: es la opción más barata por ticket por uno o dos órdenes de magnitud frente a las APIs especializadas (doc 15).
- **Revisión manual para los casos dudosos** (doc 04, componente Revisión manual). Todos los referentes la mantienen.
- **Las recompensas atraen granjas de cuentas:** las dApps X2Earn combinan verificación del ticket con anti-sybil, igual que nuestro spike S7.

## 3. Lecciones nuevas

| # | Lección | Implicancia para nosotros | Dónde |
|---|---|---|---|
| E1 | Los LLM multimodales igualan al OCR dedicado con buena resolución y pierden precisión con fotos borrosas o de baja resolución [Pendiente: fuente no verificada] | El set del S3 tiene que incluir fotos borrosas, inclinadas y con reflejos, y medir la precisión por tramo de calidad, no solo el promedio. Si falla en fotos malas, probar recorte y corrección de perspectiva antes del LLM | S3 |
| E2 | **Filtrar la calidad antes de subir** ahorra cómputo y reintentos. Las apps nativas usan ML Kit Document Scanner o SDKs pagos | Nuestra app es web (PWA). ML Kit es nativo de Android, así que no aplica directo. Equivalente web: lectura del QR en el navegador y un control simple de nitidez antes de subir [Inferencia] | S3, después del P0 |
| E3 | **Resolución de entidades:** los tickets térmicos abrevian mucho ("LCHE ENT 1L"). Fetch normaliza contra un catálogo canónico con embeddings y búsqueda vectorial | La normalización de productos contra SEPA (doc 15) es un problema distinto de la extracción y hay que medirlo aparte: % de líneas bien asignadas al producto correcto. Embeddings + búsqueda vectorial es un candidato | S3 |
| E4 | **Forense de metadatos:** la falta de EXIF de cámara delata capturas de pantalla o tickets generados | **Hay tensión con el doc 16, §3**, que manda borrar el EXIF en el cliente antes de subir. Para no perder la señal: calcular en el cliente (o en el servidor antes de descartarlo) un indicador como "tiene EXIF de cámara", guardar solo ese booleano y borrar el resto [Pendiente: decisión] | Doc 16 §3 |
| E5 | **Alerta de casi duplicado:** si 3 de 4 campos (comercio, fecha, número, monto) coinciden con un envío previo | Para tickets con QR la clave fiscal ya es exacta. Sirve para tickets sin QR o con QR ilegible, que hoy solo tienen `pHash` | Doc 16 §3, candidato |
| E6 | **Medir la tasa de revisión manual** como métrica de producto (Ramp la usa para evaluar mejoras) | Agregar al S3: % de tickets que van a revisión y tiempo de revisión por ticket. Determina el costo operativo real por observación | S3 |
| E7 | Pipeline propio (PaddleOCR o Tesseract en un VPS) solo conviene a escala masiva (más de 500.000 tickets por mes) | No aplica ahora. Confirma no entrenar modelos propios en el MVP | — |

## 4. Qué no adoptamos

- **APIs especializadas en tickets (Veryfi, Tabscanner, Taggun):** según el análisis cuestan US$40-80 cada 1.000 tickets, contra ~US$1 del LLM. Con recompensas de centavos no cierran. Quedan como plan B si el S3 falla.
- **Scandit para códigos de barras:** los tickets argentinos no traen código de barras por ítem; el único código útil es el QR fiscal, que se lee gratis.
- **zkTLS:** ya figura como experimento opcional (doc 15), solo para facturas web.

## 5. Propuestas para el S3 (a decidir por el equipo)

El S3 hoy mide totales e ítems en 100 tickets reales (doc 15). Propuesta de agregados, sin cambiar sus criterios de éxito actuales:

1. Estratificar el set por calidad de foto (nítida, borrosa, inclinada, con reflejo) y reportar la precisión por tramo (E1).
2. Medir aparte la normalización contra SEPA (E3).
3. Medir la tasa de revisión manual y el costo real por ticket con tokens medidos (E6 y §1).
4. Resolver la tensión del EXIF antes de construir la ingesta (E4).
