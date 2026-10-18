import { NextResponse } from "next/server";
import { BUCKET, db } from "@/lib/supabase";
import { notifyTelegram } from "@/lib/telegram";

export const runtime = "nodejs";

const fail = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    // Honeypot
    if (form.get("website")) {
      return NextResponse.json({ ok: true });
    }

    const name = String(form.get("name") ?? "")
      .trim()
      .slice(0, 100);

    const note = String(form.get("note") ?? "")
      .trim()
      .slice(0, 1000);

    const file = form.get("image");

    if (!name || !note) {
      return fail("Enter your name and what is unclear.");
    }

    if (!(file instanceof File) || file.size === 0) {
      return fail("Attach an image.");
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      return fail("Use a JPEG or PNG image.");
    }

    if (file.size > 4 * 1024 * 1024) {
      return fail("Image is over 4 MB. Try a smaller photo.");
    }

    const extension = file.type === "image/png" ? "png" : "jpg";

    // Safe filename: UUID only
    const path = `${crypto.randomUUID()}.${extension}`;

    const supabase = db();

    // Upload image
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("SUPABASE UPLOAD ERROR", {
        message: uploadError.message,
        name: uploadError.name,
        status: uploadError.status,
        statusCode: uploadError.statusCode,
      });

      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    // Save submission
    const { data, error: dbError } = await supabase
      .from("submissions")
      .insert({
        sender_name: name,
        note,
        image_path: path,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("DATABASE ERROR", dbError);

      // Delete uploaded image if database insert fails
      await supabase.storage.from(BUCKET).remove([path]);

      return fail("Could not save your request. Try again.", 500);
    }

    // Telegram notification
    try {
      await notifyTelegram({
        name,
        note,
        id: data.id,
        image: file,
      });
    } catch (telegramError) {
      console.error("TELEGRAM ERROR", telegramError);
      // Don't fail the submission if Telegram notification fails.
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
    });
  } catch (error) {
    console.error("SUBMIT API ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}
