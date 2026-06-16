"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Log = {
  id: string;
  toEmail: string;
  subject: string;
  status: string;
  sentAt: string;
};

export function EmailManager({ initialLogs }: { initialLogs: Log[] }) {
  const [logs] = useState(initialLogs);
  const [testing, setTesting] = useState(false);
  const [resending, setResending] = useState<string | null>(null);

  async function sendTestEmail() {
    setTesting(true);
    const response = await fetch("/api/admin/email/test", { method: "POST" });
    setTesting(false);
    if (!response.ok) return toast.error("Unable to send test email");
    toast.success("Test email sent");
  }

  async function resend(id: string) {
    setResending(id);
    const response = await fetch("/api/admin/email/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setResending(null);
    if (!response.ok) return toast.error("Unable to resend email");
    toast.success("Email resent");
  }

  return (
    <div className="space-y-5 rounded-3xl border border-black/10 bg-white p-4 shadow-sm lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">Operations</p>
          <h2 className="mt-2 font-heading text-3xl">Email</h2>
        </div>
        <button onClick={sendTestEmail} className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white">
          {testing ? "Sending..." : "Send Test Email"}
        </button>
      </div>

      <div className="grid gap-4 lg:hidden">
        {logs.map((log) => (
          <div key={log.id} className="rounded-3xl border border-black/10 p-4">
            <p className="font-semibold">{log.subject}</p>
            <p className="mt-1 text-sm text-black/55">{log.toEmail}</p>
            <p className="mt-1 text-xs text-black/45">{log.status}</p>
            <p className="mt-1 text-xs text-black/45">{new Date(log.sentAt).toLocaleString()}</p>
            <button onClick={() => resend(log.id)} className="mt-4 w-full rounded-2xl border border-black px-3 py-3 text-sm font-semibold">
              {resending === log.id ? "Resending..." : "Resend"}
            </button>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-black/10 lg:block">
        <div className="max-h-[720px] overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 bg-white text-black/50">
              <tr>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Recipient</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Sent</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-black/5">
                  <td className="px-4 py-4 font-medium">{log.subject}</td>
                  <td className="px-4 py-4">{log.toEmail}</td>
                  <td className="px-4 py-4">{log.status}</td>
                  <td className="px-4 py-4">{new Date(log.sentAt).toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end">
                      <button onClick={() => resend(log.id)} className="rounded-full border border-black px-3 py-2 text-xs font-semibold">
                        {resending === log.id ? "Resending..." : "Resend"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
