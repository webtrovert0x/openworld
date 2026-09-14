'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles, Tag, ExternalLink } from 'lucide-react';
import { OnchainNFT } from '../services/onchain';

interface NFTCardProps {
  nft: OnchainNFT;
  onBuy?: (nft: OnchainNFT) => void;
  onOffer?: (nft: OnchainNFT) => void;
}

export default function NFTCard({ nft, onBuy, onOffer }: NFTCardProps) {
  const formatAddr = (addr?: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="interactive-card rounded-xl overflow-hidden flex flex-col justify-between group">
      {/* Image */}
      <Link href={`/nft/${nft.contractAddress}/${nft.tokenId}`} className="relative aspect-square w-full bg-[#11131c] overflow-hidden block">
        {nft.image ? (
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#141724] text-slate-400 font-mono text-xs">
            <span className="text-xl font-bold text-slate-200">#{nft.tokenId}</span>
            <span className="text-[10px] text-slate-400 mt-1">Botchain NFT</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded border border-white/10 font-mono text-[11px] font-bold text-white">
          #{nft.tokenId}
        </div>

        {nft.isListed && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-400 font-mono text-[10px] font-bold">
            LISTED
          </div>
        )}
      </Link>

      {/* Info & Trading */}
      <div className="p-3.5 space-y-3">
        <div>
          <h3 className="font-bold text-sm text-white truncate font-mono">
            {nft.name}
          </h3>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
            Owner: {formatAddr(nft.owner)}
          </div>
        </div>

        {/* Traits Pills */}
        {nft.attributes && nft.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {nft.attributes.slice(0, 2).map((a, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-[#181b28] border border-[#232738] rounded text-[10px] font-mono text-slate-300 truncate">
                {a.trait_type}: {a.value}
              </span>
            ))}
          </div>
        )}

        {/* Price & Actions */}
        <div className="pt-2 border-t border-[#232738] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block">
              Price
            </span>
            <div className="font-mono text-sm font-bold text-white">
              {nft.isListed ? `${nft.price} BOT` : 'Unlisted'}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {nft.isListed ? (
              <button
                onClick={() => onBuy ? onBuy(nft) : null}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy</span>
              </button>
            ) : (
              <button
                onClick={() => onOffer ? onOffer(nft) : null}
                className="px-3 py-1.5 bg-[#181b28] hover:bg-[#202436] text-slate-200 border border-[#2d3247] rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Offer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
