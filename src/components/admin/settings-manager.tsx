"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { safeJsonParse } from "@/lib/utils";

type SettingsMap = Record<string, string>;

type EmailSettings = {
  host: string;
  port: string;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
};

type BusinessInfo = {
  contactPhone: string;
  contactEmail: string;
  shopAddress: string;
  whatsappNumber: string;
};

const defaultEmailSettings: EmailSettings = {
  host: "",
  port: "587",
  user: "",
  password: "",
  fromName: "Anmol Gadgets",
  fromEmail: ""
};

const defaultBusinessInfo: BusinessInfo = {
  contactPhone: "",
  contactEmail: "",
  shopAddress: "",
  whatsappNumber: ""
};

export function SettingsManager({ initialSettings }: { initialSettings: SettingsMap }) {
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(
    safeJsonParse(initialSettings.emailSettings, defaultEmailSettings)
  );
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(
    safeJsonParse(initialSettings.businessInfo, defaultBusinessInfo)
  );
  const [saving, setSaving] = useState(false);

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
        <h1 className="mt-2 font-heading text-3xl md:text-5xl">Business & Email</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl">Business Information</h2>
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
          </div>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl">Email Settings</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-black/60">SMTP Host</span>
              <input
                value={emailSettings.host}
                onChange={(e) => setEmailSettings({ ...emailSettings, host: e.target.value })}
                className="rounded-2xl border px-4 py-3"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-black/60">SMTP Port</span>
                <input
                  value={emailSettings.port}
                  onChange={(e) => setEmailSettings({ ...emailSettings, port: e.target.value })}
                  className="rounded-2xl border px-4 py-3"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-black/60">From Name</span>
                <input
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                  className="rounded-2xl border px-4 py-3"
                />
              </label>
            </div>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-black/60">SMTP User</span>
              <input
                value={emailSettings.user}
                onChange={(e) => setEmailSettings({ ...emailSettings, user: e.target.value })}
                className="rounded-2xl border px-4 py-3"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-black/60">SMTP Password</span>
              <input
                type="password"
                value={emailSettings.password}
                onChange={(e) => setEmailSettings({ ...emailSettings, password: e.target.value })}
                className="rounded-2xl border px-4 py-3"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-black/60">From Email</span>
              <input
                value={emailSettings.fromEmail}
                onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                className="rounded-2xl border px-4 py-3"
              />
            </label>
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="rounded-2xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-60">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
