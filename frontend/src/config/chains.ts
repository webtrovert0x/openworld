import { defineChain } from 'viem';

/**
 * Botchain Mainnet Chain Definition
 * Chain ID: 677
 * RPC: https://rpc.botchain.ai
 * Native Token: BOT (150 Million supply)
 * Explorer: https://scan.botchain.ai/
 */
export const botchainMainnet = defineChain({
  id: 677,
  name: 'Botchain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Botchain Token',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.botchain.ai'],
    },
    public: {
      http: ['https://rpc.botchain.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BotchainScan',
      url: 'https://scan.botchain.ai',
    },
  },
  testnet: false,
});

/**
 * Botchain Testnet Chain Definition
 * Chain ID: 968
 * RPC: https://rpc.bohr.life
 * Native Token: BOT (150 Million supply)
 * Explorer: https://scan.bohr.life/
 */
export const botchainTestnet = defineChain({
  id: 968,
  name: 'Botchain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Botchain Token',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
    public: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BohrScan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

