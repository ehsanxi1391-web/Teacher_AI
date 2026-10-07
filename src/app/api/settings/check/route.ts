import { NextResponse } from "next/server";
import { testProvider } from "@/lib/ai";

/** Probes the configured AI provider so the user can verify credentials. */
export async function POST() {
  const result = await testProvider();
  return NextResponse.json(result);
}
