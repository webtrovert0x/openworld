'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { 
  Compass, 
  PlusCircle, 
  Activity, 
  User, 
  ExternalLink, 
  Wallet, 
  LogOut 
} from 'lucide-react';
import deployed from '../config/deployedContracts.json';
import { botchainMainnet, botchainTestnet } from '../config/chains';

export default function Navbar() {
  const pathname = usePathname();
  const { open } = useAppKit();
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();

  const activeChainId = chainId || deployed?.chainId || botchainMainnet.id;
  const isMainnet = activeChainId === 677;
  const activeChain = isMainnet ? botchainMainnet : botchainTestnet;

  const { data: balanceData } = useBalance({
    address: address,
    chainId: activeChain.id,
  });

  const navLinks = [
    { name: 'Marketplace', href: '/', icon: Compass },
    { name: 'Mint Studio', href: '/create', icon: PlusCircle },
    { name: 'Activity', href: '/activity', icon: Activity },
    { name: 'Portfolio', href: '/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090a0f]/95 border-b border-[#232738] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand with Official Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="OpenWorld Logo"
              className="w-9 h-9 object-contain rounded-lg group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-tight font-mono flex items-center gap-1.5">
                OPEN<span className="text-[#0088ff]">WORLD</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono -mt-1">
                Botchain NFT Protocol
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors ${
                    isActive
                      ? 'bg-[#181b28] text-white border border-[#2d3247]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#12141f]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Network & Wallet */}
        <div className="flex items-center gap-3">
          {/* Network Badge */}
          <a
            href={activeChain.blockExplorers?.default.url || (isMainnet ? 'https://scan.botchain.ai' : 'https://scan.bohr.life')}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11131c] border text-[11px] font-mono transition-colors ${
              isMainnet 
                ? 'border-indigo-500/30 text-indigo-400 hover:border-indigo-500/60'
                : 'border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isMainnet ? 'bg-indigo-400' : 'bg-emerald-500'}`}></span>
            <span>{isMainnet ? 'Botchain (677)' : 'Botchain (968)'}</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {!isConnected ? (
            <button
              onClick={() => open()}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#11131c] border border-[#232738] rounded-lg p-1">
              <div className="px-2 py-0.5 text-xs font-mono font-semibold text-slate-200">
                {balanceData ? parseFloat(balanceData.formatted).toFixed(2) : '0.00'} BOT
              </div>
              <button
                onClick={() => open()}
                className="px-2.5 py-1 bg-[#181b28] hover:bg-[#202436] rounded-md text-xs font-mono text-indigo-300 font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}</span>
              </button>
              <button
                onClick={() => disconnect()}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                title="Disconnect"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
