"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const callbackUrl = useMemo(() => searchParams.get("callbackUrl") || "/admin", [searchParams]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, router, status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      redirect: false,
      callbackUrl,
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || "")
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid credentials. Please try again.");
      return;
    }
    window.location.assign(result?.url || callbackUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[2rem] border border-black/10 bg-black p-8 text-white shadow-2xl">
        <h1 className="font-heading text-4xl text-white">Anmol Gadgets Admin</h1>
        <p className="mt-2 text-sm text-white/60">Sign in to manage products, orders, and content.</p>
        <div className="mt-8 space-y-4">
          <input name="email" type="email" placeholder="Email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
          <input name="password" type="password" placeholder="Password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
        </div>
        {error && <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-2xl bg-white px-4 py-3 font-semibold text-black">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
