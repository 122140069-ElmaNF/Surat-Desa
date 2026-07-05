"use client";

import { useRouter } from "next/navigation";
import DomisiliForm from "@/app/components/surat/DomisiliForm";

export default function DomisiliPage() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    try {
      const res = await fetch("/api/pengajuan/domisili", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message ?? "Pengajuan gagal");
      }

      router.push(`/success/${result.kode_tracking}`);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan server.");
    }
  }

  return (
    <DomisiliForm
      mode="create"
      role="user"
      onSubmit={handleSubmit}
    />
  );
}