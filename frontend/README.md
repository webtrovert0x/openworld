# OpenWorld — Frontend DApp

Production-grade Next.js 16 Web3 frontend for the **OpenWorld NFT Protocol** on **Botchain Testnet**.

## Tech Stack
- **Framework**: Next.js 16 (App Router + Turbopack)
- **Styling**: Tailwind CSS & Modern Dark Institutional Theme
- **Web3 Wallet**: `@reown/appkit`, `@reown/appkit-adapter-wagmi`, `wagmi@2.x`, `viem`
- **Data Fetching**: `@tanstack/react-query`

## Key Pages
- **`/`**: Marketplace Discovery Terminal (Floor stats, grid/table view, live on-chain listings)
- **`/create`**: OpenSea-grade Mint Studio (On-chain Base64 storage, uncapped supply, unlockable content, external links)
- **`/nft/[contract]/[tokenId]`**: NFT Trading Terminal (Direct Buy, Escrow Offers, Price update, On-chain Transfer modal, Share on X)
- **`/activity`**: Real-time Botchain event ledger (`ItemListed`, `ItemBought`, `OfferCreated`)
- **`/profile`**: User Portfolio & Wallet asset viewer

## Running Locally

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```
