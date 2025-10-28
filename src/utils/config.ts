export type Chain = {
  id: number;
  key: "ethereum" | "polygon" | "arbitrum" | "optimism" | "base" | "bnb";
  name: string;
  rpcUrls: string[];
  nativeSymbol: string;
  zeroExBaseUrl: string; // 0x Swap API base for this chain
};

export const CHAINS: Record<Chain["key"], Chain> = {
  ethereum: {
    id: 1,
    key: "ethereum",
    name: "Ethereum",
    rpcUrls: ["https://rpc.ankr.com/eth"],
    nativeSymbol: "ETH",
    zeroExBaseUrl: "https://api.0x.org",
  },
  polygon: {
    id: 137,
    key: "polygon",
    name: "Polygon",
    rpcUrls: ["https://polygon-rpc.com"],
    nativeSymbol: "MATIC",
    zeroExBaseUrl: "https://polygon.api.0x.org",
  },
  arbitrum: {
    id: 42161,
    key: "arbitrum",
    name: "Arbitrum",
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    nativeSymbol: "ETH",
    zeroExBaseUrl: "https://arbitrum.api.0x.org",
  },
  optimism: {
    id: 10,
    key: "optimism",
    name: "Optimism",
    rpcUrls: ["https://mainnet.optimism.io"],
    nativeSymbol: "ETH",
    zeroExBaseUrl: "https://optimism.api.0x.org",
  },
  base: {
    id: 8453,
    key: "base",
    name: "Base",
    rpcUrls: ["https://mainnet.base.org"],
    nativeSymbol: "ETH",
    zeroExBaseUrl: "https://base.api.0x.org",
  },
  bnb: {
    id: 56,
    key: "bnb",
    name: "BNB Chain",
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    nativeSymbol: "BNB",
    zeroExBaseUrl: "https://bsc.api.0x.org",
  },
};

export type Token = {
  symbol: string;
  name: string;
  decimals: number;
  address: string; // 0x address on chain
  chain: Chain["key"];
};

// Curated common tokens per chain. Extend as needed.
export const TOKENS: Token[] = [
  // Ethereum
  {
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // 0x native token convention
    chain: "ethereum",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    chain: "ethereum",
  },
  // Base
  {
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    chain: "base",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0x833589fCD6EDb6E08f4c7C32D4f71b54bdA02913",
    chain: "base",
  },
  // Polygon
  {
    symbol: "MATIC",
    name: "MATIC",
    decimals: 18,
    address: "0x0000000000000000000000000000000000001010",
    chain: "polygon",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    chain: "polygon",
  },
  // Arbitrum
  {
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    chain: "arbitrum",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    chain: "arbitrum",
  },
  // Optimism
  {
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    chain: "optimism",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    chain: "optimism",
  },
  // BNB
  {
    symbol: "BNB",
    name: "Binance Coin",
    decimals: 18,
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    chain: "bnb",
  },
  {
    symbol: "USDT",
    name: "Tether",
    decimals: 18,
    address: "0x55d398326f99059fF775485246999027B3197955",
    chain: "bnb",
  },
];

export const getChain = (key: Chain["key"]): Chain => CHAINS[key];

export const findToken = (chain: Chain["key"], symbol: string): Token | undefined =>
  TOKENS.find(
    (t) => t.chain === chain && t.symbol.toLowerCase() === symbol.toLowerCase()
  );

export const nativeTokenAddress =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
