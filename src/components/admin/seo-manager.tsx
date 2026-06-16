"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type SeoMap = Record<string, string>;

const defaultSeo = {
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
  robotsTxt: ""
};

const fields = [
  { key: "siteTitle", label: "Site Title" },
  { key: "titleTemplate", label: "Title Template" },
  { key: "metaDescription", label: "Meta Description" },
  { key: "canonicalUrl", label: "Canonical URL" },
  { key: "metaKeywords", label: "Meta Keywords" },
  { key: "ogTitle", label: "OG Title" },
  { key: "ogDescription", label: "OG Description" },
  { key: "ogImage", label: "OG Image" },
  { key: "headerScripts", label: "Header Scripts" },
  { key: "footerScripts", label: "Footer Scripts" },
  { key: "robotsTxt", label: "Robots.txt" }
] as const;

export function SeoManager({ initialSettings }: { initialSettings: SeoMap }) {
  const [settings, setSettings] = useState({ ...defaultSeo, ...initialSettings });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: settings })
    });
    setSaving(false);
    if (!response.ok) return toast.error("Unable to save SEO settings");
    toast.success("SEO settings saved");
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-black/45">SEO Settings</p>
          <h2 className="mt-2 font-heading text-3xl">Search & Social Meta</h2>
        </div>
        <button onClick={save} className="rounded-full bg-black px-4 py-3 text-sm font-semibold text-white">
          {saving ? "Saving..." : "Save SEO"}
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const value = settings[field.key];
          const isTextarea = ["metaDescription", "metaKeywords", "ogDescription", "headerScripts", "footerScripts", "robotsTxt"].includes(field.key);
          return (
            <label key={field.key} className={field.key === "robotsTxt" || field.key.includes("Scripts") ? "md:col-span-2" : ""}>
              <span className="mb-2 block text-sm font-medium text-black/60">{field.label}</span>
              {isTextarea ? (
                <textarea
                  value={value}
                  onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                  rows={field.key === "headerScripts" || field.key === "footerScripts" || field.key === "robotsTxt" ? 6 : 4}
                  className="w-full rounded-2xl border px-4 py-3 font-mono text-sm"
                />
              ) : (
                <input
                  value={value}
                  onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                  className="w-full rounded-2xl border px-4 py-3"
                />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
