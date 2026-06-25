"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  LayoutDashboard,
  Mail,
  FilePlus2,
  Archive,
  Users,
  LogOut,
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
    title: "Manajemen Admin",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Logout",
    href: "#",
    icon: LogOut,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Surat Desa</h2>
        <span>Admin Panel</span>
      </div>

      <nav className="sidebar-menu">
        {menus.map((menu) => {
          const Icon = menu.icon;

          // ===== MENU LOGOUT =====
          if (menu.title === "Logout") {
            return (
              <button
                key={menu.title}
                onClick={handleLogout}
                className="menu-item"
                style={{
                  border: "none",
                  background: "transparent",
                  width: "100%",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Icon size={20} />
                <span>{menu.title}</span>
              </button>
            );
          }

          // ===== MENU BIASA =====
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`menu-item ${
                isActive(menu.href)
                  ? "active"
                  : ""
              }`}
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