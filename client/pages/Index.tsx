import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { swapAgent } from "../../src/agents/swapAgent";
import { CHAINS, TOKENS, getChain, findToken } from "../../src/utils/config";
import { fromBaseUnits } from "../../src/utils/helpers";
import { toast } from "sonner";

export default function Index() {
  const [chain, setChain] = useState<keyof typeof CHAINS>("base");
  const [sell, setSell] = useState("USDC");
  const [buy, setBuy] = useState("ETH");
  const [amount, setAmount] = useState("100");
  const [prompt, setPrompt] = useState("Tolong swap 100 USDC ke ETH di Base");

  const tokens = useMemo(
    () => TOKENS.filter((t) => t.chain === chain),
    [chain]
  );

  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any | null>(null);
  const [intentMsg, setIntentMsg] = useState<string>("");

  async function getQuote() {
    setLoading(true);
    setQuote(null);
    try {
      const res = await swapAgent({ kind: "structured", chain, sellToken: sell, buyToken: buy, amount, side: "sell" });
      if (!res.ok) throw new Error(res.error);
      setQuote(res.quote);
      setIntentMsg(res.message);
    } catch (e: any) {
      toast.error(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function interpretPrompt() {
    setLoading(true);
    setQuote(null);
    try {
      const res = await swapAgent({ kind: "prompt", text: prompt });
      if (!res.ok) throw new Error(res.error);
      setQuote(res.quote);
      setIntentMsg(res.message);
      setChain(res.intent.chain);
      setSell(res.intent.sellToken);
      setBuy(res.intent.buyToken);
      setAmount(res.intent.amount);
    } catch (e: any) {
      toast.error(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function tryMetamaskSwap() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      toast("Wallet tidak ditemukan. Gunakan MetaMask di browser");
      return;
    }
    if (!quote) return;
    try {
      const provider = (window as any).ethereum;
      const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
      const from = accounts[0];
      const tx = {
        from,
        to: quote.to,
        data: quote.data,
        value: `0x${BigInt(quote.value).toString(16)}`,
      };
      const hash = await provider.request({ method: "eth_sendTransaction", params: [tx] });
      toast.success(`Transaksi dikirim: ${hash}`);
    } catch (e: any) {
      toast.error(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    // Initial quote
    getQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chainMeta = getChain(chain);
  const sellToken = findToken(chain, sell);
  const buyToken = findToken(chain, buy);
  const buyAmountHuman = quote && buyToken ? fromBaseUnits(quote.buyAmount, buyToken.decimals) : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-200px,theme(colors.violet.600/.25),transparent)]">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/60 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-violet-500 to-indigo-500" />
            <span className="font-extrabold tracking-tight text-lg">IPFI Assistant</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
            <span>AI Swap Token</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>Story IP Tools</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <section className="grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Asisten AI untuk Swap Token
            </h1>
            <p className="mt-4 text-muted-foreground text-balance">
              Ketik perintah natural (Bahasa Indonesia/English) atau gunakan formulir di samping. IPFI Assistant akan memahami niat Anda dan menyiapkan transaksi terbaik menggunakan 0x aggregator.
            </p>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
                <CardDescription>Contoh: "Swap 100 USDC ke ETH di Base"</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                <div className="flex gap-3">
                  <Button onClick={interpretPrompt} disabled={loading}>
                    Interpretasikan & Tampilkan Quote
                  </Button>
                  <Button variant="outline" onClick={() => navigator.clipboard.writeText(prompt)}>
                    Salin Prompt
                  </Button>
                </div>
                {intentMsg && (
                  <p className="text-sm text-muted-foreground">{intentMsg}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-violet-500/20 shadow-[0_0_0_1px_rgba(124,58,237,0.08),0_20px_50px_-20px_rgba(124,58,237,0.4)]">
            <CardHeader>
              <CardTitle>Swap Form</CardTitle>
              <CardDescription>Pilih jaringan, token, dan jumlah</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Jaringan</label>
                  <Select value={chain} onValueChange={(v) => setChain(v as keyof typeof CHAINS)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Chain" /></SelectTrigger>
                    <SelectContent>
                      {Object.values(CHAINS).map((c) => (
                        <SelectItem key={c.key} value={c.key}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Jumlah</label>
                  <Input className="mt-1" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Dari</label>
                  <Select value={sell} onValueChange={setSell}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Token" /></SelectTrigger>
                    <SelectContent>
                      {tokens.map((t) => (
                        <SelectItem key={t.symbol} value={t.symbol}>{t.symbol}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Ke</label>
                  <Select value={buy} onValueChange={setBuy}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Token" /></SelectTrigger>
                    <SelectContent>
                      {tokens.map((t) => (
                        <SelectItem key={t.symbol} value={t.symbol}>{t.symbol}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={getQuote} disabled={loading}>Dapatkan Quote</Button>
                <Button variant="secondary" onClick={tryMetamaskSwap} disabled={!quote}>Swap via MetaMask</Button>
              </div>

              {quote && (
                <div className="mt-4 rounded-md border bg-muted/10 p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span>Jaringan</span><span>{chainMeta.name}</span></div>
                  <div className="flex justify-between text-sm"><span>Harga</span><span>1 {sell} ≈ {Number(quote.price).toFixed(6)} {buy}</span></div>
                  <div className="flex justify-between text-sm"><span>Perkiraan Terima</span><span>{buyAmountHuman} {buy}</span></div>
                  <div className="flex justify-between text-sm"><span>Gas</span><span>{quote.estimatedGas}</span></div>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-muted-foreground">Rute</summary>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {quote.sources.filter((s: any) => Number(s.proportion) > 0).map((s: any) => (
                        <li key={s.name} className="flex justify-between"><span>{s.name}</span><span>{(Number(s.proportion) * 100).toFixed(1)}%</span></li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Dibangun dengan ❤️ oleh IPFI — AI untuk IP & DeFi
      </footer>
    </div>
  );
}
