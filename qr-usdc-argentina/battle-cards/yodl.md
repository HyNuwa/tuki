# Battle Card: Yodl (Yodl Pay)

*Skill: startup-competitors | Generated: 2026-11-11*

**Amenaza: ALTA.** Es el competidor tecnológico más cercano y, a la vez, el proveedor potencial más obvio. **Confianza:** Media (SDK documentado; equipo, financiamiento y spread desconocidos).

## De un vistazo
- **Qué hace:** app self-custodial y **SDK** para pagar QR locales con stablecoins en 10 países. La liquidación en moneda local la hacen PSPs licenciados de terceros [Data].
- **Fundada:** DATA GAP (org de GitHub desde 2022) | **Financiamiento:** DATA GAP | **Equipo:** DATA GAP ("Yodl Association", posiblemente suiza [Assumption]).
- **Precio:** la app no cobra fee y el costo va en el spread, que no se publica. En el SDK, el integrador cobra 0,1–1,0% y se queda con el 70%; el fee de protocolo de 0,1% está exonerado [Data].
- **Ideal para:** usuario cripto-nativo multichain y wallets que quieren sumar "pagar QR".

## Sus fortalezas
- **El SDK acepta "any EIP-1193 wallet"** y el usuario firma desde su propia wallet: es nuestra tesis central, ya disponible como infraestructura ([yodl.me/sdk](https://yodl.me/sdk/)) [Data].
- **Iteración muy rápida:** 31 versiones de `@yodlpay/react-native` entre el 29-may y el 10-nov-2026 [Data, npm].
- Multichain (Mainnet, Arbitrum, Base, BSC, Polygon, Optimism, Gnosis), gas a cargo de Yodl y 10 países [Data].
- Funciona en la práctica según un usuario: "I had no issues paying with Yodl at any merchants who accepted QR payments" (r/ethereum, dic 2025) [Data, Tier 3].

## Sus debilidades
- **En Argentina solo cubre el QR de Mercado Pago**: no MODO, Transferencias 3.0 ni alias [Data].
- **Pide KYC en Argentina** (documento y domicilio): "non-KYC with the exception of Argentina" [Data].
- El SDK es una interfaz encapsulada; el modo **headless** está "on the roadmap". El integrador no puede mostrar su propia cotización ni hacer failover [Data].
- No publica spread, política de reembolso ni comprobante [Data].
- La app es lenta ("sometimes slow to load") y tiene poca tracción en tiendas (12 calificaciones) [Data].

## Cómo ganarle
- **Si dicen "Yodl es gratis",** responder: "El spread no está publicado. Nosotros mostramos el costo total contra CriptoYa y lo garantizamos por 60 s" [Opinion; se demuestra en la demo de la hackathon contra la promesa documentada de Yodl; con pagos reales, después de la hackathon].
- **Si dicen "Yodl ya deja pagar desde mi wallet",** responder: "Solo si tu wallet integró el SDK, y en Argentina solo Mercado Pago. Nosotros cubrimos MODO, QR bancarios y alias" [Data/P].
- **Liderar con:** cobertura total en Argentina, sin KYC extra cuando el proveedor lo permita, y reembolso automático.

## Cuándo nos gana
- El usuario ya tiene la app de Yodl o una wallet que integró el SDK: el mismo riel le sale más barato que con nosotros si nuestro fee va encima.
- El usuario paga en varios países (Brasil, Vietnam, Filipinas).
- Si construimos *sobre* Yodl, siempre somos Yodl más un recargo.

## La queja principal de sus clientes
"It is non-KYC with the exception of Argentina." — r/ethereum, Devconnect 2025.
**Por qué importa:** en nuestro mercado, Yodl pierde su ventaja de "sin KYC". El KYC depende del PSP; hay que averiguar si el nuestro lo exige a no residentes.

## Vulnerabilidad clave
Su cobertura argentina limitada a Mercado Pago, sumada a un SDK sin cotización propia, deja afuera a los comercios con MODO, QR bancarios y alias, y no deja que un integrador ofrezca garantías.

## Señales de abandono
- Cobertura de países limitada (App Store) — ocasional.
- Lentitud y KYC en Argentina — ocasional (una fuente).

## Qué vigilar
El **modo headless** del SDK, integraciones con Base App, Coinbase Wallet o Rainbow, y la incorporación de MODO o Transferencias 3.0 en Argentina. Cualquiera de esas tres cierra la mayor parte de nuestro hueco.

## Brechas de datos
- Equipo, financiamiento y PSP argentino; spread real; si la app acepta WalletConnect; si alguna wallet ya integró el SDK en Argentina. Se acotan instalando la app hasta la pantalla de conexión de wallet, buscando integradores en npm y GitHub y preguntando en su Discord o Telegram.

## Red Flags
- Si integra Base App, el diferencial "sin depósito" pierde su canal [Opinion].

## Yellow Flags
- Equipo y financiamiento desconocidos; no podemos estimar su capacidad de reacción [Data gap].

## Sources
- https://yodl.me/sdk/ · https://yodl.me/argentina/stablecoins-to-pesos/ · https://www.npmjs.com/package/@yodlpay/react-native · https://apps.apple.com/us/app/yodl-pay-spend-anywhere/id6751272683 · https://reddit.com/r/ethereum/comments/1pjloy0/devconnect_2025_payment_apps/ · raw/competitor-profiles.md, raw/strategic-signals.md
