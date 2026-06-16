"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquareText,
  Settings,
  Search,
  Bell,
  Crown,
  ChevronRight,
  Grid2x2,
  ListOrdered,
  UserRound,
  SlidersHorizontal
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

const mobileNav: NavLink[] = [
  { href: "/admin/orders", label: "Order", icon: ListOrdered },
  { href: "/admin/products", label: "Product", icon: Grid2x2 },
  { href: "/admin/testimonials", label: "Testimonial", icon: MessageSquareText },
  { href: "/admin/customers", label: "Customer", icon: UserRound },
  { href: "/admin/settings", label: "Settings", icon: SlidersHorizontal }
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
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
              <Crown className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-heading text-xl font-semibold leading-none">Anmol Gadgets</span>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.35em] text-black/55">Admin Panel</span>
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center gap-3 xl:flex">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-black/35" />
              <input placeholder="Search admin data" className="w-full bg-transparent text-sm outline-none placeholder:text-black/35" />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <Link
              href="/"
              target="_blank"
              className="rounded-2xl border border-black px-3 py-3 text-xs font-semibold text-black transition hover:bg-black hover:text-white sm:px-4"
            >
              View Website
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="rounded-2xl bg-black px-3 py-3 text-xs font-semibold text-white transition hover:bg-black/90 sm:px-4"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="fixed left-0 top-[73px] hidden h-[calc(100vh-73px)] w-72 flex-col border-r border-black/10 bg-black text-white lg:flex">
          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
            {sidebarItems.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm transition ${
                    active ? "border-white bg-white text-black" : "border-transparent text-white/70 hover:border-white/15 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${active ? "text-black" : "text-white/55"}`} />
                    {link.label}
                  </span>
                  <ChevronRight className={`h-4 w-4 ${active ? "text-black" : "text-white/25"}`} />
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[11px] uppercase tracking-[0.3em] text-white/40">Signed in as</div>
              <div className="mt-1 truncate text-sm font-medium text-white">{userEmail}</div>
            </div>
          </div>
        </aside>

        <div className="min-h-[calc(100vh-73px)] flex-1 lg:pl-72">
          <div className="border-b border-black/10 bg-white px-4 py-4 lg:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.35em] text-black/45">{pageMeta.crumb}</div>
                <div className="mt-1 truncate font-heading text-xl md:text-2xl">{pageMeta.title}</div>
              </div>
              <div className="hidden items-center gap-3 lg:flex">
                <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-black" />
                </button>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm text-black/60">{userEmail}</div>
              </div>
            </div>
          </div>

          <main className="px-4 py-5 pb-24 lg:px-6 lg:py-6 lg:pb-6">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white px-2 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="grid grid-cols-5 gap-2">
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
