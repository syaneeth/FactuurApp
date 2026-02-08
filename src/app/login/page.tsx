"use client";

import { useState } from "react";
import { createClient } from "@/src/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setMsg("Account aangemaakt ✅ Je bent ingelogd (of check je mail als confirm aan staat).");
      window.location.href = "/app";
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "/app";
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-sm opacity-70 mt-1">Email + wachtwoord</p>

        <div className="mt-6 space-y-3">
          <input
            className="w-full rounded-xl border px-3 py-2"
            type="email"
            placeholder="jij@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl border px-3 py-2"
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              className="flex-1 rounded-xl border px-3 py-2"
              onClick={signIn}
              disabled={loading}
            >
              Inloggen
            </button>
            <button
              className="flex-1 rounded-xl border px-3 py-2"
              onClick={signUp}
              disabled={loading}
            >
              Registreren
            </button>
          </div>

          {msg && <p className="text-sm mt-2">{msg}</p>}
        </div>
      </div>
    </main>
  );
}
