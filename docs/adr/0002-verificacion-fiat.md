# ADR 0002 — Verificación del pago fiat

**Estado:** **Propuesta pendiente.** Describe lo que usaría la demo de hackathon; no está aprobada para fondos reales. Chainlink CRE queda como spike separado.
**Fecha:** 2026-11-11
**Relacionado:** [16 — Modelo de seguridad y liquidación](../16-modelo-seguridad-liquidacion.md) §7–9, [ADR 0001](0001-escrow-y-autorizaciones.md)

## Contexto

El `SettlementOperator` solo puede capturar fondos contra un comprobante de que el pago en ARS se ejecutó. Hay que separar dos cosas:

- **Firma del proveedor:** demuestra **quién** hizo una declaración y quién responde por ella.
- **Prueba independiente de acreditación:** demuestra que el comercio **cobró**. Hoy no tenemos acceso a esa evidencia (ver doc 16, niveles E0 a E5).

## Propuesta

1. **Demo de hackathon:** el comprobante es una **declaración firmada (EIP-712) de un PSP simulado**, con estos campos:
   - `paymentInfoHash`
   - `solverId`
   - monto ARS
   - referencia del rail
   - `issuedAt`

   Es evidencia E1 **[Simulado]** y siempre se nombra como "declaración firmada", nunca como "prueba de acreditación".
2. **Interfaz intercambiable:** el `SettlementOperator` verifica comprobantes a través de una interfaz (`IAttestationVerifier`), siguiendo el patrón `PaymentAttestation` de Peer. Cambiar E1 por E2, E3 o E4 no requiere cambiar el escrow.
3. **Chainlink CRE (E3): spike separado**, fuera de la demo base.
   - Si decidimos probarlo, el día 0 hay que pedir acceso de despliegue con `cre account access`.
   - Mientras no esté aprobado, se usa el simulador.
   - Aun funcionando, CRE prueba lo que **informa la API del PSP**, no la acreditación.
   - La alternativa sencilla, la declaración del PSP simulado, se mantiene siempre.
4. **zkTLS (E4):** queda como visión. Reclaim tiene un provider para transacciones de mercadopago.com.ar, pero el que lo ejecuta es el titular de la cuenta (el comercio), no el pagador turista.

## Reglas de verificación (todos los niveles)

- La clave del atestador tiene que estar registrada, pertenecer al solver comprometido y estar vigente **en el bloque de envío**.
- `paymentInfoHash`, monto y solver tienen que coincidir con el compromiso activo.
- Cada comprobante se acepta una sola vez.
- El registro, la revocación y la respuesta a claves comprometidas siguen el doc 16, §8. Las disputas y los reembolsos, el §9.

## Riesgo que esta propuesta no resuelve

Una declaración falsa firmada con una clave válida (solver deshonesto o clave robada) permite capturar sin que el comercio haya cobrado. Es el riesgo R3 del doc 16. Lo acotan la revocación, la suspensión y la garantía del solver, pero ningún nivel disponible hoy lo elimina.

## Alternativas descartadas para la demo

| Alternativa | Por qué no |
|---|---|
| Firma de nuestro backend | Nos convierte en la fuente de verdad (E0) y contradice la idea de "sin nosotros en el medio" |
| Captura de pantalla del comprobante (patrón PeerPal) | No es verificable por máquina |
| Regex o mock presentado como verificación (patrón FullOnCrypto) | Engaña al jurado y al usuario |

## Pendientes

- Qué firma o referencia real puede entregar un PSP como Manteca, y bajo qué responsabilidad contractual.
- Si Base figura entre las redes soportadas por CRE (la página de redes de la documentación respondió 404 en la investigación).
- Definir el esquema EIP-712 final y sus vectores de test.
