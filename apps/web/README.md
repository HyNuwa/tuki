# apps/web — PWA (pendiente)

Todavía no está construida. Según el doc 02 (§9), va a ser **Next.js + TypeScript** con tres superficies:

| Superficie | Usuario | Pantallas mínimas |
|---|---|---|
| Landing de oferta | Comprador | Condiciones en lenguaje claro → cargar código del comercio + comprobante de pago + CVU → folio y estado |
| Panel del comercio | Almacenero | Ofertas activas, "generar código" (botón grande, < 20 s), reclamos del día |
| Panel de marca y operación | Marca / operador | Crear campaña, previsualizar compromisos, activar; revisión de reclamos; pagos; reporte agregado |

Principios:
- Montos siempre en pesos (`formatARS` de `@rvn/domain`).
- Nada de cripto visible para el comprador ni para el almacenero.
- Funciona desde un link o QR, sin instalar nada. WhatsApp como canal de aviso.

La API que consume está en `apps/api` (`npm run dev -w apps/api`).
