"use client";

import { createClient } from "../../lib/supabase/client";

export function LogoutButton() {
  const supabase = createClient();

  return (
    <button
      className="rounded-xl border px-3 py-2"
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
    >
      Log uit
    </button>
  );
}
