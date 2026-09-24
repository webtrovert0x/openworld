'use client';

import React, { ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { State, WagmiProvider } from 'wagmi';
import { wagmiAdapter, config, projectId, networks } from '../config/wagmi';
import { botchainMainnet } from '../config/chains';

// Setup queryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// AppKit Metadata for OpenWorld
const metadata = {
  name: 'OpenWorld NFT Marketplace',
  description: 'Next-Gen NFT Marketplace & Launchpad on Botchain Mainnet',
  url: 'https://openworld-psi.vercel.app',
  icons: ['https://openworld-psi.vercel.app/logo.png'],
};

// Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks: [botchainMainnet] as any,
  projectId,
  metadata,
  defaultNetwork: botchainMainnet as any,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb3704d1f62add7960e74f9739a3741872202640d5d8364e4508a3b', // Coinbase
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '1ae92b260f7d4d3d0f82f4b794f48f37cf75b081e7c9292042870077381366f9', // Rainbow
    '8a0ee50d18f22f461625904090150c226471815e444d45ddc0f823bc349666ee', // Rabby
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
    'a797aa35c0483844b72ef7d0980c0ed6939d38a6c31a2774d4779287f7340e4e', // Phantom
  ],
  allWallets: 'SHOW',
  enableInjected: true,
  enableCoinbase: true,
  enableWalletConnect: true,
  features: {
    analytics: true,
    email: false,
    socials: [],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#6366f1',
    '--w3m-border-radius-master': '12px',
    '--w3m-font-family': 'Space Grotesk, sans-serif',
  },
});

export default function Web3Provider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={config as any} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
