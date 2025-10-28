import { CHAINS, Chain, findToken, nativeTokenAddress } from "../../utils/config";
import { toBaseUnits } from "../../utils/helpers";

export type ZeroExQuote = {
  price: string;
  guaranteedPrice: string;
  to: string;
  data: string;
  value: string;
  gas: string;
  estimatedGas: string;
  gasPrice: string;
  protocolFee: string;
  buyTokenAddress: string;
  sellTokenAddress: string;
  buyAmount: string;
  sellAmount: string;
  sources: { name: string; proportion: string }[];
  allowanceTarget?: string;
  minOutput?: string;
};

export type GetQuoteParams = {
  chain: Chain["key"];
  sellToken: string; // symbol or address
  buyToken: string; // symbol or address
  amount: string; // human-readable
  taker?: string; // wallet address for gas estimations
  side?: "sell" | "buy"; // amount refers to sell or buy side
};

function tokenToAddress(chain: Chain["key"], token: string): { address: string; decimals: number } {
  if (/^0x[a-fA-F0-9]{40}$/.test(token)) {
    // Address provided; assume 18 decimals by default (most ERC-20) and 18 for native placeholder address
    return { address: token, decimals: 18 };
  }
  const known = findToken(chain, token);
  if (!known) throw new Error(`Unknown token ${token} on ${chain}`);
  return { address: known.address, decimals: known.decimals };
}

export async function getQuote(params: GetQuoteParams): Promise<ZeroExQuote> {
  const { chain, sellToken, buyToken, amount, taker, side = "sell" } = params;
  const base = CHAINS[chain].zeroExBaseUrl;

  const sell = tokenToAddress(chain, sellToken);
  const buy = tokenToAddress(chain, buyToken);

  const query = new URLSearchParams();
  query.set("sellToken", sell.address);
  query.set("buyToken", buy.address);

  if (side === "sell") {
    query.set("sellAmount", toBaseUnits(amount, sell.decimals));
  } else {
    query.set("buyAmount", toBaseUnits(amount, buy.decimals));
  }
  if (taker) query.set("takerAddress", taker);

  const url = (typeof window === "undefined")
    ? `${base}/swap/v1/quote?${query.toString()}`
    : `/api/swap/quote?chain=${encodeURIComponent(chain)}&${query.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`0x quote error (${res.status}): ${text}`);
  }
  const json = (await res.json()) as ZeroExQuote;
  return json;
}
