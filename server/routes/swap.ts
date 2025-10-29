import type { RequestHandler } from "express";
import { CHAINS } from "../../shared/ipfi/utils/config";

export const getSwapQuote: RequestHandler = async (req, res) => {
  try {
    const chainKey = String(req.query.chain ?? "base");
    if (!Object.keys(CHAINS).includes(chainKey)) {
      return res.status(400).json({ error: "Unsupported chain" });
    }
    const chain = CHAINS[chainKey as keyof typeof CHAINS];

    const url = new URL(chain.zeroExBaseUrl + "/swap/v1/quote");

    for (const [k, v] of Object.entries(req.query)) {
      if (v != null) url.searchParams.set(k, String(v));
    }

    const r = await fetch(url.toString());
    const text = await r.text();
    res
      .status(r.status)
      .type(r.headers.get("content-type") ?? "application/json")
      .send(text);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? String(err) });
  }
};
