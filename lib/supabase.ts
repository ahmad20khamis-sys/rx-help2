import { createClient } from "@supabase/supabase-js";

export const BUCKET = "prescriptions";

export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export type Submission = {
  id: string;
  created_at: string;
  sender_name: string;
  note: string;
  image_path: string;
  status: "pending" | "replied";
  reply: string | null;
  replied_at: string | null;
};
