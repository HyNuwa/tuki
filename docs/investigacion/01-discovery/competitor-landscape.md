# Panorama competitivo

**Fase:** 3 — Investigación de mercado (Ola 2)
**Proyecto:** recompensas-verificables-noa
**Fecha:** 2026-11-09
**Confianza:** Media. Scanntech, Ibotta y las billeteras están bien documentados; la presencia de competidores en el NOA es un DATA GAP.

---

## Resumen
- **Nadie en Argentina vende hoy "pago por comprador nuevo verificado en el almacén" a marcas regionales** [Data: búsqueda sin resultados en B1/B2, confianza media]. El hueco existe.
- **El competidor más cercano es Scanntech Promo Club**: el fabricante financia promociones que el comercio acepta, el descuento se aplica en la caja con dato SKU y Scanntech le transfiere la inversión al comercio. Por ahí pasaron ~R$ 9.000 M en campañas en 2023 [Data, Exame, T2]. Además, levantó una **Serie F de USD 180 M en oct-2026** [Data, T2]. En Argentina cubre autoservicios y supermercados regionales (~1.400 PDV en dic-2022), no el almacén sin POS.
- **El riesgo de plataforma más alto está del lado del almacenero:** BEES (Quilmes, más de 200.000 PDV) y TOKIN (Arcor, más de 250.000 PDV, más de 80 marcas) ya tienen relación, puntos e IA de surtido con los comercios [Data, T2].
- **El cashback por foto de ticket ya se probó en Argentina y quedó dormido.** Gelt tuvo 500k usuarios en 2022 sin actividad visible desde entonces; ShopApp, lo mismo [Data, T2-3].
- **El hueco existe en parte porque es chico** (ver `market-analysis.md`): hay pocas marcas regionales con presupuesto chico. Los grandes no lo atienden por elección, no por descuido [Opinion].

## Matriz comparativa

| Nombre | Producto | Pricing | Target | Funding | Tracción | Fortaleza clave | Debilidad clave |
|---|---|---|---|---|---|---|---|
| **Scanntech** (UY/BR/AR) | POS gratis + analítica SKU + **Promo Club** | Suscripción por tamaño y SKUs; tarifa de Promo Club: DATA GAP | Grandes CPG; autoservicios | Serie F USD 180 M (oct-2026); antes Warburg, Sequoia, IFC | Más de 45k tiendas en LatAm; ~1.400 PDV en AR (2022); NOA: DATA GAP | Dato SKU nativo del POS + pago a comercios | No llega al almacén sin POS; no identifica al "comprador nuevo"; no vende a pymes regionales |
| **Gelt** | Cashback por foto de ticket | DATA GAP | Supermercados de cadena | DATA GAP; ¿control de Prosegur Cash en 2023? (T3, sin confirmar) | 500k usuarios en AR (2022); dormida | Probó la adopción masiva en Argentina | Excluye almacenes; sin actividad desde 2022 |
| **Mercado Pago** | QR/Point, reintegros por comercio o rubro | DATA GAP | Cadenas, comercios, usuarios | MELI | Líder del pago QR en AR | Distribución en almacenes + hábito de reintegro | Sin SKU; no vende promos por producto a marcas regionales |
| **MODO / Cuenta DNI / Ualá** | Reintegros bancarios (Cuenta DNI: 20 % con tope de ARS 6.000/semana, solo en PBA) | Lo pagan bancos y cadenas | Bancarizados | Bancos y fintech | Masivo | Hábito de reintegro en pesos | Sin SKU; una marca regional no los puede contratar |
| **BEES / TOKIN** | Apps B2B de pedidos + puntos para el almacenero | DATA GAP para terceros | Almaceneros, distribuidores | AB InBev / Arcor | Más de 200k / más de 250k PDV | Relación diaria con el almacenero | No hablan con el consumidor; son de competidores de las marcas regionales |
| **Ibotta** (EE. UU.) | Ofertas por SKU en red de terceros + app | Recompensa + ~USD 0,79–1,10 por canje | Más de 3.100 marcas CPG | NYSE | USD 342 M (FY2025) | Modelo de performance puro | App propia en caída; no está en LatAm |
| **Fetch** (EE. UU.) | Escaneo de cualquier ticket + ofertas + datos | DATA GAP | CPG, retail | ~USD 600 M; valuación USD 2.500 M (2022) | Run-rate de USD 500 M; 12,5 M MAU (2025) | Hábito + datos del hogar | Costo y fraude del OCR; no está en LatAm |
| **ShopApp** (AR) | Puntos por ticket → gift cards | DATA GAP | CPG locales (Ayudín, Glaciar) | DATA GAP | Top 3 Shopping en Play (2020); hoy sin señales | Antecedente local con marcas | Sin actividad reciente |
| **Crush Rewards** (Celo) | Scan-to-earn + venta de datos (Synthia) | Token $CRUSH | Consumidores EE. UU./CA | DATA GAP | 1,87 M tokens distribuidos; sin clientes B2B públicos | Referente Web3 | Sin demanda B2B probada; token volátil |
| **Escrow de campañas en Celo/LatAm** | — | — | — | — | **No se encontró ninguno activo** | — | — |

## Mapa de posicionamiento
Dos ejes: **¿quién recibe el incentivo?** (comercio ↔ consumidor) y **¿qué se verifica?** (nada ↔ SKU por persona).

```
                      Verifica SKU + persona nueva
                                 ▲
                                 │   [ESPACIO VACÍO: nosotros]
          Scanntech Promo Club ● │   pago por prueba en almacén sin POS
          (SKU, no persona)      │
                                 │        ● Ibotta / Fetch (EE. UU.)
Incentivo al ◄───────────────────┼───────────────────► Incentivo al
comercio                         │                     consumidor
  BEES / TOKIN ●                 │      ● Gelt (dormida, solo cadenas)
  Bonificación del distribuidor ●│
                                 │   ● Mercado Pago / MODO / Cuenta DNI
                                 │     (por comercio, sin SKU)
                                 ▼
                         No verifica producto
```

## GTM de la competencia (resumen de `raw/competitor-gtm.md`)
- **Fetch es la plantilla a seguir** [Data, entrevista a los fundadores, T1, 2019]: empezaron por un almacén independiente, después marcas locales, distribuidores y recién después de ~2,5 años, Kraft Heinz. Se financiaron con **~USD 150k en premios de competencias, antes de tener código**. Más del 50 % de las descargas llegó por referidos, y un solo email de Kraft Heinz a su base trajo ~10.000 registros.
- **Scanntech suma comercios a través de la fuerza de venta de las marcas** (Salus, Coca-Cola le pasan sus listas de PDV) y se alió con la cámara de almaceneros de Uruguay [Data, T1-2, 2016].
- **Chiper y Tul crecieron por densidad**, ciudad por ciudad (Tul: 1.500 de las 2.000 ferreterías de un valle) [Data, T2].
- **Canal subexplotado en Jujuy:** los **distribuidores y preventistas**. Un distribuidor trae varias marcas y su ruta de almacenes a la vez [Opinion, basado en los casos anteriores].

## Riesgo de plataforma
| Actor | Qué tendría que agregar | Señales 2025-26 | Riesgo a 12–24 meses |
|---|---|---|---|
| Scanntech | Cobertura en almacenes sin POS + identificar "comprador nuevo" | Promo Club activo; USD 180 M frescos; entró a México | **Alto en autoservicios / bajo en almacenes sin POS** |
| Mercado Pago | Escaneo de ticket o código de barras en la app + venta a marcas | Ninguna señal de promos por SKU pagadas por marcas | Medio: técnicamente lo replica en meses, pero su incentivo está en grandes anunciantes |
| BEES / TOKIN | Llegar al consumidor final | Crecimiento de marcas terceras | Medio-alto del lado del almacenero |
| MODO / Ualá | SKU + fuerza comercial con marcas | Promos flash sin sponsor de marca | Bajo-medio |

## Verificación: dónde está la ventaja real (síntesis)
La investigación converge en una conclusión que no estaba en los docs del equipo [Opinion]:

1. Ninguna fuente fiscal o de pago trae el SKU, y una foto de ticket ya no es prueba confiable (recibos hechos con IA).
2. Por lo tanto, **la prueba del SKU tiene que venir del comercio**: un código o QR de la campaña que el almacenero entrega junto con el producto, cruzado con el comprobante QR de pago (comercio, fecha y monto verificables).
3. Eso hace del **almacenero la parte de confianza**, y el fraude dominante pasa a ser la **colusión**: un comercio adherido con amigos que reclaman compras inexistentes cobra USD 0,75 por reclamo falso (0,60 de recompensa + 0,15 de incentivo).
4. **Mitigación que nadie usa todavía:** limitar los reclamos de cada comercio a las **unidades del SKU que compró al distribuidor**. La factura del distribuidor sí trae el SKU (es el lado B2B). La factura de sell-in pone un techo duro al fraude y conecta la idea con la Variación B del brainstorm.
5. **Identificar al "comprador nuevo"**: pagar el reembolso a un CVU/CBU da un ancla de identidad (el CUIL del titular) para deduplicar "1 prueba por persona", con consentimiento.

Esa combinación (código del comercio + comprobante de pago + techo por sell-in + deduplicación por CVU) es un diseño defendible que ni Scanntech (necesita su POS) ni Gelt (foto de ticket de cadena) tienen.

## Recomendaciones estratégicas
- **Dónde competir:** almacenes y kioscos **sin POS Scanntech**, marcas regionales y nacionales que lanzan en el NOA, **pago por comprador nuevo** (CPA), no descuento a todos.
- **Qué evitar:** autoservicios con Scanntech (ahí Promo Club ya resuelve) y competir con las billeteras por el hábito de reintegro (mejor usarlas como riel).
- **Cómo diferenciarse:** "solo pagás por personas nuevas que probaron tu producto, con evidencia auditable". El escrow on-chain sirve como *prueba de que el presupuesto se gastó según las reglas*, no como producto.
- **Postura con Scanntech:** complemento. A futuro podría ser un socio de datos o un comprador potencial [Opinion].

## Análisis de vulnerabilidad
- **Gelt / ShopApp:** dormidas, así que no hay incumbente en el cashback por ticket con marcas en Argentina.
- **Scanntech:** su debilidad es estructural (requiere su POS) y su modelo de suscripción no sirve a pymes del NOA.
- **Billeteras:** no pueden vender SKU a marcas regionales sin un equipo comercial dedicado, y no les conviene por el tamaño del ticket.

## Data gaps
- Cobertura de Scanntech en Jujuy y el NOA; tarifas de Promo Club.
- Condiciones de BEES y TOKIN para marcas terceras.
- Estado real de Gelt (¿Prosegur?) y de ShopApp en 2026.
- Agencias de trade marketing o BTL en Jujuy.
- Ciclo de venta y quién decide en marcas regionales argentinas.
- Fecha de la Serie F de Scanntech: B1 la fecha en oct-2026 (fuentes T2 fechadas) y B2 la menciona como 2025. **Usamos oct-2026.**

## Conexiones estratégicas
- El hueco "almacén sin POS" coincide con lo que ARCA **no** resuelve (sin SKU en el QR fiscal; ver `industry-trends.md`). El hueco está ahí porque es difícil, y la ventaja tiene que ser operativa (red de comercios + antifraude), no tecnológica.
- El riesgo de BEES/TOKIN refuerza la tesis de usar al **distribuidor independiente** (no al de Arcor o Quilmes) como canal: es el aliado natural de las marcas regionales que compiten con esos gigantes.

---

## Flags

**Red Flags:**
- **Scanntech tiene la infraestructura de verificación que nos falta y USD 180 M frescos.** Si decide bajar al almacén chico o a marcas medianas del NOA, la ventaja se reduce a la presencia local.

**Yellow Flags:**
- Los antecedentes de cashback por ticket en Argentina (Gelt, ShopApp) se apagaron. No sabemos por qué, y conviene averiguarlo antes de repetir el modelo.
- La defensibilidad inicial es baja: la mecánica se copia fácil.
- Los almaceneros desconfían de las marcas (hay grupos de WhatsApp organizados contra los aumentos). El mensaje tiene que ser pro-almacenero.

## Fuentes
- Exame (ago-2024), Pulse 2.0 (oct-2026), Revista Mercado (oct-2026), CAS/Radar Scanntech (ene-2023) — T1-2
- InfoNegocios (ago-2024), El Cronista (dic-2025) sobre BEES/TOKIN — T2
- Ibotta FY2025 — T1-2; Fetch (comunicado de mar-2025) — T2; BiggerPockets #32 (fundadores de Fetch, 2019) — T1 entrevista, **desactualizado pero histórico**
- Detalle y URLs: `raw/direct-competitors.md`, `raw/indirect-competitors.md`, `raw/competitor-gtm.md`
