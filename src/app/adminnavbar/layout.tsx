"use client";

import React, { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LayoutDashboard, UserCheck, MapPin, Bus, Compass, Users, BookOpen, BarChart3, MessageSquare, LogOut, UserCircle, X } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const navItems = [
  { label: "Dashboard", path: "/admindashboard", icon: LayoutDashboard },
  { label: "Conductors", path: "/conductor", icon: UserCheck },
  { label: "Stands", path: "/busstand", icon: MapPin },
  { label: "Bus", path: "/bus", icon: Bus },
  { label: "Routes", path: "/routes", icon: Compass },
  { label: "Users", path: "/users", icon: Users },
  { label: "Booking", path: "/booking", icon: BookOpen },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Feedback", path: "/feedback", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthGuard();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const avatar = user?.coverImage || "/images/defaultimage.jpg";

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    setMenuOpen(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center border-b border-black/10 bg-[#212153] px-4 md:left-[260px]">
        <button className="mr-3 text-[#E3E3E3] md:hidden" onClick={() => setMobileOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1" />
        <div className="relative">
          <button className="h-9 w-9 overflow-hidden rounded-full border border-white/20" onClick={() => setMenuOpen((v) => !v)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt={user?.name || "avatar"} className="h-full w-full object-cover" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-[#e3e3e3] bg-[#212153] p-2 text-[#E3E3E3] shadow-xl">
              <div className="px-2 py-2">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm opacity-80">{user?.email}</p>
              </div>
              <button onClick={() => router.push("/editprofile")} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-white/10">
                <UserCircle className="h-4 w-4" /> Edit Profile
              </button>
              <button onClick={handleLogout} className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-white/10">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#212153] text-[#e3e3e3] transition-transform md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image src="/images/gsrtclogo.png" width={40} height={40} alt="GSRTC logo" />
            <span className="text-xl font-bold">GSRTC</span>
          </div>
          <button className="md:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1 px-3 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${active ? "bg-white/15 text-white" : "text-[#e3e3e3]/80 hover:bg-white/10 hover:text-white"}`}>
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="pt-16 md:ml-[260px]">{children}</main>
    </div>
  );
}
