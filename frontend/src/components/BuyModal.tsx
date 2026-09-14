'use client';

import React, { useState } from 'react';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseEther } from 'viem';
import { X, ShoppingBag, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { OnchainNFT } from '../services/onchain';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from '../config/contracts';
import { botchainTestnet } from '../config/chains';

interface BuyModalProps {
  nft: OnchainNFT | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BuyModal({ nft, isOpen, onClose, onSuccess }: BuyModalProps) {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({
    address: address,
    chainId: botchainTestnet.id,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  if (!isOpen || !nft) return null;

  const price = nft.price;
  const platformFee = (price * 0.015).toFixed(3);
  const userBalance = balanceData ? parseFloat(balanceData.formatted) : 0;

  const handleBuy = async () => {
    if (!isConnected) {
      open();
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);

      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'buyItem',
        args: [nft.contractAddress as `0x${string}`, BigInt(nft.tokenId)],
        value: parseEther(price.toString()),
      });

      setTxHash(hash);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Buy error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Transaction could not be executed.');
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
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span>Buy On-Chain NFT</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Botchain Testnet (Chain ID: 968)
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#141724] border border-[#232738] rounded-xl">
              <img src={nft.image} alt={nft.name} className="w-14 h-14 rounded-lg object-cover bg-black" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white font-mono truncate">{nft.name}</div>
                <div className="text-[11px] font-mono text-slate-400">Token ID #{nft.tokenId}</div>
                <div className="text-xs font-mono font-bold text-indigo-400 mt-0.5">{nft.price} BOT</div>
              </div>
            </div>

            <div className="p-3.5 bg-[#090a0f] border border-[#232738] rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Item Price</span>
                <span className="text-white">{nft.price} BOT</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Protocol Fee (1.5%)</span>
                <span>{platformFee} BOT</span>
              </div>
              <div className="pt-2 border-t border-[#232738] flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-indigo-400">{nft.price} BOT</span>
              </div>
            </div>

            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Your BOT Balance:</span>
              <span className="text-slate-200 font-bold">{userBalance.toFixed(3)} BOT</span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleBuy}
              disabled={isProcessing}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing On-Chain...</span>
                </>
              ) : (
                <span>Confirm Purchase ({nft.price} BOT)</span>
              )}
            </button>
          </>
        ) : (
          <div className="py-6 text-center space-y-4 font-mono">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">Purchase Confirmed</h3>
              <p className="text-xs text-slate-400 mt-1">Transaction confirmed on Botchain Testnet.</p>
            </div>
            {txHash && (
              <a
                href={`https://scan.bohr.life/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
              >
                <span>View on BohrScan</span>
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
