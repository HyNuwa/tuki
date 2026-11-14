# Informe de verificación: agent-data-marketplace (posicionamiento y documentos del equipo)
*Generado: 2026-11-12 | Agente V1 | Alcance: entregables de `positioning/`, `docs/17-posicionamiento.md` y la consistencia entre los documentos del equipo*

## Resumen
- **Críticos:** 0
- **Advertencias:** 14
- **Info:** 12

Fuentes contrastadas: `positioning/raw/alternative-mapping.md`, `positioning/raw/market-categories.md`, `../competitors-report.md`, `../raw/competitor-profiles.md`, las invariantes compartidas del pivote y la revisión del usuario (L6). Se verificaron todos los enlaces relativos Markdown de los 15 archivos revisados con un script: ninguno roto y ninguno apunta a archivos eliminados.

## Crítico

Ninguno. No se encontró ningún problema que pueda inducir a error en una decisión: las tablas verbatim coinciden, ningún documento presenta `exact` como escrow, ninguno afirma ser el primero ni tener demanda validada, y los números económicos coinciden donde aparecen.

## Advertencia

### A1. El conteo de alternativas no coincide con el mapa
- **Archivo:** `positioning/positioning-doc.md:17`
- **Problema:** dice "13 alternativas: 5 directas, 8 adyacentes, 3 de status quo", pero 5 + 8 + 3 = 16, y `competitive-alternatives.md` tiene 16 filas (líneas 22-26, 32-39, 45-47).
- **Corrección sugerida:** "16 alternativas (5 directas, 8 adyacentes, 3 de status quo)", o explicar qué solapamientos reducen el total a 13.

### A2. El rango del lote de 200 observaciones no cuadra con el precio diferenciado
- **Archivos:** `positioning/messaging-implications.md:11`, `docs/17-posicionamiento.md:57` frente a `docs/17-posicionamiento.md:125`
- **Problema:** el lote se describe como "~US$300-1.500 por 200 observaciones", pero la visita encargada cuesta US$5-10, así que 200 visitas suman US$1.000-2.000. El techo de US$1.500 no sale de ninguna tabla.
- **Corrección sugerida:** "US$300 (tickets) a US$1.000-2.000 (visitas encargadas)", o documentar la mezcla que da US$1.500.

### A3. Contradicción entre "precio pagado" y "precio neto" en el lenguaje recomendado
- **Archivo:** `positioning/messaging-implications.md:24` frente a `:46`
- **Problema:** la línea 24 dice que con el comprador se use **siempre** "relevamientos bajo demanda de precio **pagado**…", mientras que la línea 46 dice que se use "precio neto" en lugar de "precio pagado" en titulares. La declaración de Moore (`positioning-statement.md:10`) y la categoría usan "precio pagado"; la escalera usa "precio neto". Es la prueba específica "las palabras a usar/evitar no contradicen las declaraciones".
- **Corrección sugerida:** fijar una regla única, por ejemplo: la etiqueta de categoría lleva "precio pagado" y los titulares y el copy de venta llevan "precio neto". Reflejarla en las dos líneas.

### A4. Las cifras de RentAHuman mezclan fechas
- **Archivo:** `docs/17-posicionamiento.md:55` (también `positioning/competitive-alternatives.md:56`)
- **Problema:** "787k perfiles, 82 agentes activos (2026-02)" pone juntas una cifra de perfiles de 2026-11-12 (`raw/competitor-profiles.md:66`, contador del sitio) y una cifra de agentes de febrero de 2026. La línea 13 del mismo doc usa el par correcto, "81.000 humanos frente a 82 agentes (2026-02)".
- **Corrección sugerida:** "787k perfiles (2026-11, contador del sitio); 81.000 humanos frente a 82 agentes activos (2026-02)".

### A5. El mecanismo de Vangrid se describe de dos formas incompatibles
- **Archivos:** `positioning/competitive-alternatives.md:22`, `positioning/positioning-doc.md:111`, `docs/17-posicionamiento.md:54` (dicen "vía x402 con escrow y EAS", confianza Alta) frente a `docs/15-stack-tecnologico.md:72` y `docs/16-modelo-seguridad-verificacion-pagos.md:132` ("pago por x402 a su wallet operadora", custodial, [Pendiente: sin documentación primaria])
- **Problema:** la investigación dice que Vangrid opera con escrow; los docs técnicos dicen que su modelo es el mismo tesoro custodial que la demo. Esto afecta el argumento de que el mecanismo no diferencia y a cómo se compara la custodia.
- **Corrección sugerida:** confirmar con una fuente primaria y unificar. Si no se puede, bajar la confianza a Media en los docs de posicionamiento y citar la duda en los dos lados.

### A6. El resumen del equipo no repite la definición de producto verbatim
- **Archivo:** `docs/13-resumen-para-el-equipo.md:5-7`
- **Problema:** las invariantes exigen repetir la definición verbatim en el PRD, la arquitectura y el resumen. 03 (línea 5), 04 (línea 17) y 17 (línea 11) la citan; 13 solo tiene la frase comercial y una mención en minúscula.
- **Corrección sugerida:** agregar debajo de la frase comercial el bloque citado "**Marketplace de datos del mundo real para agentes de IA.** Los agentes pueden…".

### A7. El modelo de ingresos cita al doc 17 por algo que el doc 17 no dice
- **Archivo:** `docs/13-resumen-para-el-equipo.md:50`
- **Problema:** "La investigación sugiere sumar una suscripción liviana para el comprador humano regional ([doc 17])". El doc 17 no menciona ninguna suscripción; la idea viene de `../pricing-landscape.md:73`. Además agrega un tercer elemento al modelo que pidió el usuario ("pago por consulta y comisión por encargos").
- **Corrección sugerida:** citar `agent-data-marketplace/pricing-landscape.md` y marcarlo como opción no adoptada, o quitar la oración.

### A8. El título del doc 04 no usa la definición de producto
- **Archivo:** `docs/04-arquitectura-tecnica.md:1`
- **Problema:** el título es "marketplace de observaciones verificadas de comercio físico"; 03 y 17 usan "marketplace de datos del mundo real para agentes de IA".
- **Corrección sugerida:** "04 — Arquitectura técnica: marketplace de datos del mundo real para agentes de IA".

### A9. `aggregation_eligible` se define distinto según el documento
- **Archivos:** `docs/03-prd-mvp.md:35` ("cumple licencia, nivel y umbrales"); `docs/04-arquitectura-tecnica.md:316` ("licencia, nivel y umbrales") y `:334` ("licencia, consentimiento vigente y nivel mínimo"); `docs/16-modelo-seguridad-verificacion-pagos.md:169` e I13 `:275` ("licencia y consentimiento", sin nivel); `docs/adr/0002-verificacion-de-observaciones.md:23` ("licencia y consentimiento vigentes")
- **Problema:** la distinción de tres estados es la misma en todos lados, pero el contenido de `aggregation_eligible` varía. "Umbrales" (03, diagrama de 04) se puede leer como umbrales de privacidad, que en 16 §5.1 pertenecen a `deliverable`.
- **Corrección sugerida:** una sola definición en todos los documentos: "aceptada, con licencia que permite el uso, consentimiento vigente y nivel mínimo del producto o la tarea". Reservar "umbrales de privacidad" para `deliverable`.

### A10. Distinta cantidad de entrevistas a compradores
- **Archivos:** `docs/17-posicionamiento.md:181` ("8-10 entrevistas en paralelo a la demo ([14])") frente a `docs/14-primeros-7-dias.md:109` ("al menos 5 entrevistas" en los días 2 a 5)
- **Corrección sugerida:** en 17, "al menos 5 durante la semana de la demo y 8-10 en total antes del piloto", o alinear 14.

### A11. Dos umbrales distintos de calidad de extracción
- **Archivos:** `docs/17-posicionamiento.md:172` (K2: ≥90% en campos obligatorios sobre ≥200 tickets) frente a `docs/15-stack-tecnologico.md:139` (S3: ≥95% totales y ≥90% ítems en 100 tickets, 0 ítems inventados) y `docs/adr/0002-verificacion-de-observaciones.md:40`
- **Corrección sugerida:** explicar que S3 es la puerta técnica antes del piloto y K2 el criterio de abandono después de iterar, o unificar las muestras.

### A12. A `positioning-statement.md` le falta la sección Data Gaps
- **Archivo:** `positioning/positioning-statement.md` (las secciones terminan en Red/Yellow Flags y Sources, líneas 52-64)
- **Problema:** es la verificación universal 4.
- **Corrección sugerida:** agregar "## Data Gaps" con: ninguna declaración probada ante un comprador; el vocabulario del comprador sin entrevistas; la brecha entre precio de lista y pagado sin medir.

### A13. Faltan calificaciones de confianza por sección
- **Archivos:** `positioning/messaging-implications.md` (ninguna); `positioning/competitive-alternatives.md` (solo la de Vangrid en la línea 22); `positioning/positioning-statement.md:50` (solo la fortaleza general)
- **Corrección sugerida:** agregar "> **Confianza:**" a cada sección principal, como en `positioning-doc.md`.

### A14. Dato viejo sin marcar y fuente duplicada
- **Dato viejo:** Scanntech "3.103 PDV, 24,0%, NOA 20,1% (febrero de 2024)" tiene 33 meses y no lleva la marca "posiblemente desactualizado" en `positioning/positioning-doc.md:40`, `positioning/competitive-alternatives.md:32` ni `docs/17-posicionamiento.md:48`. Fetch 2023 sí la lleva.
- **Fuente duplicada:** `positioning/positioning-doc.md:54` presenta "iProfesional 2026-06-08; Scentia (16% más barato)" como dos evidencias, pero el dato de Scentia es una paráfrasis vía el mismo artículo de iProfesional (`competitive-alternatives.md:14`).
- **Corrección sugerida:** agregar "(posiblemente desactualizado)" a Scanntech y escribir "Scentia vía iProfesional (misma fuente)".

## Info

- I1. Cifras sin etiqueta: `positioning/positioning-doc.md:156-157` ("-5,1%", "Serie F de US$180M"), `:21-31` (tabla de alternativas), `positioning/competitive-alternatives.md:56` ("787k perfiles"), `positioning/messaging-implications.md:13` ("€10.000"), `positioning/market-category-analysis.md:73` ("US$0,3B a US$6,8B"). Agregar [Data]/[Estimate].
- I2. `positioning/messaging-implications.md:33-38`: la columna "El cliente dice" no tiene fuente y no viene de entrevistas. Etiquetarla [Assumption] y remitir a Data Gaps (línea 65).
- I3. El cliente de Moore (`positioning-statement.md:10`, "almacenes y kioscos") no repite exactamente el perfil del componente 4 (`positioning-doc.md:72`, "almacenes y autoservicios sin POS"). Unificar el texto.
- I4. El "a diferencia de" de Moore incluye el reembolso (no es uno de los atributos 1-5) y la compra vía API/MCP/x402 (atributo 5, declarado no diferencial). Es aceptable como cierre, pero no debería leerse como diferencial.
- I5. La declaración de Neumeier usa "es el único" (`positioning-statement.md:14`), mientras que `messaging-implications.md:52` pide evitar "el único" en público. La línea 54 ya lo advierte; conviene agregar "solo uso interno" junto a la declaración.
- I6. El doc 03 (líneas 78-91) no lista explícitamente zkTLS ni el sistema avanzado de recompensas como fuera de la demo; 13, 14 y 15 sí. No es contradictorio, pero es incompleto.
- I7. `docs/14-primeros-7-dias.md:26` copia en primera persona la frase del usuario ("investigaría… No esperaría"). Se pidió verbatim; si el doc debe leerse como plan del equipo, se puede poner entre comillas como cita de la revisión.
- I8. `docs/adr/0001-red-y-custodia-de-presupuestos.md:24` muestra "wARS disponible; encaja con MiniPay" como ventaja de la opción A, pero en testnet solo hay USDC y MiniPay queda fuera del hackathon. Aclarar que aplica a mainnet o al piloto.
- I9. `docs/15-stack-tecnologico.md:59,61,95` cita `x402-seller-discoverability.md`, `minipay-guide.md`, `minipay-app-fit.md` y `bulk-payouts.md` (referencias de la skill celopedia, no archivos del repositorio). Aclarar "skill celopedia" para que no parezcan enlaces rotos.
- I10. `docs/17-posicionamiento.md:4` y `positioning/positioning-doc.md:4` mencionan `agent-data-marketplace/deep-research/demanda-agentica-y-verificacion.md`, que no existe todavía (se declara en curso). Actualizar cuando se publique.
- I11. El README (en inglés, línea 5) parafrasea la definición y no dice que Modo B es el diferencial central; 13 no lista los tres conceptos. Son resúmenes, pero se puede agregar una línea a cada uno.
- I12. Los criterios de piloto se escalonan sin contradecirse: 14 (día 7: 2 compradores interesados, 1 que acepta pagar), 03:217 (2-3 compromisos escritos), 17 K1 (≥2 pilotos pagados al 2027-01-31). Conviene decir en 17 que son etapas sucesivas.

## Checklist de verificación

### Verificaciones universales y de posicionamiento
| Verificación | Resultado |
|---|---|
| Todas las afirmaciones cuantitativas etiquetadas | **Falla** (I1, I2) |
| Sin contradicciones internas | **Falla** (A1-A5) |
| Confianza consistente con la evidencia | Pasa (las calificaciones que existen están bien calibradas: Baja en el cliente, Media en la categoría) |
| Confianza presente en cada sección principal | **Falla** (A13) |
| Data Gaps en todos los entregables | **Falla** (A12) |
| Red/Yellow Flags en todos los entregables | Pasa |
| Sin dato viejo sin marcar | **Falla** (A14) |
| Sin corroboración falsa por fuente duplicada | **Falla** (A14) |
| La declaración de Moore usa el cliente del componente 4 | Pasa con observación (I3) |
| La categoría de la declaración coincide con `market-category-analysis.md` | Pasa |
| El diferencial se mapea a atributos verificados | Pasa con observación (I4) |
| El "único" de la prueba Onliness se sostiene frente a las alternativas | Pasa con condiciones (declarado como intención de diseño) |
| JTBD con evidencia en `competitive-alternatives.md` | Pasa (inferido, sin citas de compradores; declarado) |
| Jerarquía de mensajes coherente con la prioridad del posicionamiento | Pasa |
| Etiqueta de categoría consistente | Pasa |
| Palabras a usar/evitar sin contradicción con las declaraciones | **Falla** (A3) |
| Freemium consistente | Pasa ("no aplica"; ver A7 sobre la suscripción) |
| Pruebas de validación genuinas (Onliness, Moore, escalera de 8 palabras) | Pasa |

### Consistencia de los documentos del equipo
| Verificación | Resultado |
|---|---|
| Definición de producto idéntica (03, 04, 17, posicionamiento) | **Falla** (A6 en 13, A8 en el título de 04) |
| Modo B como diferencial central (03, 04, 13, 17, posicionamiento) | Pasa |
| Tres conceptos (`Contribution`→`Observation`, `DataProduct`, `Task`) en 03, 04 y 17 | Pasa |
| Distinción `accepted` / `aggregation_eligible` / `deliverable` | Pasa en estructura; **falla** en definición (A9) |
| El comprador paga solo resultados entregables + política de reembolso + reserva (03 E2, 04, 13, 16 §4.3/§5, 17, ADR 0002) | Pasa |
| Recompensa distinta del cobro x402 (03 P0-07, 04, 15, 16 §4.0, ADR 0001) | Pasa |
| Datos del facilitator de testnet (URL, solo `exact`, v1 `celo-sepolia` / v2 `eip155:11142220`, solo USDC `0x01C5…C44E`, extensiones, `X402_API_KEY`) en 15, 14, ADR 0001 y 16 | Pasa |
| `exact` nunca descrito como escrow | Pasa (todas las menciones de "escrow" se refieren a `auth-capture`, Vangrid o direcciones archivadas) |
| Alcance del hackathon consistente entre 03, 14 y 15 | Pasa con observación (I6) |
| P0-01..P0-10 verbatim frente a L6 | Pasa (10/10 filas idénticas, comparadas con script) |
| Tabla de 7 días verbatim frente a L6 | Pasa (7/7 filas idénticas) |
| Frase comercial verbatim (13, 17) | Pasa |
| Números: US$1,50 / 0,75 / 0,35 en 03, 13, 16, 17 | Pasa |
| Números: aritmética de margen y reserva en 17 (0,40 = 27%; US$588/2.700 = 22%; ~16%; CAC 5 y 13 observaciones) | Pasa |
| Números: k/m (k = 5, m = 3 como ejemplo solo en 16; `minDistinctContributors` = k en 04) | Pasa |
| Spikes S0-S6: IDs y referencias cruzadas (14→S3, 16→S1-S5, ADR 0001→S0/S1/S2/S6, ADR 0002→S3/S4/S5) | Pasa |
| Lotes de 200 observaciones / interacciones / umbrales de extracción coherentes | **Falla** (A2, A10, A11) |
| Todos los enlaces relativos resuelven | Pasa (verificado con script) |
| Sin enlaces ni referencias a archivos eliminados | Pasa |
| Sin afirmaciones de ser los primeros o de demanda validada | Pasa |
| Datos de posicionamiento (Vangrid, RentAHuman, TRM, Scanntech, SEPA) consistentes con las invariantes | **Falla** parcial (A4, A5) |

## Correcciones aplicadas (2026-11-12)

- **A1** → corregido: `positioning-doc.md` dice "16 alternativas (5 directas, 8 adyacentes y 3 de status quo)" y aclara que la tabla agrupa filas.
- **A2** → corregido: el lote de 200 observaciones queda en "US$300 (tickets a US$1,50) a US$1.000-2.000 (visitas encargadas a US$5-10)" [Estimate] en `messaging-implications.md` y `docs/17-posicionamiento.md`. La investigación cruda solo respalda US$300 (`raw/pricing-intelligence.md:125`); el techo de ~US$1.500 de `pricing-landscape.md` queda dentro del rango (ese archivo no se editó: fuera de la superficie autorizada).
- **A3** → corregido: regla única en `messaging-implications.md` y `docs/17`: "precio pagado" en la etiqueta de categoría y en el texto técnico; "precio neto" en titulares y copy de venta.
- **A4** → corregido: "787k perfiles (2026-11, contador del sitio); 81.000 humanos frente a 82 agentes activos (2026-02)" en `docs/17`; fecha agregada en `competitive-alternatives.md`.
- **A5** → corregido: ninguna fuente primaria lo resuelve (`raw/competitor-profiles.md:32-33` cita prensa: Forkast, crypto.news; "wallet operadora" no aparece en `raw/`). Redacción única en `competitive-alternatives.md`, `positioning-doc.md`, `docs/15`, `docs/16` y `docs/17`: "la prensa describe pago por x402 con escrow liberado on-chain al aceptar la entrega y reembolso total al cancelar o vencer; no se verificó con documentación primaria si los fondos quedan en un contrato de escrow o en una wallet operadora custodial". Confianza bajada a Media y agregado como Data Gap.
- **A6** → corregido: `docs/13` agrega la definición verbatim debajo de la frase comercial (la frase se mantiene).
- **A7** → corregido: `docs/13` atribuye la suscripción a `pricing-landscape.md` y la marca como opción no adoptada.
- **A8** → corregido parcialmente: el título de `docs/04` se mantiene por decisión del orquestador; la definición verbatim ya aparece cerca del inicio (sección "Qué hace el sistema").
- **A9** → corregido: definición canónica en la tabla de estados de `docs/04` ("aceptada, con licencia que permite este uso, consentimiento vigente y nivel de verificación igual o mayor que el exigido; los umbrales de privacidad se aplican al resultado `deliverable`"); diagrama de 04, `docs/03`, `docs/16` (§5 e I13) y ADR 0002 alineados.
- **A10** → corregido: `docs/17`, `positioning-doc.md` y `competitive-alternatives.md` dicen "al menos 5 durante la semana de la demo y 8-10 en total antes del piloto".
- **A11** → corregido: `docs/17` explica que S3 es la puerta técnica antes del piloto y K2 el criterio de abandono después de dos iteraciones.
- **A12** → corregido: `positioning-statement.md` tiene "## Data Gaps".
- **A13** → corregido: calificaciones "> **Confianza:**" en cada sección principal de `messaging-implications.md`, `competitive-alternatives.md` y `positioning-statement.md`.
- **A14** → corregido: Scanntech marcado "posiblemente desactualizado" en los tres archivos; Scentia citado como "vía iProfesional, misma fuente".
- **I1** → corregido: etiquetas agregadas (-5,1%, Serie F, 787k, €10.000, US$0,3B-6,8B; nota [Opinion] sobre la tabla de alternativas).
- **I2** → corregido: columna "El cliente dice" marcada [Assumption] con remisión a Data Gaps.
- **I3** → corregido: Moore (statement y doc 17) y el perfil del componente 4 dicen "almacenes, kioscos y autoservicios sin POS".
- **I4** → corregido: nota en `positioning-statement.md` de que el cierre de Moore no es diferencial.
- **I5** → corregido: Neumeier marcado "solo uso interno" en `positioning-statement.md` y `docs/17`.
- **I6** → corregido: `docs/03` agrega zkTLS (P2-06) y sistema avanzado de recompensas (P2-07) como fuera de la demo.
- **I7** → corregido: `docs/14` presenta la frase como cita textual de la revisión, sin cambiar el texto.
- **I8** → corregido: ADR 0001 aclara que wARS y MiniPay aplican a mainnet o al piloto.
- **I9** → corregido: `docs/15` aclara que son referencias de la skill celopedia, no archivos del repositorio.
- **I10** → no corregido: `deep-research/demanda-agentica-y-verificacion.md` todavía no existe; ambos documentos ya lo declaran en curso. Actualizar cuando se publique.
- **I11** → corregido: el README agrega que Modo B es el diferencial central; `docs/13` lista los tres conceptos.
- **I12** → corregido: `docs/17` explica que los criterios de compradores (14, 03, K1) son etapas sucesivas.
