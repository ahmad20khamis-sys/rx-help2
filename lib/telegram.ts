export async function notifyTelegram(opts: { name: string; note: string; id: string; image: Blob }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin/${opts.id}`;
  const caption = `New prescription from ${opts.name}\n\n${opts.note}\n\nReply: ${link}`.slice(0, 1024);

  try {
    const body = new FormData();
    body.append("chat_id", chatId);
    body.append("caption", caption);
    body.append("photo", opts.image, "prescription.jpg");
    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: "POST", body });
    if (res.ok) return;
    // Fall back to text only if the photo upload fails
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: caption }),
    });
  } catch (e) {
    console.error("Telegram notification failed", e); // never block the upload
  }
}
