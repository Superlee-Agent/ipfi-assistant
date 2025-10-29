import {
  registerIPAsset,
  getLicenses,
  distributeRoyalty,
} from "../services/story";

export type IPAction =
  | { type: "register"; name: string; owner: string }
  | { type: "licenses"; assetId: string }
  | { type: "royalty"; assetId: string; amount: string };

export async function ipAgent(action: IPAction) {
  switch (action.type) {
    case "register":
      return registerIPAsset(action.name, action.owner);
    case "licenses":
      return getLicenses(action.assetId);
    case "royalty":
      return distributeRoyalty(action.assetId, action.amount);
  }
}
