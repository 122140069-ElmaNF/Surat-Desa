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

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Surat Desa</h2>
        <span>Pimpinan Panel</span>
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