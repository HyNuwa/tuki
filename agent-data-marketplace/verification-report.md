# Verification Report: agent-data-marketplace
*Generated: 2026-11-12*

Alcance: `competitors-report.md`, `competitive-matrix.md`, `pricing-landscape.md` y los 10 archivos de `battle-cards/`, contrastados con `raw/competitor-profiles.md`, `raw/pricing-intelligence.md`, `raw/review-mining.md` y `raw/gtm-analysis.md`.

## Summary
- **Critical issues:** 1
- **Warnings:** 9
- **Info:** 8

## Critical Issues
Problemas que pueden inducir a error en una decisión. El proceso se detiene aquí para revisión del usuario.

### La muestra Radar de Scanntech (628-756 PDV) se presenta como su cobertura total en Argentina
- **File(s):** competitors-report.md, competitive-matrix.md, battle-cards/scanntech.md
- **Section:** Jugadores principales (Debilidad de Scanntech: "En AR solo 628-756 PDV"); Oportunidad 2 (evidencia); matriz, fila "Cobertura Argentina" ("Adecuado (628-756 PDV)"); battle card, "Sus debilidades" ("Muestra argentina chica: 628-756 PDV [Data]").
- **Problem:** `raw/competitor-profiles.md` (C3, Escala) indica que 628 PDV es el **panel de autoservicios de Radar (abril de 2026)**, no la cobertura total, y que Scanntech declara **más del 80% de cobertura a nivel ticket del sell-out en sus mercados, entre ellos Argentina** [Data, Latin Times]. Los entregables convierten una muestra en una debilidad de cobertura etiquetada [Data]. La evidencia de la Oportunidad 2 además compara magnitudes distintas ("628-756 PDV frente a más de 9.000M de tickets"). La misma battle card lista el 80% como fortaleza sin conciliarlo. La Oportunidad 2 y la "segunda pata del posicionamiento" (complemento en NOA y canal tradicional) se apoyan en esta lectura. La tabla de brechas del informe sí dice "solo hay muestras", lo que contradice la redacción de la tabla de jugadores.
- **Suggested fix:** Reescribir como "panel Radar de 628 autoservicios (muestra publicada); cobertura total en AR: DATA GAP; Scanntech declara más de 80% del sell-out en sus mercados". Quitar la comparación PDV contra tickets. Cambiar la celda de la matriz a "Desconocido [DATA GAP]" o "Fuerte declarado [Data, autodeclarado]". Bajar la confianza de la Oportunidad 2 a Baja hasta verificar la cobertura en NOA y añadir el 80% como evidencia en contra.

## Warnings
Problemas que bajan la calidad pero no bloquean decisiones.

### Faltan secciones de Data Gaps en 12 de 13 entregables
- **File(s):** competitive-matrix.md, pricing-landscape.md, los 10 archivos de battle-cards/
- **Problem:** Solo `competitors-report.md` tiene una sección de brechas de datos. Los demás marcan DATA GAP dentro del texto, pero no tienen la sección obligatoria. Brechas de los archivos raw que no tienen sección propia en estos entregables: fees de Agentic.Market, Sella y RentAHuman; precios por ruta de Massive; costo del facilitador de Celo; el sesgo de que la evidencia de demanda venga de vendedores.
- **Suggested fix:** Agregar un `## Data Gaps` breve en cada archivo, antes de Red Flags, que reúna los DATA GAP que ya aparecen en el texto.

### El rango de financiamiento de RentAHuman está recortado en la tabla de jugadores
- **File(s):** competitors-report.md vs. battle-cards/rentahuman.md, raw/competitor-profiles.md
- **Problem:** La tabla dice "US$0,1-0,5M (fuentes contradictorias)". La battle card, la tabla de brechas y el raw registran US$125k, US$500k **o US$12M** (StartupHub, poco fiable). La tabla omite la cifra discrepante y se ve más precisa de lo que es.
- **Suggested fix:** Escribir "US$125k-500k (US$12M en una fuente poco fiable) [Data, confianza Baja]".

### El nivel de amenaza de BeMyEye no coincide
- **File(s):** battle-cards/bemyeye.md vs. competitors-report.md
- **Problem:** La battle card dice BAJA-MEDIA. En el informe, bemyeye aparece agrupado en la fila de Field Agent con amenaza "Media".
- **Suggested fix:** Darle una fila o nota propia en la tabla de jugadores con "Baja-Media", o alinear la battle card.

### La confianza sobre Vangrid difiere entre el resumen y la battle card
- **File(s):** competitors-report.md (Resumen ejecutivo, punto 2) vs. battle-cards/vangrid.md
- **Problem:** El resumen da "confianza Alta para Vangrid" en un enunciado que incluye el seed de US$9M, mientras la battle card da Confianza Media y la tabla del informe aclara que la cifra viene solo del CEO. El mecanismo justifica Alta (varias fuentes de prensa); el financiamiento no.
- **Suggested fix:** Separar: mecanismo en producción [Data; Alta]; US$9M [Data, autodeclarado; Media].

### Confianza Media-Alta en el riesgo de demanda con fuentes de Tier 2-3 superpuestas
- **File(s):** competitors-report.md (Resumen ejecutivo, punto 4; Red Flags: "restricción probada")
- **Problem:** La evidencia combina un dato de RentAHuman de Tier 3 (2026-02), la caída de -92% y citas de vendedores x402 con interés comercial. El propio raw (review-mining) declara evidencia contraria (4.400 compradores activos) y advierte el sesgo de la fuente. "Probada" y "Media-Alta" exceden lo que esa base sostiene.
- **Suggested fix:** Bajar a Media y reemplazar "probada" por "fuertemente sugerida".

### La misma fuente se usa como corroboración independiente
- **File(s):** competitors-report.md, battle-cards/x402-bazaar-sella.md
- **Problem:** "purchases sat at zero / 65.000 sondeos", el catálogo basura con la purga de -43% y el dato contrario de 4.400 compradores provienen del mismo autor (kirothebot/ForgeMesh, dev.to). El informe los presenta junto a otros datos como señales independientes de que falta demanda.
- **Suggested fix:** Atribuir explícitamente al mismo autor y contarlo como una sola fuente.

### Datos desactualizados sin marca en el informe
- **File(s):** competitors-report.md (tabla de jugadores: Fetch "Más de 11-13M de tickets por día"; tabla de fosos)
- **Problem:** La cifra de 11M por día es de 2023 (PR Newswire); la de 13M no tiene fecha. La battle card y el raw la marcan como desactualizada; el informe no. Lo mismo pasa con "US$2-12 por tarea" de Field Agent (sin fecha) en pricing-landscape.md.
- **Suggested fix:** Agregar "(2023, posiblemente desactualizado)" y "(sin fecha)".

### Afirmaciones cuantitativas sin etiqueta
- **File(s):** competitors-report.md (columnas Fortaleza/Debilidad de la tabla de jugadores; tabla de fosos: "más de 600 CPG", "más de 1.000M de tickets", "6M de contribuyentes", "82 agentes activos"), battle-cards/rentahuman.md ("~3 personas en San Francisco", "Fundada: febrero de 2026"), battle-cards/field-agent.md ("Fundada: 2010"), battle-cards/vangrid.md ("sede en Ámsterdam")
- **Problem:** Hay cifras y hechos sin [Data]/[Estimate]/[Assumption]/[Opinion].
- **Suggested fix:** Etiquetar cada celda o poner una etiqueta de fuente por fila.

### La Oportunidad 5 se apoya en un solo entregable
- **File(s):** competitors-report.md (Oportunidad 5: ecosistema Celo/Ripio)
- **Problem:** La evidencia (talleres con Ripio, MiniPay con Mercado Pago) solo viene de gtm-analysis. La matriz y el panorama de precios no la sostienen; el panorama de precios incluso señala como incierto el costo del facilitador de Celo. No cumple el criterio de evidencia en al menos dos entregables.
- **Suggested fix:** Bajar la confianza a Baja-Media o vincularla con la brecha de costo del facilitador (pricing-landscape, Yellow Flags).

## Info
Mejoras menores y observaciones.

- battle-cards/bemyeye.md dice que 200 observaciones cuestan "US$300 a US$1.500 según el tipo"; el informe y pricing-landscape.md usan US$300. El rango es más honesto; conviene unificarlo.
- competitive-matrix.md, fila "Precio unitario bajo por observación (US$1-10)": calificar como "Fuerte" a Bazaar/Sella/Apify (sub-dólar) y a SEPA (gratis) mezcla "dentro del rango" con "más barato". Esto debilita la lectura del hueco de US$1-10.
- battle-cards/premise.md menciona un "proceso de apelación documentado" como fortaleza, pero la matriz califica a Premise "Débil" en aceptación apelable. Conviene una nota que concilie ambas cosas, por ejemplo: existe, pero se percibe como arbitrario.
- Las battle cards de BeMyEye, Fetch, Numerator y Premise dicen "sin flags rojos". Es razonable dado su nivel de amenaza, pero Numerator (amenaza Alta si lleva Receipt Hog a LatAm) podría tener un flag condicional.
- pricing-landscape.md: "0 de 10 competidores pagos" no define cuáles son los 10; la tabla por niveles tiene 8 columnas.
- raw/gtm-analysis.md fecha los tramos del SAFT de Vangrid entre agosto de 2025 y enero de 2026, mientras los entregables dicen "2026-08" (fecha del anuncio). Conviene aclarar anuncio frente a cierre.
- raw/competitor-profiles.md (Red Flags) dice "12M de precios por día" para SEPA; los entregables dicen "12M de precios publicados". Los entregables usan la forma más prudente; conviene corregir el raw.
- Fetch "Solo EE.UU." aparece como [Assumption] en la battle card y sin etiqueta en el informe y la matriz.

## Verification Checklist
- [ ] All quantitative claims labeled (ver Warning de afirmaciones sin etiqueta)
- [ ] No internal contradictions found (Critical de Scanntech; financiamiento de RentAHuman; amenaza de BeMyEye)
- [ ] Confidence ratings consistent with evidence (Vangrid; riesgo de demanda)
- [ ] Data gaps declared in all deliverables (12 archivos sin sección)
- [x] Red/Yellow flags present in all deliverables
- [ ] No stale data unmarked (Fetch, Field Agent)
- [ ] No duplicate-source false corroboration (kirothebot)
- [x] Battle cards consistent with report (skill-specific): todos los competidores de las battle cards figuran en la tabla de jugadores; salvo BeMyEye, las amenazas coinciden
- [x] Matrix aligned with profiles (skill-specific): cada columna de la matriz tiene perfil en el informe; la excepción de la celda de Scanntech AR está cubierta por el Critical
- [x] Pricing landscape consistent with profiles (skill-specific): precios, métricas de valor y costos de cambio coinciden con las battle cards; la aritmética (margen del 27%, 5-7x, 75x, -92%) verifica
- [ ] Opportunities backed by multi-source evidence (skill-specific): la Oportunidad 5 tiene una sola fuente

## Correcciones aplicadas (2026-11-12)

**Critical**
- Muestra Radar de Scanntech presentada como cobertura total → **corregido** en competitors-report.md (resumen, tabla de jugadores, Oportunidad 2, fosos, brechas, Yellow Flags), competitive-matrix.md (filas de cobertura AR y NOA, análisis de huecos, Yellow Flags) y battle-cards/scanntech.md. El panel Radar de 628 PDV figura como muestra publicada; se agregó el 80% autodeclarado. Se agregó dato nuevo: presentación de Scanntech en El Foro 2024 (cas.com.ar, datos a febrero de 2024): 3.103 PDV transmitiendo y 24,0% de cobertura del canal autoservicio en Argentina; NOA 20,1%, NEA 21,9%. No publica cobertura del canal tradicional. La Oportunidad 2 ya no compara PDV con tickets, incluye evidencia a favor y en contra, declara el hueco NOA/canal tradicional como hipótesis sin verificar (DATA GAP: cobertura por región y canal) y baja la confianza a Baja.

**Warnings**
- Faltan secciones de brechas de datos → **corregido**: se agregó "Brechas de datos" a competitive-matrix.md, pricing-landscape.md y las 10 battle cards.
- Financiamiento de RentAHuman recortado → **corregido** en la tabla de jugadores (US$125k-500k; US$12M en StartupHub, poco fiable) y con atribución por fuente en la battle card.
- Amenaza de BeMyEye → **corregido**: fila propia en la tabla de jugadores con "Baja-Media", alineada con la battle card.
- Confianza de Vangrid → **corregido**: mecanismo Alta; US$9M Media (autodeclarado) en el resumen, la tabla y la battle card.
- Confianza Media-Alta y "restricción probada" → **corregido**: Media y "fuertemente sugerida".
- Misma fuente como corroboración → **corregido**: "purchases sat at zero", la purga de -43% y los 4.400 compradores se atribuyen al mismo autor (kirothebot, dev.to) en el informe y en la battle card de x402.
- Datos desactualizados sin marca → **corregido**: Fetch "~11M por día (2023, posiblemente desactualizado)" y "13M (sin fecha)"; Field Agent "sin fecha" en pricing-landscape.md.
- Afirmaciones sin etiqueta → **corregido** en la tabla de jugadores, la tabla de fosos y las battle cards de RentAHuman, Field Agent y Vangrid.
- Oportunidad 5 con una sola fuente → **corregido**: confianza Baja-Media, vinculada a la brecha del costo del facilitador de Celo.

**Info**
- Rango de BeMyEye (US$300-1.500) → **corregido** en el informe y en pricing-landscape.md.
- Fila de precio unitario de la matriz → **corregido**: SEPA y Bazaar/Sella/Apify pasan a "n/a, más barato que el rango".
- Apelación de Premise → **corregido**: nota de conciliación en la battle card.
- Flag condicional de Numerator → **corregido**: Red Flag condicional agregado.
- "0 de 10" sin definir → **corregido**: se listan los competidores.
- SAFT de Vangrid: anuncio frente a tramos → **corregido** en la battle card y en la tabla ("anunciado 2026-08").
- "12M de precios por día" de SEPA en raw → **no corregido**: raw/ queda fuera de las superficies de edición autorizadas.
- Fetch "Solo EE.UU." sin etiqueta → **corregido**: [Assumption] en el informe y en la matriz.
