"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type SettingsMap = Record<string, string>;

const defaultSettings = {
  siteTitle: "Anmol Gadgets",
  titleTemplate: "%s | Anmol Gadgets",
  metaDescription: "",
  canonicalUrl: "",
  metaKeywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  headerScripts: "",
  footerScripts: "",
  robotsTxt: "",
  emailSettings: JSON.stringify(
    {
      host: "",
      port: "587",
      user: "",
      password: "",
      fromName: "Anmol Gadgets",
      fromEmail: ""
    },
    null,
    2
  ),
  businessInfo: JSON.stringify(
    {
      contactPhone: "",
      contactEmail: "",
      shopAddress: "",
      whatsappNumber: ""
    },
    null,
    2
  )
};

export function SettingsManager({ initialSettings }: { initialSettings: SettingsMap }) {
  const [settings, setSettings] = useState({ ...defaultSettings, ...initialSettings });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: settings })
    });
    setSaving(false);
    if (!response.ok) return toast.error("Unable to save settings");
    toast.success("Settings saved");
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-3xl">Business & Email Settings</h2>
      <div className="mt-6 grid gap-4">
        {Object.entries(settings).map(([key, value]) => (
          <label key={key} className="space-y-2">
            <span className="block text-sm font-medium capitalize text-black/60">{key}</span>
            {key.includes("Scripts") || key.endsWith("Txt") || key.includes("Description") || key.includes("Keywords") || key.includes("Info") || key.includes("Settings") ? (
              <textarea
                value={value}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                rows={key.includes("Scripts") || key.includes("Settings") || key.includes("Info") ? 6 : 3}
                className="w-full rounded-2xl border px-4 py-3 font-mono text-sm"
              />
            ) : (
              <input
                value={value}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                className="w-full rounded-2xl border px-4 py-3"
              />
            )}
          </label>
        ))}
        <button onClick={save} className="rounded-2xl bg-gold px-4 py-3 font-semibold text-black">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
