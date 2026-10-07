import ZAI from "z-ai-web-dev-sdk";
import { db } from "./db";

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

async function getSettings() {
  let s = await db.settings.findUnique({ where: { id: 1 } });
  if (!s) s = await db.settings.create({ data: { id: 1 } });
  return s;
}

/**
 * Normalizes a user-supplied OpenAI-compatible base URL:
 * - fixes typos like "https//host" (missing colon)
 * - strips trailing slashes
 * - appends "/v1" when only a bare host is given
 * Throws a friendly error if the result is still not a valid URL.
 */
export function normalizeApiBase(raw: string): string {
  let base = (raw || "https://api.openai.com/v1").trim().replace(/\/+$/, "");
  base = base.replace(/^(https?)\/\//i, "$1://"); // missing colon typo
  try {
    const u = new URL(base);
    if (!u.pathname || u.pathname === "/") base = `${u.origin}/v1`;
  } catch {
    throw new Error(
      `Invalid API Base URL: "${raw}". Example: https://api.openai.com/v1`,
    );
  }
  return base;
}

/**
 * Sends a chat completion request. If the user configured an OpenAI-compatible
 * API key, that provider is tried first; if it fails for any reason (bad URL,
 * quota, region block, network) the request silently falls back to the
 * built-in demo AI (z-ai SDK) so the tutor never hard-fails.
 */
export async function aiChat(messages: ChatMsg[]): Promise<string> {
  const s = await getSettings();
  const key = (s.apiKey || "").trim();

  if (key && key.toUpperCase() !== "DEMO") {
    try {
      const base = normalizeApiBase(s.apiBase || "https://api.openai.com/v1");
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: s.model || "gpt-4o-mini",
          messages,
          temperature: 0.4,
        }),
      });
      if (!res.ok) {
        const detail = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        console.error(
          `[ai] custom provider failed (${res.status}): ${detail?.error?.message ?? "unknown"} — falling back to demo AI`,
        );
      } else {
        const json = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        return json.choices?.[0]?.message?.content ?? "";
      }
    } catch (err) {
      console.error(
        `[ai] custom provider unreachable: ${String((err as Error)?.message || err)} — falling back to demo AI`,
      );
    }
  }

  // Built-in demo AI — the SDK expects the system prompt as the first
  // "assistant" role message.
  const converted = messages.map((m, i) =>
    i === 0 && m.role === "system" ? { role: "assistant" as const, content: m.content } : m,
  );
  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages: converted,
    thinking: { type: "disabled" },
  });
  return completion.choices[0]?.message?.content ?? "";
}

/**
 * Explicitly probes the configured custom provider with a 1-token request.
 * Used by POST /api/settings/test so users can verify their key/base/model.
 */
export async function testProvider(): Promise<{
  provider: "custom" | "demo";
  ok: boolean;
  model?: string;
  error?: string;
}> {
  const s = await getSettings();
  const key = (s.apiKey || "").trim();
  const model = s.model || "gpt-4o-mini";
  if (!key || key.toUpperCase() === "DEMO") {
    return { provider: "demo", ok: true, model: "built-in" };
  }
  try {
    const base = normalizeApiBase(s.apiBase || "https://api.openai.com/v1");
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
      }),
    });
    if (!res.ok) {
      const detail = (await res.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      return {
        provider: "custom",
        ok: false,
        model,
        error: detail?.error?.message || `HTTP ${res.status}`,
      };
    }
    return { provider: "custom", ok: true, model };
  } catch (err) {
    return {
      provider: "custom",
      ok: false,
      model,
      error: String((err as Error)?.message || err),
    };
  }
}

export interface SearchResultItem {
  name: string;
  url: string;
  snippet: string;
  host_name: string;
  date?: string;
}

export async function aiSearch(query: string, num = 8): Promise<SearchResultItem[]> {
  const zai = await ZAI.create();
  const results = (await zai.functions.invoke("web_search", { query, num })) as SearchResultItem[];
  return Array.isArray(results) ? results : [];
}

/** Extracts the first JSON object/array found in an LLM response. */
export function extractJson(raw: string): Record<string, unknown> | null {
  if (!raw) return null;
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const start = text.search(/[{[]/);
  if (start === -1) return null;
  const open = text[start];
  const close = open === "{" ? "}" : "]";
  const end = text.lastIndexOf(close);
  if (end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}
