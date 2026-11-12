# ADR 0001 — Escrow y autorizaciones del pagador

**Estado:** **Propuesta pendiente.** `AuthCaptureEscrow` v1.1.0 es el candidato para un spike. **No está aprobado para producción ni para fondos reales.**
**Fecha:** 2026-11-11
**Relacionado:** [16 — Modelo de seguridad y liquidación](../16-modelo-seguridad-liquidacion.md), [ADR 0002](0002-verificacion-fiat.md)

## Contexto

Necesitamos bloquear el USDC del pagador mientras un solver paga ARS (pago irrevocable), con estas propiedades:

- el pagador firma una sola vez y no necesita ETH para gas;
- devolución rápida cuando ningún solver se comprometió;
- **no devolver automáticamente** cuando un solver ya se comprometió y pudo haber pagado (doc 16, §4.3);
- el pagador recupera sus fondos aunque nosotros desaparezcamos;
- ningún rol puede mover fondos bloqueados ni cambiar un pago ya autorizado.

## Opciones consideradas

| Opción | A favor | En contra | Situación |
|---|---|---|---|
| **A. `AuthCaptureEscrow` v1.1.0 + `ERC3009PaymentCollector` + `SettlementOperator` propio** | Ya está desplegado en Base, con auditorías publicadas y licencia MIT. Trae `reclaim` del pagador y `void` sin límite de tiempo | `authorizationExpiry` es fijo e imposible de extender, y el `receiver` va en la firma. Exige un operador propio que haga cumplir nuestras reglas | **Candidato del spike** |
| B. Escrow propio de dos fases (`commit`/`settle`) | Modela el compromiso y permitiría extender plazos en disputas | Código nuevo sin auditar en el componente más crítico | **No se construye por ahora** |
| C. Reutilizar `EscrowV2` de Peer | Ya resuelve atestaciones y verificadores intercambiables | Está pensado como mercado P2P de on/off-ramp, no como pago a comercio; la adaptación no se evaluó | No evaluada |

## Propuesta

Probar la **opción A** en un spike. No se adopta hasta que el spike cierre con resultado positivo y pase una revisión de seguridad.

- **Autorización:** el pagador firma `ReceiveWithAuthorization` (EIP-3009) para el `PaymentInfo`. Un **relayer** nuestro envía la transacción y paga el gas.
- **Circle Paymaster no es una dependencia.** Queda como alternativa a evaluar si queremos que el usuario pague el gas en USDC sin relayer.
- **`operator` = `SettlementOperator`**: contrato propio y mínimo, con los roles y permisos del doc 16, §8.
- **`receiver` = `SettlementOperator`**, que reenvía lo capturado al solver que se comprometió. Esto permite cambiar de solver sin una segunda firma.
- **Plazos:**
  - `preApprovalExpiry` = vencimiento de la cotización;
  - `authorizationExpiry` = plazo largo para el caso "pagó y se perdió la confirmación";
  - `refundExpiry` = ventana de disputa.

## Compatibilidad verificada leyendo el código

Verificado el 2026-11-11 en [`AuthCaptureEscrow.sol`](https://github.com/base/commerce-payments/blob/main/src/AuthCaptureEscrow.sol), [`ERC3009PaymentCollector.sol`](https://github.com/base/commerce-payments/blob/main/src/collectors/ERC3009PaymentCollector.sol) y [`FiatTokenV2_2.sol`](https://github.com/circlefin/stablecoin-evm/blob/master/contracts/v2/FiatTokenV2_2.sol). Es lectura de código, **no ejecución**: el spike tiene que confirmarlo con pruebas.

| Necesidad | Comportamiento | Compatible |
|---|---|---|
| Devolución rápida | `void`: solo el operador, sin límite de tiempo | Sí, y las reglas las pone el operador |
| Sin devolución automática después del compromiso | El escrow no devuelve nada solo; solo devuelven `void` (el operador) y `reclaim` (el pagador, después de `authorizationExpiry`) | Sí, siempre que el `SettlementOperator` bloquee `void` después del compromiso |
| El solver pagó y la confirmación se perdió | `capture` revierte si `block.timestamp >= authorizationExpiry`, y desde ese momento el pagador puede hacer `reclaim` | **Parcial.** El solver tiene un plazo duro que no se puede extender (riesgo R1 del doc 16) |
| Recuperación sin nosotros | `reclaim`: solo el pagador, después de `authorizationExpiry` | Sí |
| Firma única y sin reutilización | `receiveWithAuthorization`, `nonce = _getHashPayerAgnostic(paymentInfo)`, `validBefore = preApprovalExpiry` | Sí |
| Firmas de smart accounts | `FiatTokenV2_2` tiene variantes de `receiveWithAuthorization` con `bytes signature`, "signed by an EOA wallet or a contract wallet"; el collector pasa la firma por `_handleERC6492Signature` | Probable. **Falta probarlo** y confirmar qué versión de USDC corre en Base |
| Sin roles de admin en el escrow | `AuthCaptureEscrow.sol` no tiene owner, roles ni mecanismo de upgrade | Sí para ese archivo. Falta revisar `TokenStore` y los collectors |
| Disputas después de capturar | `refund`: solo el operador, antes de `refundExpiry`, y **los fondos salen del lado del operador** | Parcial. Sin una garantía financiada no hay reembolso (doc 16, §9) |

## Plan del spike

**Alcance:** red local o Base Sepolia, con USDC de testnet. Sin fondos reales, sin PSP real, sin despliegue en mainnet. El código del spike es descartable y no es código de producto.

| Grupo | Qué se prueba |
|---|---|
| **A. Expiraciones** | `authorize` después de `preApprovalExpiry` revierte. `capture` en `authorizationExpiry` o después revierte. `reclaim` antes de `authorizationExpiry` revierte y después funciona. `refund` después de `refundExpiry` revierte. Qué orden exige el escrow entre los tres vencimientos |
| **B. Compromiso** | Solo se compromete un solver registrado y nombrado en la cotización. Un segundo compromiso se rechaza. El respaldo puede comprometerse después de `commitDeadline`. `void` queda bloqueado después del compromiso y se habilita con un "no ejecutado" firmado |
| **C. `capture`** | Procede con una declaración válida. Se rechaza con hash, monto o solver incorrectos, con clave revocada o con una declaración reutilizada. Se captura una sola vez y por el monto exacto. Los fondos llegan a la dirección registrada del solver. Cómo configurar los fees (`minFeeBps`, `maxFeeBps`, `feeReceiver`) |
| **D. `void` y `reclaim`** | El pagador recibe el monto exacto. Después de `void` o `reclaim` no se puede capturar |
| **E. Confirmación fiat perdida** | Con compromiso y pago fiat simulado como ejecutado: (1) la declaración llega tarde pero antes de `authorizationExpiry` y se captura; (2) nunca llega, el pagador hace `reclaim` y queda registrada la pérdida del solver; (3) llega después de `authorizationExpiry` y `capture` revierte. En ningún caso hay devolución automática mientras el compromiso está activo |
| **F. Wallets** | Firma EIP-3009 con una EOA. Con una smart account ya desplegada (ERC-1271). Con una smart account todavía no desplegada (envoltorio ERC-6492). El flujo completo con Base Account (passkey). Si la firma cubre `maxAmount` o el monto exacto, y qué ve el usuario en cada wallet |
| **G. Operador como `receiver`** | Un mismo contrato como `operator` y `receiver`: reenvío al solver, efecto en los fees y en el `TokenStore`, y que no queden fondos trabados |
| **H. Costos** | Gas de `authorize`, compromiso, `capture`, `void` y `reclaim`, que paga el relayer |

**Verificaciones sin código:**

- Que la dirección desplegada en Base coincide con v1.1.0 y con las auditorías publicadas.
- Qué versión de USDC corre en Base y Base Sepolia.
- Revisión de `TokenStore` y de `_handleERC6492Signature`.

**Criterio de salida:** un informe por grupo con resultado (pasa, falla, no concluyente) y una recomendación: seguir con la opción A hacia el diseño del piloto, o volver a evaluar las opciones. Que "no se puede extender `authorizationExpiry`" sea aceptable es una decisión de negocio que se toma con ese informe.

## Consecuencias

- Si la opción A se aprueba más adelante, el código propio crítico queda reducido al `SettlementOperator`.
- El riesgo de "pagué y no lo pude probar a tiempo" queda **del lado del solver** (R1), y lo tiene que aceptar en su acuerdo.
- El pagador, en el caso `Unknown`, espera como máximo hasta `authorizationExpiry`.
- Los reembolsos posteriores a `capture` necesitan financiación (doc 16, §9); esta propuesta no la resuelve.
