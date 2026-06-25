"use client";

import { useRouter } from "next/navigation";

type Props = {
  id: number;
};

export default function DeleteUserButton({
  id,
}: Props) {
  const router = useRouter();

  async function handleDelete() {

    const ok = confirm(
      "Yakin ingin menghapus admin ini?"
    );

    if (!ok) return;

    const res = await fetch(
      `/api/admin/users/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (data.success) {

      alert("Admin berhasil dihapus.");

      router.refresh();

    } else {

      alert("Gagal menghapus.");

    }
  }

  return (
    <button
      className="delete-btn"
      onClick={handleDelete}
    >
      Hapus
    </button>
  );
}