# OpenWorld — Botchain NFT Protocol & Marketplace

<div align="center">
  <img src="frontend/public/logo.png" width="100" height="100" alt="OpenWorld Logo" />
  <h3>High-Performance Institutional NFT Marketplace & Launchpad</h3>
  <p>Built specifically for <strong>Botchain Mainnet (Chain ID: 677)</strong></p>
</div>

---

## 🌐 Network Configuration (Botchain Mainnet)

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Mainnet |
| **Chain ID** | `677` |
| **RPC Endpoint** | `https://rpc.botchain.ai` |
| **Native Token** | `BOT` |
| **Total Supply** | 150 Million BOT |
| **Block Explorer** | [https://scan.botchain.ai](https://scan.botchain.ai) |

---

## 📜 Deployed Smart Contracts

| Contract | Address | BotchainScan Explorer |
| :--- | :--- | :--- |
| **OpenWorldNFT (Genesis Collection)** | `0x245bDD263dEb51bA9325F7CA76F004c601F6D574` | [View on BotchainScan](https://scan.botchain.ai/address/0x245bDD263dEb51bA9325F7CA76F004c601F6D574) |
| **OpenWorldMarketplace** | `0x841015D7b91c325aA58adB00BbAFAe367A9b02D3` | [View on BotchainScan (Verified)](https://scan.botchain.ai/address/0x841015D7b91c325aA58adB00BbAFAe367A9b02D3#code) |

*Flattened Solidity files for 1-click explorer verification are available in [`contracts/flattened/`](contracts/flattened/).*

---

## ✨ Core Features & Parity

### 1. 🎨 OpenSea-Grade Mint Studio (`/create`)
- **100% Fully On-Chain Storage**: Encodes image data and metadata directly into Base64 Data URIs stored inside the Botchain contract state mapping. Zero external image hosting / S3 / IPFS pinning dependencies required.
- **Uncapped Supply Minting**: Single items (`1 of 1`) or batch editions (`N items`) minted directly in one transaction flow.
- **Owner-Only Unlockable Content**: Creators can embed private redemption codes, Discord access keys, or high-res download URLs visible only to the verified on-chain owner.
- **External Project Links**: Embed official project or portfolio links directly in token metadata.
- **EIP-2981 Creator Royalties**: Selectable royalty fee percentage (0% to 10%) enforced on all secondary marketplace trades.

### 2. ⚡ Institutional Trading Terminal (`/` & `/nft/[contract]/[tokenId]`)
- **Zero Mock Data**: 100% live queries via pure JSON-RPC directly to Botchain Mainnet smart contracts.
- **Dual View Modes**: Interactive Grid view and high-density financial Table view with instant sorting and filtering.
- **Arbitrary Contract Discovery**: Input bar to index and explore any ERC-721 contract deployed on Botchain.
- **Trading & Offers**: Direct fixed-price purchase flow with automatic 1.5% protocol fee routing, on-chain native BOT escrowed bidding, and instant item transfers.

### 3. 🔍 Explorer & Activity Stream (`/activity`)
- **Real-Time On-Chain Ledger**: Indexes contract event logs for sales, listings, and mints directly from Botchain Mainnet.
- **Direct Block Explorer Integration**: Clickable links to transactions and addresses on BotchainScan.

### 4. 💼 Collector Portfolio (`/profile`)
- **Wallet-Centric Indexing**: View all NFTs owned or listed by the connected wallet.
- **One-Click Listing & Price Adjustments**: Direct listing management from the profile view.

---

## 🛠️ Tech Stack & Architecture

- **Smart Contracts**: Solidity `0.8.24`, Hardhat, OpenZeppelin Contracts, EIP-2981 Royalties.
- **Frontend**: Next.js 16 (Turbopack, App Router), React 19, TypeScript.
- **Web3 Engine**: Viem, Wagmi v2, Reown AppKit.
- **Styling**: Vanilla CSS Design System with dark cyberpunk monospace aesthetics.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ and npm installed
- MetaMask or any EVM Web3 wallet configured with Botchain Mainnet (Chain ID: `677`)

---

### 1. Smart Contracts Setup

```bash
cd contracts

# Install dependencies
npm install

# Run automated test suite
npx hardhat test

# Deploy to Botchain Mainnet (requires PRIVATE_KEY in .env)
npx hardhat run scripts/deploy.js --network botchainMainnet
```

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start local development server (runs on port 3000)
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Standards

- **ERC-721**: Standard non-fungible token implementation.
- **EIP-2981**: Standard royalty distribution on secondary sales.
- **ReentrancyGuard**: OpenZeppelin reentrancy protection on marketplace funds and escrow transfers.
- **Ownable**: Secure access control for fee management.

---

## 📄 License
MIT License.
