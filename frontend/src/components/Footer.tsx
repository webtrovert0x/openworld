'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { MARKETPLACE_ADDRESS, GENESIS_NFT_ADDRESS } from '../config/contracts';
import deployed from '../config/deployedContracts.json';

export default function Footer() {
  const isMainnet = deployed?.chainId === 677;
  const networkName = isMainnet ? 'Botchain Mainnet' : 'Botchain Testnet';
  const chainId = deployed?.chainId || (isMainnet ? 677 : 968);
  const explorerUrl = deployed?.explorerUrl || (isMainnet ? 'https://scan.botchain.ai' : 'https://scan.bohr.life');
  const explorerName = isMainnet ? 'BotchainScan Explorer' : 'BohrScan Explorer';
  const rpcUrl = deployed?.rpcUrl || (isMainnet ? 'https://rpc.botchain.ai' : 'https://rpc.bohr.life');

  return (
    <footer className="w-full bg-[#06070a] border-t border-[#232738] py-10 font-mono text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#1c2030]">
          
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="OpenWorld Logo"
                className="w-8 h-8 object-contain rounded-md"
              />
              <span className="font-bold text-base text-white tracking-tight">
                OPEN<span className="text-[#0088ff]">WORLD</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Decentralized NFT trading engine on {networkName} (Chain {chainId}).
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase text-slate-300">Marketplace</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/" className="hover:text-white transition-colors">Explore All</Link></li>
              <li><Link href="/create" className="hover:text-white transition-colors">Mint Studio</Link></li>
              <li><Link href="/activity" className="hover:text-white transition-colors">On-Chain Activity</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">Portfolio</Link></li>
            </ul>
          </div>

          {/* Network */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase text-slate-300">{networkName}</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 flex items-center gap-1">
                  <span>{explorerName}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href={rpcUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 flex items-center gap-1">
                  <span>RPC Endpoint</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><span className="text-slate-400">Chain ID: {chainId}</span></li>
              <li><span className="text-slate-400">Settlement Token: BOT</span></li>
            </ul>
          </div>

          {/* Smart Contracts */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase text-slate-300">Contracts</h4>
            <div className="space-y-1.5 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Marketplace</span>
                <a href={`${explorerUrl}/address/${MARKETPLACE_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                  {MARKETPLACE_ADDRESS.slice(0, 10)}...{MARKETPLACE_ADDRESS.slice(-4)}
                </a>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Genesis Collection</span>
                <a href={`${explorerUrl}/address/${GENESIS_NFT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                  {GENESIS_NFT_ADDRESS.slice(0, 10)}...{GENESIS_NFT_ADDRESS.slice(-4)}
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>© {new Date().getFullYear()} OpenWorld Protocol. {networkName} ({chainId}).</div>
          <div className="text-emerald-400 font-semibold">● Botchain Node Connected</div>
        </div>
      </div>
    </footer>
  );
}

