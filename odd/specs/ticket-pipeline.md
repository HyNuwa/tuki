# Spec: pipeline de tickets con PP-OCRv6 + GLM-OCR

Nov 16, 2026 · @Maximus

## 1. Objetivo y alcance

El pipeline convierte la foto de un ticket de compra en un registro estructurado (comercio, comprobante, ítems, totales) para un dataset que consumen agentes. Es automático de punta a punta: cada ticket recibe un puntaje de calidad de extracción y ese puntaje decide si entra al dataset. No hay revisión humana.

**Dentro del alcance**

- Filtrar fotos inservibles antes de gastar cómputo.
- Extraer cabecera, ítems y totales con un esquema JSON fijo, igual para todos los países.
- Anclar cada dato extraído al texto y a la región de la imagen de donde salió.
- Calcular un puntaje de calidad de 0 a 1 y aceptar o rechazar el ticket según un umbral.
- Emitir un registro normalizado por cada ticket aceptado, sin datos personales.
- Leer el QR fiscal cuando existe, como dato adicional. No condiciona la aceptación.
- Aislar todo lo que depende del país en un módulo por país (sección 12). Esta versión implementa solo Argentina.

**Fuera del alcance**

- Revisión o corrección manual de tickets.
- Verificar la autenticidad fiscal del comprobante: ni el CUIT ni el QR deciden la aceptación, y no hay constatación online contra ARCA.
- Entrenamiento o fine-tuning de modelos.
- Registro on-chain y lógica de la dApp.

## 2. Principios: quién hace qué

Los dos modelos leen la misma imagen por separado y el código cruza sus resultados. GLM-OCR no recibe el texto de PP-OCRv6: su entrada es solo imagen + prompt.

| Componente | Hace | No hace |
| --- | --- | --- |
| PP-OCRv6 (PaddleOCR 3.7.0) | Lee el texto literal y devuelve cada línea con su caja y su confianza. Es la evidencia. | No interpreta qué significa cada línea. |
| GLM-OCR (0,9B) | Interpreta la imagen y completa el esquema JSON fijo: qué es el total, qué es un ítem, etc. | No da coordenadas. Puede inventar valores, por eso nunca se le cree sin anclaje. |
| Código determinista | Normaliza, ancla cada valor del JSON al texto de PP-OCRv6, valida, calcula el puntaje y decide. | No parsea tickets con reglas por formato ni corrige valores por su cuenta. |
| QR fiscal del país (opcional) | Cuando existe, aporta los datos oficiales del comprobante como metadato. | No trae ítems y no influye en el puntaje. |

**Reglas que no se negocian**

1. Un valor solo cuenta como verificado si aparece en el texto de PP-OCRv6. Como nadie revisa los tickets, este cruce es el único control contra valores inventados.
2. El estado final de un ticket es «Aceptado», «Rechazado» o «Error de procesamiento», y lo decide solo el puntaje de la sección 8.
3. El identificador fiscal y el QR son opcionales: se registran si están, pero su ausencia o invalidez no baja el puntaje ni rechaza el ticket.
4. Lo que el pipeline no entendió se registra y baja el puntaje, no se descarta en silencio.
5. El código nunca reemplaza un valor de GLM-OCR por otro: si hay discrepancia, se guardan ambos y el campo queda marcado.
6. Mismo archivo + mismas versiones = misma salida y mismo puntaje. La decodificación de GLM-OCR es determinista (sin muestreo).

## 3. Flujo general

Un ticket pasa por diez etapas en serie, de a un ticket por vez. Las etapas 4 y 5 leen la misma imagen preprocesada; corren una después de la otra para no superar la RAM.

1. **E0 Ingesta**: guardar el archivo original y encolar el trabajo.
2. **E1 Filtros de imagen**: descartar lo ilegible o duplicado.
3. **E2 Preproceso**: enderezar y recortar el ticket.
4. **E3 QR**: decodificar el QR fiscal del país, si existe (opcional).
5. **E4 PP-OCRv6**: texto + cajas (evidencia).
6. **E5 GLM-OCR**: JSON con el esquema fijo.
7. **E6 Normalización**: importes, fechas e identificador fiscal a formato canónico, según el país.
8. **E7 Anclaje**: cruzar cada valor del JSON con las líneas de PP-OCRv6.
9. **E8 Validaciones**: reglas deterministas de consistencia.
10. **E9 Puntaje y ensamblado**: calcular el puntaje, decidir «Aceptado» o «Rechazado» y emitir el registro del dataset.

Si E4 no logra leer el ticket, E5 no se ejecuta: no tiene sentido pagar el modelo caro sobre una imagen ilegible.

## 4. Etapas en detalle

Cada etapa tiene una entrada, una salida y un comportamiento definido ante fallos. Todos los umbrales son configurables; los valores indicados son puntos de partida a calibrar con las fotos reales.

**E0 Ingesta**

- Entrada: archivo subido por el usuario (JPEG, PNG, HEIC) y el país del ticket, en código ISO de dos letras. El país lo declara quien sube la foto o sale de la configuración de la app; el pipeline no lo adivina.
- Hace: calcula SHA-256, guarda el original sin modificar, crea el ticket y un trabajo en la cola.
- Salida: `ticket_id`, país, ruta del original, hash.
- Fallo: archivo no decodificable o formato no soportado → «Error de procesamiento» (`archivo_invalido`). País sin módulo implementado → «Error de procesamiento» (`pais_no_soportado`).
- Idempotencia: si el SHA-256 ya existe, no se crea un trabajo nuevo; se devuelve el ticket existente.

**E1 Filtros de imagen** (OpenCV, sin modelos)

- Resolución mínima: lado corto ≥ 600 px.
- Nitidez: varianza del Laplaciano sobre la imagen en grises por encima del umbral.
- Duplicado visual: hash perceptual contra los tickets existentes; coincidencia → se agrega la marca `posible_duplicado` y se sigue.
- Fallo: resolución o nitidez insuficiente → «Error de procesamiento» (`imagen_ilegible`), con el motivo visible para el usuario, que puede subir otra foto.

**E2 Preproceso**

- Hace: aplica la orientación EXIF, detecta el contorno del ticket, corrige perspectiva e inclinación y recorta.
- Salida: imagen preprocesada + la transformación aplicada, para poder llevar cualquier caja de vuelta a coordenadas del original.
- Fallo: si no se detecta el contorno, se usa la imagen original con solo la corrección EXIF. No es un error.

**E3 QR fiscal**

- Hace: busca y decodifica códigos QR en la imagen original y le pasa el contenido al módulo del país, que sabe interpretarlo (en Argentina, el QR de ARCA).
- Salida: `qr = null` o un objeto con los datos del comprobante que ese país codifique (fecha, identificador fiscal del emisor, número de comprobante, importe, código de autorización).
- Fallo: QR ausente, ilegible o que el módulo no reconoce → `qr = null` y se sigue. Nunca es un error.

**E4 PP-OCRv6: la evidencia**

- Entrada: imagen preprocesada.
- Salida: lista de líneas en orden de lectura, cada una con `line_id`, `text`, `box` (polígono de 4 puntos), `score` y, si está disponible, las cajas por carácter.
- Fallo: cero líneas, o confianza media por debajo del umbral (inicial 0,6) → «Error de procesamiento» (`texto_ilegible`). No se ejecuta E5.

**E5 GLM-OCR: la interpretación**

- Entrada: imagen preprocesada + el prompt de la sección 5. Nada más.
- Salida: texto crudo del modelo, que se guarda tal cual, y luego se parsea como JSON y se valida contra el esquema.
- Reintento: si el JSON es inválido o no cumple el esquema, se reintenta una vez.
- Fallo: segundo intento inválido → «Error de procesamiento» (`extraccion_invalida`). Las líneas de E4 se conservan y se muestran.
- Límite: tope de tokens de salida y timeout por inferencia; superarlos cuenta como intento fallido.

**E6 a E8** se especifican en las secciones 6 y 7.

**E9 Puntaje y ensamblado**

- Hace: calcula el puntaje y fija el estado según la sección 8, persiste todos los artefactos de la sección 9 y, si el ticket fue aceptado, emite su registro del dataset.
- Salida: ticket en «Aceptado» o «Rechazado», con su puntaje y sus subpuntajes.

## 5. Esquema JSON v1 y prompt de GLM-OCR

GLM-OCR devuelve siempre el mismo objeto, con todos los valores como texto literal, tal como están impresos en el ticket. El modelo no normaliza ni calcula: eso lo hace el código, y el texto literal es lo que permite el anclaje.

```json
{
  "comercio": {
    "razon_social": "",
    "id_fiscal": "",
    "domicilio": ""
  },
  "comprobante": {
    "tipo": "",
    "letra": "",
    "punto_venta": "",
    "numero": "",
    "fecha": "",
    "hora": "",
    "codigo_autorizacion": ""
  },
  "items": [
    {
      "descripcion": "",
      "cantidad": "",
      "precio_unitario": "",
      "importe": ""
    }
  ],
  "totales": {
    "subtotal": "",
    "descuentos": "",
    "impuestos": [
      { "nombre": "", "importe": "" }
    ],
    "total": ""
  },
  "pago": {
    "forma": ""
  }
}
```

**Reglas del esquema**

- Identificador de versión: `ticket.v1`. Se guarda junto a cada resultado.
- El esquema es el mismo para todos los países. Los nombres de campo son genéricos: `id_fiscal` es el CUIT en Argentina, y `codigo_autorizacion` es el CAE. `letra` y `punto_venta` quedan vacíos donde el país no los usa.
- `impuestos` es una lista porque cada país tiene impuestos distintos; cada elemento lleva el nombre tal como está impreso (IVA, Imp. Internos, etc.).
- Un dato que no está en el ticket va como cadena vacía, y una lista sin elementos va vacía. Nunca se omite una clave.
- `items` puede tener cualquier cantidad de elementos, en el orden en que aparecen impresos.
- Claves extra o tipos distintos de texto hacen inválida la respuesta (cuenta como intento fallido en E5).

**Prompt**

El modo de extracción de GLM-OCR exige una instrucción fija seguida del esquema. El prompt es exactamente:

```text
请按下列JSON格式输出图中信息:
<el esquema de arriba, tal cual>
```

El prompt se guarda en el repositorio como un archivo versionado, no como una cadena armada en código. Cualquier cambio de prompt o de esquema crea una versión nueva y obliga a correr el set de regresión (sección 10).

## 6. E7 Anclaje

El anclaje busca cada valor del JSON de GLM-OCR dentro de las líneas de PP-OCRv6. Si lo encuentra, el campo queda verificado y hereda la caja de esa línea; si no, queda marcado. Es el único control contra valores inventados y la base del puntaje de la sección 8.

**Entrada**: el JSON validado de E5 y la lista de líneas de E4.

**Comparación**

Antes de comparar, ambos textos se pasan a mayúsculas, sin tildes y con espacios colapsados. La regla depende del tipo de campo:

| Tipo de campo | Campos | Criterio |
| --- | --- | --- |
| Numérico o identificador | `id_fiscal`, `punto_venta`, `numero`, `fecha`, `hora`, `codigo_autorizacion`, `cantidad`, `precio_unitario`, `importe`, y los importes de `totales` y de cada impuesto | Se comparan solo los caracteres alfanuméricos, sin separadores. Coincidencia exacta → `verificado`. Cualquier diferencia → `no_verificado`. No hay punto intermedio. |
| Texto | `razon_social`, `domicilio`, `descripcion`, `tipo`, `letra`, `forma`, y el nombre de cada impuesto | Similitud por distancia de edición normalizada: ≥ 0,85 → `verificado`; entre 0,60 y 0,85 → `dudoso`; menor → `no_verificado`. |

Un campo que GLM-OCR devolvió vacío queda como `faltante` y no se ancla.

**Desempate cuando un valor aparece en varias líneas**

1. Campos de `totales`: se prefiere la línea que contiene la palabra clave del campo. Las palabras clave las define el módulo del país (en Argentina: TOTAL, SUBTOTAL, IVA, DESCUENTO).
2. Campos de `comercio` y `comprobante`: se prefiere la primera aparición desde arriba.
3. Ítems: se anclan en orden, de arriba hacia abajo. La línea de un ítem no puede estar por encima de la del ítem anterior. La `descripcion` y el `importe` de un mismo ítem deben caer en la misma línea o a no más de 2 líneas de distancia.
4. Una línea ya usada por un campo numérico no se reutiliza para otro campo numérico con el mismo valor, salvo que no haya otra candidata.

**Salida por campo**

- `estado`: `verificado`, `dudoso`, `no_verificado` o `faltante`.
- `line_ids`: líneas de PP-OCRv6 que lo respaldan.
- `box`: caja en coordenadas de la imagen original (unión de las líneas; si hay cajas por carácter, solo el tramo que coincide).
- `texto_ocr`: lo que leyó PP-OCRv6 en ese lugar.
- `similitud`: valor entre 0 y 1.

**Texto no interpretado**

Las líneas de PP-OCRv6 que no quedaron asociadas a ningún campo se devuelven en `texto_no_interpretado`, con su caja. Las que contienen un importe son la señal de ítems que GLM-OCR se salteó, y bajan el subpuntaje de cobertura.

**Lo que el anclaje no hace**: no corrige el valor de GLM-OCR con el texto del OCR. En un campo `dudoso` se guardan los dos valores y el campo no cuenta como verificado.

## 7. E6 Normalización y E8 Validaciones

Estas dos etapas son código puro en `packages/domain`, sin dependencia de ningún modelo, y se prueban con tests unitarios. Las validaciones no deciden nada por sí solas: V3 y V4 alimentan el puntaje, V5 es condición para aceptar y V1, V7 y V8 son solo informativas.

**E6 Normalización**

Cada campo conserva su valor literal (`raw`) y suma un valor canónico (`valor`). Si la normalización falla, `valor` queda en `null` y el campo se marca `dudoso`.

| Dato | Regla |
| --- | --- |
| Importes | Según el formato numérico del país (Argentina: punto de miles, coma decimal; `1.234,56` → `1234.56`). Se guardan como decimal exacto, nunca como float. Se quitan el símbolo de moneda y los espacios. |
| Fecha | Según el orden de fecha del país (Argentina: `DD/MM/AA` o `DD/MM/AAAA`) → ISO `AAAA-MM-DD`. |
| Hora | `HH:MM` o `HH:MM:SS` → `HH:MM:SS`. |
| Identificador fiscal | Lo normaliza el módulo del país, que devuelve su tipo y su valor (Argentina: tipo `CUIT`, solo dígitos, 11). |
| Punto de venta y número | Solo dígitos, conservando ceros a la izquierda. |
| Cantidad | Decimal; acepta coma o punto. |
| Impuestos | Cada elemento conserva su nombre literal y normaliza su importe. |
| Moneda | No se extrae del ticket: la fija el módulo del país en código ISO 4217 (Argentina: `ARS`). |

**E8 Validaciones**

Cada una devuelve `ok`, `falla` o `no_aplica`, con un detalle legible.

| Id | Regla | Efecto |
| --- | --- | --- |
| V1 | Identificador fiscal válido según el módulo del país (Argentina: CUIT con dígito verificador módulo 11). | Informativa: se registra como `id_fiscal_valido`. |
| V2 | Fecha válida y no futura. | Si falla, la fecha queda `dudoso` y cuenta como no normalizada en completitud. |
| V3 | Por ítem: `cantidad × precio_unitario` coincide con `importe`, con tolerancia de una unidad mínima de la moneda por redondeo. Aplica solo si están los tres. | Puntaje: consistencia. |
| V4 | Suma de `importe` de los ítems menos `descuentos` coincide con `total`, con tolerancia configurable por país (Argentina, inicial: $1,00). Si en el país los impuestos se suman aparte del precio, también se suman los `impuestos`. | Puntaje: consistencia. |
| V5 | Campos mínimos presentes: `total` y al menos un ítem con descripción e importe. | Condición para aceptar. |
| V6 | El `total` está en estado `verificado`. | Si falla, el puntaje tiene tope (sección 8). |
| V7 | Cruce con el QR fiscal, si existe: los datos que ese QR traiga contra los extraídos. | Informativa: se registra como `qr_coincide`. |
| V8 | Duplicado lógico: ya existe otro ticket del mismo país con la misma fecha, hora, total y cantidad de ítems (y el mismo número de comprobante, si se extrajo). | Informativa: marca `posible_duplicado`. |

## 8. Puntaje, estados y salida

Cada ticket procesado recibe un puntaje de 0 a 1 que mide qué tan bien se extrajo y ordenó su contenido. Un ticket queda «Aceptado» cuando el puntaje alcanza el umbral, que arranca en 0,85 y se calibra con las fotos reales.

**Subpuntajes**

Cada uno va de 0 a 1. El puntaje final es la suma ponderada, redondeada a dos decimales. Los pesos son valores iniciales y viven en configuración.

| Subpuntaje | Peso | Qué mide | Cómo se calcula |
| --- | --- | --- | --- |
| Evidencia | 0,35 | Que los números extraídos existen en el ticket. | Campos numéricos no vacíos en estado `verificado`, sobre el total de campos numéricos no vacíos (importes, cantidades, precios y totales). |
| Cobertura | 0,25 | Que no se saltearon ítems. | De las líneas de PP-OCRv6 que contienen un importe, proporción que quedó asociada a algún campo. |
| Consistencia | 0,25 | Que los números cierran entre sí. | Mitad V4 (1 si pasa, 0 si falla) y mitad la proporción de ítems que pasan V3. Si V3 no aplica a ningún ítem, vale solo V4. |
| Completitud | 0,10 | Que el registro sirve como dato. | Proporción presente y normalizada de: fecha, total, razón social y, por cada ítem, descripción e importe. |
| Legibilidad | 0,05 | Calidad de la lectura de base. | Confianza media de las líneas de PP-OCRv6. |

El identificador fiscal y el QR no entran en ningún subpuntaje.

**Tope por total sin evidencia**

Si el `total` no está en estado `verificado` (V6), el puntaje final no puede superar 0,50, valga lo que valga la suma. Un total que no aparece en el texto del ticket es la señal más clara de un valor inventado.

**Estado del ticket**

| Estado | Cuándo |
| --- | --- |
| Aceptado | Cumple V5 y el puntaje es mayor o igual al umbral. Su registro entra al dataset. |
| Rechazado | El pipeline terminó, pero no cumple V5 o el puntaje quedó bajo el umbral. Lleva el puntaje, los subpuntajes y un `motivo` (`incompleto` o el nombre del subpuntaje más bajo). El usuario puede subir otra foto. |
| Error de procesamiento | Fallo en E0, E1, E4 o E5. Lleva un `motivo`: `archivo_invalido`, `pais_no_soportado`, `imagen_ilegible`, `texto_ilegible`, `extraccion_invalida` o `error_interno`. No tiene puntaje. |

Los estados de la cola (pendiente, en proceso) son internos del trabajo y no son estados del ticket.

**Estado de cada campo**

| Estado | Significado |
| --- | --- |
| `verificado` | El valor aparece en el texto de PP-OCRv6 y tiene caja. |
| `dudoso` | Coincidencia parcial o normalización fallida. |
| `no_verificado` | GLM-OCR devolvió un valor que no aparece en el texto del OCR. |
| `faltante` | GLM-OCR devolvió el campo vacío. |

**Resultado completo** (se guarda para todo ticket que llegó a E9; forma resumida)

```json
{
  "ticket_id": "...",
  "pais": "AR",
  "moneda": "ARS",
  "estado": "Aceptado",
  "puntaje": 0.93,
  "subpuntajes": {
    "evidencia": 0.97,
    "cobertura": 1.0,
    "consistencia": 0.9,
    "completitud": 0.8,
    "legibilidad": 0.88
  },
  "umbral": 0.85,
  "versiones": {
    "pipeline": "1.0.0",
    "esquema": "ticket.v1",
    "modulo_pais": "AR 1.0.0",
    "pp_ocr": "PP-OCRv6 <tier>",
    "glm_ocr": "<revisión y cuantización>"
  },
  "campos": {
    "totales.total": {
      "raw": "12.345,00",
      "valor": "12345.00",
      "estado": "verificado",
      "line_ids": ["L41"],
      "box": [[120, 1880], [610, 1880], [610, 1930], [120, 1930]],
      "texto_ocr": "TOTAL $ 12.345,00",
      "similitud": 1.0
    }
  },
  "items": [],
  "validaciones": [
    { "id": "V4", "resultado": "ok", "detalle": "" }
  ],
  "metadatos": {
    "id_fiscal": { "tipo": "CUIT", "valor": "30123456789" },
    "id_fiscal_valido": true,
    "qr": null,
    "qr_coincide": null
  },
  "marcas": [],
  "texto_no_interpretado": []
}
```

Cada campo de cada ítem lleva la misma estructura que los de `campos`.

**Registro del dataset** (solo tickets aceptados; una línea JSON por ticket)

Es la versión limpia para agentes: valores normalizados, sin cajas ni texto de OCR. Los importes y cantidades van como texto decimal con punto, las fechas en ISO y lo que falta va como `null`.

```json
{
  "ticket_id": "...",
  "esquema": "ticket.v1",
  "pais": "AR",
  "moneda": "ARS",
  "puntaje": 0.93,
  "comercio": {
    "comercio_id": "9f2c...",
    "tipo_emisor": "sociedad",
    "razon_social": "...",
    "domicilio": "...",
    "localidad": "...",
    "region": "..."
  },
  "comprobante": { "tipo": "...", "letra": "B", "punto_venta": "0004", "numero": "00012345", "fecha": "2026-11-10", "hora": "18:42:00" },
  "items": [
    { "descripcion": "...", "cantidad": "2", "precio_unitario": "1500.00", "importe": "3000.00", "verificado": true }
  ],
  "totales": {
    "subtotal": null,
    "descuentos": null,
    "impuestos": [ { "nombre": "IVA", "importe": "520.66" } ],
    "total": "3000.00"
  },
  "pago": { "forma": "..." },
  "marcas": []
}
```

En cada ítem, `verificado` es verdadero solo si su descripción y su importe quedaron anclados. Así el agente que consume el dataset puede filtrar por ítem además de por puntaje del ticket.

**Datos del comercio en el registro**

El identificador fiscal del comercio (el CUIT en Argentina) nunca sale en el registro. En su lugar va `comercio_id`, que permite agrupar tickets del mismo comercio sin revelar quién es su titular. `region` es la división de primer nivel del país (provincia en Argentina).

- `comercio_id` = `HMAC-SHA256(clave_secreta, pais + ":" + tipo + ":" + valor)` en hexadecimal, con el identificador ya normalizado (por ejemplo `AR:CUIT:30123456789`). Incluir país y tipo evita que identificadores de países distintos choquen. Solo se calcula si el identificador pasa V1; si no, va `null`.
- `tipo_emisor` lo decide el módulo del país a partir del identificador válido: `sociedad`, `persona_humana` o, si no hay identificador válido o el país no permite distinguirlo, `desconocido`. En Argentina sale del prefijo del CUIT: 30, 33 y 34 son sociedades; 20, 23, 24 y 27 son personas humanas.

| `tipo_emisor` | `razon_social` | `domicilio` | `localidad` y `region` |
| --- | --- | --- | --- |
| `sociedad` | Se incluye. | Se incluye. | Se incluyen. |
| `persona_humana` | `null`: es un nombre y apellido. | `null`: puede ser un domicilio particular. | Se incluyen. |
| `desconocido` | `null`. | `null`. | Se incluyen. |

El caso `desconocido` se trata como persona humana: sin un identificador fiscal válido no se puede saber si la razón social es un nombre propio.

**Lo que nunca entra al registro**

- Identificadores fiscales o documentos de identidad de nadie, ni el código de autorización del comprobante.
- Datos del comprador: nombre, documento, domicilio, dígitos de tarjeta o de billetera.
- Texto de OCR, cajas, `texto_no_interpretado` o cualquier campo fuera del esquema del registro.

Como control final, antes de emitir el registro se revisan los textos libres (`descripcion` de cada ítem y `forma` de pago): si alguno contiene un patrón de identificador fiscal o documento de identidad del país (en Argentina: CUIT, CUIL o DNI), o una secuencia de dígitos de tarjeta, ese campo va `null` y se agrega la marca `dato_personal_filtrado`.

## 9. Persistencia, cola y recursos

Todo corre en una VM de 4 GB de RAM sin GPU, con Postgres como única infraestructura de estado: no se agrega Redis ni otro servicio de colas.

**Qué se guarda por ticket**

- Imagen original (inmutable) y su SHA-256; imagen preprocesada y la transformación aplicada.
- Líneas completas de PP-OCRv6.
- Salida cruda de GLM-OCR de cada intento, sin tocar.
- Resultado completo: campos con su anclaje, validaciones, puntaje, subpuntajes, umbral vigente y marcas.
- Registro del dataset, si el ticket fue aceptado.
- Versiones de pipeline, esquema, prompt, pesos del puntaje y ambos modelos.
- Duración de cada etapa y RAM pico del trabajo.

Los tickets rechazados se guardan igual que los aceptados, pero no entran al dataset: sirven para calibrar el umbral y los pesos. Mientras dure la retención de la subsección de privacidad, cualquier ticket se puede reprocesar; después solo se puede volver a puntuar con pesos o umbral nuevos, a partir de los subpuntajes guardados.

**Cola**

- Una tabla `jobs` en Postgres. El worker toma trabajos con `SELECT ... FOR UPDATE SKIP LOCKED`.
- Un solo worker, concurrencia 1: un ticket por vez. Las subidas simultáneas se encolan y esperan.
- `LISTEN/NOTIFY` para despertar al worker sin sondeo constante (opcional).
- Timeout por trabajo. Un fallo de infraestructura (proceso caído, timeout) se reintenta hasta 2 veces; después, «Error de procesamiento» con `error_interno`.
- Los fallos de contenido (imagen ilegible, extracción inválida) no se reintentan a nivel de cola.

**Memoria**

- PP-OCRv6 queda cargado en el worker: su tamaño es de pocos millones de parámetros.
- GLM-OCR corre cuantizado. Si los dos modelos residentes no entran con margen, GLM-OCR se sirve en un proceso aparte y se llama por HTTP local.
- Presupuesto: el worker completo no debe superar 3 GB de RAM pico, para dejar lugar a Postgres y al sistema.

**Privacidad y retención**

Los datos internos y el dataset viven separados, y lo que puede contener datos del comprador se borra a los 30 días. Ese plazo es un valor inicial a confirmar, y el módulo de cada país puede fijar otro.

- **Separación.** Los registros del dataset están en su propia tabla. El endpoint x402 lee solo esa tabla, con un usuario de base de datos que no tiene permisos sobre las tablas internas.
- **Qué se borra a los 30 días de procesado el ticket:** imagen original, imagen preprocesada, líneas de PP-OCRv6, salida cruda de GLM-OCR y `texto_no_interpretado`. Un ticket impreso puede traer nombre, documento y dígitos de tarjeta del comprador, y esos datos quedan en todos estos artefactos.
- **Qué se conserva:** el SHA-256 y el hash perceptual de la imagen (para detectar duplicados), el resultado con puntaje y subpuntajes, y el registro del dataset.
- **Identificador fiscal crudo:** se guarda solo en el resultado interno y se borra en la misma purga. Después queda únicamente el `comercio_id`.
- **Clave del HMAC:** vive en el gestor de secretos o en variables de entorno, nunca en el repositorio ni en la base. No se rota: cambiarla cambia todos los `comercio_id` y rompe la agrupación con los registros ya emitidos.
- **Consentimiento.** No se procesa ninguna foto sin consentimiento explícito del usuario que la sube. Se guarda la versión del texto aceptado y la fecha. El texto debe decir qué se extrae, qué se vende a terceros y por cuánto tiempo se conserva la imagen.
- **Baja a pedido.** Si el usuario pide eliminar un ticket, se borran sus artefactos internos y su registro del dataset. Las copias que un agente ya compró no se pueden recuperar, y el texto de consentimiento tiene que decirlo.
- **Set de regresión.** Sus fotos quedan fuera de la purga. Solo pueden integrarlo tickets propios o de personas que lo autorizaron expresamente.

## 10. Criterios de aceptación

La implementación se da por buena cuando cumple los invariantes, pasa los tests y reporta las métricas sobre el set de regresión. El umbral de aceptación y los pesos definitivos los fija el dueño del producto después de ver la primera medición; 0,85 y los pesos de la sección 8 son valores de arranque.

**Invariantes** (un test por cada uno)

- Ningún camino del código produce un estado de ticket distinto de «Aceptado», «Rechazado» o «Error de procesamiento».
- Ningún ticket queda «Aceptado» con puntaje bajo el umbral, sin cumplir V5 o con el `total` sin verificar.
- El identificador fiscal y el QR no cambian el puntaje: el mismo ticket con y sin esos datos puntúa igual.
- Ningún registro del dataset contiene un identificador fiscal o un documento de identidad, ni claves fuera de su esquema. Se prueba con tickets de sociedad, de persona humana y sin identificador fiscal.
- Un registro con `tipo_emisor` distinto de `sociedad` tiene `razon_social` y `domicilio` en `null`.
- El mismo identificador fiscal produce siempre el mismo `comercio_id`, e identificadores distintos, o de países distintos, producen valores distintos.
- El usuario de base de datos del endpoint x402 no puede leer las tablas internas.
- Pasado el plazo de retención, no queda ninguno de los artefactos listados para purga.
- Todo campo `verificado` tiene al menos un `line_id` y una caja dentro de los límites de la imagen original.
- Toda línea de PP-OCRv6 aparece asociada a un campo o en `texto_no_interpretado`. Ninguna se pierde.
- La salida cruda de GLM-OCR se persiste aunque sea inválida.
- Reprocesar el mismo archivo con las mismas versiones da el mismo resultado y el mismo puntaje.

* Fuera de los módulos de país no hay ninguna regla propia de un país: ni formatos de número o fecha, ni palabras clave, ni validación de identificadores.
* Un ticket con un país sin módulo termina en «Error de procesamiento» con `pais_no_soportado`, sin ejecutar ningún modelo.

**Tests unitarios**

- Normalización: importes con y sin miles, fechas de 2 y 4 dígitos, CUIT con guiones y espacios.
- Validaciones: un caso `ok` y uno `falla` por regla, más los bordes de tolerancia de V3 y V4.
- Anclaje, con líneas de OCR fijas como fixture: valor exacto, valor con un dígito cambiado, valor repetido en dos líneas, ítem ausente en el JSON, texto con errores típicos de OCR.

**Set de regresión**

Las 15 fotos reales, con su resultado correcto cargado a mano. Corre completo ante cualquier cambio de modelo, cuantización, prompt, esquema o umbrales, y se le suma cada ticket que falle en producción.

**Métricas a reportar en cada corrida**

| Métrica | Cómo se mide |
| --- | --- |
| Falsos aceptados | Tickets «Aceptado» que tienen al menos un importe incorrecto frente al resultado cargado a mano. Es la métrica principal: debe tender a cero. |
| Rechazos de más | Tickets extraídos correctamente que quedaron «Rechazado». |
| Puntaje frente a exactitud real | Por ticket, el puntaje al lado de la proporción real de campos correctos. Muestra si el puntaje ordena bien los tickets. |
| Exactitud por campo de cabecera | Valor normalizado igual al correcto, por campo. |
| Ítems | Porcentaje de ítems reales recuperados y porcentaje de ítems extraídos que son correctos (descripción e importe). |
| Importes sin evidencia | Cantidad de importes en `no_verificado`, separando invención de GLM-OCR de error de lectura de PP-OCRv6. |
| JSON válido | Porcentaje de tickets con JSON válido al primer intento y tras el reintento. |
| Latencia | Mediana y máximo por etapa y total, medidos en la VM real. |
| Memoria | RAM pico del worker por ticket. |

## 11. Supuestos a confirmar antes de implementar

Esta spec se apoya en doce supuestos que nadie verificó todavía. El agente debe confirmar cada uno contra la fuente oficial o con las 15 fotos, y avisar si alguno no se cumple en lugar de improvisar una alternativa.

- [ ] **GLM-OCR lee bien español en tickets argentinos.** Usar el repositorio oficial [zai-org/GLM-OCR](https://huggingface.co/zai-org/GLM-OCR), no copias de terceros.
- [ ] **GLM-OCR completa bien la lista `items`.** El ejemplo oficial de extracción usa campos simples; no está probado con listas largas.
- [ ] **Tickets largos.** Verificar si un ticket de 40 o más ítems se trunca o se degrada. Si pasa, proponer la división de la imagen en tramos con solapamiento antes de implementarla.
- [ ] **GLM-OCR en CPU.** Definir runtime y cuantización, y medir latencia y RAM en la VM. La cifra de velocidad publicada es con GPU.
- [ ] **PP-OCRv6 cubre español** entre sus 46 idiomas de alfabeto latino, y elegir tier (small o medium) con las fotos. Ver la [documentación de PP-OCR](https://www.paddleocr.ai/latest/en/version3.x/pipeline_usage/OCR.html).
- [ ] **Cajas por carácter en PP-OCRv6.** Están anunciadas para la serie PP-OCR; confirmar que la v6 las devuelve. Si no, el recorte usa la caja de la línea.
- [ ] **Formato del QR de ARCA.** Confirmar la codificación y los nombres de los campos en la [especificación oficial](https://www.arca.gob.ar/fe/qr/), y contar cuántas de las 15 fotos traen QR.
- [ ] **Umbrales iniciales** (nitidez, confianza de OCR, similitud 0,85 y 0,60, tolerancias de V3 y V4): calibrarlos con las fotos y dejar los valores finales en configuración.

* [ ] **Pesos, umbral y tope del puntaje.** Con 15 fotos solo se puede detectar un puntaje claramente mal calibrado, no afinarlo. Reportar las métricas de la sección 10 y proponer ajustes, sin cambiarlos por cuenta propia.

- [ ] **Localidad y región.** Se derivan del domicilio extraído comparándolo con un listado oficial de localidades argentinas. Elegir la fuente y medir en las fotos cuántas veces se logra; si no se puede derivar, van `null`.
- [ ] **Marco legal.** El plazo de 30 días, el texto de consentimiento, el tratamiento del `comercio_id` y la venta del dataset deben validarse con un abogado frente a la Ley 25.326 antes de publicar el endpoint. Esta spec no reemplaza esa consulta.

* [ ] **Otros países.** Solo Argentina está especificada. Antes de sumar un país hay que confirmar con fuentes oficiales su identificador fiscal, su algoritmo de validación, cómo distingue personas de sociedades, su QR fiscal y su ley de datos personales, y verificar que PP-OCRv6 y GLM-OCR leen bien su idioma.

**Conflicto conocido con PRODUCT.md.** Esta spec define un flujo automático con estado «Aceptado». Si PRODUCT.md todavía exige «Requiere revisión» o prohíbe «Aceptado», está desactualizado: hay que corregirlo antes de implementar, por decisión del dueño del producto.

## 12. Módulo por país

Todo lo que depende del país vive en un módulo con una interfaz fija, y el resto del pipeline no contiene reglas de ningún país. Sumar un país es escribir su módulo: no se toca el esquema, el anclaje, el puntaje ni el registro del dataset. Esta versión implementa solo Argentina.

**Cómo se elige el módulo**

El país llega en E0, declarado por quien sube la foto o tomado de la configuración de la app. El pipeline no lo deduce de la imagen: tickets de países vecinos se parecen demasiado. Sin módulo para ese país, el ticket termina en `pais_no_soportado`.

**Interfaz**

| Elemento | Qué define | Lo usa | Argentina |
| --- | --- | --- | --- |
| `codigo` | País en ISO 3166-1 de dos letras. | E0, registro | `AR` |
| `moneda` | Moneda en ISO 4217 y su unidad mínima. | E6, V3, registro | `ARS`, 0,01 |
| `formato_numerico` | Separador de miles y separador decimal. | E6 | Punto y coma |
| `formato_fecha` | Orden de día, mes y año. | E6 | Día, mes, año |
| `normalizar_id_fiscal` | Del texto extraído al tipo y valor canónico, o nada si no es reconocible. | E6 | Tipo `CUIT`, 11 dígitos |
| `validar_id_fiscal` | Si el identificador es válido. | V1 | Dígito verificador módulo 11 |
| `tipo_emisor` | `sociedad`, `persona_humana` o `desconocido` a partir del identificador válido. | Registro | Prefijo 30, 33, 34 contra 20, 23, 24, 27 |
| `palabras_clave` | Términos que identifican total, subtotal, descuentos e impuestos. | E7 (desempate) | TOTAL, SUBTOTAL, DESCUENTO, IVA |
| `impuestos_incluidos` | Si los precios impresos ya incluyen impuestos. | V4 | Sí |
| `tolerancia_total` | Tolerancia de V4 en la moneda del país. | V4 | 1,00 (inicial) |
| `leer_qr` | Del contenido de un QR a los datos del comprobante, o nada si no es el QR fiscal del país. | E3, V7 | QR de ARCA |
| `patrones_dato_personal` | Patrones de identificadores y documentos a filtrar de los textos libres. | Filtro final del registro | CUIT, CUIL, DNI |
| `derivar_localidad` | Del domicilio a localidad y región, con un listado oficial. | Registro | Localidad y provincia |
| `retencion_dias` | Plazo de purga de los artefactos internos. | Sección 9 | 30 (inicial) |

**Reglas**

- Cada módulo tiene su número de versión, que se guarda con cada resultado.
- Si un país no tiene alguno de los elementos (por ejemplo, no existe QR fiscal), la función devuelve siempre vacío; no se omite.
- Si un país no permite distinguir personas de sociedades por el identificador, `tipo_emisor` devuelve siempre `desconocido` y se aplica la regla más restrictiva de privacidad.
- Un país nuevo entra con su propio set de regresión de fotos reales y su validación legal. El umbral y los pesos del puntaje son globales, pero se vuelven a medir con ese set.
