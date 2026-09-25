'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { 
  Layers, 
  ExternalLink,
  ArrowRight,
  Loader2,
  TrendingUp,
  Compass
} from 'lucide-react';
import { DROP_FACTORY_ADDRESS, DROP_FACTORY_ABI, GENESIS_NFT_ADDRESS } from '../config/contracts';
import { useOnchainMarket } from '../hooks/useOnchainMarket';

const DROP_COLLECTION_ABI = [
  { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "dropURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "nextTokenId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

function CollectionCard({ address, isGenesis = false }: { address: `0x${string}`, isGenesis?: boolean }) {
  const { data: name } = useReadContract({ address, abi: DROP_COLLECTION_ABI, functionName: 'name' });
  const { data: symbol } = useReadContract({ address, abi: DROP_COLLECTION_ABI, functionName: 'symbol' });
  const { data: dropURI } = useReadContract({ address, abi: DROP_COLLECTION_ABI, functionName: 'dropURI' });
  const { items } = useOnchainMarket(address);

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
  const listedPrices = items.filter(i => i.isListed && i.price > 0).map(i => i.price);
  const floorPrice = listedPrices.length > 0 ? Math.min(...listedPrices) : 0;

  return (
    <Link href={`/collection/${address}`} className="block group">
      <div className="panel rounded-2xl overflow-hidden border border-[#232738] hover:border-indigo-500/50 transition-all hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/10 flex flex-col h-full">
        <div className="aspect-[4/3] bg-[#090a0f] relative flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={name as string} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <Loader2 className="w-6 h-6 text-slate-600 animate-spin" />
          )}
          
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-bold text-emerald-400 uppercase font-mono flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Live
          </div>
          
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-bold text-white uppercase font-mono shadow-xl">
            {symbol as string || 'NFT'}
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-indigo-400 transition-colors">{name as string || 'Loading...'}</h3>
          
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#232738]">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Floor Price</span>
              <div className="text-sm font-bold text-slate-200">{floorPrice > 0 ? `${floorPrice} BOT` : '—'}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Status</span>
              <div className="text-sm font-bold text-indigo-400">Active</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function GlobalExplorePage() {
  const { data: drops, isLoading } = useReadContract({
    address: DROP_FACTORY_ADDRESS,
    abi: DROP_FACTORY_ABI,
    functionName: 'getAllDrops',
  });

  const dropAddresses = drops as `0x${string}`[] || [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
          Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">OpenWorld</span>
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto">
          Discover sovereign NFT drops and verified collections deployed on Botchain Mainnet. Trade instantly with zero hidden fees.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#232738] pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Trending Collections
          </h2>
        </div>

        {isLoading ? (
          <div className="panel rounded-2xl p-24 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Show Genesis Contract as the first card manually since it wasn't made by the factory */}
            <CollectionCard address={GENESIS_NFT_ADDRESS} isGenesis={true} />

            {/* Show all factory drops */}
            {dropAddresses.slice().reverse().map((dropAddr, idx) => (
              <CollectionCard key={`${dropAddr}-${idx}`} address={dropAddr} />
            ))}
          </div>
        )}

        {!isLoading && dropAddresses.length === 0 && (
          <div className="panel rounded-2xl p-16 text-center space-y-4 border border-dashed border-[#2d3247] bg-transparent">
            <Compass className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white">No New Drops Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Be the first creator to launch a verified drop on the OpenWorld protocol.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
