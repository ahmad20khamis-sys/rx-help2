"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
    if (res.ok) { router.push("/admin"); router.refresh(); } else setError("Wrong password");
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-20">
      <h1 className="mb-6 text-2xl font-extrabold">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="password" type="password" required autoFocus placeholder="Password" className="field" />
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <button className="btn w-full">Sign in</button>
      </form>
    </main>
  );
}
