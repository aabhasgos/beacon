import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getDb } from "@/lib/db";

let supabaseAdminClient: SupabaseClient | null = null;

export function getServerSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !anonKey) {
    try {
      const db = getDb();
      const row = db.prepare("SELECT value FROM app_settings WHERE key = 'supabase_config'").get() as { value: string } | undefined;
      if (row && row.value) {
        const parsed = JSON.parse(row.value);
        url = url || parsed.url || "";
        anonKey = anonKey || parsed.anonKey || "";
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceKey) {
    return null;
  }

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminClient;
}
