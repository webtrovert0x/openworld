'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccount, useBalance } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { 
  User, 
  ExternalLink, 
  Tag, 
  RefreshCw, 
  PlusCircle,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { useOnchainMarket } from '../../hooks/useOnchainMarket';
import { OnchainNFT } from '../../services/onchain';
import { botchainMainnet } from '../../config/chains';
import { GENESIS_NFT_ADDRESS } from '../../config/contracts';
import deployed from '../../config/deployedContracts.json';
import ListModal from '../../components/ListModal';

export default function ProfilePage() {
  const activeChain = botchainMainnet;
  const networkName = 'Botchain Mainnet';
  const explorerUrl = 'https://scan.botchain.ai';

  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { data: balanceData } = useBalance({
    address: address,
    chainId: activeChain.id,
  });

  const { items, isLoading, refresh } = useOnchainMarket(GENESIS_NFT_ADDRESS);
  const [selectedNFTForList, setSelectedNFTForList] = useState<OnchainNFT | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter items owned by the connected wallet
  const userOwnedItems = items.filter(
    (item) => address && (
      item.owner.toLowerCase() === address.toLowerCase() ||
      item.seller.toLowerCase() === address.toLowerCase()
    )
  );

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const userBalance = balanceData ? parseFloat(balanceData.formatted) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      
      {/* Header */}
      <div className="panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 font-mono">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Collector Portfolio</h1>
            {isConnected && address ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span>{address.slice(0, 10)}...{address.slice(-6)}</span>
                <button onClick={copyAddress} className="hover:text-white">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`${explorerUrl}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <div className="text-xs text-slate-400 mt-1">Wallet not connected</div>
            )}
          </div>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#141724] border border-[#232738] rounded-xl text-xs">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">BOT Balance</span>
              <span className="text-base font-bold text-white">{userBalance.toFixed(3)} BOT</span>
            </div>
            <div className="p-3 bg-[#141724] border border-[#232738] rounded-xl text-xs">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Owned Tokens</span>
              <span className="text-base font-bold text-indigo-400">{userOwnedItems.length} NFTs</span>
            </div>
            <Link
              href="/create"
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Mint NFT
            </Link>
          </div>
        ) : (
          <button
            onClick={() => open()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono transition-colors"
          >
            Connect Botchain Wallet
          </button>
        )}
      </div>

      {/* Owned Items Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono">
          <h2 className="text-base font-bold text-white">
            Owned On-Chain Tokens ({userOwnedItems.length})
          </h2>
          <button
            onClick={() => refresh()}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="panel rounded-xl p-16 text-center space-y-2 font-mono">
            <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
            <div className="text-xs text-slate-400">Syncing wallet tokens with Botchain...</div>
          </div>
        ) : userOwnedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userOwnedItems.map((nft) => (
              <div key={nft.id} className="panel rounded-xl overflow-hidden p-3.5 space-y-3 font-mono">
                <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                  <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 rounded text-[10px] font-bold text-white border border-white/10">
                    #{nft.tokenId}
                  </div>
                  {nft.isListed && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-bold">
                      {nft.price} BOT
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-sm text-white truncate">{nft.name}</div>
                  <div className="text-[11px] text-slate-400">Token ID #{nft.tokenId}</div>
                </div>

                <div className="pt-2 border-t border-[#232738] flex items-center justify-between">
                  <Link
                    href={`/nft/${nft.contractAddress}/${nft.tokenId}`}
                    className="text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedNFTForList(nft);
                      setListModalOpen(true);
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold"
                  >
                    {nft.isListed ? 'Update Price' : 'List on Market'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel rounded-xl p-16 text-center space-y-3 font-mono">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-white">No Tokens Owned in this Wallet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You do not currently hold tokens in the OpenWorld contract on {networkName}.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Mint Your First NFT</span>
            </Link>
          </div>
        )}
      </div>

      {/* List Modal */}
      <ListModal
        nft={selectedNFTForList}
        isOpen={listModalOpen}
        onClose={() => {
          setListModalOpen(false);
          setSelectedNFTForList(null);
        }}
        onSuccess={() => refresh()}
      />
    </div>
  );
}
