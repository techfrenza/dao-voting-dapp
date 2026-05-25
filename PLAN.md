## Plan: DAO Voting MVP

**TL;DR:** Ship a working DAO voting dApp with minimum code. The contract is 90% empty, there's no root `package.json`, and frontend-contract wiring is broken. Fix all three layers so a user can connect MetaMask, create proposals, and vote on a local Hardhat node.

**Design:** Single-owner DAO. Deployer = admin. Members whitelisted by admin. One vote per member per proposal (for/against). No backend, everything is on-chain plus lightweight UI state.

---

### Phase 1: Smart Contract (blocks everything)

1. **Rewrite `onchain/contracts/Voting.sol`** — full interface per test suite: `Ownable`, `members` mapping, `addMember`, `createProposal`, `vote`, `getProposalResults`. No-arg constructor.
2. **Install OpenZeppelin** in `onchain/` (`@openzeppelin/contracts`)
3. **Delete boilerplate:** `Lock.sol`, `Lock.js` (ignition + test)
4. **Fix `onchain/scripts/deploy.js`** — deploy with no args, print address
5. **Verify:** `npx hardhat test` passes

### Phase 2: Frontend Bootstrap

6. **Create root `package.json`** via Vite (`npm create vite@latest . -- --template react`)
7. **Install deps:** `ethers@5`, `zustand`, `react-bootstrap`, `bootstrap`
8. **Create `vite.config.js`**
9. **Move `public/index.html` to root `index.html`** (Vite convention)
10. **Rename entry:** `src/index.js` to `src/main.jsx`

### Phase 3: Wire Frontend to Contract

11. **Refactor `src/hooks/useEthereum.js`** — call correct contract methods (`createProposal`, `vote`, `getProposalResults`)
12. **Fix `src/App.js`** — real ABI import from `../onchain/artifacts/...`, address from env var
13. **Fix `ProposalDisplay.js`** — render `votesFor` and `votesAgainst`
14. **Fix `VotingResults.js`** — same field alignment
15. **Fix `ProposalSubmission.js`** — call on-chain `createProposal`
16. **Fix `Header.js`** — receive `account` and `connectWallet` as props, not independent hook call
17. **Simplify `useStore.js`** — remove blockchain logic from local store

### Phase 4: Verification

18. `cd onchain && npx hardhat test` — all pass
19. Deploy to local node, start frontend with `npm run dev`
20. Manual smoke: connect, add member, submit proposal, vote, see results, double-vote rejected

---

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| No constructor args | Align with test suite spec |
| Vite (not CRA) | Faster, zero-config, no eject |
| ethers v5 | Existing code uses v5 API |
| No backend | All state on-chain, MVP simplicity |
| Delete Lock.sol | Not part of product |
| Localhost only | Testnet is a stretch goal |

### Excluded from MVP

- Testnet/mainnet deployment
- CI/CD pipeline
- Mobile responsiveness
- Event-based real-time updates (poll on action instead)

### Open Questions

1. **Admin UI for `addMember`:** Add a simple owner-only input? Without it, members must be added via Hardhat console. Recommend yes, because a small admin panel makes the demo self-contained.
2. **ABI import:** Import directly from `../onchain/artifacts/...` or copy/symlink it. Recommend direct import for MVP simplicity.
3. **Event listener vs polling:** Listen to `ProposalCreated` events for live updates, or just re-fetch after each action. Recommend re-fetch after action for simplicity.