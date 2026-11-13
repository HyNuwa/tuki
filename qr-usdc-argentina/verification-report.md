# Verification Report: qr-usdc-argentina
*Generated: 2026-11-11 | Agente: V1 (Verificación) | Skill: startup-competitors*

**Alcance.** Se auditaron `competitors-report.md`, `competitive-matrix.md`, `pricing-landscape.md` y las 11 battle cards de `battle-cards/`. Se usaron `raw/*.md` e `intake.md` como fuente de verdad para los cruces. No se editó ningún entregable.

**Restricción adicional del founder.** Es un proyecto de hackathon ("validar la idea primero, formalizar después"). El founder dijo explícitamente que **no** va a hacer prueba de campo y que la formalización legal viene después. Toda recomendación que dependa de una prueba de campo o de un dictamen legal se marca como Warning, junto con una alternativa compatible con un hackathon.

## Summary
- **Critical issues:** 1
- **Warnings:** 15
- **Info:** 10

---

## Critical Issues
Problemas que pueden inducir a error en la toma de decisiones. El proceso se pausa acá para que el usuario los revise.

### La evidencia central de la oportunidad n.º 1 está sobredimensionada ("fondos que desaparecen en 4 de 7 productos")
- **File(s):** `competitors-report.md` (Resumen ejecutivo, punto 3; Hallazgos > Sentimiento; Oportunidad "confiabilidad como producto"), `competitive-matrix.md` (Análisis de huecos, "Reembolso automático con plazo").
- **Section:** Resumen ejecutivo; Oportunidades estratégicas; Análisis de huecos.
- **Problem:** Los entregables dicen "Fondos que 'desaparecen' en pagos fallidos aparecen en 4 de 7 productos" y lo etiquetan **[Data]**. La fuente (`raw/review-mining.md`, Patrones estructurales n.º 1) dice otra cosa: "pagos fallidos **o retenidos**" y lo etiqueta **[Opinion]**. En la propia matriz de dolor de raw, la fila "Pago fallido / pendiente con fondos debitados" solo tiene 3 productos en A (Moreta, Peanut, P2P.me). Bitget entra al conteo únicamente por la fila "Cuentas congeladas / fondos retenidos" (una cuenta de wallet bloqueada 4 meses). Además, la battle card de Bitget aclara "wallet en general, no QR", y la de P2P.me "no era un pago QR". Solo el caso de Peanut es un pago QR fallido en Argentina. Toda la muestra sale de menos de 25 reseñas relevantes, y raw califica ese volumen con confianza **Baja**. Esta cifra es la evidencia principal de "la mayor oportunidad" del informe y del diferencial que se recomienda priorizar, así que presentarla como dato duro puede sesgar la decisión de producto.
- **Suggested fix:** Reformular así: "Hay reportes de fondos retenidos o pagos fallidos sin acreditar en 4 de 7 productos (solo uno, Peanut, es un pago QR en Argentina) [Opinion, muestra <25 reseñas; confianza Baja]". Bajar la confianza de la oportunidad de Media a Baja-Media en el tramo "dolor documentado", o aclarar que el dolor está documentado de forma direccional, no concluyente.

---

## Warnings
Problemas que bajan la calidad pero no bloquean decisiones.

### W1. La conclusión general del informe depende de una prueba de campo que no se va a hacer
- **File(s):** `competitors-report.md` (Resumen ejecutivo, punto 5; Brechas de datos, fila 1, "regla de corte").
- **Problem:** El veredicto dice "todavía no hay evidencia para construir una app independiente. Antes conviene validar con una prueba de campo comparativa y un test concierge". La "regla de corte" de la tabla de brechas también se apoya en una "prueba de campo con 30–50 QR de Buenos Aires". El founder descartó la prueba de campo, así que el veredicto queda sin un camino de validación ejecutable.
- **Suggested fix:** Reformular la validación en clave de hackathon: (a) demo end-to-end con un **proveedor mock** que simule cotización, vencimiento, liquidación y reembolso (la máquina de estados quoted→signed→onchain→fiat_settled/refunded) sobre testnet de Base; (b) landing con waitlist y mensaje "pagá QR argentinos desde tu wallet de Base", midiendo conversión; (c) un concierge con un puñado de usuarios (5–10) **en el evento del hackathon**. Mover la regla de corte basada en 30–50 QR reales a una sección "post-hackathon".

### W2. La mitigación del riesgo de demanda exige una prueba de campo antes de escribir código
- **File(s):** `competitors-report.md` (Riesgos > "la demanda no alcanza", Mitigación).
- **Problem:** "prueba de campo, test concierge con 20 a 30 nómadas y una regla de corte explícita antes de escribir código de producción". Contradice la restricción del founder, y el tamaño (20–30 nómadas en coworkings) excede lo razonable en un hackathon.
- **Suggested fix:** "Durante el hackathon: waitlist y encuesta corta en ExpatsBA y grupos de nómadas, y concierge con 5–10 asistentes del evento usando la demo con proveedor mock. La regla de corte con datos reales queda para después del hackathon."

### W3. La oportunidad y el riesgo de confiabilidad se miden "en campo"
- **File(s):** `competitors-report.md` (Oportunidad "confiabilidad como producto", Cómo aprovecharlo; Riesgo "la vara de confiabilidad del MVP", Mitigación).
- **Problem:** Se recomienda "publicar el SLA y la tasa de éxito real medida en la prueba de campo" y "reembolso probado en campo", además de "lanzar solo con dos proveedores activos", lo que implica contratos firmados con dos PSPs, es decir, formalización.
- **Suggested fix:** Para el hackathon: demostrar el failover y el reembolso automático con **dos adaptadores mock** (uno que falla o llega a su límite y otro que toma el pago), con estado visible en la UI. El SLA publicado, la tasa de éxito real y los contratos con PSPs pasan a "post-hackathon".

### W4. Las recomendaciones regulatorias dependen de un dictamen legal
- **File(s):** `competitors-report.md` (Concentración > Barreras regulatorias, "confianza Baja hasta un dictamen legal"; Riesgo regulatorio, Mitigación "dictamen legal antes de cobrar"; Brechas de datos, fila "Dictamen sobre la CNV RG 1172/2026 → Abogado").
- **Problem:** El founder pospone la formalización legal. El informe no ofrece una ruta para avanzar mientras tanto.
- **Suggested fix:** "Durante el hackathon no se cobra fee y no se mueve dinero real (demo en testnet con proveedor mock), así que el riesgo de clasificación de la CNV no aplica todavía. Se deja registrado como pregunta abierta para la etapa de formalización: verificar la RG 1172/2026 en el Boletín Oficial y obtener un dictamen antes del primer cobro real."

### W5. Varias brechas de datos y talking points de battle cards se resuelven con pagos reales
- **File(s):** `competitors-report.md` (Brechas de datos: "Pago de prueba" de Moreta, "Cuenta de prueba con pasaporte" de Bitget, "Pagos de prueba" de WanderWallet y CacaoCash, "Pagar con una tarjeta extranjera real", "Simular un envío real" de Western Union; Yellow Flags: Moreta "si se valida en campo"), `battle-cards/moreta-pay.md` (Vulnerabilidad clave: "Si en la prueba de campo falla…"), `battle-cards/yodl.md` (Cómo ganarle: "hay que demostrarlo en campo"), `pricing-landscape.md` (Mapa de posicionamiento: "Si la profundidad no se materializa en campo").
- **Problem:** Todas estas acciones equivalen a una prueba de campo, que no va a ocurrir.
- **Suggested fix:** Proponer alternativas de escritorio: recorrer el onboarding de cada app hasta la pantalla de KYC o de depósito y capturarla; leer docs y FAQs públicas; buscar videos y walkthroughs; preguntar en los Discord o Telegram de cada producto. En las battle cards, reemplazar "en campo" por "en la demo" o "post-hackathon", y aclarar que la comparación es contra la promesa documentada del competidor.

### W6. El canal de grants supone una "demo en riel real"
- **File(s):** `competitors-report.md` (Oportunidad "canales baratos y vacíos").
- **Problem:** "Postulación a Base Batches o Circle Grants con demo en riel real" exige un proveedor licenciado integrado, o sea, formalización.
- **Suggested fix:** "Demo en testnet de Base con proveedor mock y la máquina de estados completa; indicar en la postulación qué PSP se integraría después."

### W7. El nivel de amenaza de Bitget es inconsistente entre el informe y la battle card
- **File(s):** `competitors-report.md` (Jugadores clave), `battle-cards/bitget-wallet.md`.
- **Problem:** El informe aclara que "la amenaza se evalúa para nuestro segmento" y le asigna **Alta** a Bitget. La battle card dice "ALTA por distribución… En nuestro segmento… la amenaza es **media**", igual que `raw/competitor-profiles.md` ("Alto por distribución, medio en el segmento de turista con USDC en Base").
- **Suggested fix:** En la tabla del informe, poner "Media (Alta por distribución)", siguiendo el mismo formato que Moreta.

### W8. El nivel de amenaza de Moreta en nuestro segmento contradice a raw
- **File(s):** `competitors-report.md` (Jugadores clave: "Media (Alta en turista general)"), `battle-cards/moreta-pay.md` ("MEDIA en nuestro segmento cripto-nativo").
- **Problem:** `raw/competitor-profiles.md` dice "**bajo** en el segmento cripto-nativo con wallet propia". Los entregables lo suben a Media sin justificarlo.
- **Suggested fix:** Justificar la suba (por ejemplo, si se debe a la cobertura "live" de 5 redes confirmada en `raw/strategic-signals.md`) o volver a Baja.

### W9. CacaoCash se usa como fuente sobre Moreta, aunque el propio informe la declara no confiable sobre terceros
- **File(s):** `battle-cards/moreta-pay.md` ("No paga alias ni CVU [Data, vía CacaoCash]"; "spread de 0,6–0,75% según terceros"), `competitive-matrix.md` (Moreta, Alias = "—"; Spread publicado = "D"), `pricing-landscape.md` (Moreta all-in +2,1% a +2,2%), `competitors-report.md` (Producto y cobertura: "Moreta no paga alias").
- **Problem:** En "Contradicciones" el informe concluye que "las guías de CacaoCash no son confiables sobre terceros" (dieron 2,3 en Trustpilot cuando es 4,6). Aun así, el dato de "sin alias" y el spread de Moreta, que fija su costo all-in, salen solo de CacaoCash (`raw/competitor-profiles.md`, Moreta > Producto). Es una fuente única y contradicha, presentada como [Data].
- **Suggested fix:** Etiquetar ambos datos como "[Data, VENDOR competidor; confianza Baja]", marcar la celda de alias de Moreta en la matriz como "?" o "— (según CacaoCash)", y mostrar el all-in de Moreta como rango con y sin spread (+1,5% a +2,2%).

### W10. La confianza del resumen ejecutivo, punto 1, está inflada y el conteo de "especialistas" es impreciso
- **File(s):** `competitors-report.md` (Resumen ejecutivo, punto 1).
- **Problem:** El punto dice "al menos 11 especialistas… menos de 25 reseñas… [Data; confianza Alta]". El set de 11 incluye wallets generalistas (Bitget, MiniPay), un producto que no paga QR argentinos (Settle) y otro que no opera en Argentina (Quay). Además, `raw/review-mining.md` califica con confianza **Baja** el volumen de menos de 25 reseñas.
- **Suggested fix:** Decir "11 jugadores en el set analizado, de los cuales unos 6 son especialistas que operan en Argentina" y bajar la confianza a Media.

### W11. La economía unitaria del informe usa un supuesto que el mismo informe desaconseja
- **File(s):** `competitors-report.md` (Riesgo "la demanda no alcanza": "neto de ~US$0,15 por pago… ~65.000 pagos por mes"), `pricing-landscape.md` (Red Flags, Análisis de la variable de valor).
- **Problem:** Los US$0,15 netos salen de 22 × 1% × **70%**, que es el revenue share del integrador del SDK de Yodl (`raw/pricing-intelligence.md`, punto 3). El informe los presenta como economía general, pero en el Riesgo "Yodl" recomienda **no** construir sobre Yodl. Sin Yodl, el bruto sería de unos US$0,22 menos los costos del proveedor y del paymaster, y el volumen necesario cambia (unos 45.000 pagos por mes antes de costos).
- **Suggested fix:** Presentar dos escenarios etiquetados [Estimate]: "sobre el SDK de Yodl (US$0,15)" y "proveedor directo (US$0,22 bruto, costos del PSP sin datos)".

### W12. Una cita entre comillas no refleja la fuente
- **File(s):** `competitors-report.md` (Oportunidad "confiabilidad", Evidencia: "'Una sola falla y vuelvo a Western Union' (ExpatsBA) [Data]"; Resumen ejecutivo, punto 3: "una sola falla basta para que el usuario vuelva a Western Union").
- **Problem:** La cita textual de raw es "this seems like too much risk for my comfort. I think I will stick to Western Union" (lemonade, 2025-12-01). Según `raw/forum-mining.md`, ese usuario **evaluó** Peanut y se quedó en Western Union: no tuvo una falla. La frase entre comillas es una paráfrasis analítica de raw (marcada [Opinion]) presentada como cita y como [Data].
- **Suggested fix:** Usar la cita textual y describirla como "aversión al riesgo antes de probar", o quitar las comillas y etiquetar como [Opinion].

### W13. Faltan secciones de Data Gaps en varios entregables
- **File(s):** `competitive-matrix.md`, `pricing-landscape.md` y las 11 battle cards.
- **Problem:** Solo `competitors-report.md` tiene una sección de Brechas de datos. La matriz menciona los "?" en una Yellow Flag. El panorama de precios deja gaps sueltos (Bitget sin precio, MiniPay, Takenos y Settle como DATA GAP, Western Union) sin una sección propia, aunque `raw/pricing-intelligence.md` tiene "§8 Data Gaps". Las battle cards marcan [Data gap] en línea, pero no tienen sección.
- **Suggested fix:** Agregar una sección "Brechas de datos" breve en la matriz y en el panorama de precios (trasladando §8 de raw), y una línea "Brechas de datos" en cada battle card.

### W14. Faltan calificaciones de confianza en secciones principales
- **File(s):** `competitive-matrix.md` (Análisis de huecos: solo la oportunidad 1 la tiene), `pricing-landscape.md` (ninguna sección), las 11 battle cards (ninguna).
- **Problem:** El protocolo exige una calificación de confianza en cada sección principal. Hay casos sensibles, como el costo all-in por competidor, que mezcla [Data], [Estimate] y [Assumption], o la amenaza de cada battle card.
- **Suggested fix:** Agregar "Confianza: Alta/Media/Baja" por sección en la matriz y en el panorama de precios, y una línea de confianza junto a la amenaza en cada battle card.

### W15. Red Flags marcadas como "Ninguna" cuando el contenido muestra riesgos
- **File(s):** `battle-cards/minipay.md`, `battle-cards/settle.md`, `battle-cards/takenos.md` ("Ninguna inmediata"), `battle-cards/p2p-me.md` ("Ninguna específica").
- **Problem:** Hay riesgos en el propio contenido de cada card. Takenos tiene US$12M frescos, QR para extranjeros y contrataciones (el informe lo lista en Yellow Flags). Settle comparte exactamente nuestro público (Base y Farcaster) y su red de comercios. MiniPay tiene distribución embebida y el mensaje "pay like a local". P2P.me tiene el mejor precio, en la misma cadena y con la misma filosofía no custodial.
- **Suggested fix:** Convertir al menos un riesgo de cada card en Red Flag o, si se mantiene "Ninguna", justificar por qué.
---

## Info
Mejoras menores y observaciones.

- **La mediana del precio no es reproducible.** `pricing-landscape.md` dice "Mediana en cripto: ~+1,5–2,1%". Con los puntos medios de las 6 opciones cripto de la tabla (P2P.me 0,3; Peanut ~0,6–1,1; Yodl ~0,65; WanderWallet 2,1; Moreta 2,15; CacaoCash 2,6) la mediana da ~1,4%. Solo se llega a 1,5–2,1% con los extremos superiores o incluyendo "Nosotros". Conviene explicitar el método.
- **Celda de Bitget en la matriz.** En "Firmar desde una wallet externa sin depositar", Bitget figura con "D¹", pero la battle card y raw dicen "no firma desde otra wallet [Data]". La calificación coherente es "—", con la nota sobre importar la frase semilla.
- **Celdas F o A apoyadas en teoría o en supuestos.** Bitget tiene "QR interoperable = F" con el texto "en teoría cubre todos los QR" y cero reseñas. MiniPay tiene "Sin custodia = A" basado en un [Assumption] (nota 4). Sugerencia: marcarlas como "F (declarado)" o "?".
- **La tabla "Jugadores clave" del informe no tiene etiquetas por celda.** Etapa, financiamiento y usuarios mezclan datos autodeclarados y de Tier 3. Conviene una etiqueta general debajo de la tabla, por ejemplo "[Data; financiamiento y usuarios mayormente autodeclarados o Tier 3]".
- **El talking point de Bitget se apoya en una muestra parcial.** El "47% de una estrella" sale de la página 1 de 3 de Trustpilot (`raw/review-mining.md`) y refiere a la wallet en general, no a QR Pay. Conviene aclararlo para no usarlo como argumento sin matiz frente a un jurado.
- **Hay corroboración repetida sobre una base chica.** Los dos hilos de ExpatsBA (unos 13 posts en el de abril de 2026) sostienen a la vez el dominio del status quo, las fallas de Peanut, el miedo a la red equivocada ("6 o más posts") y la cita de Western Union. No son fuentes independientes entre sí.
- **El denominador de "variable de cobro dominante: 5 de 9" no está claro.** `pricing-landscape.md` incluye a belo, que no está en el set perfilado. Conviene listar los 9.
- **Datos viejos.** No se encontraron datos de más de 18 meses sin marcar. La evidencia de Peanut y P2P.me (dic 2025), el dato de MiniPay (nov 2025) y la tasa de Fiserv (20-oct) ya están señalados como posiblemente desactualizados.
- **El tamaño del concierge.** El "test concierge con 20 a 30 personas" del informe y el panorama de precios ("medir en el test concierge si alguien paga…") es compatible con un hackathon si se reduce a 5–10 asistentes del evento con la demo mock (ver W1 y W2).
- **La columna "Nosotros" del panorama de precios** asume "1% + 0,3–1,0% de spread del proveedor" sin aclarar si el proveedor es Yodl o un PSP directo. Conviene alinearla con los dos escenarios de W11.

---

## Verification Checklist
- [ ] All quantitative claims labeled — mayormente sí; faltan etiquetas en la tabla de Jugadores clave y hay etiquetas [Data] incorrectas (Critical; W12).
- [ ] No internal contradictions found — amenaza de Bitget (W7), amenaza de Moreta frente a raw (W8), economía unitaria (W11).
- [ ] Confidence ratings consistent with evidence — Resumen ejecutivo punto 1 inflado (W10); Critical.
- [ ] Data gaps declared in all deliverables — solo en el informe (W13).
- [x] Red/Yellow flags present in all deliverables — presentes, aunque con varias "Ninguna" discutibles (W15).
- [x] No stale data unmarked
- [ ] No duplicate-source false corroboration — CacaoCash como fuente única sobre Moreta (W9); hilos de ExpatsBA (Info).
- [ ] Battle cards consistent with report (skill-specific) — W7, W8.
- [x] Matrix aligned with profiles (skill-specific) — los 11 competidores tienen perfil; hay ajustes menores de celdas (Info).
- [ ] Pricing landscape consistent with profiles (skill-specific) — spread de Moreta (W9); base de la economía unitaria (W11).
- [ ] Opportunities backed by multi-source evidence (skill-specific) — la oportunidad n.º 1 tiene la evidencia sobredimensionada (Critical); la de canales se apoya solo en ausencia de datos.
- [ ] Hackathon constraint (sin prueba de campo, sin formalización legal todavía) — W1 a W6.

---

## Correcciones aplicadas (2026-11-11)

**Critical (fondos que "desaparecen" en 4 de 7 productos):** sin cambios, por decisión del founder, que considera aceptable el hallazgo tal como está escrito. Se mantienen intactos el texto, la etiqueta y la confianza en `competitors-report.md` y `competitive-matrix.md`.

**Warnings**
- **W1.** Resumen ejecutivo, punto 5: la validación pasa a demo en testnet de Base con proveedor mock (máquina de estados completa), landing con waitlist y concierge con 5–10 asistentes del evento. La regla de corte con 30–50 QR reales pasa a la nueva subsección "Después de la hackathon".
- **W2.** Riesgo "la demanda no alcanza": la mitigación pasa a waitlist, encuesta corta en ExpatsBA y concierge con 5–10 asistentes usando la demo mock; la regla de corte queda para después.
- **W3.** Oportunidad y riesgo de confiabilidad: failover y reembolso se demuestran con dos adaptadores mock y estado visible en la UI; SLA publicado, tasa de éxito real y contratos con PSPs pasan a post-hackathon. Mismo criterio en la matriz (huecos y diferenciación n.º 2).
- **W4.** Barreras regulatorias, riesgo regulatorio y brecha de datos: se aclara que sin fee ni dinero real el riesgo CNV no aplica todavía; el dictamen y la verificación de la RG 1172/2026 quedan como nota en "Después de la hackathon", no como prerrequisito.
- **W5.** Brechas de datos del informe: pagos de prueba, cuentas con pasaporte, tarjeta real y envío de Western Union se reemplazan por alternativas de escritorio (onboarding hasta KYC o depósito, docs, FAQs, videos, Discord y Telegram); los pagos reales pasan a post-hackathon. Se ajustaron la Yellow Flag de Moreta, la vulnerabilidad de `moreta-pay.md`, el talking point de `yodl.md` y la lectura del mapa de posicionamiento en `pricing-landscape.md`.
- **W6.** El canal de grants usa la demo en testnet con proveedor mock e indica qué PSP se integraría después.
- **W7.** Bitget en "Jugadores clave" pasa a "Media (Alta por distribución)"; la battle card se reordenó con el mismo criterio.
- **W8.** Moreta vuelve a **Baja** en nuestro segmento (Alta en turista general), alineada con `raw/competitor-profiles.md`, en el informe y en la battle card, con la justificación explícita.
- **W9.** "Sin alias" y spread de Moreta se etiquetan como [Data, VENDOR competidor (CacaoCash); confianza Baja] en informe, matriz (celda "— (según CacaoCash)" y nota 8) y battle card. El all-in de Moreta se muestra como +1,5% a +2,2% y se ajustó la comparación de precio del informe.
- **W10.** Resumen ejecutivo, punto 1: "11 jugadores en el set analizado, de los cuales unos 6 son especialistas que operan en Argentina"; confianza bajada a Media y volumen de reseñas marcado con confianza Baja, como en raw.
- **W11.** Economía unitaria en dos escenarios [Estimate]: sobre el SDK de Yodl (US$0,15 neto, ~65.000 pagos por mes) y proveedor directo (US$0,22 bruto, ~45.000 pagos por mes antes de costos del PSP, sin datos). Aplicado en el informe y en `pricing-landscape.md` (variable de valor, Red Flags, espacio libre n.º 4, celda "Nosotros").
- **W12.** La frase "Una sola falla y vuelvo a Western Union" se reemplazó por la cita textual de lemonade, descrita como aversión al riesgo antes de probar; la lectura "una sola falla" queda marcada como paráfrasis [Opinion]. Mismo ajuste en el resumen ejecutivo, punto 3.
- **W13.** Se agregó una sección "Brechas de datos" a `competitive-matrix.md`, a `pricing-landscape.md` (trasladando §8 de raw) y a las 11 battle cards.
- **W14.** Se agregaron calificaciones de confianza por sección en la matriz (comparación y cada hueco) y en el panorama de precios, y una línea de confianza junto a la amenaza en cada battle card.
- **W15.** Red Flags concretas en `minipay.md` (distribución embebida y "pay like a local"), `settle.md` (mismo público y red de comercios), `takenos.md` (capital, QR para extranjeros y contrataciones) y `p2p-me.md` (mejor precio, misma cadena y filosofía no custodial).

**Info aplicadas**
- Mediana de precio: recalculada con método explícito (~+1,4%; +0,9% a +1,9% según extremos).
- Celda de Bitget "firmar desde wallet externa": "—¹", con la nota sobre importar la frase semilla.
- Bitget "QR interoperable" pasa a "F (declarado)" (nota 7); MiniPay "Sin custodia" pasa a "A⁴ (supuesto)".
- Etiqueta general y confianza bajo la tabla "Jugadores clave".
- Talking point de Bitget: se aclara que el 47% es de la página 1 de 3 y sobre la wallet en general.
- Corroboración de ExpatsBA: nueva Yellow Flag en el informe.
- "5 de 9": se listan los 9 y se aclara que belo no está en el set perfilado.
- Concierge reducido a 5–10 asistentes del evento con la demo mock (informe y panorama de precios).
- Columna "Nosotros": se explicita que el spread usa la app de Yodl como proxy y que con un PSP directo es un data gap.
- Datos viejos: sin cambios (ya estaban señalados).
