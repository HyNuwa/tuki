# 13 — Resumen ejecutivo para presentar al equipo

**Estado: propuesta de startup para validar, no compañía operativa. Fecha: 10 de noviembre de 2026.**

## La idea en 30 segundos

Personas que tienen USDC pueden encontrarse frente a comercios que cobran mediante QR local. Queremos facilitar que paguen desde una wallet compatible y que el negocio cobre en ARS, **utilizando un proveedor existente que procese la conversión y liquidación**. La diferencia que buscamos es una experiencia confiable y enfocada en viajeros y usuarios internacionales, no otra blockchain, pasarela o exchange.

## Primer mercado

- Destino: Argentina.
- Usuario inicial: viajero internacional o freelance con USDC en wallet EVM.
- Primer formato: QR argentino que el procesador admita; no todos.
- Activo/red: USDC en una red admitida por el proveedor, preferencia inicial Base.
- Canal de adquisición: un socio turístico o comunidad con usuarios reales.

## Lo que NO vamos a construir aún

- No procesaremos ARS nosotros mismos ni captaremos depósitos.
- No construiremos liquidez P2P, AMM, cross-chain bridge o escrow propio.
- No prometeremos KYC cero, anonimato, pagos offline o instantaneidad garantizada.
- No desarrollaremos una red federada de comercios todavía.

## Por qué ahora puede ser viable

Existe infraestructura SDK para este flujo: Yodl documenta integración React Native y cobertura argentina; otros proveedores como Interlace y 8B documentan mercados regionales. **Eso es una oportunidad de ahorro de desarrollo y a la vez una amenaza competitiva**: otros también pueden integrarla.

## Qué probará el MVP

1. Problema real y repetido: pago QR fallido con otras opciones.
2. Posibilidad técnica, legal y comercial de usar un proveedor para nuestra app.
3. Costo total y tiempo de pago competitivos.
4. Un canal capaz de aportar usuarios sin un CAC superior al margen de vida útil.
5. Soporte y conciliación de casos reales, no solo una demo feliz.

## Riesgo central

Si Yodl o P2P.me ofrecen directamente lo mismo sin mayor costo, y nuestros usuarios pueden acceder igual de fácil, **no existe motivo para crear nuestra aplicación**. Necesitamos demostrar una mejora real en distribución, UX, fiabilidad, ayuda local o integración particular.

## Economía ilustrativa

US$30 por pago × 1 % de convenience fee × 70 % para la integración = **US$0,21 de ingreso bruto propio**; 10.000 pagos al mes = US$2.100 **antes de cualquier costo propio**. Es ejemplo, no previsión ni contrato.

## Camino a 8 semanas

- Semanas 1–2: usuarios y proveedores.
- 3–4: prototipo y SDK sobre ambiente de pruebas.
- 5–6: error handling, cotizaciones, QA.
- 7–8: cumplimiento, canal, go/no-go de piloto autorizado.

## La visión futura

Si los pagos generan una relación comercial real, explorar beneficios opcionales con comercios adheridos. Solo después investigar redes comerciales federadas y liquidación de recompensas entre participantes; no contar ingresos de esa etapa ahora.

## La decisión que necesitamos tomar

**¿Podemos encontrar un grupo de usuarios y un proveedor que nos permitan ofrecer algo objetivamente mejor que las soluciones existentes?** Si no, detener el proyecto o cambiar el segmento antes de escribir infraestructura financiera propia.

Ver [01 — Visión](01-vision-y-tesis.md), [03 — PRD](03-prd-mvp.md), [06 — Proveedores](06-evaluacion-de-proveedores.md) y [09 — Validación](09-validacion-y-go-to-market.md).
