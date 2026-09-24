'use client';

import React, { useState } from 'react';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseEther } from 'viem';
import { X, Sparkles, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { OnchainNFT } from '../services/onchain';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from '../config/contracts';
import { botchainMainnet, botchainTestnet } from '../config/chains';
import deployed from '../config/deployedContracts.json';

interface OfferModalProps {
  nft: OnchainNFT | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OfferModal({ nft, isOpen, onClose, onSuccess }: OfferModalProps) {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const isMainnet = deployed?.chainId === 677;
  const activeChain = isMainnet ? botchainMainnet : botchainTestnet;
  const networkName = isMainnet ? 'Botchain Mainnet' : 'Botchain Testnet';
  const explorerUrl = isMainnet ? 'https://scan.botchain.ai' : 'https://scan.bohr.life';

  const { data: balanceData } = useBalance({
    address: address,
    chainId: activeChain.id,
  });

  const [offerAmount, setOfferAmount] = useState('');
  const [duration, setDuration] = useState('86400');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  if (!isOpen || !nft) return null;

  const numOffer = parseFloat(offerAmount) || 0;
  const userBalance = balanceData ? parseFloat(balanceData.formatted) : 0;

  const handleOffer = async () => {
    if (!isConnected) {
      open();
      return;
    }

    if (numOffer <= 0) {
      setErrorMsg('Offer must be > 0 BOT');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);

      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'createOffer',
        args: [
          nft.contractAddress as `0x${string}`,
          BigInt(nft.tokenId),
          BigInt(duration),
        ],
        value: parseEther(numOffer.toString()),
      });

      setTxHash(hash);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Offer error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Transaction could not be completed.');
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
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Make Escrow Offer</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Funds are escrowed directly in the Botchain smart contract.
              </p>
            </div>

            <div className="space-y-1.5 font-mono">
              <label className="text-xs text-slate-400">Offer Amount (BOT)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#090a0f] border border-[#232738] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-400 font-bold">
                  BOT
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                Wallet Balance: <strong className="text-slate-200">{userBalance.toFixed(3)} BOT</strong>
              </div>
            </div>

            <div className="space-y-1.5 font-mono">
              <label className="text-xs text-slate-400">Expiration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-[#090a0f] border border-[#232738] rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="3600">1 Hour</option>
                <option value="86400">24 Hours</option>
                <option value="259200">3 Days</option>
                <option value="604800">7 Days</option>
              </select>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleOffer}
              disabled={isProcessing || numOffer <= 0}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Escrowing on Botchain...</span>
                </>
              ) : (
                <span>Submit Offer ({numOffer} BOT)</span>
              )}
            </button>
          </>
        ) : (
          <div className="py-6 text-center space-y-4 font-mono">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">Offer Escrowed</h3>
              <p className="text-xs text-slate-400 mt-1">Your offer is now live on {networkName}.</p>
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
