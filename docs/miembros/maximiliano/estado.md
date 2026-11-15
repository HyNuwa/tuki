# Estado · Maximiliano

**Última actualización:** 2026-11-14

## Current focus
M1 contract gate, branch `feat/m1-contracts-gate`. Maximiliano authorized correcting payer authentication of Task terms and is responsible for coordinating the paired M1 §3 / M2a §7 change. Alexxe's departure is not assumed; verifier quorum remains 2-of-2 with separate key holders required for the claimed trust model.

**Implemented:** bind `PaymentInfo.salt` to `keccak256(abi.encode(taskId, termsHash))`, retaining the existing ERC-3009 signature and all function/event ABIs. Reproduced RED, then focused GREEN; full suite and independent verifier passed all 123 fork tests (AC0–AC14 plus binding regressions); baseline 116 PASS and meaningful regression RED confirmed. Old authorizations require regeneration. AC15's pre-existing files and fixture/config changes remain separate and uncommitted.
**Next step:** complete native review for this security work unit, then resume AC15 and `Int02.s.sol`. Prior AC0 re-run: 11 PASS; prior gas measurements retain `maxLeavesPerRoot = 256`.
**Pending:** native review of this correction, effective invariant coverage, capture-receipt semantics, Task `preApprovalExpiry` selection and real AC16 proof. No real-network run until replacement funded testnet credentials and the verifier-key-holder arrangement are safely established. Never inspect `.env*` files or use chat-exposed keys.