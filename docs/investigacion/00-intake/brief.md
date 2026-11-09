# Brief de intake

**Fase:** 1 — Intake
**Proyecto:** recompensas-verificables-noa (nombre provisional)
**Fecha:** 2026-11-09
**Confianza:** Media — construido a partir de los 3 documentos del equipo.

---

## Fuentes del intake
- Doc 01 · Propuesta de startup y viabilidad (v1.0, 9-nov-2026)
- Doc 02 · MVP: especificación funcional y técnica (v1.0, 9-nov-2026)
- Doc 03 · Análisis competitivo Scan-to-Earn y modelos de fidelización

## La idea
**Una línea:** plataforma B2B2C donde marcas regionales financian promociones por compras elegibles de SKUs específicos en comercios independientes, sin que el comercio cambie su sistema de cobro; el comprador recibe un reembolso/descuento en pesos.

- **Problema (marca/distribuidor):** las promociones en canal tradicional son difíciles de ejecutar y medir por local. [Assumption]
- **Problema (comercio):** poco tiempo, no quiere otro POS. [Assumption]
- **Problema (comprador):** pocas recompensas útiles en compras habituales. [Assumption]
- **Mecánica:** marca define campaña (SKU, locales, vigencia, recompensa, tope) → comercio exhibe la promo → comprador paga como siempre y sube evidencia por web móvil → reglas + revisión manual → pago vía marca o PSP → reporte y conciliación.
- **Lo que NO es:** app de cashback de cualquier ticket, nueva billetera QR, venta de datos, token propio.
- **Web3:** hipótesis de Fase 2 (escrow de campaña en Celo/wARS), condicionada a que un cliente la pida y pague.

## Cliente y mercado
- **Pagador:** marcas de productos envasados de compra frecuente, regionales, y sus distribuidores.
- **Canal:** almacenes, despensas y pequeños autoservicios.
- **Geografía beachhead:** NOA argentino (ciudad específica: **por confirmar**).
- **Referentes:** Scanntech/NielsenIQ (datos de canal tradicional), Ibotta/Gelt (recompensas financiadas por marcas), Crush, Decal, Blackbird.

## Modelo de negocio (simulación del equipo)
- Fee de lanzamiento (USD 100) + precio por compra elegible validada (USD 1,00 / 1,50 / 2,00).
- Del precio salen: recompensa comprador 0,60 + incentivo comercio 0,15 + validación/soporte/pagos 0,25–0,35.
- Contribución por compra: −0,10 / 0,45 / 1,00.
- Break-even caso base ≈ 1.112 compras/mes contra USD 600/mes de fijos (sin sueldos).

## Producto
- MVP: monolito modular (Next.js PWA, Node/TS, PostgreSQL, object storage, workers, ledger, adaptador PSP).
- Piloto: 1 marca, 1–2 SKU, ≤10 comercios, 14 días, 100–300 reclamos.
- Problema técnico central: verificar SKU — un ticket POSNET o un pago QR no trae el detalle del artículo.

## Plan propuesto por el equipo
- 4 semanas de validación comercial (≥12 marcas, ≥15 comercios entrevistados; piloto concierge) antes de construir.
- Sem. 5–12: MVP y campaña repetida.

## Contexto
- Piloto: San Salvador de Jujuy.
- Modo de análisis: **Fast Track**.

## Refinamiento post-brainstorm (2026-11-09)
- **Caso de uso foco:** campañas de **lanzamiento / primera prueba** de productos regionales (Variación A). La marca paga por comprador nuevo verificado, no por cualquier compra.
- **Web3 en alcance:** la hackatón exige un componente Web3. El escrow de campaña on-chain (Celo/wARS u otra red) pasa de "Fase 2 condicionada" a **parte de la demo**, con verificación de compras off-chain. Esto revierte una decisión del doc 01 por razones de contexto (hackatón), no de cliente: hay que mantenerlo desacoplado para poder apagarlo si la startup sigue.

---

## Flags (preliminares)

**Red Flags:**
- **Economía de la marca no probada:** a USD 1,50 por compra validada, para un producto envasado de compra frecuente (ticket probable de pocos USD) el costo por unidad puede superar el margen bruto que la marca gana en esa unidad, sobre todo si muchas compras habrían ocurrido igual. [Opinion] El propio doc 01 lo marca como riesgo crítico.

**Yellow Flags:**
- **Contradicción entre documentos:** el doc 03 recomienda zkTLS y el modelo prepago en stablecoins de Decal como "ruta de mayor viabilidad", mientras que los docs 01/02 los descartan para el MVP. Los docs 01/02 parecen la postura vigente; conviene alinearlo explícitamente.
- **Fuentes débiles en el doc 03:** varios datos clave (p. ej., 35% de ingresos de Fetch por licenciamiento de datos) vienen de blogs (Tier 3) o de una investigación interna sin publicar.
- **La verificación de SKU sin integración POS** tiene costo operativo y riesgo de fraude reales.

## Fuentes
- Documentos internos del equipo (01, 02, 03).
