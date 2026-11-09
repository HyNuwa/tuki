# Brainstorm — variaciones de la idea (Fast Track: 3)

**Fase:** 2 — Brainstorm
**Proyecto:** recompensas-verificables-noa
**Fecha:** 2026-11-09
**Confianza:** Baja — es exploración; nada de esto está validado todavía.

---

**Idea base:** las marcas pagan por compra validada de un SKU en almacenes de Jujuy y el comprador sube la prueba desde una web móvil.

Sus dos puntos débiles son la **incrementalidad**: en un producto de compra habitual, la marca paga por compras que igual habrían ocurrido. Y la **verificación del SKU**: un ticket de almacén rara vez trae el detalle del artículo. Las tres variaciones atacan alguno de esos dos puntos.

## Variación A — "Pago por primera prueba" (lanzamientos y nuevos puntos de venta)
Mismo producto, distinto caso de uso: solo campañas de **lanzamiento o entrada a una zona nueva**. La marca paga por *primer comprador* de un producto nuevo, no por cualquier compra.
- **Lo atractivo:** la incrementalidad es mucho más alta y defendible, porque nadie compraba ese producto antes. Encaja con el presupuesto de *trade marketing* o sampling, que ya existe. Un costo por prueba de USD 1–2 compite con regalar muestras.
- **Lo riesgoso:** menos campañas al año por marca, con ventas más episódicas. Hay que limitar el reclamo a un comprador por persona, lo que exige algún tipo de identidad.
- **Competencia:** compite con agencias de sampling y promotoras en el local, no con Ibotta.

## Variación B — Incentivar al almacenero, no al consumidor
La plataforma no le habla al comprador: la marca o el distribuidor pagan al **comercio** por objetivos verificables (exhibición en góndola, cartel colocado, sell-out de N unidades). El almacenero lo prueba con una foto o con la factura de compra al distribuidor.
- **Lo atractivo:** elimina la app de consumidor y la adquisición de compradores, que es la mitad del problema. Hay un solo usuario por local. La factura del distribuidor sí trae el SKU, así que la verificación es más fácil. Los distribuidores ya gastan en incentivos a comercios.
- **Lo riesgoso:** es un mercado de *retail execution* / trade marketing con jugadores existentes (a investigar en la Ola 2). Pierde la parte de "recompensa al comprador", y con ella el atractivo de demo B2B2C.
- **Competencia:** apps de retail execution y fuerzas de venta, y planillas de WhatsApp de los distribuidores.

## Variación C — Versión "hackatón": escrow de campaña on-chain
Mantener la idea base, pero hacer que el **presupuesto de la campaña viva en un escrow** (Celo/wARS o similar) que libera pagos según reglas públicas, con verificación off-chain (confirmación del comercio y ticket).
- **Lo atractivo:** si la hackatón es Web3, es la demo diferencial. Le muestra a la marca, de forma auditable, que su presupuesto solo se gastó en compras válidas.
- **Lo riesgoso:** el doc 01 ya concluye, con razón, que Web3 no resuelve el problema central (la verificación). Abre preguntas regulatorias (CNV/PSAV) y, sin un cliente que lo pida, es solución buscando problema.
- **Competencia:** ninguna local directa, porque nadie lo pide todavía.

## Lectura inicial [Opinion]
- **A** es la que mejor arregla la economía de la idea base, sin cambiar el producto.
- **B** es la que mejor arregla la verificación y la fricción, pero es otro negocio.
- **C** solo tiene sentido como capa de demo si el jurado de la hackatón premia Web3.
- Combinación sugerida para la hackatón: **producto base + caso de uso A**, con C opcional como módulo de demo.

---

## Flags

**Red Flags:**
- Ninguna variación resuelve por sí sola conseguir marcas que paguen. El cuello de botella es comercial, no técnico.

**Yellow Flags:**
- La Variación B podría chocar con jugadores establecidos de retail execution (a verificar).
- La Variación C arrastra el antipatrón "solución buscando problema" si se pone en el centro.

## Fuentes
- Docs internos 01–03. Sin investigación web todavía.
