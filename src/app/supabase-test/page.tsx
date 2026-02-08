"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function SupabaseTestPage() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setStatus(`ok ✅ session: ${data.session ? "yes" : "no"}`);
      } catch (e: any) {
        setStatus(`error ❌ ${e?.message ?? String(e)}`);
      }
    };
    run();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Supabase test</h1>
      <p>{status}</p>
    </main>
  );
}
