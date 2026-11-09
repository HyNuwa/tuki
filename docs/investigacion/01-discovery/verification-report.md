# Informe de verificación: recompensas-verificables-noa
*Generado: 2026-11-09. Revisión hecha en la sesión principal, sin un agente separado (Fast Track).*

## Resumen
- **Críticos:** 0
- **Advertencias:** 4
- **Info:** 3

## Críticos
Ninguno. Las contradicciones encontradas están declaradas y explicadas en los entregables.

## Advertencias

### 1. Costo de la degustación: dos estimaciones incompatibles
- **Archivos:** `market-analysis.md` §2.2 y §6; `raw/market-size.md` §4.2; `raw/indirect-competitors.md` §5
- **Problema:** A1 estima USD 1,5–2,2 por comprador convertido y B2, USD 6–30. Es el dato que decide si la propuesta es más barata que la alternativa.
- **Arreglo:** está declarado en `market-analysis.md` §6, con un rango de trabajo de USD 2–10. Hay que cerrarlo con 2 cotizaciones de agencias BTL (experimento de la Fase 8).

### 2. Fecha de la Serie F de Scanntech
- **Archivos:** `raw/direct-competitors.md` (oct-2026) vs `raw/indirect-competitors.md` (2025)
- **Arreglo:** los entregables usan oct-2026, que tiene fuentes T2 con fecha.

### 3. Datos desactualizados
- Scanntech Argentina con ~1.400 PDV (dic-2022), entrevista a los fundadores de Fetch (2019) y 14 % de trade spend (~2012). Están marcados con ⚠️ en `confidence-dashboard.md` y como "desactualizado" en `market-analysis.md`.

### 4. Corroboración que no es independiente
- La cifra del 70,8 % de recibos con IA viene de una sola nota T3 que cita a AppZen. No está corroborada; por eso tiene confianza Baja-Media.
- Las poblaciones del NOA (excepto Jujuy) las tomó A1 de memoria. Solo afectan el SAM del NOA, que ya tiene confianza Baja.

## Info
- `target-audience.md` **no se generó**: el Fast Track omite la Ola 3 (voz del cliente). No hay personas basadas en datos; es el hueco más grande, junto con la falta de validación con clientes.
- Las cifras de TAM/SAM/SOM son consistentes entre `market-analysis.md` y `raw/market-size.md`.
- Todos los entregables tienen las secciones de Flags, Data gaps y Fuentes.

## Checklist de verificación
- [x] Afirmaciones cuantitativas etiquetadas (salvo cifras de contexto en tablas con su fuente al lado)
- [x] Contradicciones internas declaradas
- [x] Confianza consistente con la evidencia
- [x] Data gaps declarados
- [x] Flags presentes
- [x] Datos viejos marcados
- [x] Fuente única marcada como tal
- [ ] Cruce entre fases (estrategia, finanzas, validación): pendiente, se revisa al cerrar la Fase 8
