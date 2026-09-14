'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatEther } from 'viem';
import { 
  Activity, 
  ShoppingBag, 
  Tag, 
  Sparkles, 
  ExternalLink,
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';
import { publicClient } from '../../services/onchain';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, GENESIS_NFT_ADDRESS, NFT_ABI } from '../../config/contracts';

interface ActivityItem {
  id: string;
  type: 'List' | 'Sale' | 'Offer' | 'Mint';
  contractAddress: string;
  tokenId: number;
  price?: number;
  from?: string;
  to?: string;
  blockNumber: string;
  txHash: string;
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > BigInt(10000) ? currentBlock - BigInt(10000) : BigInt(0);

      // Fetch on-chain logs from marketplace
      const [listLogs, buyLogs, offerLogs] = await Promise.all([
        publicClient.getContractEvents({
          address: MARKETPLACE_ADDRESS,
          abi: MARKETPLACE_ABI,
          eventName: 'ItemListed',
          fromBlock,
        }).catch(() => []),
        publicClient.getContractEvents({
          address: MARKETPLACE_ADDRESS,
          abi: MARKETPLACE_ABI,
          eventName: 'ItemBought',
          fromBlock,
        }).catch(() => []),
        publicClient.getContractEvents({
          address: MARKETPLACE_ADDRESS,
          abi: MARKETPLACE_ABI,
          eventName: 'OfferCreated',
          fromBlock,
        }).catch(() => []),
      ]);

      const parsed: ActivityItem[] = [];

      listLogs.forEach((log: any) => {
        parsed.push({
          id: `list-${log.transactionHash}-${log.logIndex}`,
          type: 'List',
          contractAddress: log.args.nftContract,
          tokenId: Number(log.args.tokenId),
          price: parseFloat(formatEther(log.args.price)),
          from: log.args.seller,
          blockNumber: log.blockNumber.toString(),
          txHash: log.transactionHash,
        });
      });

      buyLogs.forEach((log: any) => {
        parsed.push({
          id: `buy-${log.transactionHash}-${log.logIndex}`,
          type: 'Sale',
          contractAddress: log.args.nftContract,
          tokenId: Number(log.args.tokenId),
          price: parseFloat(formatEther(log.args.price)),
          from: log.args.seller,
          to: log.args.buyer,
          blockNumber: log.blockNumber.toString(),
          txHash: log.transactionHash,
        });
      });

      offerLogs.forEach((log: any) => {
        parsed.push({
          id: `offer-${log.transactionHash}-${log.logIndex}`,
          type: 'Offer',
          contractAddress: log.args.nftContract,
          tokenId: Number(log.args.tokenId),
          price: parseFloat(formatEther(log.args.amount)),
          from: log.args.bidder,
          blockNumber: log.blockNumber.toString(),
          txHash: log.transactionHash,
        });
      });

      setEvents(parsed);
    } catch (err) {
      console.error('Error querying events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white">
            On-Chain Activity
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Real-time event ledger from Botchain Testnet contract <strong className="text-slate-300">{MARKETPLACE_ADDRESS}</strong>.
          </p>
        </div>

        <button
          onClick={fetchEvents}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#181b28] hover:bg-[#202436] text-slate-200 rounded-lg text-xs font-mono font-semibold transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Sync Events</span>
        </button>
      </div>

      {/* Activity Table */}
      <div className="panel rounded-xl overflow-hidden font-mono text-xs">
        {isLoading ? (
          <div className="p-16 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
            <div className="text-xs text-slate-400">Querying on-chain contract events...</div>
          </div>
        ) : events.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-[#141724] text-slate-400 border-b border-[#232738]">
              <tr>
                <th className="p-3.5">Event</th>
                <th className="p-3.5">Token ID</th>
                <th className="p-3.5">Value</th>
                <th className="p-3.5">From</th>
                <th className="p-3.5">Block</th>
                <th className="p-3.5 text-right">Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232738]">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#141724]/60 transition-colors">
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ev.type === 'Sale' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      ev.type === 'List' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' :
                      ev.type === 'Offer' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                      'bg-slate-500/10 text-slate-300 border border-slate-500/30'
                    }`}>
                      {ev.type}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-white">
                    <Link href={`/nft/${ev.contractAddress}/${ev.tokenId}`} className="hover:text-indigo-400">
                      Token #{ev.tokenId}
                    </Link>
                  </td>
                  <td className="p-3.5 text-white font-bold">
                    {ev.price ? `${ev.price} BOT` : '—'}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {ev.from ? `${ev.from.slice(0, 6)}...${ev.from.slice(-4)}` : '—'}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    #{ev.blockNumber}
                  </td>
                  <td className="p-3.5 text-right">
                    <a
                      href={`https://scan.bohr.life/tx/${ev.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                    >
                      <span>{ev.txHash.slice(0, 8)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-white">No Marketplace Events in Recent Blocks</div>
            <p className="text-xs text-slate-400">New listings, trades, and offers on Botchain will stream live here.</p>
          </div>
        )}
      </div>

    </div>
  );
}
