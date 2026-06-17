"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { safeJsonParse } from "@/lib/utils";

type SettingsMap = Record<string, string>;

type EmailSettings = {
  fromName: string;
  fromEmail: string;
  adminMail: string;
};

type BusinessInfo = {
  contactPhone: string;
  contactEmail: string;
  shopAddress: string;
  whatsappNumber: string;
  instagramLink: string;
};

const defaultEmailSettings: EmailSettings = {
  fromName: "Anmol Gadgets",
  fromEmail: "",
  adminMail: ""
};

const defaultBusinessInfo: BusinessInfo = {
  contactPhone: "",
  contactEmail: "",
  shopAddress: "",
  whatsappNumber: "",
  instagramLink: ""
};

export function SettingsManager({ initialSettings }: { initialSettings: SettingsMap }) {
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(
    safeJsonParse(initialSettings.emailSettings, defaultEmailSettings)
  );
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(
    safeJsonParse(initialSettings.businessInfo, defaultBusinessInfo)
  );
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  async function downloadBackup() {
    setBackingUp(true);
    const response = await fetch("/api/admin/backup-db");
    setBackingUp(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast.error(data.error || "Unable to download backup");
      return;
    }

    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="([^"]+)"/i);
    const filename = match?.[1] || "anmol-gadgets-backup.json";
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

  async function save() {
    setSaving(true);
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        values: {
          emailSettings: JSON.stringify(emailSettings, null, 2),
          businessInfo: JSON.stringify(businessInfo, null, 2)
        }
      })
    });
    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast.error(data.error || "Unable to save settings");
      return;
    }
    toast.success("Settings saved");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">Settings</p>
        <h1 className="mt-2 font-heading text-2xl md:text-5xl">Business & Email</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-heading text-xl sm:text-2xl">Business Information</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-black/60">Contact Phone</span>
              <input
                value={businessInfo.contactPhone}
                onChange={(e) => setBusinessInfo({ ...businessInfo, contactPhone: e.target.value })}
                className="rounded-2xl border px-4 py-3"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-black/60">Contact Email</span>
              <input
                value={businessInfo.contactEmail}
                onChange={(e) => setBusinessInfo({ ...businessInfo, contactEmail: e.target.value })}
                className="rounded-2xl border px-4 py-3"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-black/60">Shop Address</span>
              <textarea
                value={businessInfo.shopAddress}
                onChange={(e) => setBusinessInfo({ ...businessInfo, shopAddress: e.target.value })}
                rows={4}
                className="rounded-2xl border px-4 py-3"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-black/60">WhatsApp Number</span>
              <input
                value={businessInfo.whatsappNumber}
                onChange={(e) => setBusinessInfo({ ...businessInfo, whatsappNumber: e.target.value })}
                className="rounded-2xl border px-4 py-3"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-black/60">Instagram Link</span>
              <input
                value={businessInfo.instagramLink}
                onChange={(e) => setBusinessInfo({ ...businessInfo, instagramLink: e.target.value })}
                placeholder="https://instagram.com/yourprofile"
                className="rounded-2xl border px-4 py-3"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-heading text-xl sm:text-2xl">Resend Settings</h2>
          <p className="mt-1 text-sm text-black/50">Resend API key stays in env. Configure sender name, sender email, and the admin inbox here.</p>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-black/60">From Name</span>
              <input value={emailSettings.fromName} onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })} className="rounded-2xl border px-4 py-3" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-black/60">From Email</span>
              <input value={emailSettings.fromEmail} onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })} className="rounded-2xl border px-4 py-3" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-black/60">Admin Notification Email</span>
              <input value={emailSettings.adminMail} onChange={(e) => setEmailSettings({ ...emailSettings, adminMail: e.target.value })} className="rounded-2xl border px-4 py-3" />
            </label>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="font-heading text-xl sm:text-2xl">Database Backup</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-black/50">
          Download a full backup of all site data including products, orders, customers, testimonials, settings, email logs, admin users, and sequence data.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={downloadBackup}
            disabled={backingUp}
            className="rounded-2xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {backingUp ? "Preparing Backup..." : "Backup DB"}
          </button>
          <a href="/admin/backup-db" className="rounded-2xl border border-black/10 px-6 py-3 font-semibold">
            Open Backup Page
          </a>
        </div>
      </section>

      <div className="flex justify-stretch sm:justify-end">
        <button onClick={save} disabled={saving} className="rounded-2xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-60">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
