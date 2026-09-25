'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { 
  Layers, 
  PlusCircle, 
  ExternalLink,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { botchainMainnet } from '../../config/chains';

const DROP_FACTORY_ADDRESS = "0x2Be2B7d615a9DF3974b2837ffE97EBC21028576c";
const DROP_FACTORY_ABI = [
  { "inputs": [{ "internalType": "address", "name": "_creator", "type": "address" }], "name": "getDropsByCreator", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }
];

const DROP_COLLECTION_ABI = [
  { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "dropURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }
];

function DropCard({ address }: { address: `0x${string}` }) {
  const { data: name } = useReadContract({ address, abi: DROP_COLLECTION_ABI, functionName: 'name' });
  const { data: symbol } = useReadContract({ address, abi: DROP_COLLECTION_ABI, functionName: 'symbol' });
  const { data: dropURI } = useReadContract({ address, abi: DROP_COLLECTION_ABI, functionName: 'dropURI' });

  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    if (typeof dropURI === 'string' && dropURI.startsWith('ipfs://')) {
      const hash = dropURI.replace('ipfs://', '');
      fetch(`https://gateway.pinata.cloud/ipfs/${hash}`)
        .then(res => res.json())
        .then(data => setMetadata(data))
        .catch(console.error);
    }
  }, [dropURI]);

  const imageUrl = metadata?.image?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');

  return (
    <div className="panel rounded-2xl overflow-hidden border border-[#232738] hover:border-indigo-500/50 transition-colors group flex flex-col">
      <div className="aspect-[4/3] bg-[#090a0f] relative flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name as string} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Loader2 className="w-6 h-6 text-slate-600 animate-spin" />
        )}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-bold text-white uppercase font-mono">
          {symbol as string || 'DROP'}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-1 truncate">{name as string || 'Loading...'}</h3>
        <p className="text-xs text-slate-400 font-mono mb-4 flex-1 line-clamp-2">
          {metadata?.description || '...'}
        </p>
        
        <div className="pt-4 border-t border-[#232738] flex items-center justify-between mt-auto">
          <Link 
            href={`/drop/${address}`}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider"
          >
            View Mint Page <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          
          <a
            href={`https://scan.botchain.ai/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-300"
            title="View on BotchainScan"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LaunchpadPage() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  const { data: drops, isLoading } = useReadContract({
    address: DROP_FACTORY_ADDRESS,
    abi: DROP_FACTORY_ABI,
    functionName: 'getDropsByCreator',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    }
  });

  const dropAddresses = drops as `0x${string}`[] || [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-black font-mono text-white flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-400" />
            My Launchpad
          </h1>
          <p className="text-sm font-mono text-slate-400 max-w-xl">
            Manage your deployed Smart Contracts. Every collection here is a sovereign, self-contained contract that you own.
          </p>
        </div>

        <Link
          href="/create"
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono font-bold text-xs transition-colors shadow-lg shadow-indigo-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Drop</span>
        </Link>
      </div>

      {!isConnected ? (
        <div className="panel rounded-2xl p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-[#181b28] rounded-full flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Connect Your Wallet</h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto pb-2">
            Connect to Botchain Mainnet to view the drops you have deployed from this address.
          </p>
          <button
            onClick={() => open()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg"
          >
            Connect Wallet
          </button>
        </div>
      ) : isLoading ? (
        <div className="panel rounded-2xl p-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : dropAddresses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dropAddresses.slice().reverse().map((dropAddr, idx) => (
            <DropCard key={`${dropAddr}-${idx}`} address={dropAddr} />
          ))}
        </div>
      ) : (
        <div className="panel rounded-2xl p-16 text-center space-y-4 border border-dashed border-[#2d3247] bg-transparent">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white">No Drops Deployed</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto pb-2">
            You haven't launched any sovereign smart contracts yet. Deploy your first collection today.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch First Drop</span>
          </Link>
        </div>
      )}

    </main>
  );
}
