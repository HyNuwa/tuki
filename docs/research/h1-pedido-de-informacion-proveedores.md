# H1 — Pedido de información a proveedores (borrador)

**Estado:** borrador para revisión. **No autoriza ningún contacto.** Nada de este documento se envió a terceros. Enviarlo requiere una autorización explícita del fundador, que indique a qué candidatos y por qué canal.

**Objetivo:** reunir la evidencia que pide H1 ([doc 17](../17-posicionamiento.md), §5): al menos dos proveedores independientes, con acceso efectivo al corredor USDC → QR argentino, que cotizan y aceptan por escrito cómo comprometen, pagan, prueban y cobran.

## 1. Criterio de evaluación (propuesto, pendiente de aprobación)

- **Pasa provisionalmente:** dos proveedores aceptan avanzar con el mismo caso de pago y con una asignación de riesgos explícita compatible con el [doc 16](../16-modelo-seguridad-liquidacion.md), sin esconder excepciones.
- **Se refuta comercialmente:** de al menos cinco que responden, menos de dos aceptan, o todos exigen prefondeo o cobrar el USDC antes de pagar.
- **Inconclusa:** responden menos de cinco, o los que responden no acreditan capacidad. No se reemplaza con una simulación.
- **No cuenta como aceptación:** "nos interesa" sin condiciones concretas. Una expresión de interés no vinculante tampoco es un contrato ni una operación.

## 2. Candidatos

Lista tomada de la investigación interna no versionada (`solver-economics-cold-start.md`). **Ningún dato de esta tabla está verificado para el caso de pago QR.** Antes de cualquier contacto, confirmar el rail, la licencia y el canal comercial de cada uno.

| Candidato | Por qué está en la lista | Lo que hay que confirmar antes de contactar |
|---|---|---|
| Manteca | Procesa el pago QR de Bybit Pay en Argentina | Precio B2B (no es público); su documentación cambió de dominio |
| Ripio (B2B) | Exchange local con API; margen implícito ~1% en Ripio Exchange | Si ofrece pagos a QR por API o solo venta de USDC |
| Bitso Business | Ofrece pagos en ARS a terceros | Hoy exige prefondeo en cripto, lo opuesto a nuestras reglas |
| belo | Exchange local; margen implícito ~0,95% | Si tiene API B2B |
| Fiwind | Uno de los márgenes más bajos (~0,5%) | Si tiene API B2B |
| Cocos Crypto | Margen implícito ~0,6% | Si tiene API B2B |
| Settle | Infraestructura de pagos en LatAm | Cobertura del QR argentino |
| BlindPay | Infraestructura de pagos con stablecoins | Cobertura de ARS |
| Koywe | Rampa cripto–fiat en LatAm | Cobertura de ARS y del QR |

**Fuera de la lista, como referencia:** Paycrest, porque es el único precedente documentado de proveedores que pagan primero contra un escrow, y conviene preguntarle cómo consiguió sus primeros nodos. Yodl y Circle Payments Network son competidores o alternativas, no candidatos.

**Advertencia ya documentada:** les pedimos a instituciones con licencia peores condiciones que las que tienen hoy. En Circle Payments Network y en Bitso Business cobran antes de pagar. Sin una concesión (por ejemplo, responsabilidad contractual en lugar de fianza, o conciliación para el caso en que pagaron y no llegaron a probarlo), es probable que H1 falle.

## 3. Descripción del caso de pago (para adjuntar al pedido)

> Una persona con USDC en su propia wallet escanea un QR interoperable de un comercio argentino. Varios proveedores reciben el pedido y cotizan el monto en pesos, con vencimiento. El USDC del pagador queda bloqueado en un contrato de escrow en Base. El proveedor elegido se compromete, paga los pesos al comercio y entrega una declaración firmada con la referencia del pago. Con esa declaración cobra el USDC del escrow. Si no presenta la declaración antes del plazo máximo, el pagador recupera su USDC y el proveedor no cobra.
>
> Hoy es un diseño, no un producto. No hay pagos reales ni contratos en producción. Buscamos entender si estas reglas serían aceptables para ustedes y con qué condiciones.

## 4. Cuestionario

Pedir respuesta escrita a cada pregunta. "No sabemos" o "no aplica" es una respuesta válida y se registra como tal.

**Cobertura y elegibilidad**

1. ¿Pueden pagar a un QR interoperable argentino (Transferencias 3.0) por API? ¿Y a alias o CVU? ¿Qué billeteras y QR quedan fuera?
2. ¿Con qué registro o licencia operan (PSAV ante la CNV, PSP ante el BCRA, otro)? ¿Qué exigen del pagador? En particular: ¿aceptan pagadores no residentes sin DNI?

**Precio y cotización**

3. ¿Cómo cotizan: spread, fee fijo, mínimos por pago y por mes? ¿Cuánto dura una cotización firme?
4. ¿Su API devuelve una cotización ejecutable que puedan comprometer antes de pagar?

**Las reglas de pago**

5. ¿Aceptarían pagar los pesos **antes** de recibir el USDC, contra un escrow onchain que les paga al presentar una declaración firmada? Si no, ¿qué condición lo haría aceptable (fianza, límite por pago, responsabilidad contractual, conciliación)?
6. ¿Qué evidencia del pago pueden entregar automáticamente: una declaración firmada por su API, un número de operación del rail, otra cosa? ¿Puede firmarla su propio sistema?
7. ¿Cuánto tardan, en la mediana y en el peor caso, entre ejecutar el pago y poder confirmarlo? ¿Con qué frecuencia falla o queda incierto un pago?
8. Si pagaron y no logran probarlo antes del plazo máximo, pierden el USDC. ¿Qué plazo necesitarían para que ese riesgo sea aceptable?
9. Si su firma se usara para declarar un pago que no ocurrió (error o clave comprometida), ¿qué responsabilidad asumirían?

**Operación**

10. ¿Necesitan prefondeo o un saldo en pesos? ¿Quién lo financia y a qué costo?
11. ¿Pueden recibir USDC en Base en una dirección propia? ¿Qué pasa si el emisor congela esa dirección o pausa el token?
12. ¿Qué volumen mínimo justificaría la integración para ustedes?

**Cierre**

13. ¿Estarían dispuestos a dejar por escrito un interés no vinculante, con sus condiciones, para avanzar con este caso de pago?

## 5. Registro de respuestas

Una fila por candidato. Se completa solo con lo que el candidato respondió por escrito.

| Candidato | Fecha | Canal | Rail QR (P1) | Licencia y pagador no residente (P2) | Precio (P3–P4) | Acepta pagar primero (P5) y condición | Evidencia (P6) | Tiempos y fallas (P7) | Plazo pedido (P8) | Responsabilidad (P9) | Prefondeo (P10) | USDC en Base (P11) | Volumen mínimo (P12) | Interés escrito (P13) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | | | | |

## 6. Decisiones pendientes antes de enviar

- Aprobar el criterio de la sección 1.
- Autorizar el contacto con terceros: a qué candidatos y por qué canal.
- Elegir quién firma el pedido y cómo se presenta el proyecto (hackathon o startup en validación).
- Revisar si la descripción del caso (sección 3) revela algo que todavía no se quiere compartir.
