"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  id: number;
};

export default function DeleteUserButton({ id }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(
      "Yakin ingin menghapus admin ini?"
    );

    if (!ok) return;

    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/users/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Admin berhasil dihapus.");

        router.refresh();
      } else {
        toast.error("Gagal menghapus.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className="btn btn-danger btn-sm"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "Menghapus..." : "Hapus"}
    </button>
  );
}