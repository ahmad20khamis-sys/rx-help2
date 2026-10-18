import { createClient } from "@supabase/supabase-js";

export const BUCKET = "prescriptions";

// Server-only client. Never import this in a "use client" file.
export function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

export type Submission = {
  id: string; created_at: string; sender_name: string; note: string;
  image_path: string; status: "pending" | "replied"; reply: string | null; replied_at: string | null;
};
