'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseEther } from 'viem';
import { X, Tag, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { OnchainNFT } from '../services/onchain';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, NFT_ABI } from '../config/contracts';
import deployed from '../config/deployedContracts.json';

interface ListModalProps {
  nft: OnchainNFT | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ListModal({ nft, isOpen, onClose, onSuccess }: ListModalProps) {
  const networkName = 'Botchain Mainnet';
  const explorerUrl = 'https://scan.botchain.ai';

  const { open } = useAppKit();
  const { isConnected } = useAccount();

  const [price, setPrice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  if (!isOpen || !nft) return null;

  const numPrice = parseFloat(price) || 0;

  const handleList = async () => {
    if (!isConnected) {
      open();
      return;
    }

    if (numPrice <= 0) {
      setErrorMsg('Price must be > 0 BOT');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);

      // 1. Approve marketplace if needed
      await writeContractAsync({
        address: nft.contractAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'approve',
        args: [MARKETPLACE_ADDRESS, BigInt(nft.tokenId)],
      });

      // 2. List on marketplace
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'listItem',
        args: [
          nft.contractAddress as `0x${string}`,
          BigInt(nft.tokenId),
          parseEther(numPrice.toString()),
        ],
      });

      setTxHash(hash);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('List error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Listing could not be completed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md panel rounded-2xl p-6 space-y-5 border border-[#2d3247] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            <div>
              <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                <span>List NFT on Marketplace</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Set fixed ask price in native BOT.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#141724] border border-[#232738] rounded-xl">
              <img src={nft.image} alt={nft.name} className="w-14 h-14 rounded-lg object-cover bg-black" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white font-mono truncate">{nft.name}</div>
                <div className="text-[11px] font-mono text-slate-400">Token ID #{nft.tokenId}</div>
              </div>
            </div>

            <div className="space-y-1.5 font-mono">
              <label className="text-xs text-slate-400">Listing Price (BOT)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#090a0f] border border-[#232738] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-400 font-bold">
                  BOT
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleList}
              disabled={isProcessing || numPrice <= 0}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting On-Chain...</span>
                </>
              ) : (
                <span>Publish Listing ({numPrice} BOT)</span>
              )}
            </button>
          </>
        ) : (
          <div className="py-6 text-center space-y-4 font-mono">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">Item Listed</h3>
              <p className="text-xs text-slate-400 mt-1">Item is now tradable on {networkName}.</p>
            </div>
            {txHash && (
              <a
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#181b28] hover:bg-[#202436] text-white rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
