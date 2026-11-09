# 04 · Decisiones de diseño (después de la investigación)

Los docs 01–03 plantean la idea. La investigación de mercado (`docs/investigacion/`) cambió cuatro cosas. Este documento explica qué cambió y dónde está en el código.

## 1. Caso de uso: primera prueba, no cualquier compra

**Antes:** la marca paga por cualquier compra elegible de un SKU.
**Ahora:** campañas de **lanzamiento o primera prueba**. La marca paga por **comprador nuevo** verificado (1 reembolso por persona y campaña).

**Por qué:** en un producto de compra habitual, la marca paga por compras que igual iban a ocurrir. En una primera prueba, la incrementalidad es mucho más alta y defendible.

**Código:** `CampaignLimits.maxClaimsPerBuyer = 1` y `buyerKey` = HMAC del CVU (`apps/api/src/service.ts`).

## 2. Precio: % del precio del SKU con tope

**Antes:** USD 1,50 fijos por compra (0,60 comprador + 0,15 comercio + resto plataforma).
**Ahora:** recompensa = **% del precio del SKU con piso y tope**, más el incentivo al comercio y la comisión de la plataforma.

**Por qué:** USD 1,50 equivale al 119 % del precio de un paquete de galletitas. Con una ganancia bruta de ~23 %, la marca necesitaría unas 5 recompras para recuperar lo que pagó (`market-analysis.md` §2).

**Código:** `packages/domain/src/pricing.ts` (`RewardRule`, `repurchasesToBreakEven`). Hay un test que muestra el caso de las galletitas.

**Recomendación para el piloto:** SKU de ≥ ARS 3.000 (yerba, dulce de leche, bebida o aceite regional).

## 3. Verificación: anclada en el comercio y en datos externos

**Lo que descubrimos:** ni el QR fiscal de ARCA ni WSFEv1 ni el comprobante de un pago QR traen el SKU. Además, el 70,8 % del fraude de recibos detectado en 2026 ya es con tickets generados por IA. Una foto de ticket sola no sirve.

| Ancla | Qué prueba | Código |
|---|---|---|
| **Código de campaña** de un solo uso que entrega el almacenero con el producto | Que el comercio vendió ese SKU a esa persona | `issueMerchantCode`, `Evidence.merchantCode` |
| **Comprobante de pago QR** | Comercio (CUIT), fecha y monto | `Evidence.paymentProof`, `paymentMatches()` |
| **Techo por sell-in**: reclamos ≤ unidades que el comercio compró al distribuidor | Limita la colusión comercio + amigos (fraude dominante cuando el comercio es la parte de confianza) | `SELL_IN_CAP_REACHED`, `NEAR_SELL_IN_CAP` |
| **1 reembolso por CVU** | Que sea un comprador nuevo | `BUYER_LIMIT_REACHED` |
| Huella del ticket | Tickets reutilizados | `DUPLICATE_EVIDENCE` |

Niveles de evidencia: **A** (código + pago coincidente) se aprueba solo; **B** (solo código, o pago + ticket con renglón del SKU) se aprueba con muestreo 1/10; **C** e **insuficiente** van a revisión humana.

## 4. Web3: escrow no custodial de la marca

**Riesgo regulatorio** (`regulatory.md` §4): si la plataforma recibe activos virtuales y los transfiere a terceros como negocio, eso es actividad de **PSAV** ante la CNV (RG 1058/2025 y 1172/2026). Implica SA o SRL, patrimonio mínimo, UIF y auditoría de smart contracts.

**Diseño** (`contracts/src/CampaignEscrow.sol`):
- **La marca despliega y fondea** el contrato. La plataforma nunca tiene los fondos.
- La plataforma solo **firma atestaciones EIP-712**: "reclamo X válido, pagar N a la wallet Y". Cualquiera puede enviarlas (relayer), pero el destino y el monto vienen firmados.
- Cada reclamo se paga una sola vez y hay un **tope por reclamo**, aunque la plataforma firme de más.
- La marca **no puede retirar antes del fin** (presupuesto comprometido), pero **puede pausar o cambiar el firmante**.
- Al terminar, el remanente vuelve a la marca.
- On-chain no hay datos personales, solo ids de reclamo opacos (hash).
- El tag **ERC-8021** lo agrega el cliente de la wallet como sufijo del calldata; hay un test que lo prueba.

**Límites que siguen abiertos:**
- Que la plataforma firme liberaciones puede verse como "administración" (zona gris). Hay que consultarlo con un abogado antes de usar fondos reales.
- El comprador de un almacén de Jujuy no va a tener wallet. En producción, el riel del consumidor es **fiat vía PSP** (Mercado Pago u otro) y el escrow es la **garantía y auditoría del presupuesto del lado de la marca**. Pagar en wARS a consumidores requiere un PSAV aliado que haga la rampa.
- wARS tiene poca liquidez (~USD 200k de volumen en dic-2025). Hay que tener un plan B con USDC o cUSD.

## 5. Reglas de las hackatones de Celo (si se presenta a otra)

Según el repo `vaquita` (Agents on Open Rails), los eliminatorios eran:
- solo Celo mainnet;
- tag ERC-8021 en cada transacción;
- identidad ERC-8004;
- gas pagado en stablecoin;
- repo público.

La tubería de transacciones de `vaquita` (`src/chain/tagged-sender.ts`) cumple todo eso y se puede reutilizar para desplegar y operar `CampaignEscrow`. En mainnet, usar montos chicos y la wallet de la marca de prueba.
