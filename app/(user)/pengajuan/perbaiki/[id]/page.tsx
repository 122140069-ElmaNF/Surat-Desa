import { notFound } from "next/navigation";
import getPengajuanEdit from "@/lib/queries/getPengajuanEdit";

import DomisiliForm from "@/app/components/surat/DomisiliForm";
import ListrikForm from "@/app/components/surat/ListrikForm";

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

  const initialData = {
    ...data.detail,
    ...data.pengajuan,
    dokumen: data.dokumen,
  };

  switch (data.kodeSurat) {
    case "SD":
      return (
        <DomisiliForm
          mode="edit"
          initialData={initialData}
        />
      );

    case "SKL":
      return (
        <ListrikForm
          mode="edit"
          initialData={initialData}
        />
      );

    default:
      notFound();
  }
}