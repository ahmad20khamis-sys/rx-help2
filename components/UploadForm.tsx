"use client";
import { useState } from "react";

// Shrinks phone photos so they upload fast and stay under serverless body limits.
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Could not read image"))), "image/jpeg", 0.85));
}

export default function UploadForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get("image") as File;
    if (!file?.size) return setError("Choose a photo of the prescription.");
    if (!["image/jpeg", "image/png"].includes(file.type)) return setError("Use a JPEG or PNG image.");

    setState("sending");
    try {
      data.set("image", await shrink(file), "prescription.jpg");
      const res = await fetch("/api/submit", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-rx/30 bg-white p-6 text-center">
        <p className="text-xl font-bold">Prescription sent</p>
        <p className="mt-2 text-ink/70">You&apos;ll get an answer from the pharmacist soon.</p>
        <button className="btn mt-5" onClick={() => { setState("idle"); setPreview(null); }}>Send another</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="block">
        <span className="mb-1.5 block font-semibold">Your name and department</span>
        <input name="name" required maxLength={100} placeholder="Amina K., Pediatrics" className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block font-semibold">Photo of the prescription</span>
        <input
          name="image" type="file" accept="image/jpeg,image/png" required
          onChange={(e) => { const f = e.target.files?.[0]; setPreview(f ? URL.createObjectURL(f) : null); }}
          className="field file:mr-3 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-white"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {preview && <img src={preview} alt="Selected prescription" className="mt-3 max-h-64 w-full rounded-lg border border-line object-contain bg-white" />}
      </label>
      <label className="block">
        <span className="mb-1.5 block font-semibold">What is unclear?</span>
        <textarea name="note" required maxLength={1000} rows={4} placeholder="Second line of the handwriting, dose of the third drug…" className="field" />
      </label>
      <p className="text-sm text-ink/60">Cover the patient&apos;s name and ID before taking the photo.</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-red-700">{error}</p>}
      <button className="btn w-full" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send prescription"}</button>
    </form>
  );
}
