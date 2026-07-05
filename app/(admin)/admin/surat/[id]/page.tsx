import { notFound } from "next/navigation";
import { getPengajuanDetail } from "@/lib/queries/getPengajuanDetail";
import DetailSuratClient from "./DetailSuratClient";

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

  if (!data) {
    notFound();
  }

  return (
    <DetailSuratClient
    pengajuan={data.pengajuan}
    detail={data.detail}
    dokumen={data.dokumen}
/>
  );
}