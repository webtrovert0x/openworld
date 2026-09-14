# OpenWorld Protocol Whitepaper
**A Next-Generation, Institutional NFT Exchange and Launchpad Protocol on Botchain**

*Version 1.0 — September 2026*  
*Protocol Team: OpenWorld Foundation*  
*Network: Botchain (Chain ID: 968)*  

---

## Abstract

Non-Fungible Tokens (NFTs) have established themselves as the foundational primitive for verifiable digital property rights, intellectual property, and community membership. However, existing marketplace architectures frequently suffer from metadata fragility (reliance on centralized third-party servers and off-chain image hosts prone to link rot and 404 errors), complex user interfaces, and non-enforced creator royalties.

**OpenWorld** is an institutional-grade, decentralized NFT marketplace and minting protocol engineered specifically for the **Botchain** ecosystem. Built on high-performance EVM infrastructure, OpenWorld delivers:
1. **100% On-Chain Asset Permanence**: Direct Base64 data URI encoding within smart contract state, eliminating external storage dependencies.
2. **Deterministic Settlement Engine**: Non-custodial fixed-price atomic swaps and cryptographically secured escrow offers with a minimal 1.5% protocol fee.
3. **EIP-2981 Royalty Standard Enforcement**: Native secondary sale creator remuneration embedded directly into the settlement layer.
4. **Institutional Trading Interface**: A streamlined, low-latency trading desk equipped with live on-chain event indexing, floor analytics, uncapped supply editioning, owner-only unlockable content, and direct wallet transfers.

---

## 1. Introduction & Market Problem

### 1.1 The Fragility of Off-Chain Metadata
A critical flaw in standard NFT implementations is the detachment of metadata from the underlying blockchain. Assets that point to centralized URLs (e.g., AWS S3, Cloudinary) or unpinned IPFS hashes become completely inaccessible if the server goes offline or pinning subscriptions lapse.

### 1.2 The Botchain Advantage
Botchain provides an optimal execution environment for digital assets:
* **High Throughput & Rapid Finality**: Instant order settlement and token transfers without network congestion.
* **Ultra-Low Gas Economics**: Micro-cent transaction fees allow for dense calldata and rich on-chain metadata storage that would be prohibitively expensive on legacy networks like Ethereum L1.
* **Native EVM Compatibility**: Full support for Solidity tooling, viem/wagmi client adapters, and standardized hardware wallets.

---

## 2. System Architecture & Smart Contract Design

OpenWorld operates as a two-tier smart contract protocol consisting of the **Asset Layer** (`OpenWorldNFT`) and the **Exchange Layer** (`OpenWorldMarketplace`).

```
┌─────────────────────────────────────────────────────────────────┐
│                      OpenWorld Frontend DApp                    │
│      (Next.js 16 + Wagmi v2 + Viem + Reown AppKit Wallet)       │
└───────────────────────────────┬─────────────────────────────────┘
                                │ JSON-RPC (https://rpc.bohr.life)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Botchain Testnet (Chain ID: 968)              │
│                                                                 │
│   ┌───────────────────────────┐   ┌───────────────────────────┐ │
│   │     OpenWorldNFT.sol      │   │  OpenWorldMarketplace.sol │ │
│   │                           │   │                           │ │
│   │ • ERC-721 Standard        │   │ • Fixed-Price Listings    │ │
│   │ • EIP-2981 Royalties      │◄──┤ • Atomic Purchases        │ │
│   │ • On-Chain Base64 Storage │   │ • BOT Escrow Offer Engine │ │
│   │ • Uncapped Edition Mint   │   │ • 1.5% Protocol Fee Split │ │
│   └───────────────────────────┘   └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2.1 The Asset Layer (`OpenWorldNFT.sol`)

`OpenWorldNFT` extends OpenZeppelin's `ERC721URIStorage`, `ERC2981`, and `Ownable` contracts:

* **On-Chain Token URI Mapping**:
  Images and attribute graphs are base64-encoded client-side into self-contained JSON data URIs (`data:application/json;base64,...`) and written directly to the contract's internal mapping:
  $$\text{tokenURI}(k) = \text{Base64}(\text{Metadata JSON})$$
* **Batch & Edition Minting**:
  Enables single-token creation (`mint`) and mass edition distributions (`batchMint`) within a single transactional execution block.
* **EIP-2981 Royalty Standard**:
  Every token stores creator royalty specifications (receiver address and fee numerator up to 1,000 basis points / 10%).

---

### 2.2 The Exchange Layer (`OpenWorldMarketplace.sol`)

The marketplace contract serves as the non-custodial liquidity clearinghouse for all Botchain digital assets.

#### A. Fixed-Price Direct Listing & Settlement
Sellers list tokens by approving the marketplace and setting a unit ask price in native `BOT`. When a buyer initiates `buyItem`:
1. The contract validates `msg.value == listing.price`.
2. EIP-2981 royalty fees are calculated and routed directly to the creator.
3. Protocol fee ($1.5\% = 150 \text{ bps}$) is transferred to the treasury address.
4. Net proceeds ($\text{Price} - \text{Royalty} - \text{Fee}$) are transferred to the seller.
5. The NFT is atomically transferred to the buyer via `IERC721.safeTransferFrom`.

$$\text{Seller Payout} = P_{\text{total}} - (\text{Fee}_{\text{protocol}} + \text{Royalty}_{\text{creator}})$$

#### B. Escrowed Bid / Offer Engine
Prospective buyers can place native `BOT` bids on any token by depositing funds directly into contract escrow via `makeOffer`.
* **Capital Protection**: Funds remain locked in the contract until the offer is either accepted by the NFT owner or voluntarily cancelled by the bidder.
* **Owner Execution**: The token owner can accept the bid via `acceptOffer`, instantly transferring the token and receiving the escrowed payment.

---

## 3. Protocol Economics & Fee Structure

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Protocol Marketplace Fee** | `1.5%` (150 bps) | Sustains protocol development, liquidity incentives, and treasury operations. |
| **Creator Royalties** | `0.0% – 10.0%` (0–1000 bps) | Configurable by creator upon minting; enforced via EIP-2981 on secondary trades. |
| **Settlement Currency** | `BOT` (Native) | Native gas and exchange token of the Botchain network. |
| **Escrow Fee** | `0%` | Zero friction to place or cancel offers. |

---

## 4. OpenSea Feature Parity & User Utilities

OpenWorld incorporates key institutional and consumer-facing features:

1. **Uncapped Supply Studio**:
   Creators are not restricted by arbitrary caps; they can mint 1/1 masterpieces or large-scale community drops (e.g., 10,000 items).
2. **Owner-Only Unlockable Content**:
   Enables creators to embed encrypted download URLs, Discord keys, or physical claim codes that only the verified on-chain token owner can access.
3. **Direct Wallet Transfer**:
   Native interface integration for `safeTransferFrom`, allowing instant peer-to-peer asset transfers with recipient address validation.
4. **Social Amplification Engine**:
   One-click social sharing to X (Twitter) and instant clipboard sharing with rich dynamic metadata previews.
5. **Real-Time Event Ledger**:
   Sub-second indexing of contract events (`ItemListed`, `ItemBought`, `ItemCancelled`, `OfferCreated`) without relying on centralized closed-source indexing layers.

---

## 5. Security & Threat Mitigation

* **Reentrancy Protection**: All fund transfers and escrow releases utilize OpenZeppelin's `ReentrancyGuard` with strict Checks-Effects-Interactions patterns.
* **Non-Custodial Escrow**: Sellers maintain custody of their NFTs until the instant of execution, preventing platform-wide lockups.
* **Front-Running Resistance**: Strict state validation on listings and offers ensures obsolete orders cannot be executed against stale prices.

---

## 6. Deployed Contract Specifications

The canonical contracts are deployed and operational on Botchain Testnet:

```
Network:           Botchain Testnet
Chain ID:          968
RPC:               https://rpc.bohr.life
Native Token:      BOT
Block Explorer:    https://scan.bohr.life

OpenWorldNFT:      0x50Eda285Fdc45AE741eF4F23110E9BE4a3CFec61
Marketplace:       0x526676Bed606B8942dd1Eb18b7E6090E14C5a30A
```

---

## 7. Roadmap

* **Phase 1 (Current)**:
  * Deployment of Genesis Core Contracts on Botchain Testnet.
  * Launch of Next.js 16 Trading Terminal & Mint Studio.
  * 100% On-Chain Metadata & Base64 storage implementation.
* **Phase 2**:
  * Multi-Token Sweep Cart & Batch Purchasing Engine.
  * Collection-wide Floor Bidding (Trait-agnostic escrow bids).
  * Trait floor analytics and rarity scoring engine.
* **Phase 3**:
  * Botchain Mainnet protocol deployment.
  * Decentralized creator launchpad with customized whitelist / merkle drop verification.
  * Cross-chain bridge integration for ecosystem expansion.

---

## 8. Conclusion

OpenWorld represents a significant advancement in decentralized digital asset infrastructure for Botchain. By combining 100% on-chain asset permanence, institutional trading ergonomics, and automated royalty compliance, OpenWorld establishes the definitive benchmark for NFT exchange and launchpad technology on Botchain.

---
*© 2026 OpenWorld Protocol. All rights reserved.*
