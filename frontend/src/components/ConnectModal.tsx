'use client';

import React, { useState } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { X, Wallet, ShieldCheck, Loader2, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { botchainMainnet } from '../config/chains';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  category: string;
  icon: string;
  badge?: string;
  isPopular?: boolean;
}

export default function ConnectModal({ isOpen, onClose }: ConnectModalProps) {
  const { connectors, connect, isPending, error } = useConnect();
  const { open } = useAppKit();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasInjected = typeof window !== 'undefined' && Boolean((window as any).ethereum);
  const isMetaMaskDetected = typeof window !== 'undefined' && Boolean((window as any).ethereum?.isMetaMask);
  const isCoinbaseDetected = typeof window !== 'undefined' && Boolean((window as any).ethereum?.isCoinbaseWallet);
  const isRabbyDetected = typeof window !== 'undefined' && Boolean((window as any).ethereum?.isRabby);

  // Injected connector
  const injectedConnector = connectors.find(
    (c) => c.type === 'injected' || c.id === 'injected' || c.id === 'metaMask'
  );

  const handleConnectInjected = async (walletName: string) => {
    try {
      setConnectingId(walletName);
      if (injectedConnector) {
        await connect({ connector: injectedConnector, chainId: botchainMainnet.id });
        onClose();
      } else if (connectors.length > 0) {
        await connect({ connector: connectors[0], chainId: botchainMainnet.id });
        onClose();
      } else {
        open();
      }
    } catch (err) {
      console.error('Connection error:', err);
    } finally {
      setConnectingId(null);
    }
  };

  const handleWalletConnectOpen = () => {
    onClose();
    open();
  };

  const wallets: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      category: 'Browser Extension & Mobile',
      icon: '🦊',
      badge: isMetaMaskDetected ? 'Installed' : hasInjected ? 'Detected' : 'Popular',
      isPopular: true,
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      category: 'Browser & Mobile App',
      icon: '🛡️',
      badge: isCoinbaseDetected ? 'Installed' : undefined,
    },
    {
      id: 'rabby',
      name: 'Rabby Wallet',
      category: 'DeFi Power-User Extension',
      icon: '🐰',
      badge: isRabbyDetected ? 'Installed' : undefined,
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      category: 'Mobile & Extension',
      icon: '🌈',
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      category: 'Multi-Chain Crypto Wallet',
      icon: '💎',
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      category: 'Web3 & Multi-Chain',
      icon: '⚡',
    },
    {
      id: 'phantom',
      name: 'Phantom (EVM)',
      category: 'Multi-Chain Extension',
      icon: '👻',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg panel rounded-2xl p-6 space-y-5 border border-[#2d3247] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#232738]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-mono font-bold text-white flex items-center gap-2">
                <span>Connect a Wallet</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Botchain Mainnet (Chain ID: 677)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1f2334] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Injected / Detected Wallets Grid */}
        <div className="space-y-2 font-mono">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Available Wallets
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {wallets.map((w) => {
              const isSelected = connectingId === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    if (hasInjected && (w.id === 'metamask' || w.badge === 'Installed' || w.badge === 'Detected')) {
                      handleConnectInjected(w.id);
                    } else {
                      handleWalletConnectOpen();
                    }
                  }}
                  disabled={isPending}
                  className={`p-3 rounded-xl bg-[#141724] hover:bg-[#1c2032] border transition-all text-left flex items-center justify-between group cursor-pointer ${
                    w.badge === 'Installed' || w.badge === 'Detected'
                      ? 'border-indigo-500/40 bg-indigo-950/10'
                      : 'border-[#232738] hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{w.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 truncate flex items-center gap-1.5">
                        <span>{w.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {w.badge ? (
                          <span className="text-emerald-400 font-semibold">{w.badge}</span>
                        ) : (
                          w.category
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && isPending ? (
                    <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Universal WalletConnect Bar */}
        <div className="space-y-2 font-mono pt-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Mobile & Other Wallets
          </div>
          <button
            onClick={handleWalletConnectOpen}
            className="w-full p-3.5 rounded-xl bg-[#141724] hover:bg-[#1a1e2f] border border-[#232738] hover:border-indigo-500/50 flex items-center justify-between transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-base shrink-0">
                📱
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 flex items-center gap-2">
                  <span>WalletConnect / All 300+ Wallets</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    QR & Mobile
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Scan QR code or connect with any mobile wallet app
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
            {error.message}
          </div>
        )}

        {/* Security & Network Footer */}
        <div className="pt-2 border-t border-[#1e2235] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Cryptographic Security</span>
          </span>
          <span className="text-slate-400">Botchain Mainnet (677)</span>
        </div>
      </div>
    </div>
  );
}
