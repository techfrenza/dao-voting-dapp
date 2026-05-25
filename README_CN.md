# DAO_Voting

一个使用 React + Vite（前端）和 Solidity + Hardhat（智能合约）构建的极简 DAO 投票去中心化应用。成员可通过 MetaMask 提交提案并进行链上投票。无需后端——所有状态均存储在链上。

## 技术栈

| 层级 | 技术 |
|-------|-----------|
| 智能合约 | Solidity `^0.8.0`，OpenZeppelin Ownable v4 |
| 合约工具 | Hardhat `^2.22`，hardhat-toolbox v5 |
| 前端 | React 18，Vite 5 |
| 区块链库 | ethers.js v5 |
| 钱包 | MetaMask (EIP-1193) |
| 状态管理 | React `useState`（无外部状态库） |

## 业务功能

### 1. 钱包连接
连接 MetaMask 钱包。应用会读取您的链上角色（所有者 / 成员）并加载所有提案。

### 2. 提案提交
成员通过输入描述来提交新提案。提案通过 `createProposal(string)` 存储在链上。非成员在合约层面会被拒绝。

### 3. 提案展示
从合约中获取所有提案，并以响应式卡片网格的形式展示，附带实时投票计数。

### 4. 投票
成员通过 `vote(uint proposalId, bool support)` 对每个提案投赞成或反对票。链上防止重复投票。投票后按钮消失。

### 5. 投票结果
每张卡片显示实时赞成 / 反对票数，在每次交易后从合约重新获取。

### 6. 投票历史
连接钱包后，应用会对每个提案查询 `hasVotedOn(proposalId, address)`，使您的历史投票记录在页面刷新后仍然保留。

### 7. 成员管理（仅限所有者）
部署者（所有者）会看到"添加成员"面板。输入任意以太坊地址并点击"添加"，即可调用 `addMember(address)`。所有者也可以将自己添加为成员以获得成员权限。

## 项目结构

```
DAO_Voting/
├── index.html                # Vite 入口点
├── vite.config.js
├── package.json              # 前端依赖（React、ethers、Vite）
├── .env.local                # VITE_CONTRACT_ADDRESS（不提交到版本控制）
├── src/
│   ├── main.jsx              # React DOM 挂载
│   ├── App.jsx               # 所有 UI 集中在一个文件中（约 150 行）
│   └── App.css               # 深色主题样式
├── public/
│   └── favicon.ico
└── onchain/                  # Hardhat 项目
    ├── contracts/
    │   └── Voting.sol        # DAO 投票合约（OpenZeppelin Ownable）
    ├── scripts/
    │   └── deploy.js
    ├── test/
    │   └── Voting.test.js    # 8 个测试——全部通过
    ├── hardhat.config.js
    └── package.json          # Hardhat + @openzeppelin/contracts
```

## 智能合约接口

```solidity
function addMember(address)                              // onlyOwner
function createProposal(string calldata description)     // members only
function vote(uint proposalId, bool support)             // members only, no double-vote
function getProposalResults(uint proposalId) returns (uint votesFor, uint votesAgainst)
function hasVotedOn(uint proposalId, address voter) returns (bool)
mapping(address => bool) public members
mapping(uint => Proposal) public proposals              // 1-indexed
uint public proposalCount
```

## 快速开始

### 1. 安装依赖

```bash
# 合约依赖
cd onchain && npm install

# 前端依赖
cd .. && npm install
```

### 2. 启动本地 Hardhat 节点

```bash
cd onchain
npx hardhat node
```

### 3. 部署合约

在第二个终端中执行：

```bash
cd onchain
npx hardhat run scripts/deploy.js --network localhost
```

将打印出的地址复制到仓库根目录的 `.env.local` 文件中：

```
VITE_CONTRACT_ADDRESS=0x<deployed address>
```

### 4. 启动前端

```bash
npm run dev
```

打开 [http://localhost:5173](http://localhost:5173)，并将 MetaMask 连接到 Hardhat 本地网络（链 ID 31337）。

### 5. 运行合约测试

```bash
cd onchain
npx hardhat test
```

全部 8 个测试应均通过。
