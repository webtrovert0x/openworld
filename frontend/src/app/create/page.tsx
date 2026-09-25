'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccount, useWriteContract, useBalance } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseEther, formatEther } from 'viem';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  Upload, 
  Image as ImageIcon,
  ArrowRight,
  Globe,
  Coins,
  Sparkles,
  Calendar
} from 'lucide-react';
import { botchainMainnet } from '../../config/chains';
import { uploadToPinata, uploadMetadataToPinata } from '../../utils/pinata';

// PLACEHOLDER: We will replace this with the real address once you fund the wallet and deploy.
const DROP_FACTORY_ADDRESS = "0x2Be2B7d615a9DF3974b2837ffE97EBC21028576c";

const DROP_FACTORY_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_symbol", "type": "string" },
      { "internalType": "string", "name": "_dropURI", "type": "string" },
      { "internalType": "uint256", "name": "_mintPrice", "type": "uint256" },
      { "internalType": "uint256", "name": "_startTime", "type": "uint256" },
      { "internalType": "uint256", "name": "_endTime", "type": "uint256" },
      { "internalType": "uint256", "name": "_maxSupply", "type": "uint256" },
      { "internalType": "uint96", "name": "_royaltyFeeBps", "type": "uint96" }
    ],
    "name": "createDrop",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default function CreateDropPage() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  const { data: balanceData } = useBalance({
    address: address,
    chainId: botchainMainnet.id,
  });

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  
  // Media states
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Drop Settings
  const [mintPrice, setMintPrice] = useState<string>('0');
  const [maxSupply, setMaxSupply] = useState<number>(100);
  const [royaltyBps, setRoyaltyBps] = useState('500'); // 5%
  
  // Dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<string>(''); // e.g., 'Uploading Image...', 'Deploying...'
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDeployDrop = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isConnected) {
      open();
      return;
    }

    if (!name.trim() || !symbol.trim()) {
      setErrorMsg('Please specify a collection name and symbol');
      return;
    }

    if (!file) {
      setErrorMsg('Please upload an image file for your drop');
      return;
    }

    if (!startDate) {
      setErrorMsg('Please select a start date');
      return;
    }

    try {
      setIsDeploying(true);
      setErrorMsg(null);

      // 1. Upload Image to Pinata
      setDeployStep('Uploading Image to IPFS (Pinata)...');
      const imageIpfsUri = await uploadToPinata(file);

      // 2. Upload Metadata to Pinata
      setDeployStep('Uploading Metadata to IPFS...');
      const metadataIpfsUri = await uploadMetadataToPinata(name, description, imageIpfsUri);

      // 3. Prepare Contract Arguments
      setDeployStep('Awaiting Wallet Confirmation...');
      
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : 0;
      
      let parsedPrice = BigInt(0);
      try {
        parsedPrice = parseEther(mintPrice || '0');
      } catch (e) {
        setErrorMsg('Invalid mint price format');
        setIsDeploying(false);
        return;
      }

      // 4. Deploy Drop via Factory
      const hash = await writeContractAsync({
        address: DROP_FACTORY_ADDRESS as `0x${string}`,
        abi: DROP_FACTORY_ABI,
        functionName: 'createDrop',
        args: [
          name,
          symbol,
          metadataIpfsUri,
          parsedPrice,
          BigInt(startTimestamp),
          BigInt(endTimestamp),
          BigInt(maxSupply),
          BigInt(royaltyBps)
        ],
        chainId: botchainMainnet.id,
      });

      setTxHash(hash);
      setDeploySuccess(true);
    } catch (err: any) {
      console.error('Deploy error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Transaction could not be broadcast.');
    } finally {
      setIsDeploying(false);
      setDeployStep('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-indigo-400" />
          Deploy Creator Drop
        </h1>
        <p className="text-xs font-mono text-slate-400">
          Launch your own smart contract collection. Set your price, dates, and let others mint.
        </p>
      </div>

      {!deploySuccess ? (
        <form className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Image Upload & Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="panel rounded-2xl p-4 space-y-3 font-mono text-xs">
              <span className="text-slate-400 uppercase font-bold text-[10px]">Drop Artwork</span>
              
              <div className="aspect-square rounded-xl bg-[#090a0f] overflow-hidden border border-[#232738] flex flex-col items-center justify-center relative group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-[11px] text-slate-400">No Image Selected</div>
                    <div className="text-[10px] text-slate-500">High-res images will be pinned to IPFS</div>
                  </div>
                )}
              </div>

              <label className="flex items-center justify-center gap-2 w-full py-3 bg-[#181b28] hover:bg-[#202436] text-slate-200 border border-[#2d3247] rounded-xl cursor-pointer text-xs font-semibold transition-colors">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Select High-Res Artwork</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Right: Drop Settings Form */}
          <div className="lg:col-span-7 space-y-4">
            <div className="panel rounded-2xl p-6 space-y-6 font-mono text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-bold text-[10px]">Collection Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Cyber Punks"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#090a0f] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-bold text-[10px]">Symbol *</label>
                  <input
                    type="text"
                    placeholder="e.g. CPUNK"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-[#090a0f] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase font-bold text-[10px]">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#090a0f] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs resize-none"
                />
              </div>

              {/* Mint Settings */}
              <div className="space-y-4 pt-4 border-t border-[#232738]">
                <h3 className="text-slate-300 font-bold text-xs uppercase flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  Mint Settings
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase font-bold text-[10px]">Mint Price (BOT)</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="0.00"
                      value={mintPrice}
                      onChange={(e) => setMintPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#090a0f] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase font-bold text-[10px]">Max Supply</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="100"
                      value={maxSupply}
                      onChange={(e) => setMaxSupply(parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2.5 bg-[#090a0f] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Date Settings */}
              <div className="space-y-4 pt-4 border-t border-[#232738]">
                <h3 className="text-slate-300 font-bold text-xs uppercase flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Drop Schedule
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase font-bold text-[10px]">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#090a0f] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase font-bold text-[10px]">End Date (Optional)</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#090a0f] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit */}
              <div className="pt-4">
                {!isConnected ? (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono font-bold text-xs transition-colors cursor-pointer"
                  >
                    Connect Wallet to Deploy Drop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDeployDrop}
                    disabled={isDeploying}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{deployStep}</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Deploy Drop Smart Contract</span>
                      </span>
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>
        </form>
      ) : (
        /* Success Screen */
        <div className="panel rounded-2xl p-8 text-center space-y-5 font-mono max-w-lg mx-auto">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Drop Deployed!</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your custom smart contract for <strong className="text-white">{name}</strong> is live. 
            Buyers can now mint it starting at the scheduled time!
          </p>

          {txHash && (
            <div className="p-3 bg-[#090a0f] border border-[#232738] rounded-xl text-xs flex justify-between items-center">
              <span className="text-slate-400 truncate max-w-[240px]">TX: {txHash}</span>
              <a
                href={`https://scan.botchain.ai/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>BotchainScan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Link
              href="/"
              className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <span>View Drop Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => {
                setDeploySuccess(false);
                setName('');
                setSymbol('');
                setDescription('');
                setFile(null);
                setImagePreview(null);
              }}
              className="py-3 bg-[#181b28] hover:bg-[#202436] text-white rounded-xl border border-[#2d3247] text-xs font-semibold"
            >
              Deploy Another Drop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
