"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      redirect: false,
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || "")
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid credentials. Please try again.");
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#d4a84322,transparent_30%),linear-gradient(180deg,#111,#f6f3ee_80%)] px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[2rem] border border-gold/30 bg-[#0f0f0f] p-8 text-white shadow-2xl">
        <h1 className="font-heading text-4xl text-gold">Anmol Gadgets Admin</h1>
        <p className="mt-2 text-sm text-white/60">Sign in to manage products, orders, and content.</p>
        <div className="mt-8 space-y-4">
          <input name="email" type="email" placeholder="Email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
          <input name="password" type="password" placeholder="Password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
        </div>
        {error && <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-2xl bg-gold px-4 py-3 font-semibold text-black">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
