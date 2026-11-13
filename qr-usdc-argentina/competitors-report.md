# Informe de inteligencia competitiva: pago de QR argentinos con USDC desde la wallet propia

*Skill: startup-competitors | Generated: 2026-11-11*

**Producto evaluado (pre-lanzamiento, etapa hackathon).** App móvil liviana. Un viajero de estadía larga, nómada o freelancer extranjero con USDC en Base escanea un QR de comercio argentino y firma el pago desde la wallet que ya tiene. Un proveedor licenciado hace el FX y liquida ARS al comercio. Dirección de diferenciación: sin depósito, cotización all-in garantizada con vencimiento y reembolso automático, failover entre proveedores, todos los QR más alias/CVU y comprobante verificable para el comercio.

**Etiquetas.** [Data] dato con fuente · [Estimate] cálculo con supuestos · [Assumption] supuesto sin verificar · [Opinion] juicio analítico. **Confianza:** Alta / Media / Baja. La base son los seis archivos de `raw/` (investigados el 2026-11-10) y el informe previo `reports/Pagos QR con USDC en Argentina.md`.

---

## Resumen ejecutivo

1. El segmento "extranjero paga QR argentino con stablecoins" está **fragmentado**: hay 11 jugadores en el set analizado, de los cuales unos 6 son especialistas que operan en Argentina (el resto son wallets generalistas como Bitget y MiniPay, un producto que no paga QR argentinos como Settle y otro que no opera en Argentina como Quay). Entre todos suman menos de 25 reseñas que mencionen pagos QR en Argentina [Data; ese volumen tiene confianza Baja en `raw/review-mining.md`]. Al mismo tiempo, el segmento se está **consolidando** como una función más de las wallets grandes (Bitget, MiniPay, KuCoin) y de los rieles fiat (Global66, Alipay+) [Data; confianza Media].
2. El hallazgo clave es que el hueco "pagar firmando desde la wallet que ya tenés, sin depositar" sigue existiendo en las apps de consumo que operan en Argentina, pero es **angosto y fácil de cerrar**. El SDK de Yodl ya lo habilita para cualquier wallet EIP-1193 y Bitget lo ofrece a quien ya usa Bitget Wallet [Data; confianza Media].
3. La mayor oportunidad es convertir la confiabilidad en una **promesa medible**: cotización all-in garantizada con vencimiento, reembolso automático y failover. Fondos que "desaparecen" en pagos fallidos aparecen en 4 de 7 productos, ninguno publica un SLA, y en los foros hay aversión al riesgo antes incluso de probar: un usuario evaluó Peanut y decidió quedarse con Western Union ("this seems like too much risk for my comfort. I think I will stick to Western Union") [Data/Opinion; confianza Media].
4. El mayor riesgo es la **demanda**. En los foros gana el status quo (tarjeta, efectivo y Western Union). El usuario que siente el dolor (sin DNI, con USDC y en comercios que solo aceptan QR) es un nicho dentro del nicho. Y el precio no diferencia: P2P.me y Peanut quedan a menos de 0,6% del mejor precio, frente a nuestro +1,3–2,0% ilustrativo [Data/Estimate; confianza Media-Alta].
5. Evaluación general: **todavía no hay evidencia para construir una app independiente a escala**. Durante la hackathon, la idea se valida sin dinero real: (a) demo end-to-end sobre testnet de Base con un **proveedor mock** que simule cotización, vencimiento, liquidación y reembolso (máquina de estados quoted→signed→onchain→fiat_settled/refunded); (b) landing con waitlist y el mensaje "pagá QR argentinos desde tu wallet de Base", midiendo conversión; (c) un concierge con 5–10 asistentes del evento usando la demo. Conviene diseñar desde el día uno como componente embebible (mini-app de Base o SDK) con un adaptador de proveedores propio, no montado sobre Yodl [Opinion]. La regla de corte con QR reales queda para después de la hackathon (ver "Después de la hackathon").

---

## Concentración del mercado

- **Estructura:** fragmentada en el nivel de especialistas y en consolidación hacia funciones de wallets o super-apps [Opinion]. Ningún especialista muestra volumen relevante en Argentina. El único dato independiente de volumen turista es de Global66, un riel fiat: US$1,7M en 10 meses [Data].
- **Jugadores activos:** 11 en el set acordado, más unos 8 adyacentes o nuevos (Global66, Alipay+, Binance Pay, Bybit Pay/Manteca, KuCoin Pay, Wallbit, belo, Fiserv/Clover) [Data].
- **Concentración del financiamiento:** el capital va hacia B2B, payroll y wallets. Takenos tiene US$12M (con US$7M el 4-nov-2026), P2P.me unos US$8,7M y Bitget lo financia su matriz. Los especialistas en QR para turistas tienen poco capital: Peanut US$1,5M, WanderWallet US$0,5M, Moreta unos US$0,5M; CacaoCash, Yodl y Quay no divulgan [Data; confianza Media, varias cifras son Tier 3].
- **Barreras de entrada:**
  - **Técnicas: bajas.** Un SDK (Yodl) o un acuerdo con un PSP alcanza para llegar a Transferencias 3.0 [Data].
  - **Regulatorias y de proveedor: medias.** Hace falta un PSP o PSAV licenciado. Según una fuente secundaria, la CNV RG 1172/2026 crea la figura del "referidor" y excluye al software de autocustodia; queda abierto si cobrar un fee sobre el swap cambia esa categoría [Data, informe previo; confianza Baja]. No afecta la hackathon (sin fee ni dinero real); se resuelve en la etapa de formalización (ver "Después de la hackathon").
  - **De distribución: altas.** Bitget, MiniPay y Binance ya tienen al usuario, y el SEO en inglés está saturado [Data].

---

## Jugadores clave de un vistazo

La amenaza se evalúa para **nuestro segmento** (extranjero cripto-nativo con USDC en Base) salvo que se indique otra cosa.

| Competidor | Etapa | Financiamiento | Fortaleza | Debilidad | Amenaza |
|---|---|---|---|---|---|
| **Yodl** | Live, SDK con releases semanales | DATA GAP | SDK que acepta cualquier wallet EIP-1193, revenue share de 70%, multichain, gas pago | En Argentina solo Mercado Pago, KYC, spread oculto, SDK encapsulado | **Alta** |
| **Bitget Wallet** | Escala (80–100M usuarios declarados) | Matriz | Autocustodia, Transferencias 3.0, subsidios | Hay que tener el saldo en Bitget; sin comprobante ni política de reembolso documentados; KYC contradictorio | **Media** (Alta por distribución) |
| **Moreta Pay** | YC S24, 3 empleados | ~US$0,5M (o US$130K) | Más tracción del grupo, Argentina "live" con 5 redes de QR, recibo, soporte por WhatsApp | Depósito, sin alias (solo según CacaoCash; confianza Baja), 1,5% de fee, cero evidencia de uso en Argentina | **Baja** (Alta en turista general) |
| **WanderWallet** | Pre-seed | US$0,5M | US$0,20 por pago, QR interoperable + alias, **única política de fallas publicada** | Depósito (rechazos), fee ambiguo, cero reseñas de Argentina | **Media-Alta** |
| **CacaoCash** | Temprana, iteración diaria | DATA GAP | Fondeo por casi cualquier riel, alias/CVU, ~80 guías SEO | 2,5% de fee, depósito, reseñas posiblemente sembradas | **Media** |
| **Peanut** | Pre-seed, 339 commits por mes | US$1,5M | Boca a boca expat, premio en Devconnect, buen precio | Solo Mercado Pago, bugs y fondos "desaparecidos", límites ocultos | **Media** |
| **P2P.me** | Seed | ~US$8,7M | No custodial, Base, mejor precio observado | P2P humano: lento, límites bajos, el comercio cobra de un particular; controversia en MetaDAO | **Media** |
| **Takenos** | Seed extendida | US$12M | Capital, QR para extranjeros desde Devconnect | Stablecoin propia (no USDC), KYC opaco, foco en payroll | **Media** |
| **MiniPay** | Escala (10M+ usuarios) | Opera/Celo | Distribución embebida, mensaje "pay like a local" | Celo/USDT, rollout parcial, sin métricas de 2026 | **Baja** |
| **Settle** (Farcaster) | Comunidad | DATA GAP | Activación presencial de comercios | Cripto a cripto: no paga QR argentinos | **Baja** |
| **Quay** | Beta post-hackathon (Singapur) | Premio Sui Overflow | Modelo de diseño casi idéntico a nuestra tesis | No opera en Argentina ni en EVM; su atomicidad no se puede trasladar | **Baja** (alta como referencia) |

[Data; etapa, financiamiento y usuarios son mayormente autodeclarados o Tier 3. Amenaza: Opinion, alineada con `raw/competitor-profiles.md`; MiniPay, Takenos y Settle no tienen nivel en raw y se asignan a partir de `raw/gtm-analysis.md`.] Moreta queda en Baja para nuestro segmento, como en raw: compite por el turista que fondea con banco o tarjeta, no por quien quiere pagar desde su wallet de Base. **Confianza:** Media.

---

## Soluciones adyacentes y sustitutos

| Sustituto | Trabajo que resuelve | Por qué lo eligen | Comparación | Amenaza |
|---|---|---|---|---|
| **Tarjeta extranjera + efectivo + Western Union** ("no hacer nada") | Pagar casi todo sin instalar nada | Inercia, cero riesgo percibido: "cash is king", "Credit cards work fine" (ExpatsBA, abr 2026) [Data] | Cuesta entre 6% y 16% más que vender USDC [Estimate], pero **no sirve en comercios que solo aceptan QR**. Es la opción mayoritaria en el hilo más representativo | **Alta** |
| **Global66 / Alipay+** | El turista paga QR con la wallet fiat de su país | No necesita cripto. Global66: US$1,7M, 75% chilenos, ticket de US$21,88. Alipay+ entró a Transferencias 3.0 vía PVS en julio de 2026 [Data] | Otro segmento (turista no cripto), pero achica el mercado total | Media |
| **Pix en Mercado Pago** (brasileños) | El brasileño paga con Pix | Ya tiene la app [Data] | Saca del mercado al grupo de turistas más grande | Media (para el mercado total) |
| **Binance Pay / Bybit Pay (Manteca) / KuCoin Pay** | El usuario de exchange paga QR | Ya tiene saldo ahí | Binance limita el QR a residentes verificados [Data]. Para Bybit y KuCoin no se verificó si aceptan no residentes [Data gap]. Manteca es un **proveedor posible** | Baja-Media |
| **Tarjetas cripto** (KAST, RedotPay, MetaMask Card, Gnosis Pay) | Gastar USDC con red de tarjeta | Funcionan donde se acepta tarjeta | Las rechazan en comercios y en el Subte; no sirven en comercios solo QR (r/ethereum) [Data, Tier 3] | Baja |
| **"Le pido a un amigo que pague con Mercado Pago"** | Pago informal | Gratis | Sin evidencia en foros [Assumption] | Desconocida |

---

## Contradicciones entre fuentes y cuál creer

| Tema | Versión A | Versión B | Qué creer | Confianza |
|---|---|---|---|---|
| **¿Algún competidor permite pagar desde una wallet externa?** | Informe previo: "ningún competidor deja firmar desde la wallet externa sin depositar" | Wave 1 y C2: el **SDK de Yodl** acepta "any EIP-1193 wallet" y el usuario firma desde su wallet; **Bitget** ofrece "pagá QR con USDC desde tu wallet autocustodiada" | Las dos son ciertas a distinto nivel. **Ninguna app de consumo verificada en Argentina** deja firmar desde *otra* wallet. Bitget firma desde *su propia* wallet: es autocustodia, pero hay que tener los fondos en Bitget. Yodl lo habilita para *integradores*, sin que se haya encontrado una wallet que ya lo use en Argentina. El hueco existe en producto, **no en infraestructura**. Matiz: un usuario de wallet de semilla podría importar su frase en Bitget y "no depositar" [Opinion]. | Media |
| **Custodia de WanderWallet** | Guía de CacaoCash e informe previo: saldo custodial | Sitio propio: no custodial; un lector cuenta que lo verificó Bridge y le pidió transferir a Bridge | Se acepta el sitio propio para la etiqueta, entendida como wallet embebida con rampas de terceros. **Para el usuario igual hay un depósito**, así que la contradicción no cambia nuestro hueco. A2 la lista como custodial: se corrige. | Media |
| **Moreta en Argentina** | Guía de Prince of Travel (sep 2026): solo Filipinas, Vietnam, Laos y Mongolia | Página propia `/supported-countries/argentina` (actualizada el 27-oct-2026): "live", con Mercado Pago, Ualá, MODO, Cuenta DNI y BNA+, 1,5%, tope de ARS 4,35M por pago y 8,7M por semana | Se cree a la **página propia y más reciente** sobre que figura "live" (confianza Alta). Que **funcione en la práctica** tiene confianza Baja: cero reseñas y cero menciones en foros sobre Argentina. | Alta (oferta) / Baja (uso) |
| **Trustpilot de Moreta** | Guía de CacaoCash y nota previa: 2,3 | Trustpilot directo: 4,6 con 318 reseñas, 11% de una estrella | **Trustpilot directo.** Las guías de CacaoCash no son confiables sobre terceros. | Alta |
| **Spread de P2P.me para quien paga** | A1: spread implícito de ~2% | A2: el ~2% es la brecha entre compra y venta; quien vende USDC queda ~0,3% debajo del mejor precio | **A2**, porque se basa en cotizaciones observadas en CriptoYa. Salvedad: la tasa del QR podría no ser la de off-ramp. | Media |
| **Fee de WanderWallet** | Sitio propio: US$0,20 | CacaoCash: US$0,20 + 1%; AppAdvice: US$0,20 + 2% de spread | Fee visible de US$0,20 (sitio propio) **más un spread no publicado** de tamaño desconocido. | Baja |
| **Rating de Moreta en App Store** | 4,2 con 2,3K | 4,4 con 809 (EE. UU.) | Diferencia de tienda o región; no es un error. | Media |
| **Financiamiento de Moreta** | ~US$500K | US$130K | Sin resolver (CB Insights vs VCBacked). | Baja |
| **Guías de CacaoCash** | ~85 únicas (índice) | 78 en inglés (sitemap) | Mismo orden de magnitud; cambia el método de conteo. | Media |
| **Financiamiento de Takenos** | US$12M (varias fuentes) | US$10M (iProfesional) | **US$12M.** | Alta |
| **Fecha de Alipay+ en Transferencias 3.0** | Julio de 2026 (nota fechada el 17-jul) | Mayo de 2026 (C2) | **Julio de 2026**, por la fuente fechada. | Media |
| **KYC de Bitget QR Pay** | "without KYC" | "QR Pay verification" | Sin resolver; asumir que **pide KYC** hasta probarlo. | Baja |
| **Tracción de P2P.me en Argentina** | Informe previo: US$86K por mes y 108 MAU | ops.p2p.me no cargó | No verificable hoy; tratarla como histórica. | Baja |

---

## Hallazgos clave por dimensión

### Producto y cobertura
- **La cobertura no diferencia por sí sola.** WanderWallet ("any interoperable QR" + alias), CacaoCash (Mercado Pago, MODO, QR CVU/CBU + alias) y Moreta (5 redes, incluida Cuenta DNI) ya cubren mucho. Nadie cubre *todo*: Peanut y Yodl solo Mercado Pago, CacaoCash no confirma Cuenta DNI [Data; confianza Media], y Moreta no pagaría alias [Data, VENDOR competidor (CacaoCash); confianza Baja]. Los comercios que solo aceptan transferencia a alias existen ("None of these apps were able to do a direct transfer", r/ethereum, dic 2025) [Data, Tier 3].
- **El comprobante para el comercio no lo pide nadie.** Ningún usuario lo menciona [Data]. Solo Moreta (recibo en la app del usuario) y Quay (recibo onchain, fuera de Argentina) tienen algo parecido. Puede servir para P2P.me, donde el comercio cobra de un particular y no se reporta a ARCA, pero como diferencial de demanda es **[Assumption]** [confianza Baja].
- **La atomicidad de Quay no se puede trasladar.** En Argentina el último tramo (ARS a un CVU) pasa fuera de la cadena, así que "garantizado o reembolso" exige escrow, un SLA contractual con el proveedor y operaciones de reembolso [Opinion; confianza Alta en el razonamiento].

### Precio
- Todas las opciones cripto caen en una franja de **+0,3% a +3,1%** sobre el mejor precio de venta de USDC/ARS. La tarjeta queda entre +6% y +16,5% [Estimate, cotizaciones del 10-nov-2026 a una sola hora].
- **El precio es condición de entrada, no diferencial.** El tipo de cambio aparece elogiado en todas las reseñas [Data]. Nuestro modelo ilustrativo (~1% + spread) queda **más caro** que P2P.me, Peanut y Yodl, más barato que CacaoCash, y similar o algo más barato que Moreta (+1,5% a +2,2%, según se incluya o no el spread que solo reporta CacaoCash) [Estimate].
- **Nadie publica su spread** contra una referencia pública. Todos se anclan contra la tarjeta, que es la referencia más débil [Data].

### Sentimiento de clientes
- **El dolor más grave:** fondos que "desaparecen" o quedan retenidos en pagos fallidos. Aparece en Moreta, Peanut, P2P.me y Bitget [Data; confianza Media, porque la muestra es chica].
- **La fricción de entrada más repetida:** el depósito previo (WanderWallet, Moreta, CacaoCash) y el miedo a enviar por la red equivocada (6 o más posts en ExpatsBA) [Data].
- **Contraevidencia:** **ningún usuario pide "pagar desde mi propia wallet"**. Los usuarios de CacaoCash no se quejan de depositar (0% de reseñas de 1 a 3 estrellas, aunque posiblemente sembradas). Lo más elogiado es la simplicidad y el soporte humano, no la custodia [Data]. La tesis central es **[Assumption]**.
- **La latencia de conversión al pagar** aparece en 3 productos (CacaoCash, Yodl, P2P.me). Nuestro modelo, que convierte en el momento del pago, la heredaría [Data/Opinion].

### Go-to-market
- El **SEO genérico en inglés está saturado**: CacaoCash tiene ~80 guías, Moreta publica un post semanal sobre Argentina (688 URLs) y Peanut tiene 491 URLs programáticas en 3 idiomas [Data].
- **El único canal que generó boca a boca medible (Devconnect BA 2025) no se repite en 2026**: Devcon 8 es en Mumbai [Data]. Peanut capitalizó esa ventana.
- **Huecos de canal:** SEO long-tail cripto-nativo ("pagar QR argentino desde Coinbase Wallet o Base"), hackathons y grants de ecosistema (el camino de Quay), coworkings, hostels y grupos de nómadas, y ExpatsBA. Son baratos pero **no validados en volumen** [Data por ausencia / Opinion].

### Señales estratégicas
- **Yodl:** 31 versiones de `@yodlpay/react-native` en 5 meses y un modo headless "on the roadmap" [Data, npm]. Si sale el headless, cualquier wallet de Base replica nuestra UX en semanas [Opinion].
- **Bitget** sigue el mapa de QR nacionales país por país y compra adopción con cashback (50% en VietQR) [Data].
- **Takenos** levantó US$7M el 4-nov-2026 para sumar más de 15 países en 2027 y contrata compliance y ventas [Data].
- **Funding de etapa cero disponible:** Circle Developer Grants (abiertos), Base Batches (sin fechas para 2026), Celo Proof of Ship (exige Celo) y Stellar Community Fund [Data].

---

## Oportunidades estratégicas

### Oportunidad: confiabilidad como producto (cotización garantizada + reembolso automático + failover)
- **Qué:** una promesa operativa publicada. El monto all-in queda bloqueado por N segundos. Si el ARS no llega al comercio en X minutos, el USDC vuelve solo. Hay estado visible del pago y un segundo proveedor si el primero falla o llega a su límite.
- **Evidencia:**
  - Fondos que "desaparecen" en 4 de 7 productos [Data].
  - Límites del proveedor que provocan rechazos: Peanut, 6M ARS por mes [Data].
  - Aversión al riesgo antes de probar: "this seems like too much risk for my comfort. I think I will stick to Western Union" (lemonade, ExpatsBA, 2025-12-01; evaluó Peanut, no tuvo una falla) [Data]. La lectura "la confianza se rompe con una sola falla" es una paráfrasis analítica de `raw/forum-mining.md`, no una cita [Opinion].
  - Solo WanderWallet publica una política, y es cualitativa y sin plazos [Data].
  - Ningún competidor tiene failover [Data por ausencia].
- **Confianza:** Media. El dolor está documentado; la disposición a pagar por la garantía no.
- **Cómo aprovecharlo:** en la hackathon, construir la máquina de estados quoted→signed→onchain→fiat_settled/refunded sobre testnet de Base y demostrar el failover y el reembolso automático con **dos adaptadores mock** (uno que falla o llega a su límite y otro que toma el pago), con el estado visible en la UI. El SLA publicado, la tasa de éxito real y los contratos con PSPs quedan para después de la hackathon. Es más difícil de copiar que una función de UX porque exige ingeniería y operación continuas [Opinion].

### Oportunidad: "sin depósito" para quien ya tiene USDC en una wallet de Base
- **Qué:** firmar desde Coinbase Wallet, Base App, MetaMask o Rainbow vía WalletConnect o EIP-1193, sin mover fondos a otra app.
- **Evidencia:** el depósito es la fricción más repetida, y el miedo a la red equivocada aparece en 6 o más posts [Data]. Ninguna app de consumo verificada en Argentina lo ofrece [Data]. Nadie cubre ese término en SEO [Data por ausencia].
- **Confianza:** Media (sobre que el hueco existe) / **Baja** (sobre que dure). El SDK de Yodl y Bitget lo pueden cerrar.
- **Cómo aprovecharlo:** tomarlo como *ventaja de entrada*, no como foso. Avisar si el USDC del usuario está en otra cadena, porque ahí el problema de red reaparece [Opinion].

### Oportunidad: transparencia de precio contra una referencia pública, con fee fijo o con tope
- **Qué:** "X USDC → ARS 30.000, vence en 60 s, −0,8% vs CriptoYa". Fee fijo de US$0,15–0,25, o 1% con tope.
- **Evidencia:** nadie publica su spread; los cinco productos "0 fee" cobran dentro de la tasa; WanderWallet es el único con fijo, y sus usuarios piden más claridad [Data].
- **Confianza:** Media.
- **Cómo aprovecharlo:** publicar una comparativa honesta y verificable de costo total; las guías de CacaoCash tienen errores comprobables [Opinion].

### Oportunidad: ser componente embebible en lugar de app suelta
- **Qué:** una mini-app en Base App o Farcaster, o una API/SDK de orquestación con garantía, para wallets.
- **Evidencia:** las wallets están absorbiendo la función (Bitget, MiniPay, KuCoin). Yodl valida el modelo B2B2C con 70/30. El público de Base no quiere bajar otra app [Data/Opinion].
- **Confianza:** Media.
- **Cómo aprovecharlo:** misma API y misma máquina de estados para la app y la mini-app desde el MVP. Salvedad: las Spend Permissions de Base App figuran "coming soon" [Data, informe previo].

### Oportunidad: canales baratos y vacíos para el nicho cripto-nativo
- **Qué:**
  - 5 a 10 páginas long-tail exactas.
  - Postulación a Base Batches o Circle Grants con la demo en testnet de Base (proveedor mock y máquina de estados completa), indicando qué PSP se integraría después.
  - Activación tipo POAP en 2 o 3 coworkings de Palermo.
  - Presencia transparente en ExpatsBA.
- **Evidencia:** ningún competidor trabaja coworkings ni grupos de nómadas. Quay pasó de hackathon a beta sin marketing [Data].
- **Confianza:** Media (canales vacíos) / Baja (volumen alcanzable).
- **Cómo aprovecharlo:** usar cada canal como experimento de demanda con métricas (visitas a la landing, altas en la waitlist) antes de escalar [Opinion].

---

## Riesgos estratégicos

### Riesgo: la demanda no alcanza
- **Qué:** el segmento con USDC, sin DNI y en comercios solo QR es demasiado chico.
- **Evidencia:**
  - Menos de 25 reseñas relevantes en todo el mercado.
  - Yodl tiene 12 calificaciones y CacaoCash 4.
  - "Cash is king" domina ExpatsBA.
  - El informe previo estima "decenas de miles por año" y unos 11.000 nómadas en Buenos Aires, cifra sin fuente.
  - Economía unitaria con ticket de US$22 y fee de 1%, en dos escenarios [Estimate]:
    - **Sobre el SDK de Yodl** (70% del fee para el integrador): ~US$0,15 neto por pago, ~65.000 pagos por mes para US$10.000 netos.
    - **Proveedor directo** (la ruta que recomienda este informe): ~US$0,22 bruto por pago, ~45.000 pagos por mes para US$10.000 **antes** de restar el spread o fee del PSP y el paymaster, que no tienen datos [Data gap].
- **Severidad:** **Alta.**
- **Mitigación:** durante la hackathon, waitlist y encuesta corta en ExpatsBA y grupos de nómadas, y concierge con 5–10 asistentes del evento usando la demo con proveedor mock. La regla de corte con datos reales queda para después de la hackathon.

### Riesgo: Yodl, a la vez proveedor y competidor
- **Qué:** si construimos sobre el SDK de Yodl, nuestro precio es el suyo más algo, y la app de Yodl ofrece el mismo riel sin recargo. El SDK encapsulado no deja mostrar una cotización propia ni hacer failover.
- **Evidencia:** fee de integrador de 0,1–1,0% (nuestro 1% es el techo); headless en el roadmap; 31 releases en 5 meses [Data].
- **Severidad:** **Alta.**
- **Mitigación:** cotizar directo con PSPs (Manteca, Ripio, Settle Network) y usar Yodl, como mucho, como un proveedor más del adaptador.

### Riesgo: las wallets absorben la función
- **Qué:** Bitget (más de 80M usuarios), MiniPay y Base App integran QR nacionales con subsidio.
- **Evidencia:** expansión país por país, cashback de lanzamiento y el mensaje "self-custody keeps control with the user" del COO de Bitget [Data].
- **Severidad:** **Alta** a 12–24 meses.
- **Mitigación:** posicionarse como capa de garantía embebible que esas wallets puedan licenciar, no como wallet.

### Riesgo: la vara de confiabilidad del MVP
- **Qué:** una falla en la caja quema al usuario y al canal comunitario. Además, heredamos los límites y caídas del proveedor.
- **Evidencia:** los bugs de Peanut circulan en ExpatsBA; el KYC rechazado de Takenos se volvió un post público [Data].
- **Severidad:** **Alta.**
- **Mitigación:** en la demo, dos adaptadores mock con failover, límites visibles antes de escanear y reembolso automático demostrable en la UI. Lanzar con dos PSPs reales y un reembolso probado con pagos reales queda para después de la hackathon.

### Riesgo: desventaja de precio
- **Qué:** +1,3–2,0% frente a +0,3–0,6% de P2P.me y Peanut.
- **Evidencia:** pricing-intelligence §2 [Estimate].
- **Severidad:** Media. Los usuarios no cambian de app por 0,5% después de una buena experiencia [Opinion], pero el usuario cripto-nativo compara.
- **Mitigación:** fee fijo bajo, o cobrarle a la wallet socia o al comercio (B2B2C).

### Riesgo: regulatorio
- **Qué:** que cobrar un fee sobre el swap nos clasifique como actividad de intercambio (patrimonio mínimo de US$150.000) en lugar de "referidor" o software excluido.
- **Evidencia:** CNV RG 1172/2026, según una fuente secundaria [Data, confianza Baja].
- **Severidad:** Media, pero no aplica durante la hackathon.
- **Mitigación:** durante la hackathon no se cobra fee ni se mueve dinero real (demo en testnet con proveedor mock), así que el riesgo de clasificación de la CNV todavía no aplica. El adaptador de proveedores permite cambiar de PSAV más adelante. La verificación legal queda como pregunta abierta (ver "Después de la hackathon").

### Riesgo: incumbentes del contenido y de la confianza
- **Qué:** Moreta (YC, publica cada semana), CacaoCash (~80 guías) y Peanut (boca a boca) ocupan la intención de búsqueda del turista.
- **Severidad:** Media.
- **Mitigación:** no competir en "turista en Argentina"; ocupar "desde tu wallet de Base".

---

## Evaluación de fosos competitivos

| Tipo de foso | ¿Presente en el mercado? | Quién lo tiene | Fuerza |
|---|---|---|---|
| Efectos de red | No en sentido estricto. P2P.me tiene un mercado de dos lados con proveedores de liquidez | P2P.me | Débil |
| Costos de cambio | Bajos. KYC y saldo "atrapado" en apps de depósito | CacaoCash, Moreta, Peanut, WanderWallet | Débil |
| Datos | No | — | — |
| Marca y confianza | Emergente | Peanut (expats), Moreta (YC y reseñas), Bitget (marca global) | Débil-Media |
| Economías de escala | Sí, en distribución y contenido | Bitget, MiniPay (distribución); Moreta, CacaoCash (contenido a escala) | Fuerte (Bitget) / Media |

**Qué implica para un nuevo entrante** [Opinion]. Ningún especialista tiene un foso real, así que entrar es fácil, pero retener también es difícil. Un producto no custodial tiene costo de cambio casi nulo en ambas direcciones. El único foso al alcance de un equipo chico es la **confiabilidad operativa demostrada**: tasa de éxito publicada, SLA de reembolso, failover y datos propios de qué QR y qué proveedores funcionan. Ese dataset de rendimiento por proveedor y por tipo de QR podría volverse un pequeño **foso de datos** si se acumula antes que los demás. La distribución, en cambio, es de las wallets: sin un acuerdo de embebido, el techo de la app independiente es bajo.

---

## Brechas de datos y limitaciones

| Dato faltante | Por qué importa | Cómo completarlo |
|---|---|---|
| **Tasa de éxito, tiempo de liquidación y spread real de cada competidor** en QR reales | Es la base de la regla de corte (ver "Después de la hackathon") | Durante la hackathon: comparar contra la promesa documentada de cada competidor (docs, FAQs, videos y walkthroughs públicos). La medición con QR reales queda para después |
| **Spread del proveedor licenciado que usaríamos** | Es el insumo más importante de nuestro precio | Pedir cotización a Manteca, Ripio y Settle Network; preguntarle a Yodl por un modo headless o una API de cotización |
| **Si alguna wallet ya integra el SDK de Yodl en Argentina** y si la app de Yodl acepta WalletConnect | Define si el hueco "sin depósito" ya está cerrado | Instalar la app de Yodl y recorrer el onboarding hasta la pantalla de conexión de wallet; buscar integradores en npm y GitHub; preguntar en su Discord o Telegram |
| **Tamaño del segmento** (extranjeros con USDC en Base en Buenos Aires) | Riesgo número uno | Landing con waitlist; encuesta corta en ExpatsBA y grupos de nómadas; concierge con 5–10 asistentes de la hackathon |
| **Uso real de Moreta en Argentina** | Figura "live", pero sin evidencia de uso | Buscar reseñas, videos o walkthroughs argentinos; preguntar a su soporte por WhatsApp |
| **KYC real de Bitget QR Pay y si acepta pasaportes extranjeros** | Define si compite en nuestro segmento | Recorrer el onboarding hasta la pantalla de KYC y capturarla; leer su FAQ de QR Pay |
| **Fee real de WanderWallet** (tres versiones) y **Cuenta DNI en CacaoCash** | Matriz y battle cards | Recorrer el onboarding hasta la pantalla de depósito o de fees; leer FAQs; preguntar a soporte |
| **Equipo y financiamiento** de CacaoCash, Yodl y Quay | Capacidad de reacción | LinkedIn (`company/cacao-cash`), handbook de Sui Overflow, contacto directo |
| **Seguidores en redes, anuncios pagos, volumen de búsqueda** | GTM y CAC | Social Blade o HypeAuditor, Meta Ad Library y Google Ads Transparency (necesitan navegador), Ahrefs o Semrush |
| **Google Play** (ninguna ficha se pudo leer) y **Reddit directo** (solo vía espejo) | Sentimiento incompleto | Lectura manual |
| **Antigüedad de la evidencia de Peanut y P2P.me** (dic 2025, más de 10 meses) | Pueden haber mejorado | Página 2 del hilo de ExpatsBA; changelog y commits recientes de cada producto |
| **Tasa actual de la tarjeta extranjera** (el último dato de Fiserv es del 20-oct; el fetch dio 404) y discrepancia del mayorista (1.438 vs 1.546) | Tamaño del ahorro contra la tarjeta | Volver a consultar Fiserv y Visa FX desde un navegador; preguntar a asistentes extranjeros de la hackathon qué tasa les liquidaron |
| **Western Union 2026** | Costo del status quo | Recorrer el simulador de envío hasta la pantalla de cotización, sin enviar |
| **Encuadre CNV RG 1172/2026** | Riesgo regulatorio | No aplica a la hackathon; ver "Después de la hackathon" |
| **MiniPay, Takenos y Settle** | Perfiles livianos (no estaban en el set de Wave 1) | Docs públicas, videos y preguntas en sus canales de comunidad |
| **Citas recortadas a ~120 caracteres** por la herramienta | No usar en material público sin verificar | Verificación manual |
| **Cotizaciones de un solo momento** (10-nov-2026, ~23:25 ART) | ±1% de variación diaria | Repetir en 3 días distintos |

### Después de la hackathon

Nada de esto es prerrequisito para la hackathon. Queda registrado para la etapa de formalización:

- **Regla de corte con QR reales:** si algún competidor cubre ≥95% de los QR a menos de 0,5 pp del mejor costo y desde la wallet externa, no conviene construir. Se mide con 30–50 QR de Buenos Aires (Mercado Pago, MODO, bancarios, estáticos de monto abierto), registrando cada pago contra CriptoYa el mismo día.
- **Pagos de prueba reales** en Moreta, Bitget, WanderWallet, CacaoCash, MiniPay, Takenos y Yodl, y una cuenta de Bitget con pasaporte.
- **Contratos con dos PSPs**, SLA publicado y tasa de éxito real medida.
- **Legal:** verificar la CNV RG 1172/2026 en el Boletín Oficial y obtener un dictamen antes del primer cobro real de fee.

---

## Red Flags

- **La tesis central ("pagar desde mi propia wallet") no aparece pedida por ningún usuario** en reseñas ni foros. Es una hipótesis, y el informe previo la presentaba como "espacio libre verificable". Lo verificado es que el hueco existe en producto, no que la gente lo valore [Data/Assumption].
- **El hueco técnico es frágil:** el SDK de Yodl lo habilita para cualquier wallet EIP-1193 y Bitget lo ofrece a sus usuarios. Una alianza Base App–Yodl lo cerraría sin nosotros [Data/Opinion].
- **Construir sobre Yodl nos hace estructuralmente más caros que Yodl** y nos impide tener cotización propia y failover, que son justamente nuestros diferenciadores [Data].
- **El dolor es débil para la mayoría de los extranjeros:** tarjeta, efectivo y Western Union les alcanzan, y el canal que generó adopción (Devconnect BA) no se repite en 2026 [Data].
- **El precio juega en contra:** quedamos más caros que P2P.me, Peanut y la app de Yodl [Estimate].

## Yellow Flags

- **WanderWallet ya ocupa parte del hueco** (QR interoperable + alias, US$0,20, política de fallas publicada) [Data].
- **Moreta figura live en Argentina** con 5 redes de QR y recibo; si se confirma su uso real (reseñas, videos o pagos post-hackathon), es el rival más fuerte en el segmento turista general [Data].
- **Las reseñas de CacaoCash y Moreta muestran patrones de agrupamiento**; sus ratings no son concluyentes [Data/Opinion].
- **Muchas cifras de tracción son autodeclaradas** (Moreta 250K, Takenos 10K turistas y US$5B, Bitget 80–100M) [Data].
- **Takenos, con US$12M y contratando**, podría priorizar QR para extranjeros [Opinion].
- **Si el USDC del usuario no está en Base**, vuelve el problema de la red equivocada [Opinion].
- **El "comprobante para el comercio" no tiene evidencia de demanda** [Data por ausencia].
- **Los grants exigen cadenas distintas** (Celo, Stellar, Arc); perseguir varios diluye el foco [Opinion].
- **Corroboración sobre una base chica:** los dos hilos de ExpatsBA (unos 13 posts en el de abril de 2026) sostienen a la vez el dominio del status quo, las fallas de Peanut, el miedo a la red equivocada y la cita de Western Union. No son fuentes independientes entre sí [Data].

---

## Sources

- Raw: `raw/competitor-profiles.md`, `raw/pricing-intelligence.md`, `raw/review-mining.md`, `raw/forum-mining.md`, `raw/gtm-analysis.md`, `raw/strategic-signals.md` (2026-11-10); `reports/Pagos QR con USDC en Argentina.md`.
- Yodl SDK: https://yodl.me/sdk/ · Yodl Argentina: https://yodl.me/argentina/stablecoins-to-pesos/ · npm: https://www.npmjs.com/package/@yodlpay/react-native
- Quay: https://www.quay.cash/ · https://www.quay.cash/docs · Sui Overflow 2026: https://www.sui.io/blog/sui-overflow-2026-winners.md
- CacaoCash: https://cacaocash.com/ · https://cacaocash.com/fees · App Store: https://apps.apple.com/us/app/id6761438986 · Trustpilot: https://www.trustpilot.com/review/cacaocash.com
- Moreta: https://moretapay.com/supported-countries/argentina · https://moretapay.com/affiliate-program · Trustpilot: https://www.trustpilot.com/review/moretapay.com · YC: https://www.ycombinator.com/companies/moreta
- WanderWallet: https://wanderwallet.io/ · App Store: https://apps.apple.com/us/app/wanderwallet-pay-like-a-local/id6744653963 · https://parsers.vc/startup/wanderwallet.io/
- Peanut: https://peanut-wallet.vercel.app/en/use-cases/tourists · https://peanut-wallet.vercel.app/en/pricing · https://github.com/peanutprotocol/peanut-ui
- P2P.me: https://p2p.me/en · https://solanafloor.com/news/only-way-out-through-metadao-extends-controversial-p2pme-ico
- Bitget: https://web3.bitget.com/hot-trend-news/508 · https://www.digitaltransactions.net/?p=1333600 · https://www.trustpilot.com/review/web3.bitget.com
- Takenos: https://eleconomista.com.ar/finanzas/takenos-levanta-us-7-millones-apuesta-mas-15-paises-america-latina-2027-n99427 · https://www.iproup.com/innovacion/62199-takenos-lanza-pagos-qr-para-extranjeros-y-es-furor-en-devconnect
- MiniPay: https://press.opera.com/2025/11/19/minipay-pay-like-a-local-mercadopago-pix/ · https://decrypt.co/350750/opera-celo-scale-up-partnership-to-make-stablecoins-useful-for-millions-of-users
- Settle: https://luma.com/cbc7qm3t · Settle Network: https://www.unlock-bc.com/en/stellar-foundation-invests-in-latin-americas-settle-digital-assets-network
- Foros: https://www.expatsba.com/threads/how-are-new-expats-and-foreigners-in-argentina-handling-daily-payments-in-buenos-aires-without-local-bank-account.7102/ · https://www.expatsba.com/threads/has-anyone-used-the-new-financial-app-peanut-to-send-mercado-pago-payments-in-argentina.6669/ · https://reddit.com/r/ethereum/comments/1pjloy0/devconnect_2025_payment_apps/
- Tasas: https://criptoya.com/api/usdc/ars/0.1 · https://dolarhoy.com/
- Global66 / Alipay+: https://www.descubre.vc/noticia/global66-turistas-extranjeros-impulsan-el-67-del-volumen-de-pagos-con-qr-en-argentina-2026-08-10 · https://www.descubre.vc/noticia/alipay-se-integra-al-sistema-qr-de-argentina-mediante-alianza-con-la-fintech-pvs-2026-07-17
- Grants: https://community.arc.io/home/blogs/circle-developer-grants-program-relaunches-2026-05-14 · https://cryptobriefing.com/base-2026-roadmap-global-markets
- Devcon 8 (Mumbai): https://blog.ethereum.org/2025/12/23/devcon-mumbai
