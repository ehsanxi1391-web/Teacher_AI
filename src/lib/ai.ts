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
 * Sends a chat completion request. If the user configured an OpenAI-compatible
 * API key, that provider is used; otherwise the built-in demo AI (z-ai SDK).
 */
export async function aiChat(messages: ChatMsg[]): Promise<string> {
  const s = await getSettings();
  const key = (s.apiKey || "").trim();

  if (key && key.toUpperCase() !== "DEMO") {
    const base = (s.apiBase || "https://api.openai.com/v1").replace(/\/+$/, "");
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
      throw new Error(`AI provider error ${res.status}`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return json.choices?.[0]?.message?.content ?? "";
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
