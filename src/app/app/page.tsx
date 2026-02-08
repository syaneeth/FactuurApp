"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function AppHome() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      setEmail(data.user.email ?? null);
    };
    run();
  }, [supabase]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 opacity-70">
        {email ? `Ingelogd als: ${email}` : "Laden..."}
      </p>
    </main>
  );
}
