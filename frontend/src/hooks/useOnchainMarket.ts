'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchOnchainCollection, OnchainNFT } from '../services/onchain';
import { GENESIS_NFT_ADDRESS } from '../config/contracts';

export function useOnchainMarket(contractAddress: string = GENESIS_NFT_ADDRESS) {
  const [collectionInfo, setCollectionInfo] = useState<{
    name: string;
    symbol: string;
    totalSupply: number;
  }>({
    name: 'OpenWorld Genesis',
    symbol: 'OWG',
    totalSupply: 0,
  });

  const [items, setItems] = useState<OnchainNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchOnchainCollection(contractAddress);
      setCollectionInfo({
        name: res.name,
        symbol: res.symbol,
        totalSupply: res.totalSupply,
      });
      setItems(res.items);
    } catch (err: any) {
      console.error('Failed to load onchain market data:', err);
      setError(err?.message || 'Failed to sync with Botchain Mainnet');
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    collectionInfo,
    items,
    isLoading,
    error,
    refresh: loadData,
  };
}
