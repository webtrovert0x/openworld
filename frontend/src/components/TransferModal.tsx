'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { isAddress } from 'viem';
import { X, Send, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { OnchainNFT } from '../services/onchain';
import { NFT_ABI } from '../config/contracts';
import deployed from '../config/deployedContracts.json';

interface TransferModalProps {
  nft: OnchainNFT | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TransferModal({ nft, isOpen, onClose, onSuccess }: TransferModalProps) {
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const isMainnet = deployed?.chainId === 677;
  const networkName = isMainnet ? 'Botchain Mainnet' : 'Botchain Testnet';
  const explorerUrl = deployed?.explorerUrl || (isMainnet ? 'https://scan.botchain.ai' : 'https://scan.bohr.life');
  const explorerName = isMainnet ? 'BotchainScan' : 'BohrScan';

  if (!isOpen || !nft) return null;

  const handleTransfer = async () => {
    if (!isConnected || !address) {
      setErrorMsg('Wallet not connected');
      return;
    }

    const cleanRecipient = recipient.trim();
    if (!isAddress(cleanRecipient)) {
      setErrorMsg(`Please enter a valid ${networkName} wallet address (0x...)`);
      return;
    }

    if (cleanRecipient.toLowerCase() === address.toLowerCase()) {
      setErrorMsg('Recipient cannot be your own address');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);

      const hash = await writeContractAsync({
        address: nft.contractAddress as `0x${string}`,
        abi: [
          {
            "inputs": [
              { "internalType": "address", "name": "from", "type": "address" },
              { "internalType": "address", "name": "to", "type": "address" },
              { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'safeTransferFrom',
        args: [
          address,
          cleanRecipient as `0x${string}`,
          BigInt(nft.tokenId),
        ],
      });

      setTxHash(hash);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Transfer error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Transfer transaction failed.');
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
                <Send className="w-4 h-4 text-indigo-400" />
                <span>Transfer NFT</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Direct on-chain safe transfer on {networkName}.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#141724] border border-[#232738] rounded-xl">
              <img src={nft.image} alt={nft.name} className="w-14 h-14 rounded-lg object-cover bg-black" />
              <div className="min-w-0 flex-1 font-mono">
                <div className="text-xs font-bold text-white truncate">{nft.name}</div>
                <div className="text-[11px] text-slate-400">Token ID #{nft.tokenId}</div>
              </div>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-slate-400 uppercase font-bold text-[10px]">
                Recipient Address (0x...) *
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#090a0f] border border-[#232738] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 block">
                Make sure the recipient is an EVM address on {networkName}.
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleTransfer}
              disabled={isProcessing || !recipient.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transferring on Botchain...</span>
                </>
              ) : (
                <span>Confirm On-Chain Transfer</span>
              )}
            </button>
          </>
        ) : (
          <div className="py-6 text-center space-y-4 font-mono">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">Transfer Completed</h3>
              <p className="text-xs text-slate-400 mt-1">
                Token #{nft.tokenId} transferred to <strong className="text-white">{recipient.slice(0, 8)}...</strong>
              </p>
            </div>
            {txHash && (
              <a
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
              >
                <span>View on {explorerName}</span>
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
