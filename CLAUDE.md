# DAO Voting dApp — Agent Contract

## §1 Project Vision

Full-stack DAO voting dApp — Solidity smart contract (Hardhat, OpenZeppelin Ownable) with a React + ethers.js v5 frontend. Members vote on proposals stored entirely on-chain.

| Layer | Technology |
|---|---|
| Smart contracts | Solidity ^0.8.0 (compiled at 0.8.28), Hardhat, OpenZeppelin |
| Frontend | React (to be bootstrapped — CRA or Vite), ethers.js v5, Zustand |
| Test | Hardhat test (Chai/Mocha) |
| Chain | Local Hardhat node → testnet via Infura |

**[CRITICAL]** Never suggest or introduce any alternative framework, library, or dependency not listed above without explicit user approval.

**Project structure**
- `src/` — React frontend (no root `package.json` yet; bootstrapping required)
- `onchain/` — Hardhat environment with its own `package.json`
- `public/` — Static assets for the React app

---

## §2 Golden Rules

1. **Read before write** — read every file you will touch before editing it.
2. **Precision edits** — change only what the task requires; leave surrounding code intact.
3. **No premature abstraction** — do not introduce new contracts, hooks, or utilities unless the task explicitly asks for them.
4. **Fail explicitly** — Solidity: always use `require` with explicit revert messages. React: propagate Web3 errors to UI, no silent swallowing.

---

## §3 Architecture & Critical Constraints

**Smart contract interface** (`onchain/contracts/Voting.sol`)

| Function | Description |
|---|---|
| `addMember(address)` | Owner-only: register a DAO member |
| `createProposal(string)` | Members-only: create a new proposal |
| `vote(uint proposalId, bool support)` | Members-only: vote for/against; no double voting |
| `getProposalResults(uint)` | Returns `(votesFor, votesAgainst)` |
| `members(address)` | Public mapping: `true` if registered member |
| `proposals(uint)` | Public struct: `description`, `votesFor`, `votesAgainst`, `exists` |

- Contract must use OpenZeppelin `Ownable`; revert message must be `"Ownable: caller is not the owner"` (test suite expects this exact string).
- `vote()` must guard against double voting.
- Solidity `pragma ^0.8.0`; Hardhat compiles at `0.8.28`.

**Frontend** (`src/`)
- `useEthereum.js` — all blockchain interaction via `ethers.providers.Web3Provider` (ethers v5 API).
- `useStore.js` — Zustand store for client-side proposal state and voting history.
- `App.js` — wires together `useEthereum` + `useStore`; renders Header / ProposalSubmission / ProposalDisplay / VotingResults / Footer.

**Known issues / constraints**
- `onchain/` has its own `package.json` — all Hardhat commands run from there.
- Frontend `src/` has NO root `package.json` yet — must be bootstrapped before it can run.
- ABI path in `App.js` is a placeholder (`./path/to/your/contractABI.json`) — update to `onchain/artifacts/contracts/Voting.sol/Voting.json` after compile.
- Constructor mismatch: deploy script uses `string[] memory proposalNames`; tests deploy with no args — resolve before testnet deploy.

**Environment variables** (`onchain/.env` — never committed)
```
INFURA_URL=<your_rpc_url>
PRIVATE_KEY=<deployer_wallet_private_key>
```

**Hardhat commands (run from `onchain/`)**
```bash
npm install
npx hardhat compile
npx hardhat test
npx hardhat test test/Voting.test.js
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/deploy.js --network <network-name>
```

**Frontend bootstrap (repo root — one-time)**
```bash
npx create-react-app . --template cra-template   # CRA
# OR
npm create vite@latest . -- --template react      # Vite
```
Then install `ethers`, `zustand`, `react-bootstrap` and update `src/App.js` with contract address and ABI path.

---

## §4 Agent Workflows

**Plan Mode trigger:** changes touching ≥2 files → enter Plan Mode and await user confirmation before editing.

**Verification (must both exit 0)**
```bash
cd onchain && npx hardhat compile
cd onchain && npx hardhat test
```

**Git commits:** Angular format (`fix:`, `feat:`, `refactor:`), body explains *why*.

---

## §5 Hard Boundaries — NEVER

- Never read or modify `onchain/.env` or any file containing private keys.
- Never deploy to mainnet without explicit per-session user confirmation.
- Never self-initiate `git push` without explicit user instruction.
- Never remove access control checks (`onlyOwner`, `onlyMember`) from contract functions.
- Never allow double-voting — the `vote()` function must guard against it.

---

## §6 Definition of Done

- [ ] Change satisfies only the stated requirement — no scope creep
- [ ] `npx hardhat compile` exits 0
- [ ] `npx hardhat test` exits 0 (all tests pass)
- [ ] Constructor/deploy-script argument mismatch resolved if contract was touched
- [ ] ABI path in `App.js` points to `onchain/artifacts/contracts/Voting.sol/Voting.json`
- [ ] No unguarded assumptions about Web3Provider availability in frontend hooks

---

## §7 Context Compaction Guide

When compacting, preserve:
```xml
<architecture_state>
  <decisions></decisions>
  <dead_ends></dead_ends>
  <todo></todo>
</architecture_state>
```

---

## 8. AGENTS.md Soft Link

`CLAUDE.md` is self-contained — no `@` reference to `AGENTS.md`. `AGENTS.md` contains only `@CLAUDE.md`.
