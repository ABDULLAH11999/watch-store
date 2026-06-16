"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquareText,
  Settings,
  Mail,
  Database,
  Search,
  Bell,
  Crown,
  ChevronRight,
  Grid2x2,
  ListOrdered,
  UserRound,
  SlidersHorizontal,
} from "lucide-react";
import { signOut } from "next-auth/react";

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const desktopSections: Array<{ title: string; links: NavLink[] }> = [
  {
    title: "Overview",
    links: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }]
  },
  {
    title: "Catalog",
    links: [
      { href: "/admin/products", label: "Manage Products", icon: Package },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareText }
    ]
  },
  {
    title: "Sales",
    links: [
      { href: "/admin/orders", label: "Manage Orders", icon: ShoppingCart },
      { href: "/admin/customers", label: "Manage Customers", icon: Users }
    ]
  },
  {
    title: "Configuration",
    links: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/seo", label: "SEO Settings", icon: Mail }
    ]
  },
  {
    title: "Messaging",
    links: [{ href: "/admin/email", label: "Email", icon: Mail }]
  },
  {
    title: "Operations",
    links: [{ href: "/admin/backup-db", label: "Backup DB", icon: Database }]
  }
];

const mobileNav: NavLink[] = [
  { href: "/admin/products", label: "Products", icon: Grid2x2 },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered },
  { href: "/admin/customers", label: "Customers", icon: UserRound },
  { href: "/admin/settings", label: "Settings", icon: SlidersHorizontal }
];

function getPageMeta(pathname: string | null) {
  if (pathname?.startsWith("/admin/products")) return { title: "Products", crumb: "Catalog / Products" };
  if (pathname?.startsWith("/admin/orders")) return { title: "Orders", crumb: "Sales / Orders" };
  if (pathname?.startsWith("/admin/customers")) return { title: "Customers", crumb: "CRM / Customers" };
  if (pathname?.startsWith("/admin/testimonials")) return { title: "Testimonials", crumb: "Content / Testimonials" };
  if (pathname?.startsWith("/admin/settings")) return { title: "Settings", crumb: "Configuration / Settings" };
  if (pathname?.startsWith("/admin/seo")) return { title: "SEO Settings", crumb: "Configuration / SEO" };
  if (pathname?.startsWith("/admin/email")) return { title: "Email", crumb: "Operations / Email" };
  if (pathname?.startsWith("/admin/backup-db")) return { title: "Backup DB", crumb: "Operations / Backup" };
  return { title: "Dashboard", crumb: "Overview / Dashboard" };
}

export function AdminShell({
  children,
  userEmail
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const pageMeta = useMemo(() => getPageMeta(pathname), [pathname]);

  return (
    <div className="min-h-screen bg-[#f3efe9] text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-white/10 bg-[#0f0f0f] text-white shadow-2xl lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold text-black">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <div className="font-heading text-2xl text-white">Anmol Gadgets</div>
              <div className="text-[11px] uppercase tracking-[0.35em] text-white/45">Admin Panel</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/55">
            Premium control center for products, orders, customers, SEO, and content.
          </p>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          {desktopSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="px-3 text-[11px] uppercase tracking-[0.35em] text-white/35">{section.title}</p>
              <div className="space-y-1">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm transition ${
                        active
                          ? "border-gold/40 bg-white/10 text-white"
                          : "border-transparent text-white/65 hover:border-white/10 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${active ? "text-gold" : "text-white/55 group-hover:text-gold"}`} />
                        {link.label}
                      </span>
                      <ChevronRight className={`h-4 w-4 ${active ? "text-gold" : "text-white/30"}`} />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/40">Signed in as</div>
            <div className="mt-1 truncate text-sm font-medium text-white">{userEmail}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="mt-4 w-full rounded-2xl bg-gold px-4 py-3 font-semibold text-black transition hover:bg-[#c89d35]"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <div className="sticky top-0 z-30 border-b border-black/10 bg-[#f3efe9]/90 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-4 lg:px-8">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] uppercase tracking-[0.35em] text-black/45">{pageMeta.crumb}</div>
              <div className="mt-1 truncate font-heading text-xl md:text-2xl">{pageMeta.title}</div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs font-semibold lg:hidden"
            >
              Sign Out
            </button>

            <div className="hidden flex-1 items-center gap-3 xl:flex">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                <Search className="h-4 w-4 text-black/35" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search admin data"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-black/35"
                />
              </div>
              <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </button>
              <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs font-semibold">
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <main className="px-4 py-5 pb-24 lg:px-8 lg:py-6 lg:pb-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-2 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                  active ? "bg-black text-white" : "text-black/55"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
