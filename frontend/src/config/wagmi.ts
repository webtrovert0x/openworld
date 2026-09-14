import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { botchainTestnet } from './chains';
import { http } from 'wagmi';

// Project ID from environment or user's project ID
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || process.env.NEXT_PUBLIC_PROJECT_ID || 'c43f36da76c6ec227aa6d98c25dbbb11';

export const networks = [botchainTestnet];

// Set up Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
  transports: {
    [botchainTestnet.id]: http('https://rpc.bohr.life'),
  },
});

export const config = wagmiAdapter.wagmiConfig;
