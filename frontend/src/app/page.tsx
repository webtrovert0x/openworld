'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import { 
  RefreshCw, 
  Search, 
  PlusCircle, 
  ExternalLink, 
  Layers, 
  LayoutGrid, 
  Table, 
  ArrowUpRight,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { useOnchainMarket } from '../hooks/useOnchainMarket';
import { OnchainNFT } from '../services/onchain';
import deployed from '../config/deployedContracts.json';
import { GENESIS_NFT_ADDRESS, MARKETPLACE_ADDRESS, DROP_FACTORY_ADDRESS, DROP_FACTORY_ABI } from '../config/contracts';
import NFTCard from '../components/NFTCard';
import BuyModal from '../components/BuyModal';
import OfferModal from '../components/OfferModal';

export default function MarketplacePage() {
  const [contractAddress, setContractAddress] = useState<string>(GENESIS_NFT_ADDRESS);
  const [customAddressInput, setCustomAddressInput] = useState<string>('');
  
  const { data: allDrops } = useReadContract({
    address: DROP_FACTORY_ADDRESS,
    abi: DROP_FACTORY_ABI,
    functionName: 'getAllDrops',
  });

  React.useEffect(() => {
    if (allDrops && (allDrops as string[]).length > 0) {
      const dropsArray = allDrops as string[];
      setContractAddress(dropsArray[dropsArray.length - 1]);
    }
  }, [allDrops]);
  const { collectionInfo, items, isLoading, error, refresh } = useOnchainMarket(contractAddress);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'listed' | 'unlisted'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [selectedNFT, setSelectedNFT] = useState<OnchainNFT | null>(null);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && !item.tokenId.toString().includes(searchQuery)) {
        return false;
      }
      if (statusFilter === 'listed' && !item.isListed) return false;
      if (statusFilter === 'unlisted' && item.isListed) return false;
      return true;
    });
  }, [items, searchQuery, statusFilter]);

  const listedCount = items.filter((i) => i.isListed).length;
  const floorPrice = items.filter((i) => i.isListed && i.price > 0).reduce((min, p) => p.price < min ? p.price : min, items[0]?.price || 0);

  const handleCustomContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAddressInput.startsWith('0x') && customAddressInput.length === 42) {
      setContractAddress(customAddressInput);
    }
  };

  const handleBuy = (nft: OnchainNFT) => {
    setSelectedNFT(nft);
    setBuyModalOpen(true);
  };

  const handleOffer = (nft: OnchainNFT) => {
    setSelectedNFT(nft);
    setOfferModalOpen(true);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Network & Protocol Status Bar */}
      <div className="panel rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Network</span>
            <span className="text-indigo-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Botchain Mainnet (677)
            </span>
          </div>
          <div className="border-l border-[#232738] pl-4">
            <span className="text-slate-400 block text-[10px] uppercase">RPC Endpoint</span>
            <span className="text-slate-200">https://rpc.botchain.ai</span>
          </div>
          <div className="border-l border-[#232738] pl-4">
            <span className="text-slate-400 block text-[10px] uppercase">Marketplace Engine</span>
            <a
              href={`https://scan.botchain.ai/address/${MARKETPLACE_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>{MARKETPLACE_ADDRESS.slice(0, 8)}...{MARKETPLACE_ADDRESS.slice(-6)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <button
          onClick={() => refresh()}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#181b28] hover:bg-[#202436] text-slate-200 rounded-lg text-xs font-mono font-semibold transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Sync On-Chain State</span>
        </button>
      </div>

      {/* Collection Stats Header */}
      <div className="panel rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-mono text-white">
              {collectionInfo.name} ({collectionInfo.symbol})
            </h1>
            <a
              href={`https://scan.botchain.ai/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white"
              title="View on BotchainScan"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-2">
            <span>Contract: <strong className="text-slate-300">{contractAddress}</strong></span>
          </div>
        </div>

        {/* Core On-Chain Numbers */}
        <div className="grid grid-cols-3 gap-3 font-mono">
          <div className="p-3 bg-[#141724] rounded-lg border border-[#232738]">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">Total Minted</span>
            <span className="text-lg font-bold text-white">{collectionInfo.totalSupply} NFTs</span>
          </div>
          <div className="p-3 bg-[#141724] rounded-lg border border-[#232738]">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">Active Listings</span>
            <span className="text-lg font-bold text-indigo-400">{listedCount} Listed</span>
          </div>
          <div className="p-3 bg-[#141724] rounded-lg border border-[#232738]">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">Floor Ask</span>
            <span className="text-lg font-bold text-emerald-400">{floorPrice > 0 ? `${floorPrice} BOT` : '—'}</span>
          </div>
        </div>
      </div>

      {/* Contract Switcher Form */}
      <div className="panel rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <span className="text-slate-300 font-semibold shrink-0">Explore Any Contract Address:</span>
        <form onSubmit={handleCustomContractSubmit} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-xl">
          <input
            type="text"
            placeholder="0x... (ERC-721 Contract Address on Botchain)"
            value={customAddressInput}
            onChange={(e) => setCustomAddressInput(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#090a0f] border border-[#232738] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#181b28] hover:bg-[#202436] text-white rounded-lg font-semibold shrink-0"
          >
            Load
          </button>
        </form>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-[#11131c] border border-[#232738] rounded-lg font-mono text-xs">
            {[
              { id: 'all', label: `All (${items.length})` },
              { id: 'listed', label: `Listed (${listedCount})` },
              { id: 'unlisted', label: `Unlisted (${items.length - listedCount})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setStatusFilter(t.id as any)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  statusFilter === t.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search token name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#11131c] border border-[#232738] rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* View Switcher & Mint Link */}
        <div className="flex items-center gap-2">
          <Link
            href="/create"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-semibold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Mint New Token</span>
          </Link>

          <div className="flex items-center p-1 bg-[#11131c] border border-[#232738] rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-[#181b28] text-white' : 'text-slate-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-[#181b28] text-white' : 'text-slate-400'}`}
              title="Table View"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Items Display */}
      {isLoading ? (
        <div className="panel rounded-xl p-16 text-center space-y-3 font-mono">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <div className="text-sm font-bold text-white">Reading on-chain tokens from Botchain Mainnet...</div>
          <div className="text-xs text-slate-400">Querying RPC https://rpc.botchain.ai</div>
        </div>
      ) : filteredItems.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onBuy={handleBuy}
                onOffer={handleOffer}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="panel rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141724] text-slate-400 border-b border-[#232738]">
                <tr>
                  <th className="p-3.5">Token</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Owner</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232738]">
                {filteredItems.map((nft) => (
                  <tr key={nft.id} className="hover:bg-[#141724]/60 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={nft.image} alt={nft.name} className="w-10 h-10 rounded-lg object-cover bg-black" />
                      <div>
                        <div className="font-bold text-white">{nft.name}</div>
                        <div className="text-[11px] text-slate-400">ID #{nft.tokenId}</div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      {nft.isListed ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          LISTED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#181b28] text-slate-400 text-[10px]">
                          UNLISTED
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-white">
                      {nft.isListed ? `${nft.price} BOT` : '—'}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                    </td>
                    <td className="p-3.5 text-right">
                      {nft.isListed ? (
                        <button
                          onClick={() => handleBuy(nft)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-xs"
                        >
                          Buy
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOffer(nft)}
                          className="px-3 py-1 bg-[#181b28] hover:bg-[#202436] text-slate-200 border border-[#2d3247] rounded text-xs"
                        >
                          Offer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="panel rounded-xl p-16 text-center space-y-3 font-mono">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Tokens Found on Botchain Mainnet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No tokens are currently minted in this contract. Use the Mint Studio to deploy the next on-chain token.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mint First Token</span>
          </Link>
        </div>
      )}

      {/* Modals */}
      <BuyModal
        nft={selectedNFT}
        isOpen={buyModalOpen}
        onClose={() => {
          setBuyModalOpen(false);
          setSelectedNFT(null);
        }}
        onSuccess={() => refresh()}
      />

      <OfferModal
        nft={selectedNFT}
        isOpen={offerModalOpen}
        onClose={() => {
          setOfferModalOpen(false);
          setSelectedNFT(null);
        }}
        onSuccess={() => refresh()}
      />
    </main>
  );
}
