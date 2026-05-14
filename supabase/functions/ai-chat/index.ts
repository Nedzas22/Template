// AI chat edge function — Anthropic Claude with prompt caching.
//
// Verifies the caller's Supabase JWT, calls Anthropic's messages API with
// cache_control on the system prompt, and logs token usage to
// ai_token_usage for per-user reporting.
//
// Set these function secrets:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY are injected
// automatically by the Supabase runtime.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.95.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
}

const DEFAULT_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 4096;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return json({ error: "ANTHROPIC_API_KEY is not configured" }, 500);
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return json({ error: "Invalid token" }, 401);
    }

    const body: ChatRequest = await req.json();
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return json({ error: "messages array is required" }, 400);
    }

    const model = body.model ?? DEFAULT_MODEL;
    const maxTokens = body.maxTokens ?? DEFAULT_MAX_TOKENS;
    const systemPrompt = body.systemPrompt ?? "You are a helpful assistant.";

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const usage = response.usage as {
      input_tokens: number;
      output_tokens: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };

    // Log token usage (fire-and-forget with admin client, RLS bypass)
    const adminClient = createClient(supabaseUrl, serviceKey);
    adminClient
      .from("ai_token_usage")
      .insert({
        user_id: user.id,
        model,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cache_creation_tokens: usage.cache_creation_input_tokens ?? 0,
        cache_read_tokens: usage.cache_read_input_tokens ?? 0,
      })
      .then(({ error }) => {
        if (error) console.error("[ai-chat] usage log failed", error);
      });

    return json({
      content: response.content,
      stopReason: response.stop_reason,
      usage: {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
        cacheReadTokens: usage.cache_read_input_tokens ?? 0,
      },
    });
  } catch (error) {
    console.error("[ai-chat] error", error);
    return json({ error: String(error) }, 500);
  }
});
