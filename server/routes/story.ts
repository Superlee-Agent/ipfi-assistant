import type { RequestHandler } from "express";
import { quoteExactInputSingle } from "../../src/services/storydex/quoter";

export const getStoryQuote: RequestHandler = async (req, res) => {
  try {
    const tokenIn = String(req.query.tokenIn);
    const tokenOut = String(req.query.tokenOut);
    const fee = Number(req.query.fee ?? 3000);
    const amountIn = BigInt(String(req.query.amountIn));

    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenIn) || !/^0x[a-fA-F0-9]{40}$/.test(tokenOut)) {
      return res.status(400).json({ error: "tokenIn/tokenOut must be 0x-addresses" });
    }

    const result = await quoteExactInputSingle({ tokenIn, tokenOut, fee, amountIn });
    res.json({
      amountOut: result.amountOut.toString(),
      sqrtPriceX96After: result.sqrtPriceX96After.toString(),
      initializedTicksCrossed: result.initializedTicksCrossed,
      gasEstimate: result.gasEstimate?.toString() ?? null,
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? String(e) });
  }
};
