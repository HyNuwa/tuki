# ADR 0002 — Verificación de observaciones y qué se vende como "verificado"

**Estado:** propuesta pendiente.
**Fecha:** 2026-11-12
**Contexto relacionado:** [doc 16](../16-modelo-seguridad-verificacion-pagos.md) (§2 verificación por capas, §3 fraude), [doc 15](../15-stack-tecnologico.md) (spikes S3, S4, S5).

## Contexto

Un comprador paga por observaciones del comercio físico porque confía en que sean reales. Pero ninguna capa por sí sola demuestra que una persona compró esos artículos a ese precio:

- El QR fiscal de ARCA codifica emisor, comprobante, fecha, total y CAE, pero **no los ítems**. Además puede incluir el documento del comprador (`tipoDocRec`, `nroDocRec`).
- La extracción con un LLM de visión puede leer mal o inventar ítems.
- World ID demuestra que una cuenta corresponde a un humano único, no que esa persona hizo la compra.
- Un ticket ajeno, encontrado o compartido no deja ninguna señal fuerte.

## Decisión propuesta

1. **Niveles explícitos.** Cada observación lleva un nivel: L0 imagen + extracción, L1 QR consistente con la imagen, L2 constatación en ARCA, L3 corroboración independiente. Cada agregado declara el nivel mínimo que usa, y cada tarea fija `minVerificationLevel`.
2. **Los controles automáticos solo rechazan o mandan a revisión.** Aceptar exige que todos los controles obligatorios del nivel den `pass`.
3. **Lenguaje honesto.** Solo una observación L1 o superior con el total cuadrado se vende como "precio pagado". Una foto de góndola sin QR se vende como "precio de góndola observado".
4. **Reglas de aceptación públicas por tarea.** El rechazo opaco es la primera causa de abandono de contribuyentes en Receipt Hog, Fetch, Premise y Field Agent ([review-mining](../../agent-data-marketplace/raw/review-mining.md)), así que el motivo del rechazo se muestra siempre.
5. **Minimización.** `nroDocRec` y cualquier dato del comprador se descartan antes de guardar. Las imágenes son privadas y tienen retención limitada.
6. **Verificada no es lo mismo que entregable.** `accepted` (pasó la verificación) genera la recompensa; `aggregation_eligible` exige además licencia y consentimiento vigentes y nivel de verificación igual o mayor que el exigido (definición canónica en el [doc 04](../04-arquitectura-tecnica.md)); solo un resultado `deliverable` (cumple los criterios del comprador y los umbrales de privacidad) se cobra. Ver doc 16, §5.1, y [doc 04](../04-arquitectura-tecnica.md).
7. **Alcance del hackathon:** L0 y L1 con revisión manual. L2 (ARCA), World ID, C2PA y zkTLS quedan como spikes o experimentos fuera del hackathon (doc 15).

## Alternativas descartadas por ahora

- **Solo OCR + World ID:** no detecta un ticket ajeno ni una imagen editada con el total cambiado.
- **zkTLS como capa principal:** solo sirve cuando el comercio emite factura web, y el ticket en papel del canal tradicional queda afuera. Queda como experimento.
- **Revisión manual de todo:** no escala al precio por observación buscado.

## Consecuencias

- Hay un fraude residual aceptado (ticket ajeno) que se mitiga con topes por persona, consenso L3 y auditoría por muestreo. Las recompensas en stablecoin no se pueden revertir.
- Una observación aceptada se recompensa aunque el encargo no llegue a un resultado entregable; ese costo lo cubre la reserva de garantía de la plataforma (doc 16, §4.3).
- Los umbrales de pHash, las ventanas y los topes se calibran con datos reales.

## Pendiente

Spikes S3 (calidad de extracción en 100 tickets reales), S4 (constatación ARCA automática) y S5 (World ID en Argentina).
