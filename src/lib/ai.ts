import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  content: Array<{ type: string; text?: string }>;
  stopReason: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
  };
}

export interface ChatOptions {
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<ChatResponse> {
  const { data, error } = await supabase.functions.invoke<ChatResponse>("ai-chat", {
    body: { messages, ...options },
  });

  if (error) throw error;
  if (!data) throw new Error("Empty response from ai-chat");
  return data;
}

export function extractText(response: ChatResponse): string {
  return response.content
    .filter((block) => block.type === "text" && block.text)
    .map((block) => block.text)
    .join("");
}
