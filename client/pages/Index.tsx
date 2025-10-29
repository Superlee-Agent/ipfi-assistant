import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, ImagePlus, WalletMinimal } from "lucide-react";

type Message = { id: string; role: "assistant" | "user"; text: string };

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      role: "assistant",
      text: "Hello, I am Radut Agent. Attach an image and I’ll analyze it automatically.",
    },
  ]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function onSend() {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { id: cryptoRandom(), role: "user", text: t }]);
    setText("");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-200px,theme(colors.fuchsia.600/.15),transparent)]">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/50 border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-pink-500 to-fuchsia-600" />
            <span className="font-semibold">IP Assistant</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Guest</span>
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
              <Button variant="ghost" size="icon" className="text-muted-foreground" title="Attach image">
                <ImagePlus className="h-5 w-5" />
              </Button>
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
