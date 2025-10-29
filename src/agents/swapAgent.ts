import { handlePrompt, PromptResult } from "../services/ai/promptHandler";
import { getQuote, GetQuoteParams } from "../services/swap/tokenSwap";
import { SwapIntent } from "../utils/helpers";

export type SwapRequest =
  | { kind: "prompt"; text: string; taker?: string }
  | ({ kind: "structured" } & GetQuoteParams);

export type SwapAgentResponse =
  | {
      ok: true;
      intent: SwapIntent;
      quote: Awaited<ReturnType<typeof getQuote>>;
      message: string;
    }
  | { ok: false; error: string };

export async function swapAgent(
  request: SwapRequest,
): Promise<SwapAgentResponse> {
  try {
    if (request.kind === "prompt") {
      const res: PromptResult = await handlePrompt(request.text, request.taker);
      if (res.type === "swap.intent.invalid")
        return { ok: false, error: res.message };
      if (res.type === "swap.intent") {
        const quote = await getQuote({ ...res.intent, taker: request.taker });
        const message = humanize(
          res.intent.chain,
          res.intent.sellToken,
          res.intent.buyToken,
          res.intent.amount,
          res.intent.side,
        );
        return { ok: true, intent: res.intent, quote, message };
      }
      const message = humanize(
        res.intent.chain,
        res.intent.sellToken,
        res.intent.buyToken,
        res.intent.amount,
        res.intent.side,
      );
      return { ok: true, intent: res.intent, quote: res.quote, message };
    }

    const { chain, sellToken, buyToken, amount, taker, side } = request;
    const intent: SwapIntent = {
      chain,
      sellToken,
      buyToken,
      amount,
      side: side ?? "sell",
    };
    const quote = await getQuote({
      chain,
      sellToken,
      buyToken,
      amount,
      taker,
      side,
    });
    const message = humanize(
      chain,
      sellToken,
      buyToken,
      amount,
      side ?? "sell",
    );
    return { ok: true, intent, quote, message };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}

function humanize(
  chain: string,
  sell: string,
  buy: string,
  amount: string,
  side: "sell" | "buy",
): string {
  const verb = side === "sell" ? "menukar" : "membeli";
  return `AI siap ${verb} ${amount} ${side === "sell" ? sell : buy} pada jaringan ${chain}.`;
}
