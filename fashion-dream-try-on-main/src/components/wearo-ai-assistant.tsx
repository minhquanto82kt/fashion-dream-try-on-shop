import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePartPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";
import { ArrowUp, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateWearoAiReply } from "@/lib/wearo-ai-chat.functions";

const modelAdapter: ChatModelAdapter = {
  async run({ messages }) {
    const normalized = messages
      .map((message) => ({
        role: message.role === "user" ? "user" : "assistant",
        content: message.content
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n"),
      }))
      .filter((message) => message.content.trim().length > 0);

    const result = await generateWearoAiReply({ data: { messages: normalized } });
    return { content: [{ type: "text", text: result.text }] };
  },
};

function WearoMessage() {
  return (
    <MessagePrimitive.Root className="flex gap-3 py-4">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Sparkles className="size-4" />
      </div>
      <div className="min-w-0 max-w-[85%] text-sm leading-7 text-foreground">
        <MessagePrimitive.Parts>
          {({ part }) => {
            if (part.type === "text") {
              return <MessagePartPrimitive.Text />;
            }
            return part.toolUI ?? null;
          }}
        </MessagePrimitive.Parts>
      </div>
    </MessagePrimitive.Root>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end py-3">
      <div className="max-w-[82%] rounded-2xl bg-primary px-4 py-2.5 text-sm leading-6 text-primary-foreground">
        <MessagePrimitive.Parts>
          {({ part }) => (part.type === "text" ? <MessagePartPrimitive.Text /> : null)}
        </MessagePrimitive.Parts>
      </div>
    </MessagePrimitive.Root>
  );
}

function WearoThread() {
  return (
    <ThreadPrimitive.Root className="flex h-[620px] flex-col bg-background">
      <ThreadPrimitive.Viewport className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-8">
        <ThreadPrimitive.Messages>
          {({ message }) => (message.role === "user" ? <UserMessage /> : <WearoMessage />)}
        </ThreadPrimitive.Messages>
      </ThreadPrimitive.Viewport>
      <div className="border-t border-border bg-card/80 p-4 backdrop-blur sm:p-5">
        <ComposerPrimitive.Root className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 focus-within:border-primary">
          <ComposerPrimitive.Input
            placeholder="Hỏi WEARO AI về phong cách, outfit hoặc cách phối đồ..."
            rows={2}
            className="min-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-silver"
          />
          <ComposerPrimitive.Send className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40">
            <ArrowUp className="size-4" />
          </ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
        <p className="mt-2 px-2 text-[10px] uppercase tracking-[0.14em] text-silver">
          WEARO AI · Stylist Beta
        </p>
      </div>
    </ThreadPrimitive.Root>
  );
}

export function WearoAiAssistant() {
  const runtime = useLocalRuntime(modelAdapter, { maxSteps: 1 });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <WearoThread />
    </AssistantRuntimeProvider>
  );
}
