import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, WalletMinimal } from "lucide-react";

// Story chain stats shape
type StoryStats = {
  coin_image: string | null;
  coin_price: string | null;
  coin_price_change_percentage: number | null;
  gas_prices?: { slow: number; average: number; fast: number } | null;
};

type Message = { id: string; role: "assistant" | "user"; text: string };

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      role: "assistant",
      text: "Hello, I am Radut Agent. I’m connected to Story chain. Ask me anything.",
    },
  ]);
  const [text, setText] = useState("");
  const [stats, setStats] = useState<StoryStats | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    // Fetch token/network data from StoryScan
    fetch("https://www.storyscan.io/api/v2/stats")
      .then((r) => r.json())
      .then((j) => setStats(j as StoryStats))
      .catch(() => void 0);
  }, []);

  function onSend() {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { id: cryptoRandom(), role: "user", text: t }]);
    setText("");
  }

  const price = stats?.coin_price ? Number(stats.coin_price) : null;
  const change = stats?.coin_price_change_percentage ?? null;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-200px,theme(colors.fuchsia.600/.15),transparent)]">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/50 border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-pink-500 to-fuchsia-600" />
            <span className="font-semibold">IP Assistant</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Button size="sm" className="gap-2"><WalletMinimal className="h-4 w-4" /> Connect Wallet</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        <div className="h-[calc(100vh-7rem)] grid">
          <div className="relative overflow-y-auto rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-4 md:p-6">
            <div className="space-y-6">
              {messages.map((m) => (
                <ChatBubble key={m.id} role={m.role} text={m.text} />
              ))}
              <div ref={endRef} />
            </div>

            {/* Composer */}
            <div className="absolute left-0 right-0 bottom-0 translate-y-full pt-4" />
          </div>

          <div className="sticky bottom-4 self-end">
            <div className="mt-4 flex items-center gap-2 rounded-xl border bg-background/70 backdrop-blur p-2">
              <Input
                className="h-12 flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
              />
              <Button className="h-12 px-5" onClick={onSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <div className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2.5 text-sm">
          <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">Story Chain</span>
          {price !== null && (
            <span className="text-xs text-muted-foreground">
              STORY ${price.toFixed(2)} {change !== null && (
                <em className={cn("not-italic ml-1", change >= 0 ? "text-emerald-400" : "text-rose-400")}>{change >= 0 ? `+${change}%` : `${change}%`}</em>
              )}
            </span>
          )}
          {stats?.gas_prices && (
            <span className="text-xs text-muted-foreground ml-2">
              Gas: slow {stats.gas_prices.slow} avg {stats.gas_prices.average} fast {stats.gas_prices.fast}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ role, text }: { role: Message["role"]; text: string }) {
  const isAssistant = role === "assistant";
  return (
    <div className={cn("flex", isAssistant ? "justify-start" : "justify-end") }>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md",
          isAssistant
            ? "bg-muted/30 border text-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {text}
      </div>
    </div>
  );
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2, 10);
}
