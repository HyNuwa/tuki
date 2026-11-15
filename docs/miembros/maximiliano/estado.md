# Estado · Maximiliano

**Última actualización:** 2026-11-14

## Current focus
M1 contract gate, branch `feat/m1-contracts-gate`. Maximiliano owns development coordination; Alexxe's departure is not assumed. The 2-of-2 threshold and separate verifier key-holder requirement remain unchanged.

**Completed:** payer-authenticated Task terms in `f1a30b8`, with paired M1/M2a specs, 123 passing fork tests, independent baseline comparison and native risk/readability/reliability review without findings. Exact acknowledgement closed that review. AC15's separate work unit now has independent 32-run / 1600-call coverage with no reverts and a full suite of 124 passing tests; negative controls confirm monitor sensitivity. Production contracts are unchanged by AC15. Native assessment for AC15 is next.
**Next step:** complete the work-unit assessment, then prepare `Int02.s.sol` and real AC16 prerequisites. `maxLeavesPerRoot` remains 256; gas results are in M1 §9.
**Pending:** AC16 script and real-network proof, Task `preApprovalExpiry`, capture-receipt/unsolicited-transfer semantics, replacement funded testnet credentials and the second verifier key holder. Never inspect `.env*` files or use chat-exposed keys. No push, PR or deployment has been performed.
