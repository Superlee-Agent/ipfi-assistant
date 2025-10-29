import { getIPAsset } from "./ipAsset";

export type License = {
  id: string;
  assetId: string;
  licensee: string;
  terms: string;
  createdAt: number;
};

const licenses = new Map<string, License[]>();

export function addLicense(
  assetId: string,
  licensee: string,
  terms: string,
): License {
  if (!getIPAsset(assetId)) throw new Error("IP Asset tidak ditemukan");
  const l: License = {
    id: `lic_${Math.random().toString(36).slice(2, 10)}`,
    assetId,
    licensee,
    terms,
    createdAt: Date.now(),
  };
  const arr = licenses.get(assetId) ?? [];
  arr.push(l);
  licenses.set(assetId, arr);
  return l;
}

export function getLicenses(assetId: string): License[] {
  return licenses.get(assetId) ?? [];
}
