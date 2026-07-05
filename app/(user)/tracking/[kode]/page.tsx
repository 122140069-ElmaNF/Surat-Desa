import { redirect } from "next/navigation";

export default async function TrackingKodePage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;

  redirect(`/tracking?kode=${encodeURIComponent(kode)}`);
}
