import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: Request) {
  const { id, reply } = await req.json().catch(() => ({}));
  const text = String(reply ?? "").trim();
  if (!id || !text) return NextResponse.json({ error: "Write a reply first." }, { status: 400 });

  const { error } = await db()
    .from("submissions")
    .update({ reply: text, status: "replied", replied_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: "Could not save the reply." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
