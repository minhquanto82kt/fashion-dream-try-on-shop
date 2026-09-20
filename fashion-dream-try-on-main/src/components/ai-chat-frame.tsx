import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Bot, Check, MessageCircle, Send, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateConcept } from "@/lib/ai.functions";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  image?: string;
};

const QUICK_PROMPTS = [
  "Phối cho tôi một look tối giản",
  "Tôi nên mặc gì đi hẹn hò?",
  "Gợi ý outfit hợp dáng unisex",
];

export function AiChatFrame({ onUseConcept }: { onUseConcept?: (prompt: string) => void }) {
  const run = useServerFn(generateConcept);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Chào bạn. Tôi là WEARO Stylist. Hãy nói cho tôi biết bạn muốn mặc gì, đi đâu hoặc mood hôm nay.",
    },
  ]);

  const mutation = useMutation({
    mutationFn: (prompt: string) => run({ data: { style: "Minimal", occasion: "Đi chơi", prompt } }),
    onSuccess: (data, prompt) => {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: data.text || "Tôi đã tạo một concept dựa trên yêu cầu của bạn.",
          image: data.image,
        },
      ]);
      onUseConcept?.(prompt);
    },
    onError: (error: Error) => toast.error(error.message || "Không thể kết nối AI Stylist."),
  });

  const send = (value = input) => {
    const prompt = value.trim();
    if (!prompt || mutation.isPending) return;
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", text: prompt }]);
    setInput("");
    mutation.mutate(prompt);
  };

  return (
    <aside className="ai-chatframe" aria-label="WEARO AI Stylist chat">
      <header className="ai-chatframe__header">
        <div className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bot className="size-4" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-[#F2AD94]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary">WEARO / AI STYLIST</p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">Personal Style Assistant</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-silver"><span className="size-1.5 rounded-full bg-[#F2AD94]" />Online</span>
      </header>

      <div className="ai-chatframe__context">
        <Sparkles className="size-3.5 shrink-0 text-primary" />
        <span>AI Stylist · Concept mode</span>
      </div>

      <div className="ai-chatframe__messages" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={`ai-chatframe__message ${message.role === "user" ? "ai-chatframe__message--user" : "ai-chatframe__message--assistant"}`}>
            <div className="ai-chatframe__avatar" aria-hidden="true">{message.role === "user" ? <User className="size-3" /> : <Bot className="size-3" />}</div>
            <div className="min-w-0 max-w-[88%]">
              <div className="ai-chatframe__bubble">{message.text}</div>
              {message.image && <img src={message.image} alt="Concept outfit được tạo bởi AI" className="mt-2 max-h-48 w-full rounded-xl object-cover" />}
            </div>
          </div>
        ))}
        {mutation.isPending && (
          <div className="ai-chatframe__message ai-chatframe__message--assistant">
            <div className="ai-chatframe__avatar"><Bot className="size-3" /></div>
            <div className="ai-chatframe__bubble ai-chatframe__typing"><span /><span /><span /></div>
          </div>
        )}
      </div>

      <div className="ai-chatframe__quick-actions">
        {QUICK_PROMPTS.map((prompt) => <button key={prompt} type="button" onClick={() => send(prompt)} disabled={mutation.isPending}>{prompt}</button>)}
      </div>

      <form className="ai-chatframe__composer" onSubmit={(event) => { event.preventDefault(); send(); }}>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={2} maxLength={500} placeholder="Nhắn cho AI Stylist…" aria-label="Tin nhắn cho AI Stylist" />
        <button type="submit" disabled={!input.trim() || mutation.isPending} aria-label="Gửi tin nhắn"><Send className="size-4" /></button>
      </form>
      <div className="ai-chatframe__footer"><Check className="size-3" /> AI có thể tạo concept và hình ảnh tham khảo. Kiểm tra kết quả trước khi mua.</div>
    </aside>
  );
}
