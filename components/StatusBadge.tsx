export default function StatusBadge({ status }: { status: "pending" | "replied" }) {
  const replied = status === "replied";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${replied ? "bg-rx/10 text-rx" : "bg-wait/10 text-wait"}`}>
      {replied ? "Replied" : "Pending"}
    </span>
  );
}
