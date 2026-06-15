"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileCheck,
  Archive,
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
];

export default function PimpinanSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Persetujuan Surat hanya aktif di /pimpinan
    if (href === "/pimpinan") {
      return pathname === "/pimpinan";
    }

    // Arsip aktif untuk halaman arsip dan turunannya
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Surat Desa</h2>
        <span>Pimpinan Panel</span>
      </div>

      <nav className="sidebar-menu">
        {menus.map((menu) => {
          const Icon = menu.icon;

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