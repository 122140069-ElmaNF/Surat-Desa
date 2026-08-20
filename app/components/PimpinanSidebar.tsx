"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  usePathname,
} from "next/navigation";
import { useEffect, useState } from "react";

import {
  FileCheck,
  Archive,
  UserCog,
  LogOut,
  TriangleAlert,
  Landmark,
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
];

export default function PimpinanSidebar() {
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
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (!res.ok) {
        toast.error("Logout gagal.");
        return;
      }

      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan.");
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

          <p>Panel Pimpinan</p>

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