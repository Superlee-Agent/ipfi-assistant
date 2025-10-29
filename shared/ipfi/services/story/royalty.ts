import { getIPAsset } from "./ipAsset";

export type RoyaltyRecord = {
  id: string;
  assetId: string;
  amount: string;
  timestamp: number;
};

const royalties = new Map<string, RoyaltyRecord[]>();

export function distributeRoyalty(
  assetId: string,
  amount: string,
): RoyaltyRecord {
  if (!getIPAsset(assetId)) throw new Error("IP Asset tidak ditemukan");
  if (!/^\d*(?:\.\d+)?$/.test(amount)) throw new Error("Jumlah tidak valid");
  const rec: RoyaltyRecord = {
    id: `roy_${Math.random().toString(36).slice(2, 10)}`,
    assetId,
    amount,
    timestamp: Date.now(),
  };
  const arr = royalties.get(assetId) ?? [];
  arr.push(rec);
  royalties.set(assetId, arr);
  return rec;
}

export function getRoyaltyHistory(assetId: string): RoyaltyRecord[] {
  return royalties.get(assetId) ?? [];
}
