import { Chain, getChain, findToken, TOKENS } from "./config";

export type SwapIntent = {
  chain: Chain["key"];
  sellToken: string; // symbol or address
  buyToken: string; // symbol or address
  amount: string; // decimal string in human units
  side: "sell" | "buy"; // default sell amount
};

const chainKeywords: Record<string, Chain["key"]> = {
  eth: "ethereum",
  ethereum: "ethereum",
  mainnet: "ethereum",
  polygon: "polygon",
  matic: "polygon",
  arbitrum: "arbitrum",
  optimism: "optimism",
  op: "optimism",
  base: "base",
  bsc: "bnb",
  bnb: "bnb",
};

export function detectChain(
  input: string,
  fallback: Chain["key"] = "base",
): Chain["key"] {
  const lower = input.toLowerCase();
  for (const [k, v] of Object.entries(chainKeywords)) {
    if (lower.includes(k)) return v;
  }
  return fallback;
}

export function normalizeTokenSymbol(
  chain: Chain["key"],
  token: string,
): string | undefined {
  const cleaned = token.replace(/[^a-zA-Z0-9]/g, "");
  const known = findToken(chain, cleaned.toUpperCase());
  if (known) return known.symbol;
  if (/^0x[a-fA-F0-9]{40}$/.test(token)) return token; // address
  return undefined;
}

export function parseAmount(s: string): string | null {
  const m = s.match(/\d*[\.,]?\d+/);
  return m ? m[0].replace(",", ".") : null;
}

export function parseSwapPrompt(prompt: string): SwapIntent | null {
  const chain = detectChain(prompt, "base");
  // Heuristics: "swap 100 usdc to eth", "buy 0.1 eth with usdc"
  const lower = prompt.toLowerCase();
  const isBuySide = /(buy|dapatkan|mau.*terima)/.test(lower);

  const amount = parseAmount(prompt);
  const tokens = TOKENS.filter((t) => t.chain === chain).map((t) =>
    t.symbol.toLowerCase(),
  );
  const symbols = Array.from(new Set(tokens));

  const foundSymbols: string[] = [];
  for (const sym of symbols) {
    const re = new RegExp(`(^|[^a-zA-Z])${sym}([^a-zA-Z]|$)`, "i");
    if (re.test(prompt)) foundSymbols.push(sym.toUpperCase());
  }

  let sellToken: string | undefined;
  let buyToken: string | undefined;

  if (foundSymbols.length >= 2) {
    // Prefer order around "to" or "ke"
    const toIdx = Math.min(
      ...[lower.indexOf(" to "), lower.indexOf(" ke ")].filter((i) => i >= 0),
    );
    if (toIdx >= 0) {
      // token before -> sell, after -> buy
      const before = foundSymbols.find(
        (s) => lower.indexOf(s.toLowerCase()) < toIdx,
      );
      const after = foundSymbols.find(
        (s) => lower.indexOf(s.toLowerCase()) > toIdx,
      );
      sellToken = before;
      buyToken = after;
    } else {
      sellToken = foundSymbols[0];
      buyToken = foundSymbols[1];
    }
  }

  // Handle patterns: "buy X ETH with USDC"
  if (isBuySide && foundSymbols.length >= 2) {
    buyToken = foundSymbols[0];
    sellToken = foundSymbols[1];
  }

  if (!sellToken || !buyToken || !amount) return null;

  return {
    chain,
    sellToken,
    buyToken,
    amount,
    side: isBuySide ? "buy" : "sell",
  };
}

export function toBaseUnits(amount: string, decimals: number): string {
  const [int, frac = ""] = amount.split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  return BigInt(int + fracPadded).toString();
}

export function fromBaseUnits(amount: string, decimals: number): string {
  const raw = amount.replace(/^0+/, "");
  if (raw.length <= decimals) {
    const padded = raw.padStart(decimals, "0");
    return `0.${padded}`.replace(/\.?0+$/, "");
  }
  const int = raw.slice(0, raw.length - decimals);
  const frac = raw.slice(raw.length - decimals).replace(/0+$/, "");
  return frac ? `${int}.${frac}` : int;
}

export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}
