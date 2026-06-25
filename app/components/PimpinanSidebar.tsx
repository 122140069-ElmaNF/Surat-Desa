"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  FileCheck,
  Archive,
  UserCog,
  LogOut,
} from "lucide-react";

const menus = [
  {
    title: "Persetujuan Surat",
    href: "/pimpinan",
    icon: FileCheck,
  },
  {
    title: "Arsip Surat",
    href: "/pimpinan/arsip",
    icon: Archive,
  },
  {
    title: "Profil Pimpinan",
    href: "/pimpinan/profil",
    icon: UserCog,
  },
  {
    title: "Logout",
    href: "#",
    icon: LogOut,
  },
];

export default function PimpinanSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/pimpinan") {
      return pathname === "/pimpinan";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Logout gagal.");
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Surat Desa</h2>
        <span>Pimpinan Panel</span>
      </div>

      <nav className="sidebar-menu">
        {menus.map((menu) => {
          const Icon = menu.icon;

          // Menu Logout
          if (menu.title === "Logout") {
            return (
              <button
                key={menu.title}
                onClick={handleLogout}
                className="menu-item"
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <Icon size={20} />
                <span>{menu.title}</span>
              </button>
            );
          }

          // Menu biasa
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