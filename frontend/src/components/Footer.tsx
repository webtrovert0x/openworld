'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { MARKETPLACE_ADDRESS, GENESIS_NFT_ADDRESS } from '../config/contracts';
import deployed from '../config/deployedContracts.json';

export default function Footer() {
  const networkName = 'BOT Chain Mainnet';
  const chainId = 677;
  const websiteUrl = 'https://www.botchain.ai/en/';
  const explorerUrl = 'https://scan.botchain.ai';
  const explorerName = 'BotchainScan Explorer';
  const rpcUrl = 'https://rpc.botchain.ai';

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

          {/* Network & Ecosystem */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <img src="/botchain.jpeg" alt="BOT Chain" className="w-4 h-4 rounded-full object-cover" />
              <span>{networkName}</span>
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a 
                  href={websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-indigo-400 flex items-center gap-1.5 text-slate-200 group"
                >
                  <img src="/botchain.jpeg" alt="BOT Chain" className="w-3.5 h-3.5 rounded-full object-cover" />
                  <span className="font-semibold group-hover:underline">BOT Chain Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 flex items-center gap-1.5 text-slate-300 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="group-hover:underline">BOT Chain Explorer</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a href={rpcUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 flex items-center gap-1.5">
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
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} OpenWorld Protocol. Powered by</span>
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold">
              <img src="/botchain.jpeg" alt="BOT Chain" className="w-3.5 h-3.5 rounded-full object-cover" />
              <span>BOT Chain</span>
            </a>
            <span>({chainId}).</span>
          </div>
          <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Botchain Node Connected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

