export type IPAsset = {
  id: string;
  name: string;
  owner: string;
  createdAt: number;
};

const assets = new Map<string, IPAsset>();

export function registerIPAsset(name: string, owner: string): IPAsset {
  if (!name || !owner) throw new Error("Name dan owner wajib diisi");
  const id = `ip_${cryptoRandom(8)}`;
  const asset: IPAsset = { id, name, owner, createdAt: Date.now() };
  assets.set(id, asset);
  return asset;
}

export function getIPAsset(id: string): IPAsset | null {
  return assets.get(id) ?? null;
}

function cryptoRandom(len: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
