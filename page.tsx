import Link from "next/link";
import { notFound } from "next/navigation";
import { BUCKET, db, Submission } from "@/lib/supabase";
import StatusBadge from "@/components/StatusBadge";
import ReplyForm from "@/components/ReplyForm";

export const dynamic = "force-dynamic";

export default async function Detail({ params }: { params: { id: string } }) {
  const supabase = db();
  const { data } = await supabase.from("submissions").select("*").eq("id", params.id).single();
  if (!data) notFound();
  const s = data as Submission;
  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(s.image_path, 3600);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/admin" className="text-ink/60 underline">Back to list</Link>
      <div className="mb-4 mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{s.sender_name}</h1>
          <p className="text-ink/50">{new Date(s.created_at).toLocaleString()}</p>
        </div>
        <StatusBadge status={s.status} />
      </div>
      {signed?.signedUrl && (
        <a href={signed.signedUrl} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={signed.signedUrl} alt="Prescription" className="w-full rounded-xl border border-line bg-white" />
        </a>
      )}
      <p className="mt-1 text-sm text-ink/50">Tap the image to open it full size.</p>
      <section className="my-6">
        <h2 className="mb-1 font-bold">What they asked</h2>
        <p className="whitespace-pre-wrap rounded-lg border border-line bg-white p-4">{s.note}</p>
      </section>
      <section>
        <h2 className="mb-2 font-bold">Your reply</h2>
        <ReplyForm id={s.id} initial={s.reply ?? ""} />
      </section>
    </main>
  );
}
