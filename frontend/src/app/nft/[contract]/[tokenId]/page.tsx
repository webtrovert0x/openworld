'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAccount, useWriteContract } from 'wagmi';
import { formatEther } from 'viem';
import { 
  ArrowLeft, 
  ExternalLink, 
  ShoppingBag, 
  Sparkles, 
  Tag, 
  RefreshCw, 
  AlertCircle,
  Share2,
  Copy,
  Check,
  Send,
  Lock,
  Unlock,
  Globe
} from 'lucide-react';
import { publicClient, OnchainNFT } from '../../../../services/onchain';
import { GENESIS_NFT_ADDRESS, MARKETPLACE_ADDRESS, NFT_ABI, MARKETPLACE_ABI } from '../../../../config/contracts';
import BuyModal from '../../../../components/BuyModal';
import OfferModal from '../../../../components/OfferModal';
import ListModal from '../../../../components/ListModal';
import TransferModal from '../../../../components/TransferModal';

interface ExtendedNFT extends OnchainNFT {
  externalUrl?: string;
  unlockableContent?: string;
}

export default function NFTDetailPage() {
  const params = useParams();
  const contractAddress = (params?.contract as string) || GENESIS_NFT_ADDRESS;
  const tokenId = parseInt((params?.tokenId as string) || '1', 10);

  const { address, isConnected } = useAccount();
  const [nft, setNft] = useState<ExtendedNFT | null>(null);
  const [collectionName, setCollectionName] = useState('OpenWorld Collection');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const loadTokenData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const targetAddr = contractAddress as `0x${string}`;

      const [name, tokenUri, owner, listing] = await Promise.all([
        publicClient.readContract({
          address: targetAddr,
          abi: NFT_ABI,
          functionName: 'name',
        }).catch(() => 'OpenWorld Collection'),
        publicClient.readContract({
          address: targetAddr,
          abi: NFT_ABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
        }),
        publicClient.readContract({
          address: targetAddr,
          abi: NFT_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        }),
        publicClient.readContract({
          address: MARKETPLACE_ADDRESS,
          abi: MARKETPLACE_ABI,
          functionName: 'getListing',
          args: [targetAddr, BigInt(tokenId)],
        }).catch(() => null),
      ]);

      setCollectionName(name);

      let metadata: any = {
        name: `${name} #${tokenId}`,
        description: '',
        image: '',
        attributes: [],
        external_url: '',
        unlockable_content: '',
      };

      if (tokenUri.startsWith('data:application/json;base64,')) {
        try {
          const jsonStr = atob(tokenUri.replace('data:application/json;base64,', ''));
          metadata = JSON.parse(jsonStr);
        } catch (e) {
          console.error(e);
        }
      } else if (tokenUri.startsWith('http://') || tokenUri.startsWith('https://')) {
        try {
          const res = await fetch(tokenUri);
          if (res.ok) metadata = await res.json();
        } catch (e) {
          console.error(e);
        }
      }

      const isListed = listing ? listing.isActive : false;
      const price = listing ? parseFloat(formatEther(listing.price)) : 0;
      const priceWei = listing ? listing.price.toString() : '0';
      const seller = listing ? listing.seller : owner;
      const listedAt = listing ? Number(listing.listedAt) : 0;

      setNft({
        id: `${targetAddr}-${tokenId}`,
        tokenId,
        contractAddress: targetAddr,
        name: metadata.name || `${name} #${tokenId}`,
        description: metadata.description || '',
        image: metadata.image || '',
        attributes: metadata.attributes || metadata.traits || [],
        externalUrl: metadata.external_url || metadata.externalUrl || '',
        unlockableContent: metadata.unlockable_content || metadata.unlockableContent || '',
        owner,
        isListed,
        price,
        priceWei,
        seller,
        listedAt,
        rawUri: tokenUri,
      });
    } catch (err: any) {
      console.error('Failed to load token:', err);
      setError(err?.message || 'Failed to query token from Botchain Testnet');
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, tokenId]);

  useEffect(() => {
    loadTokenData();
  }, [loadTokenData]);

  const isOwner = isConnected && address && nft && (
    nft.owner.toLowerCase() === address.toLowerCase() ||
    nft.seller.toLowerCase() === address.toLowerCase()
  );

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareToX = () => {
    if (typeof window !== 'undefined' && nft) {
      const tweetText = `Check out ${nft.name} on @OpenWorld NFT Marketplace (Botchain Testnet)!`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
    }
  };

  const handleCancelListing = async () => {
    if (!nft) return;
    try {
      await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [nft.contractAddress as `0x${string}`, BigInt(nft.tokenId)],
      });
      loadTokenData();
    } catch (err) {
      console.error('Cancel listing error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Bar Navigation & Share Actions */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Marketplace</span>
        </Link>

        {/* Share & Copy Link */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleShareToX}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141724] hover:bg-[#1e2336] text-slate-300 border border-[#232738] rounded-lg transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share to X</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141724] hover:bg-[#1e2336] text-slate-300 border border-[#232738] rounded-lg transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="panel rounded-xl p-16 text-center space-y-3 font-mono">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <div className="text-sm font-bold text-white">Loading on-chain token #{tokenId}...</div>
          <div className="text-xs text-slate-400">Reading from {contractAddress}</div>
        </div>
      ) : error || !nft ? (
        <div className="panel rounded-xl p-16 text-center space-y-3 font-mono">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-white">Token Not Found</h2>
          <p className="text-xs text-slate-400">{error || 'Token does not exist on Botchain Testnet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image & Contract Details */}
          <div className="lg:col-span-5 space-y-4">
            <div className="panel rounded-2xl overflow-hidden bg-black aspect-square relative border border-[#232738] flex items-center justify-center">
              {nft.image ? (
                <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center font-mono text-slate-400">
                  <div className="text-3xl font-bold text-white">#{nft.tokenId}</div>
                  <div className="text-xs text-slate-400 mt-1">Botchain On-Chain Asset</div>
                </div>
              )}
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded font-mono text-xs font-bold text-white border border-white/10">
                #{nft.tokenId}
              </div>
            </div>

            {/* On-Chain Contract Metadata Card */}
            <div className="panel rounded-xl p-4 space-y-2.5 font-mono text-xs">
              <div className="text-slate-400 uppercase font-bold text-[10px] pb-1 border-b border-[#232738]">
                On-Chain Verification
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Contract Address</span>
                <a
                  href={`https://scan.bohr.life/address/${nft.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>{nft.contractAddress.slice(0, 8)}...{nft.contractAddress.slice(-6)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Token ID</span>
                <span className="text-white">#{nft.tokenId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Network</span>
                <span className="text-emerald-400">Botchain Testnet (968)</span>
              </div>
              {nft.externalUrl && (
                <div className="flex justify-between items-center pt-1 border-t border-[#232738]">
                  <span className="text-slate-400">External Project Link</span>
                  <a
                    href={nft.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Visit Website</span>
                    <Globe className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-indigo-400">
                {collectionName}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {nft.name}
              </h1>
              {nft.description && (
                <p className="text-xs font-mono text-slate-300 leading-relaxed pt-1">
                  {nft.description}
                </p>
              )}
            </div>

            {/* Owner Details */}
            <div className="panel rounded-xl p-4 grid grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Owner</span>
                <a
                  href={`https://scan.bohr.life/address/${nft.owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-indigo-400 flex items-center gap-1 mt-1 truncate"
                >
                  <span className="truncate">{nft.owner}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Listing Status</span>
                <div className="mt-1">
                  {nft.isListed ? (
                    <span className="text-emerald-400 font-bold">Active Listing on Market</span>
                  ) : (
                    <span className="text-slate-400">Not Listed for Sale</span>
                  )}
                </div>
              </div>
            </div>

            {/* Unlockable Content (OpenSea Style - Owner Only) */}
            {nft.unlockableContent && (
              <div className="panel rounded-xl p-4 font-mono text-xs space-y-2 border border-indigo-500/30">
                <div className="flex items-center gap-2">
                  {isOwner ? (
                    <Unlock className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="font-bold text-white uppercase text-[11px]">
                    Unlockable Content
                  </span>
                </div>
                {isOwner ? (
                  <div className="p-3 bg-[#090a0f] rounded-lg border border-[#232738] text-emerald-400 font-mono break-all">
                    {nft.unlockableContent}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px]">
                    This item includes secret unlockable content only visible to the on-chain owner.
                  </p>
                )}
              </div>
            )}

            {/* Trading Desk Panel */}
            <div className="panel rounded-2xl p-6 space-y-5 border border-[#2d3247] bg-[#11131c]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                    Current Ask Price
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1">
                    {nft.isListed ? `${nft.price} BOT` : 'Not Listed'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono">
                {nft.isListed && !isOwner && (
                  <button
                    onClick={() => setBuyModalOpen(true)}
                    className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Buy Now ({nft.price} BOT)</span>
                  </button>
                )}

                {!isOwner && (
                  <button
                    onClick={() => setOfferModalOpen(true)}
                    className="py-3 px-4 bg-[#181b28] hover:bg-[#202436] text-white border border-[#2d3247] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Place Escrow Offer</span>
                  </button>
                )}

                {isOwner && (
                  <>
                    <button
                      onClick={() => setListModalOpen(true)}
                      className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Tag className="w-4 h-4" />
                      <span>{nft.isListed ? 'Update Listing Price' : 'List Item for Sale'}</span>
                    </button>

                    <button
                      onClick={() => setTransferModalOpen(true)}
                      className="py-3 px-4 bg-[#181b28] hover:bg-[#202436] text-slate-200 border border-[#2d3247] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 text-indigo-400" />
                      <span>Transfer Asset</span>
                    </button>

                    {nft.isListed && (
                      <button
                        onClick={handleCancelListing}
                        className="sm:col-span-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Cancel Listing
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Traits */}
            {nft.attributes && nft.attributes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase">
                  Traits & Attributes ({nft.attributes.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {nft.attributes.map((attr, idx) => (
                    <div key={idx} className="p-2.5 panel rounded-xl font-mono text-xs space-y-0.5">
                      <div className="text-[10px] uppercase text-slate-400 font-semibold truncate">{attr.trait_type}</div>
                      <div className="text-white font-bold truncate">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Modals */}
      <BuyModal
        nft={nft}
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        onSuccess={() => loadTokenData()}
      />

      <OfferModal
        nft={nft}
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        onSuccess={() => loadTokenData()}
      />

      <ListModal
        nft={nft}
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        onSuccess={() => loadTokenData()}
      />

      <TransferModal
        nft={nft}
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={() => loadTokenData()}
      />
    </div>
  );
}
