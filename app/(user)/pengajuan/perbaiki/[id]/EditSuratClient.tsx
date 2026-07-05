"use client";

import { useRouter } from "next/navigation";

import DomisiliForm from "@/app/components/surat/DomisiliForm";

export default function EditDomisiliClient({
  initialData,
}: {
  initialData: any;
}) {
  const router = useRouter();

  async function handleEditSubmit(formData: FormData) {
    try {
      const res = await fetch(
        `/api/pengajuan/edit/${initialData.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      router.push(`/success/${initialData.kode_tracking}`);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  }

  return (
    <DomisiliForm
      mode="edit"
      role="user"
      initialData={initialData}
      onSubmit={handleEditSubmit}
    />
  );
}