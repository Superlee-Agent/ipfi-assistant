import { ethers } from "ethers";

export type QuoteExactInputSingleParams = {
  tokenIn: string;
  tokenOut: string;
  fee: number; // 100, 500, 3000, 10000
  amountIn: bigint; // raw, in tokenIn decimals
  sqrtPriceLimitX96?: bigint; // default 0
};

export type QuoteResult = {
  amountOut: bigint;
  sqrtPriceX96After: bigint;
  initializedTicksCrossed: number;
  gasEstimate: bigint | null;
};

// PiperX / Aeneid contracts on Story chain (testnet/mainnet share same interface)
export const AENEID_V3_QUOTER = process.env.AENEID_V3_QUOTER ?? "0x8812d810EA7CC4e1c3FB45cef19D6a7ECBf2D85D";

const QUOTER_ABI = [
  "function quoteExactInputSingle((address tokenIn,address tokenOut,uint24 fee,uint256 amountIn,uint160 sqrtPriceLimitX96)) returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed)"
];

export async function quoteExactInputSingle(params: QuoteExactInputSingleParams, rpcUrl?: string): Promise<QuoteResult> {
  const providerUrl = rpcUrl ?? process.env.STORY_RPC;
  if (!providerUrl) throw new Error("Missing STORY_RPC env var for Story testnet RPC URL");
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const quoter = new ethers.Contract(AENEID_V3_QUOTER, QUOTER_ABI, provider);
  const tuple = {
    tokenIn: params.tokenIn,
    tokenOut: params.tokenOut,
    fee: params.fee,
    amountIn: params.amountIn,
    sqrtPriceLimitX96: params.sqrtPriceLimitX96 ?? 0n,
  } as const;
  const [amountOut, sqrtPriceX96After, initializedTicksCrossed] = await quoter.quoteExactInputSingle(tuple);

  // Best effort gas estimate by simulating a call to the quoter (not always available)
  let gas: bigint | null = null;
  try {
    gas = await provider.estimateGas({ to: AENEID_V3_QUOTER, data: quoter.interface.encodeFunctionData("quoteExactInputSingle", [tuple]) });
  } catch {
    gas = null;
  }

  return {
    amountOut: BigInt(amountOut.toString()),
    sqrtPriceX96After: BigInt(sqrtPriceX96After.toString()),
    initializedTicksCrossed: Number(initializedTicksCrossed.toString()),
    gasEstimate: gas,
  };
}
