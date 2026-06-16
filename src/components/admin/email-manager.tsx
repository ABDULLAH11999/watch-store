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
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-3xl">Email</h2>
        <button onClick={sendTestEmail} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
          {testing ? "Sending..." : "Send Test Email"}
        </button>
      </div>
      <div className="overflow-hidden rounded-3xl border border-black/10">
        <div className="max-h-[720px] overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 bg-[#faf7f2] text-black/50">
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
                      <button onClick={() => resend(log.id)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold">
                        {resending === log.id ? "Resending..." : "Resend"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-black/50">
                    No email logs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
