"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  FilePlus2,
  Archive,
  LogIn,
} from "lucide-react";

const menus = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Surat Masuk",
    href: "/admin/surat",
    icon: Mail,
  },
  {
    title: "Buat Surat",
    href: "/admin/buat-surat",
    icon: FilePlus2,
  },
  {
    title: "Arsip Surat",
    href: "/admin/arsip",
    icon: Archive,
  },
  {
    title: "Login Admin",
    href: "/login-admin",
    icon: LogIn,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Surat Desa</h2>
        <span>Admin Panel</span>
      </div>

      <nav className="sidebar-menu">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const active =
            pathname === menu.href ||
            pathname.startsWith(menu.href + "/");

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`menu-item ${active ? "active" : ""}`}
            >
              <Icon size={20} />
              <span>{menu.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}