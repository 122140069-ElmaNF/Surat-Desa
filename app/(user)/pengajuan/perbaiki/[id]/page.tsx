import { notFound } from "next/navigation";
import getPengajuanEdit from "@/lib/queries/getPengajuanEdit";
import DomisiliForm from "@/app/components/surat/DomisiliForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PerbaikiPengajuanPage({
  params,
}: Props) {
  const { id } = await params;

  const data = await getPengajuanEdit(id);

  if (!data) {
    notFound();
  }

  switch (data.kodeSurat) {
    case "SD":
      return (
        <DomisiliForm
          mode="edit"
          initialData={{
            ...data.detail,
            ...data.pengajuan,
            dokumen: data.dokumen,
          }}
        />
      );

    default:
      notFound();
  }
}