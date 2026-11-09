# Análisis de mercado

**Fase:** 3 — Investigación de mercado (Fast Track: Olas 1 y 2)
**Proyecto:** recompensas-verificables-noa
**Fecha:** 2026-11-09
**Confianza:** Media en el contexto macro y del canal; **Baja** en el tamaño del mercado local, que es bottom-up con supuestos.

Tipo de cambio usado en todo el análisis: **USD 1 = ARS 1.570** (oficial BNA, 6-nov-2026).

---

## Resumen ejecutivo
1. **El canal existe y es grande.** El canal tradicional mueve ~34 % del consumo masivo argentino, contra 31 % de las cadenas, y hay más de 194.700 comercios independientes [Data, NielsenIQ abr-2026 vía Revista Mercado, T1-2].
2. **El mercado que de verdad podemos servir es chico.** Marcas regionales del NOA: **USD 90k–390k/año facturados** (USD 50k–200k netos). En Jujuy, año 1: **USD 3k–15k facturados** [Estimate].
3. **La economía depende de qué producto se promociona.** Para un SKU barato (galletitas, ~USD 1,25), un costo de USD 1,50 por compra equivale al 119 % del precio de góndola. La marca necesita unas 5 recompras para recuperarlo [Estimate].
4. **La regulación no frena un piloto en pesos**, que es de riesgo bajo a medio. Sí frena un escrow cripto con usuarios reales, que es de riesgo alto (PSAV/CNV).
5. **El timing es mixto.** A favor: el pago con QR es masivo y ARCA está digitalizando a los comercios chicos. En contra: el consumo cae y las pymes alimenticias tienen poco margen.

## 1. Tamaño de mercado

| Nivel | Cifra | Cómo se construyó | Confianza |
|---|---|---|---|
| **Contexto global** | Automatización de rebates post-compra: USD 6,45 MM → 16,63 MM en 2034 (CAGR 11,2 %) | Dataintelo, citado en el doc 03 [Data, T3] | Baja (fuente de un solo informe comercial) |
| **Referente de modelo** | Ibotta: USD 342 M de ingresos en FY2025 (−7 %); ganancia neta de USD 68,7 M → 3,6 M | Comunicado de resultados FY2025 [Data, T1-2] | Alta |
| **TAM Argentina** | DATA GAP: no hay cifra pública de gasto en trade promotion. Único proxy: ~14 % de las ventas brutas de las CPG va a promociones comerciales (estudio de ~2012, **desactualizado**) | — | Baja |
| **SAM: marcas regionales del NOA** | **USD 90k–390k/año bruto; USD 50k–200k neto** | 95–220 marcas × 1–1,5 campañas/año × USD 700–1.600 por campaña [Estimate] | Baja (la cantidad de marcas es un DATA GAP crítico) |
| **Upside: marcas nacionales que lanzan en el NOA** | +USD 30k–300k/año | 10–20 marcas × 1–2 campañas × 2.000–5.000 compras × USD 1,50 [Estimate] | Baja |
| **SAM Jujuy** | USD 13k–90k bruto | 18–38 marcas regionales [Estimate] | Baja |
| **SOM año 1 (Jujuy)** | **USD 3,3k / 6,3k / 15k bruto** (conservador / base / optimista); **USD 2k / 3,6k / 8,3k neto** | 4 / 6 / 10 marcas, 9 campañas en el caso base, 3.600 compras [Estimate] | Baja |

**Lectura honesta [Opinion]:** el SOM del año 1 no paga ni un sueldo. Jujuy sirve como **laboratorio para probar que la verificación y la recompra funcionan**, no como mercado. Un negocio de verdad requiere sumar a marcas nacionales que lanzan en el NOA y luego expandirse a otras regiones, que es donde ya está Scanntech.

**Densidad:** San Salvador de Jujuy tiene 308.950 habitantes [Data, Censo 2022] y unos 1.300–2.600 comercios de cercanía [Estimate, con la densidad nacional de 4,23 cada 1.000 habitantes]. Con 3.600 compras al año, toca menos de 3 compras por comercio. Conviene concentrar cada campaña en 50–100 comercios ancla [Opinion].

## 2. Unit economics: el número que decide

### 2.1 Costo para la marca frente al precio del producto
| SKU (precio estimado nov-2026) | USD | USD 1,50 como % del precio | Recompras para recuperar el costo* |
|---|---|---|---|
| Galletitas 150 g | 1,25 | 119 % | ~5 |
| Fideos 500 g | 1,33 | 113 % | ~5 |
| Yerba 500 g | 1,99 | 75 % | ~3 |
| Dulce de leche 400 g | 2,78 | 53 % | ~2–3 |
| Gaseosa 1,5 L | 3,46 | 43 % | ~2 |
| Aceite 1,5 L | 5,42 | 27 % | ~1–2 |

\*Supuesto: la ganancia bruta del fabricante es el 18–28 % del precio de góndola [Estimate]. Los precios salen de datos oficiales de Neuquén (abr-2026) ajustados por IPC, como proxy porque **no hay precios publicados del NOA** [Data T1 + Estimate].

**Implicancia [Opinion]:** el modelo de **"primera prueba" cierra para SKUs de ≥ ARS 3.000 (≈ USD 2)** o con una **recompensa variable del 15–25 % del precio con tope**. Con SKUs baratos y un precio fijo de USD 1,50, la marca pierde plata salvo que la recompra sea alta.

### 2.2 Benchmarks
| Métrica | Valor | Fuente |
|---|---|---|
| Comisión de Ibotta por canje | USD 0,87 promedio (0,79 en redes de terceros, 1,10 en su app), además de la recompensa | [Data, Ibotta FY2025 / Q3-2025, T1-2] |
| Comisión neta propuesta | USD 0,75 por compra (1,50 − 0,60 − 0,15), antes de verificación y fraude | Docs del equipo [Assumption] |
| Degustación en EE. UU. | USD 2,95 por prueba; **USD 7,63 por comprador convertido** | [Data, Makai 2026, T3] |
| Degustación en Argentina | **Contradictorio: USD 1,5–2,2 o USD 6–30 por comprador convertido** (ver §6) | [Estimate] |
| Incentivo al almacenero | USD 0,15 suma ~35–50 % al margen unitario del comercio (con un margen supuesto del 25–35 %) | [Estimate] |
| Bonificación "pague 10 lleve 12" | 16,7 % del sell-in, ≈ USD 0,10–0,20 por unidad colocada (no es costo por prueba) | [Estimate] |

## 3. Madurez y trayectoria
- **Mercado global de pago por venta: maduro y bajo presión.** Ibotta cayó 7 % en ingresos y casi no gana plata. Dosh (adquirida por USD 277,6 M en 2021) cerró en feb-2025 [Data, T2]. Su red de terceros crece (+27 %) mientras su app propia cae (−22 %) [Data, T1-2]: el valor está en la red, no en la app de consumidor.
- **Canal tradicional argentino: estable dentro de un mercado en caída.** El consumo masivo acumula −2,7 % en ene-sep 2026; en septiembre, kioscos y almacenes quedaron en 0 % interanual contra −2,6 % de supermercados [Data, Scentia, T2]. Las ventas reales de supermercados en Jujuy cayeron 10,4 % en ene-abr 2026 y cerraron más de 100 comercios en el centro de San Salvador de Jujuy (abr-2026) [Data, T2].
- **Migración a segundas marcas** [Data, T2]: es un viento a favor para las promociones de prueba de marcas regionales.

## 4. Resumen regulatorio
*(Detalle en `raw/regulatory.md`. No es asesoría legal.)*

| Tema | Qué implica | Riesgo para el piloto |
|---|---|---|
| Promociones (DNU 274/2019, art. 14) | Prohíbe premios vinculados a una compra que dependan del azar. Un reembolso garantizado sin azar no sería sorteo [Opinion, lectura del texto oficial] | Bajo |
| Jujuy (Ley 6.234, INPROJUY Res. 063-P/2021) | Los sorteos requieren autorización y pagan un arancel del 10 % del premio. Si alcanza a reembolsos sin azar es DATA GAP | Bajo–Medio: consultar al INPROJUY |
| Consumidor (Ley 24.240) | La oferta publicada obliga: bases claras y pago en plazo | Bajo |
| Datos (Ley 25.326, AAIP) | Consentimiento, inscripción de la base, consentimiento aparte para compartir con marcas; reforma 3397-D-2026 en etapa temprana | Bajo–Medio |
| Pagos (BCRA) | Si la plataforma recibe y redistribuye fondos se acerca a ser PSP. **Diseño recomendado:** paga la marca desde su PSP y la plataforma solo instruye | Bajo con ese diseño |
| Fiscal | Tratamiento del reembolso: DATA GAP. La plataforma factura solo su comisión | Medio (falta información) |
| **Web3 (RG CNV 1058/2025 y 1172/2026)** | Transferir o custodiar activos virtuales para terceros como negocio = PSAV: SA/SRL, patrimonio mínimo de USD 75k–150k (la mitad si el volumen es bajo), UIF y auditoría de smart contracts | **Alto en producción; bajo en una demo con testnet** |

**Costo mínimo de cumplimiento para el piloto:** bases y condiciones, términos y privacidad, inscripción ante la AAIP, contrato con la marca, consulta contable y una SAS. Honorarios: DATA GAP (cotizar).

## 5. Timing
| A favor | En contra |
|---|---|
| 115,6 M pagos QR/mes (+72 % interanual) y extracciones de efectivo por adulto −33 % interanual: reembolsar a un CVU no genera fricción [Data, BCRA jul-2026, T1] | El QR fiscal y la factura electrónica **no traen SKU** [Data, RG 4892/2020, T1] |
| ARCA: papel solo para contingencias; monotributistas sociales obligados desde el 01/11/2026 [Data, RG 5893/2026, T1-2] | Recibos falsos hechos con IA: del 0 % al 70,8 % del fraude detectado en 14 meses [Data, AppZen vía T3] |
| Celo y Ripio activos en Argentina (workshops oct-2026) | wARS con volumen muy bajo (~USD 200k en dic-2025) [Data, T3] |
| Consumidores migrando a segundas marcas | Consumo −2,7 % y márgenes de las pymes alimenticias apretados |

**Veredicto de timing [Opinion]:** bueno para el riel de pagos y para la demanda de prueba de marcas regionales. Regular para la verificación. Prematuro para mostrarle cripto al usuario final.

## 6. Contradicción a resolver: ¿cuánto cuesta una degustación en el NOA?
- **A1** estima **USD 1,5–2,2 por comprador convertido**. Supone una promotora a ARS 8–12k/hora, 40 pruebas por turno y 35 % de conversión.
- **B2** estima **USD 6–30 por comprador**. Parte de un aviso de ARS 600–850k "por evento" para promotoras de stand en convenciones (Santa Fe), más 30 % de agencia y producto.
- **A cuál creerle [Opinion]:** ninguna está bien anclada. El aviso de B2 es de otro tipo de evento (convenciones, no degustaciones en supermercado), así que probablemente sobreestima. La tarifa por hora de A1 es un supuesto sin fuente. El rango real probablemente es **USD 2–10 por comprador convertido**.
- **Por qué importa:** si la degustación cuesta USD 2, la propuesta **no es más barata**; si cuesta USD 10, es de 5 a 7 veces más barata. **Esto se resuelve con 2 llamadas a agencias BTL de Salta o Tucumán** (experimento de la Fase 8).

## 7. Data gaps
- Cantidad de marcas regionales del NOA con presupuesto de marketing (crítico).
- Padrón de comercios de cercanía de San Salvador de Jujuy y cuántos tienen controlador fiscal.
- Precios de góndola del NOA.
- Tarifas de degustación y sampling en el NOA.
- Tasa de recompra después de una prueba (solo se obtiene con el piloto).
- Tratamiento fiscal del reembolso.
- Si el INPROJUY regula reembolsos sin azar.

## Conexiones estratégicas
- La ausencia del SKU en el QR fiscal (ver `industry-trends.md`) obliga a usar la **confirmación del comercio**. Eso vuelve al almacenero un actor de confianza y crea el riesgo de **colusión**, que es el vector de fraude dominante (ver `competitor-landscape.md`, sección de verificación).
- El SAM chico explica por qué Scanntech apunta a grandes CPG con suscripción (ver `competitor-landscape.md`). El hueco de marcas regionales existe en parte porque **vale poco plata**.

---

## Flags

**Red Flags:**
- **SOM del año 1 de USD 2k–8k neto**: el mercado local no sostiene una empresa. Solo tiene sentido como piloto para luego vender a marcas nacionales o expandirse a otras regiones.
- **Con SKUs baratos (≤ USD 1,5) y precio fijo de USD 1,50, la marca pierde plata** salvo que la recompra sea alta. Hay que rediseñar el pricing (porcentaje del precio con tope) o elegir SKUs de mayor ticket.

**Yellow Flags:**
- La ventaja de precio frente a la degustación es incierta (USD 1,5–30 según la fuente).
- El consumo cae y las pymes tienen poco presupuesto (el 57 % de las empresas invierte ≤ 3 % de su facturación en marketing, según Endeavor 2025, T1).
- El componente Web3 en producción tiene riesgo regulatorio alto.

## Fuentes
- NielsenIQ vía Revista Mercado (abr y jun 2026) — T1-2
- BCRA, Informe Mensual de Pagos Minoristas (jul-2026) — T1
- Ibotta, resultados FY2025 y Q3-2025 — T1-2
- Scentia vía prensa (oct-2026) — T2
- INDEC, Censo 2022 — T1; DPEyC Neuquén, precios (abr-2026) — T1
- DNU 274/2019; RG ARCA 4892/2020 y 5893/2026; RG CNV 1058/2025 y 1172/2026; Ley 25.326; Ley 6.234 de Jujuy — T1
- Endeavor, Estado del Marketing 2025 — T1
- Makai (2026), LetsDataScience/AppZen (jun-2026) — T3
- Detalle y URLs: `raw/market-size.md`, `raw/trends.md`, `raw/regulatory.md`
