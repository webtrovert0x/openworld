import { createPublicClient, http, formatEther } from 'viem';
import { botchainTestnet } from '../config/chains';
import { GENESIS_NFT_ADDRESS, MARKETPLACE_ADDRESS, NFT_ABI, MARKETPLACE_ABI } from '../config/contracts';

export interface OnchainNFT {
  id: string;
  tokenId: number;
  contractAddress: string;
  name: string;
  description: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
  owner: string;
  isListed: boolean;
  price: number; // in BOT
  priceWei: string;
  seller: string;
  listedAt: number;
  rawUri: string;
}

export const publicClient = createPublicClient({
  chain: botchainTestnet,
  transport: http('https://rpc.bohr.life'),
});

function resolveIpfsUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return url;
}

/**
 * Fetch real on-chain NFTs from an ERC721 contract on Botchain Testnet
 */
export async function fetchOnchainCollection(contractAddress: string = GENESIS_NFT_ADDRESS): Promise<{
  name: string;
  symbol: string;
  totalSupply: number;
  items: OnchainNFT[];
}> {
  try {
    const targetAddr = contractAddress as `0x${string}`;

    // 1. Fetch collection name, symbol, total supply directly from contract
    const [name, symbol, totalSupplyBig] = await Promise.all([
      publicClient.readContract({
        address: targetAddr,
        abi: NFT_ABI,
        functionName: 'name',
      }).catch(() => 'OpenWorld Collection'),
      publicClient.readContract({
        address: targetAddr,
        abi: NFT_ABI,
        functionName: 'symbol',
      }).catch(() => 'OW'),
      publicClient.readContract({
        address: targetAddr,
        abi: NFT_ABI,
        functionName: 'totalSupply',
      }).catch(() => BigInt(0)),
    ]);

    const totalSupply = Number(totalSupplyBig);
    if (totalSupply === 0) {
      return { name, symbol, totalSupply: 0, items: [] };
    }

    const items: OnchainNFT[] = [];

    // 2. Query each real token on-chain
    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
      try {
        const [tokenUri, owner, listing] = await Promise.all([
          publicClient.readContract({
            address: targetAddr,
            abi: NFT_ABI,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
          }).catch(() => ''),
          publicClient.readContract({
            address: targetAddr,
            abi: NFT_ABI,
            functionName: 'ownerOf',
            args: [BigInt(tokenId)],
          }).catch(() => '0x0000000000000000000000000000000000000000'),
          publicClient.readContract({
            address: MARKETPLACE_ADDRESS,
            abi: MARKETPLACE_ABI,
            functionName: 'getListing',
            args: [targetAddr, BigInt(tokenId)],
          }).catch(() => null),
        ]);

        let metadata: any = {
          name: `${name} #${tokenId}`,
          description: '',
          image: '',
          attributes: [],
        };

        // Parse tokenURI (base64 or remote URL / IPFS)
        if (tokenUri.startsWith('data:application/json;base64,')) {
          try {
            const jsonStr = atob(tokenUri.replace('data:application/json;base64,', ''));
            metadata = JSON.parse(jsonStr);
          } catch (e) {
            console.error('Failed to decode base64 metadata', e);
          }
        } else if (tokenUri.startsWith('http://') || tokenUri.startsWith('https://') || tokenUri.startsWith('ipfs://')) {
          try {
            const resolvedUri = resolveIpfsUrl(tokenUri);
            const res = await fetch(resolvedUri);
            if (res.ok) {
              metadata = await res.json();
            }
          } catch (e) {
            console.error('Failed to fetch remote metadata', e);
          }
        }

        const isListed = listing ? listing.isActive : false;
        const priceWei = listing ? listing.price.toString() : '0';
        const price = listing ? parseFloat(formatEther(listing.price)) : 0;
        const seller = listing ? listing.seller : owner;
        const listedAt = listing ? Number(listing.listedAt) : 0;

        items.push({
          id: `${targetAddr}-${tokenId}`,
          tokenId,
          contractAddress: targetAddr,
          name: metadata.name || `${name} #${tokenId}`,
          description: metadata.description || '',
          image: resolveIpfsUrl(metadata.image || ''),
          attributes: metadata.attributes || metadata.traits || [],
          owner,
          isListed,
          price,
          priceWei,
          seller,
          listedAt,
          rawUri: tokenUri,
        });
      } catch (err) {
        console.error(`Error loading token #${tokenId}`, err);
      }
    }

    return {
      name,
      symbol,
      totalSupply,
      items,
    };
  } catch (error) {
    console.error('fetchOnchainCollection error:', error);
    return { name: 'OpenWorld Collection', symbol: 'OW', totalSupply: 0, items: [] };
  }
}
