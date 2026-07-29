"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Mail,
  FilePlus2,
  Archive,
  Users,
  LogOut,
  TriangleAlert,
} from "lucide-react";

type Props = {
  isSuperAdmin: boolean;
};

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
];

export default function AdminSidebar({
  isSuperAdmin,
}: Props) {
  const pathname = usePathname();

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowLogoutModal(false);
      }
    }

    if (showLogoutModal) {
      window.addEventListener(
        "keydown",
        handleKey
      );
    }

    return () => {
      window.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, [showLogoutModal]);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const filteredMenus = menus.filter((menu) => {
    if (
      menu.href === "/admin/users" &&
      !isSuperAdmin
    ) {
      return false;
    }

    return true;
  });

  async function handleLogout() {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (!res.ok) {
        alert("Logout gagal.");
        return;
      }

      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <img
            src="/logoSurat.png"
            alt="Logo Surat Desa"
            className="sidebar-logo"
          />

          <h2>Surat Desa</h2>

          <p>Panel Admin</p>
        </div>

        {/* Menu */}
        <nav className="sidebar-menu">
          {filteredMenus.map((menu) => {
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

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            onClick={() =>
              setShowLogoutModal(true)
            }
            className="logout-menu"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Modal Logout */}
      {showLogoutModal && (
        <div
          className="logout-overlay"
          onClick={() =>
            setShowLogoutModal(false)
          }
        >
          <div
            className="logout-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="logout-icon">
              <TriangleAlert
                size={44}
                color="#f59e0b"
              />
            </div>

            <h2>Konfirmasi Logout</h2>

            <p>
              Apakah Anda yakin ingin keluar
              dari sistem?
            </p>

            <div className="logout-actions">
              <button
                className="btn-cancel"
                onClick={() =>
                  setShowLogoutModal(false)
                }
              >
                Batal
              </button>

              <button
                className="btn-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}