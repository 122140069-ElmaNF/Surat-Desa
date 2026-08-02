import { notFound } from "next/navigation";
import { getPengajuanDetail } from "@/lib/queries/getPengajuanDetail";
import DetailSuratClient from "./DetailSuratClient";
import { getActivityLogs } from "@/lib/queries/getActivityLogs";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminDetailSuratPage({
  params,
}: PageProps) {
  const { id } = await params;

  const data = await getPengajuanDetail(id);

  const activity = await getActivityLogs(id);

  if (!data) {
    notFound();
  }

  return (
    <DetailSuratClient
    pengajuan={data.pengajuan}
    detail={data.detail}
    dokumen={data.dokumen}
    activities={activity}
/>
  );
}