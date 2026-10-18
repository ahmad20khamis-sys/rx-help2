"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReplyForm({ id, initial }: { id: string; initial: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const reply = new FormData(e.currentTarget).get("reply");
    const res = await fetch("/api/admin/reply", { method: "POST", body: JSON.stringify({ id, reply }) });
    setBusy(false);
    if (res.ok) { setMsg("Reply saved"); router.refresh(); }
    else setMsg((await res.json()).error ?? "Could not save the reply.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea name="reply" required rows={6} defaultValue={initial} placeholder="Type the answer here" className="field" />
      <div className="flex items-center gap-3">
        <button className="btn" disabled={busy}>{busy ? "Saving…" : initial ? "Update reply" : "Send reply"}</button>
        {msg && <span role="status" className="text-ink/70">{msg}</span>}
      </div>
    </form>
  );
}
