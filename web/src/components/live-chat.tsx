import { Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { ChatMessage } from "@/lib/types";

const SIMULATED = [
  { author: "Mira", body: "That transition though" },
  { author: "Kade", body: "Who else is here from the beginning" },
  { author: "Jun", body: "Volume all the way up" },
  { author: "Rae", body: "This is the set of the night" },
  { author: "Theo", body: "Play the unreleased one" },
  { author: "Sable", body: "The lights are unreal" },
  { author: "Nia", body: "Sending it from Providence" },
  { author: "Omar", body: "No skips. None." },
];

export function LiveChat({
  messages,
  onSend,
  canSend,
  signedOutHint,
}: {
  messages: ChatMessage[];
  onSend: (body: string) => Promise<void> | void;
  canSend: boolean;
  signedOutHint?: string;
}) {
  const [text, setText] = useState("");
  const [sim, setSim] = useState<ChatMessage[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const sending = useRef(false);

  useEffect(() => {
    let n = 0;
    const id = window.setInterval(() => {
      const pick = SIMULATED[n % SIMULATED.length];
      n += 1;
      if (!pick) return;
      setSim((prev) => [
        ...prev.slice(-24),
        {
          id: `sim-${Date.now()}`,
          streamId: "sim",
          userId: null,
          author: pick.author,
          body: pick.body,
          createdAt: new Date().toISOString(),
        },
      ]);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const all = useMemo(() => {
    const merged = [...messages, ...sim];
    merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return merged.slice(-60);
  }, [messages, sim]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [all.length]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending.current) return;
    sending.current = true;
    try {
      await onSend(body);
      setText("");
    } finally {
      sending.current = false;
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl bg-elevated/80">
      <div className="border-b border-border px-4 py-3 text-sm font-medium">Live chat</div>
      <div ref={scroller} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
        {all.map((m) => (
          <p key={String(m.id)} className="text-sm leading-snug">
            <span className="font-medium text-accent">{m.author}</span>{" "}
            <span className="text-fg/90">{m.body}</span>
          </p>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-border p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={canSend ? "Say something" : signedOutHint || "Sign in to chat"}
          disabled={!canSend}
          maxLength={240}
          className="h-10"
        />
        <button
          type="submit"
          disabled={!canSend || !text.trim()}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-fg disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
