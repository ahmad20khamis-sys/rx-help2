import UploadForm from "@/components/UploadForm";

export default function Home() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight">Can&apos;t read a prescription?</h1>
      <p className="mb-8 mt-2 text-ink/70">Send a photo and say what&apos;s unclear. You&apos;ll get a written answer.</p>
      <UploadForm />
    </main>
  );
}
