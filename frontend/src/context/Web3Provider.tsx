'use client';

import React, { ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { State, WagmiProvider } from 'wagmi';
import { config, projectId, networks } from '../config/wagmi';
import { botchainMainnet, botchainTestnet } from '../config/chains';

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
  adapters: [config as any],
  networks: [botchainMainnet, botchainTestnet] as any,
  projectId,
  metadata,
  defaultNetwork: botchainMainnet as any,
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
