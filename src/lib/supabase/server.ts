import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase cookie names (meest voorkomend). We lezen ze via cookieStore.get(name)
const SUPABASE_COOKIE_NAMES = [
  "sb-access-token",
  "sb-refresh-token",
  // Nieuwe/recentere naamvarianten (afhankelijk van project ref / pkce flow)
  "supabase-auth-token",
  "sb:token",
];

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Next 16: geen cookieStore.getAll() in jouw setup -> emuleer via get(name)
          const found: { name: string; value: string }[] = [];

          for (const name of SUPABASE_COOKIE_NAMES) {
            const c = cookieStore.get(name);
            if (c?.value) found.push({ name, value: c.value });
          }

          // Ook handig: pak eventuele project-gescope cookies (sb-<projectref>-auth-token)
          // We kunnen alles wat begint met "sb-" proberen via een brute lijst.
          // Als dit niet genoeg blijkt, doen we een middleware-based oplossing.
          return found;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
