export interface IIPAsset {
  id: string;
  name: string;
  owner: string;
  createdAt: number;
}

export interface ILicense {
  id: string;
  assetId: string;
  licensee: string;
  terms: string;
  createdAt: number;
}

export interface IRoyaltyRecord {
  id: string;
  assetId: string;
  amount: string;
  timestamp: number;
}
