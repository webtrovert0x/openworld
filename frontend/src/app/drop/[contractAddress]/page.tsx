'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { formatEther } from 'viem';
import { 
  Sparkles, 
  Clock, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { botchainMainnet } from '../../../config/chains';

const DROP_COLLECTION_ABI = [
  { "inputs": [], "name": "mintPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "startTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "endTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "maxSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "nextTokenId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "dropURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "payable", "type": "function" }
];

export default function DropMintPage() {
  const params = useParams();
  const contractAddress = params.contractAddress as `0x${string}`;

  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  const [metadata, setMetadata] = useState<any>(null);
  const [isFetchingMeta, setIsFetchingMeta] = useState(true);
  const [mintAmount, setMintAmount] = useState<number>(1);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Read Contract Data
  const { data: mintPriceData } = useReadContract({
    address: contractAddress,
    abi: DROP_COLLECTION_ABI,
    functionName: 'mintPrice',
  });
  
  const { data: startTimeData } = useReadContract({
    address: contractAddress,
    abi: DROP_COLLECTION_ABI,
    functionName: 'startTime',
  });

  const { data: endTimeData } = useReadContract({
    address: contractAddress,
    abi: DROP_COLLECTION_ABI,
    functionName: 'endTime',
  });

  const { data: maxSupplyData } = useReadContract({
    address: contractAddress,
    abi: DROP_COLLECTION_ABI,
    functionName: 'maxSupply',
  });

  const { data: nextTokenIdData } = useReadContract({
    address: contractAddress,
    abi: DROP_COLLECTION_ABI,
    functionName: 'nextTokenId',
  });

  const { data: dropURIData } = useReadContract({
    address: contractAddress,
    abi: DROP_COLLECTION_ABI,
    functionName: 'dropURI',
  });

  const { writeContractAsync } = useWriteContract();

  // Variables
  const mintPriceWei = typeof mintPriceData === 'bigint' ? mintPriceData : BigInt(0);
  const startTime = typeof startTimeData === 'bigint' ? Number(startTimeData) : 0;
  const endTime = typeof endTimeData === 'bigint' ? Number(endTimeData) : 0;
  const maxSupply = typeof maxSupplyData === 'bigint' ? Number(maxSupplyData) : 0;
  const mintedSupply = typeof nextTokenIdData === 'bigint' ? Number(nextTokenIdData) - 1 : 0;
  const dropURI = typeof dropURIData === 'string' ? dropURIData : '';

  const now = Math.floor(Date.now() / 1000);
  const isStarted = startTime > 0 && now >= startTime;
  const isEnded = endTime > 0 && now > endTime;
  const isSoldOut = maxSupply > 0 && mintedSupply >= maxSupply;

  useEffect(() => {
    async function fetchMetadata() {
      if (!dropURI) return;
      try {
        setIsFetchingMeta(true);
        const ipfsHash = dropURI.replace('ipfs://', '');
        const res = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
        const data = await res.json();
        setMetadata(data);
      } catch (err) {
        console.error("Failed to fetch metadata", err);
      } finally {
        setIsFetchingMeta(false);
      }
    }
    fetchMetadata();
  }, [dropURI]);

  const handleMint = async () => {
    if (!isConnected) {
      open();
      return;
    }
    try {
      setIsMinting(true);
      setErrorMsg(null);
      const totalCost = mintPriceWei * BigInt(mintAmount);

      const hash = await writeContractAsync({
        address: contractAddress,
        abi: DROP_COLLECTION_ABI,
        functionName: 'mint',
        args: [BigInt(mintAmount)],
        value: totalCost,
        chainId: botchainMainnet.id,
      });

      setTxHash(hash);
      setMintSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.shortMessage || err?.message || 'Transaction failed');
    } finally {
      setIsMinting(false);
    }
  };

  const getStatusBadge = () => {
    if (isSoldOut) return <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-bold uppercase">Sold Out</span>;
    if (isEnded) return <span className="px-3 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full text-xs font-bold uppercase">Ended</span>;
    if (!isStarted) return <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold uppercase">Starts Soon</span>;
    return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Now</span>;
  };

  const imageUrl = metadata?.image?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') || '';

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        
        {/* Left: Artwork Presentation */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative aspect-square rounded-[30px] bg-[#090a0f] overflow-hidden border border-[#232738] shadow-2xl flex items-center justify-center">
            {isFetchingMeta ? (
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            ) : imageUrl ? (
              <img src={imageUrl} alt={metadata?.name || 'Artwork'} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
            ) : (
              <div className="text-slate-500 font-mono text-xs uppercase">No Artwork Found</div>
            )}
          </div>
        </div>

        {/* Right: Minting Details */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-[#181b28] px-3 py-1 rounded-full border border-[#232738]">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Verified Contract
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {metadata?.name || 'Loading Drop...'}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
              {metadata?.description || 'Loading description...'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 bg-[#090a0f] border border-[#232738] rounded-2xl">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Price</span>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                {mintPriceWei === BigInt(0) ? 'Free' : formatEther(mintPriceWei)} 
                <span className="text-sm font-medium text-slate-400">BOT</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Minted</span>
              <div className="text-2xl font-bold text-white">
                {mintedSupply} <span className="text-sm font-medium text-slate-400">/ {maxSupply}</span>
              </div>
            </div>
          </div>

          {!mintSuccess ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#232738] rounded-xl bg-[#090a0f] p-1">
                  <button 
                    onClick={() => setMintAmount(Math.max(1, mintAmount - 1))}
                    className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#181b28] rounded-lg transition-colors text-lg font-mono"
                  >
                    -
                  </button>
                  <div className="w-16 text-center text-white font-bold font-mono text-lg">{mintAmount}</div>
                  <button 
                    onClick={() => setMintAmount(Math.min(maxSupply - mintedSupply, mintAmount + 1))}
                    className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#181b28] rounded-lg transition-colors text-lg font-mono"
                  >
                    +
                  </button>
                </div>
                
                {!isConnected ? (
                  <button
                    onClick={() => open()}
                    className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <button
                    onClick={handleMint}
                    disabled={isMinting || isSoldOut || isEnded || !isStarted}
                    className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isMinting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Mint {mintAmount > 1 ? `${mintAmount} NFTs` : 'NFT'}
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Mint Successful!</h3>
              <p className="text-sm text-emerald-100/70">
                You just collected {mintAmount} {mintAmount > 1 ? 'editions' : 'edition'} of this drop.
              </p>
              {txHash && (
                <a 
                  href={`https://scan.botchain.ai/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-wider"
                >
                  View Transaction <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Activity / Stats footer */}
          <div className="pt-8 border-t border-[#232738] flex items-center justify-between text-slate-500 text-xs font-mono">
            <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Live on Botchain</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Real-time sync</span>
          </div>
        </div>

      </div>
    </div>
  );
}
