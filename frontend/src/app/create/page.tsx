'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccount, useWriteContract } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
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
  Lock,
  Globe
} from 'lucide-react';
import { GENESIS_NFT_ADDRESS, NFT_ABI } from '../../config/contracts';
import deployed from '../../config/deployedContracts.json';

interface TraitInput {
  trait_type: string;
  value: string;
}

export default function CreateNFTPage() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [unlockableContent, setUnlockableContent] = useState('');
  const [hasUnlockable, setHasUnlockable] = useState(false);
  const [supply, setSupply] = useState<number>(1);
  const [royaltyBps, setRoyaltyBps] = useState('500'); // 5%
  const [traits, setTraits] = useState<TraitInput[]>([
    { trait_type: '', value: '' },
  ]);

  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [mintedCount, setMintedCount] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setImageUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTrait = () => {
    setTraits([...traits, { trait_type: '', value: '' }]);
  };

  const removeTrait = (idx: number) => {
    setTraits(traits.filter((_, i) => i !== idx));
  };

  const updateTrait = (idx: number, field: 'trait_type' | 'value', val: string) => {
    const updated = [...traits];
    updated[idx][field] = val;
    setTraits(updated);
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      open();
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Please specify a token name');
      return;
    }

    if (!imageUrl.trim()) {
      setErrorMsg('Please upload an image file or provide an image URL');
      return;
    }

    const mintSupply = Math.max(1, Number(supply) || 1);

    try {
      setIsMinting(true);
      setErrorMsg(null);

      const metadata = {
        name,
        description,
        image: imageUrl,
        external_url: externalUrl.trim() || undefined,
        unlockable_content: hasUnlockable && unlockableContent.trim() ? unlockableContent.trim() : undefined,
        attributes: traits.filter((t) => t.trait_type && t.value),
      };

      const metadataUri = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

      let hash: `0x${string}`;

      if (mintSupply === 1) {
        hash = await writeContractAsync({
          address: GENESIS_NFT_ADDRESS,
          abi: NFT_ABI,
          functionName: 'mint',
          args: [metadataUri, BigInt(royaltyBps)],
        });
      } else {
        const uris = Array(mintSupply).fill(metadataUri);
        hash = await writeContractAsync({
          address: GENESIS_NFT_ADDRESS,
          abi: NFT_ABI,
          functionName: 'batchMint',
          args: [uris, BigInt(royaltyBps)],
        });
      }

      setTxHash(hash);
      setMintedCount(mintSupply);
      setMintSuccess(true);
    } catch (err: any) {
      console.error('Mint error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Transaction could not be broadcast.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white">
          Mint On-Chain NFT
        </h1>
        <p className="text-xs font-mono text-slate-400">
          Deploy an ERC-721 token directly to {deployed?.chainId === 677 ? 'Botchain Mainnet' : 'Botchain Testnet'} contract <strong className="text-slate-300">{GENESIS_NFT_ADDRESS}</strong>.
        </p>
      </div>

      {!mintSuccess ? (
        <form onSubmit={handleMint} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Image Upload & Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="panel rounded-2xl p-4 space-y-3 font-mono text-xs">
              <span className="text-slate-400 uppercase font-bold text-[10px]">Media Asset</span>
              
              <div className="aspect-square rounded-xl bg-black overflow-hidden border border-[#232738] flex flex-col items-center justify-center relative group">
                {imagePreview || imageUrl ? (
                  <img
                    src={imagePreview || imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-xs text-slate-400">No Image Selected</div>
                    <div className="text-[10px] text-slate-400">Upload a PNG, JPG, WEBP, or SVG file</div>
                  </div>
                )}
              </div>

              {/* Upload Input */}
              <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#181b28] hover:bg-[#202436] text-slate-200 border border-[#2d3247] rounded-xl cursor-pointer text-xs font-semibold transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* URL fallback */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] uppercase text-slate-400">Or Paste Image URL / IPFS:</span>
                <input
                  type="text"
                  placeholder="https://... or ipfs://..."
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  className="w-full px-3 py-1.5 bg-[#090a0f] border border-[#232738] rounded-lg text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Right: Metadata Form */}
          <div className="lg:col-span-7 space-y-4">
            <div className="panel rounded-2xl p-6 space-y-4 font-mono text-xs">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-slate-400 uppercase font-bold text-[10px]">Token Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Botchain Genesis #003"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#090a0f] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-400 uppercase font-bold text-[10px]">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your on-chain NFT..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#090a0f] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs resize-none"
                />
              </div>

              {/* External Link (OpenSea parity) */}
              <div className="space-y-1">
                <label className="text-slate-400 uppercase font-bold text-[10px] flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>External Link (Website / Project URL)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://yoursite.io"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#090a0f] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              {/* Unlockable Content Toggle (OpenSea parity) */}
              <div className="space-y-2 p-3 bg-[#141724] border border-[#232738] rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="font-bold text-white text-[11px]">Unlockable Content</div>
                      <div className="text-[10px] text-slate-400">Include secret content only the owner can reveal</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasUnlockable}
                    onChange={(e) => setHasUnlockable(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
                {hasUnlockable && (
                  <textarea
                    rows={2}
                    placeholder="Enter redeemable key, passcode, or secret link..."
                    value={unlockableContent}
                    onChange={(e) => setUnlockableContent(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090a0f] border border-[#232738] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500 mt-2 resize-none"
                  />
                )}
              </div>

              {/* Supply & Royalty in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Supply */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-400 uppercase font-bold text-[10px]">
                      Supply
                    </label>
                    <span className="text-[10px] text-indigo-400 font-semibold">
                      {supply > 1 ? `${supply.toLocaleString()} items` : '1 of 1'}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={supply}
                    onChange={(e) => setSupply(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2 bg-[#090a0f] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-400">
                    The number of items that can be minted.
                  </span>
                </div>

                {/* Royalty */}
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-bold text-[10px]">
                    Royalty (EIP-2981)
                  </label>
                  <select
                    value={royaltyBps}
                    onChange={(e) => setRoyaltyBps(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#090a0f] border border-[#232738] rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  >
                    <option value="0">0%</option>
                    <option value="250">2.5%</option>
                    <option value="500">5.0%</option>
                    <option value="750">7.5%</option>
                    <option value="1000">10.0%</option>
                  </select>
                  <span className="text-[10px] text-slate-400">
                    Creator fee on secondary sales
                  </span>
                </div>
              </div>

              {/* Traits */}
              <div className="space-y-2 pt-2 border-t border-[#232738]">
                <div className="flex justify-between items-center">
                  <label className="text-slate-400 uppercase font-bold text-[10px]">Attributes / Traits</label>
                  <button
                    type="button"
                    onClick={addTrait}
                    className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Trait</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {traits.map((trait, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Trait Type"
                        value={trait.trait_type}
                        onChange={(e) => updateTrait(idx, 'trait_type', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[#090a0f] border border-[#232738] rounded-lg text-white font-mono text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={trait.value}
                        onChange={(e) => updateTrait(idx, 'value', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[#090a0f] border border-[#232738] rounded-lg text-white font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeTrait(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">{errorMsg}</span>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                {!isConnected ? (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono font-bold text-xs transition-colors"
                  >
                    Connect Wallet to Mint
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isMinting}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Broadcasting {supply > 1 ? `${supply} Tokens` : 'Token'} to Botchain...</span>
                      </>
                    ) : (
                      <span>Mint {supply > 1 ? `${supply} Copies` : 'Token'} on Botchain</span>
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>

        </form>
      ) : (
        <div className="panel rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4 font-mono">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Mint Confirmed</h2>
          <p className="text-xs text-slate-400">
            Successfully minted <strong className="text-white">{mintedCount} {mintedCount > 1 ? 'copies' : 'copy'} of {name}</strong> on {deployed?.chainId === 677 ? 'Botchain Mainnet' : 'Botchain Testnet'}.
          </p>

          {txHash && (
            <div className="p-3 bg-[#090a0f] border border-[#232738] rounded-xl text-xs flex justify-between items-center">
              <span className="text-slate-400 truncate max-w-[240px]">TX: {txHash}</span>
              <a
                href={`${deployed?.explorerUrl || 'https://scan.botchain.ai'}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>{deployed?.chainId === 677 ? 'BotchainScan' : 'BohrScan'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                setMintSuccess(false);
                setName('');
                setDescription('');
                setImageUrl('');
                setImagePreview(null);
                setExternalUrl('');
                setUnlockableContent('');
                setHasUnlockable(false);
                setSupply(1);
              }}
              className="py-2.5 bg-[#181b28] hover:bg-[#202436] text-white rounded-xl text-xs font-semibold"
            >
              Mint Another
            </button>
            <Link
              href="/"
              className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
            >
              <span>View Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
