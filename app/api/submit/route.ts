import { NextResponse } from "next/server";
import { BUCKET, db } from "@/lib/supabase";
import { notifyTelegram } from "@/lib/telegram";

export const runtime = "nodejs";
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const form = await req.formData();
  if (form.get("website")) return NextResponse.json({ ok: true }); // honeypot: bots fill this in

  const name = String(form.get("name") ?? "").trim().slice(0, 100);
  const note = String(form.get("note") ?? "").trim().slice(0, 1000);
  const file = form.get("image");

  if (!name || !note) return fail("Enter your name and what is unclear.");
  if (!(file instanceof File) || !file.size) return fail("Attach an image.");
  if (!["image/jpeg", "image/png"].includes(file.type)) return fail("Use a JPEG or PNG image.");
  if (file.size > 4 * 1024 * 1024) return fail("Image is over 4 MB. Try a smaller photo.");

  const path = `${crypto.randomUUID()}.${file.type === "image/png" ? "png" : "jpg"}`;
  const supabase = db();

  const up = await supabase.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (up.error) {
  console.error("SUPABASE UPLOAD ERROR:", up.error);

  return NextResponse.json(
    {
     error: up.error.message
    },
    { status: 500 }
  );
}

  const { data, error } = await supabase
    .from("submissions").insert({ sender_name: name, note, image_path: path }).select("id").single();
  if (error) { console.error(error); return fail("Could not save your request. Try again.", 500); }

  await notifyTelegram({ name, note, id: data.id, image: file });
  return NextResponse.json({ ok: true });
}
