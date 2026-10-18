import Link from "next/link";
import { BUCKET, db, Submission } from "@/lib/supabase";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: { status?: string } }) {
  const filter = searchParams.status === "pending" || searchParams.status === "replied" ? searchParams.status : "all";
  const supabase = db();

  let q = supabase.from("submissions").select("*").order("created_at", { ascending: false });
  if (filter !== "all") q = q.eq("status", filter);
  const { data } = await q;
  const rows = (data ?? []) as Submission[];

  const signed = rows.length
    ? await supabase.storage.from(BUCKET).createSignedUrls(rows.map((r) => r.image_path), 3600)
    : { data: [] };
  const urlFor = new Map((signed.data ?? []).map((s) => [s.path, s.signedUrl]));

  const tabs = [["all", "All"], ["pending", "Pending"], ["replied", "Replied"]];

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Submissions</h1>
        <form action="/api/admin/logout" method="post"><button className="text-ink/60 underline">Sign out</button></form>
      </div>
      <nav className="mb-5 flex gap-2">
        {tabs.map(([key, label]) => (
          <Link key={key} href={key === "all" ? "/admin" : `/admin?status=${key}`}
            className={`rounded-full border px-4 py-1.5 font-semibold ${filter === key ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
            {label}
          </Link>
        ))}
      </nav>
      {rows.length === 0 && <p className="rounded-lg border border-dashed border-line p-8 text-center text-ink/60">Nothing here yet. New uploads show up as soon as they arrive.</p>}
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/${r.id}`} className="flex gap-4 rounded-xl border border-line bg-white p-3 hover:border-rx">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urlFor.get(r.image_path) || ""} alt="" className="h-24 w-24 shrink-0 rounded-lg bg-paper object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-bold">{r.sender_name}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="line-clamp-2 text-ink/70">{r.note}</p>
                <p className="mt-1 text-sm text-ink/50">{new Date(r.created_at).toLocaleString()}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
