# Dirección del fundador para la síntesis estratégica (2026-11-12)

Texto del fundador, sin modificar. Tiene prioridad sobre el intake y sobre cualquier conclusión previa de la investigación.

---

Sí, retomá la síntesis estratégica con la nueva dirección de **red RFQ de payment solvers para pagos cripto → moneda local**.

Pero haría una distinción importante: **no quiero adoptar todavía «liquidación garantizada» como categoría**, porque no tenemos un mecanismo probado de confirmación bancaria, garantías financiadas ni proveedores reales que acepten nuestras reglas.

Propongo que investiguemos y definamos:

1. **Posicionamiento B2B:** nuestra propuesta es una red de ejecución de pagos donde proveedores independientes compiten mediante RFQ para convertir criptomonedas en pagos locales. Evaluar si esa categoría es defendible frente a P2P.me, Yodl, ZKP2P y otros protocolos basados en intents.

2. **Propuesta B2C:** qué beneficio concreto percibe el usuario frente a pagar con tarjeta, efectivo, exchanges o las aplicaciones existentes. No utilizar términos técnicos como RFQ o solvers en el mensaje comercial.

3. **Diferenciación real:** investigar si la combinación de competencia entre proveedores, liquidación verificable, recuperación ante fallos y acceso a distintos corredores ofrece algo que los competidores no resuelven actualmente. Separar capacidades existentes de ventajas todavía hipotéticas.

4. **Modelo de negocio y efecto de red:** cómo conseguimos los primeros solvers, qué incentivo económico tienen para participar y qué volumen necesitamos para sostener las operaciones. Analizar el problema de arranque entre oferta y demanda.

5. **Evolución internacional:** mantener la arquitectura multichain y multipaís, pero utilizar USDC en Base → QR argentino como corredor inicial, no como identidad permanente del producto.

6. **Riesgos técnicos pendientes:** conservar como bloqueantes de producción el solver que compromete y no paga, el vínculo verificable entre la firma EIP-3009 y la intención mostrada al usuario, los fondos congelados por el emisor y la financiación de reembolsos.

Quiero que la síntesis termine con:
- Una propuesta de posicionamiento B2B y otra B2C.
- Una matriz competitiva basada en capacidades verificadas.
- Nuestra hipótesis de ventaja competitiva.
- Un modelo de ingresos preliminar.
- Las tres hipótesis que debemos validar antes de invertir más desarrollo.

**No cambies todavía la arquitectura ni apruebes la promesa de liquidación garantizada.** Primero necesitamos demostrar que esta red puede ofrecer una mejora comercial real y que los proveedores estarían dispuestos a participar.

No hace falta otro commit por ahora; avancemos con la síntesis estratégica como documento de investigación.

---

## Restricciones vigentes de conversaciones anteriores

- Es una hackathon: primero se valida la idea, después se formaliza. Lo legal va después.
- No habrá prueba de campo con comercios.
- No definir la startup por el nicho de 550–1.650 personas en Buenos Aires: es un mercado de validación; la ambición es global, por corredores.
- No reducir la estrategia a "otra wallet de USDC para turistas".
- Estado real del producto: **no existe código**. La arquitectura (docs/04, 15, 16 y ADR en la raíz del repo) es un diseño no aprobado para fondos reales. La demo de hackathon usará dos solvers y un PSP simulados.
