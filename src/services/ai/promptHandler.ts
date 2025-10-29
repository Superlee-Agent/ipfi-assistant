import { parseSwapPrompt, SwapIntent } from "../../utils/helpers";
import { getQuote } from "../swap/tokenSwap";

export type PromptResult =
  | { type: "swap.intent.invalid"; message: string }
  | { type: "swap.intent"; intent: SwapIntent }
  | {
      type: "swap.quote";
      intent: SwapIntent;
      quote: Awaited<ReturnType<typeof getQuote>>;
    };

export async function handlePrompt(
  prompt: string,
  taker?: string,
): Promise<PromptResult> {
  const intent = parseSwapPrompt(prompt);
  if (!intent)
    return {
      type: "swap.intent.invalid",
      message: "Prompt tidak jelas. Contoh: 'Swap 100 USDC ke ETH di Base'.",
    };

  const quote = await getQuote({
    chain: intent.chain,
    sellToken: intent.sellToken,
    buyToken: intent.buyToken,
    amount: intent.amount,
    side: intent.side,
    taker,
  });

  return { type: "swap.quote", intent, quote };
}
