"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export function DbBackupPanel() {
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState("");

  async function downloadBackup() {
    setLoading(true);
    setLastError("");
    const response = await fetch("/api/admin/backup-db");
    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const message = data.error || "Backup failed";
      setLastError(message);
      toast.error(message);
      return;
    }

    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="([^"]+)"/i);
    const filename = match?.[1] || "anmol-gadgets-backup.sql";
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
    toast.success("Backup download started");
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-3xl">Postgres Backup</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
        This downloads a full JSON backup of the site data, including products, orders, customers, testimonials, settings, email logs, admin users, and sequence data.
        It works directly from the app without requiring `pg_dump`.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
      <button onClick={downloadBackup} disabled={loading} className="rounded-2xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-60">
        {loading ? "Preparing backup..." : "Backup DB"}
      </button>
      <a href="/api/admin/backup-db" className="rounded-2xl border border-black/10 px-5 py-3 font-semibold">
        Direct Download
      </a>
      </div>
      {lastError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {lastError}
        </div>
      )}
    </div>
  );
}
