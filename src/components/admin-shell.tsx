"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ListOrdered,
  Package,
  Settings,
  ShoppingCart,
  Users,
  MessageSquareText,
  ChevronRight,
  PanelLeft,
  PanelTop,
  LogOut,
  ArrowUpRight
} from "lucide-react";
import { signOut } from "next-auth/react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const sidebarItems: NavLink[] = [
  { href: "/admin/orders", label: "Order", icon: ShoppingCart },
  { href: "/admin/products", label: "Product", icon: Package },
  { href: "/admin/testimonials", label: "Testimonial", icon: MessageSquareText },
  { href: "/admin/customers", label: "Customer", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

const bottomTabs: NavLink[] = [
  { href: "/admin/orders", label: "Order", icon: ListOrdered },
  { href: "/admin/products", label: "Product", icon: PanelLeft },
  { href: "/admin/testimonials", label: "Testimonial", icon: MessageSquareText },
  { href: "/admin/customers", label: "Customer", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: PanelTop }
];

function getPageMeta(pathname: string | null) {
  if (pathname?.startsWith("/admin/products/new")) return { title: "Create Product", crumb: "Products / Create" };
  if (pathname?.startsWith("/admin/products/")) return { title: "Edit Product", crumb: "Products / Edit" };
  if (pathname?.startsWith("/admin/products")) return { title: "Products", crumb: "Catalog / Products" };
  if (pathname?.startsWith("/admin/orders")) return { title: "Orders", crumb: "Sales / Orders" };
  if (pathname?.startsWith("/admin/customers")) return { title: "Customers", crumb: "CRM / Customers" };
  if (pathname?.startsWith("/admin/testimonials")) return { title: "Testimonials", crumb: "Content / Testimonials" };
  if (pathname?.startsWith("/admin/settings")) return { title: "Settings", crumb: "Configuration / Settings" };
  return { title: "Dashboard", crumb: "Overview / Dashboard" };
}

function isActive(pathname: string | null, href: string) {
  return pathname === href || pathname?.startsWith(`${href}/`);
}

export function AdminShell({
  children,
  userEmail
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const pageMeta = useMemo(() => getPageMeta(pathname), [pathname]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white text-black">
      <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden min-h-screen border-r border-black/10 bg-white lg:flex lg:flex-col">
          <div className="border-b border-black/10 px-6 py-5">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/ui-image/Logo.png"
                alt="Anmol Gadgets logo"
                width={60}
                height={60}
                className="h-11 w-11 shrink-0 object-contain"
                priority
              />
              <span>
                <span className="block font-heading text-xl font-semibold leading-none">Anmol Gadgets</span>
                <span className="mt-1 block text-[11px] uppercase tracking-[0.35em] text-black/45">Admin Panel</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-medium transition ${
                    active ? "border-black bg-black text-white shadow-sm" : "border-black/10 bg-white text-black hover:border-black hover:bg-black hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-black/10 p-5">
            <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.3em] text-black/45">Signed in as</div>
              <div className="mt-1 truncate text-sm font-semibold">{userEmail}</div>
              <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-black/45">
                <span>Quick Actions</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 overflow-x-hidden">
          <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:px-6 lg:py-4">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <Link href="/admin" className="flex items-center gap-3 lg:hidden">
                  <Image
                    src="/ui-image/Logo.png"
                    alt="Anmol Gadgets logo"
                    width={48}
                    height={48}
                    className="h-9 w-9 shrink-0 object-contain"
                    priority
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-heading text-base font-semibold leading-none sm:text-lg">Anmol Gadgets</span>
                    <span className="mt-1 block text-[9px] uppercase tracking-[0.28em] text-black/45">Admin</span>
                  </span>
                </Link>

                <div className="hidden min-w-0 lg:block">
                  <div className="text-[11px] uppercase tracking-[0.35em] text-black/45">{pageMeta.crumb}</div>
                  <div className="mt-1 truncate font-heading text-2xl leading-none">{pageMeta.title}</div>
                </div>
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <Link
                  href="/"
                  target="_blank"
                  className="rounded-2xl border border-black px-4 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
                >
                  View Website
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/90"
                >
                  Logout
                </button>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <Link
                  href="/"
                  target="_blank"
                  className="rounded-2xl border border-black px-3 py-2 text-[11px] font-semibold text-black"
                >
                  Visit
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="rounded-2xl bg-black px-3 py-2 text-[11px] font-semibold text-white"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="border-t border-black/10 px-3 py-2 lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-black/45">{pageMeta.crumb}</div>
                  <div className="mt-1 truncate font-heading text-lg">{pageMeta.title}</div>
                </div>
                <button className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold text-black/60">
                  {userEmail?.split("@")[0] || "Admin"}
                </button>
              </div>
            </div>
          </header>

          <main className="px-3 py-4 pb-28 overflow-x-hidden sm:px-4 lg:px-6 lg:py-6 lg:pb-6">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white px-1 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {bottomTabs.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`min-w-0 flex flex-col items-center justify-center rounded-2xl px-1 py-2 text-[9px] font-semibold transition ${
                  active ? "bg-black text-white shadow-sm" : "text-black/55"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="mt-1 truncate text-center leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
