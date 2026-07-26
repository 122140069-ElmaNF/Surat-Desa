import { notFound } from "next/navigation";
import getPengajuanEdit from "@/lib/queries/getPengajuanEdit";

import DomisiliForm from "@/app/components/surat/DomisiliForm";
import ListrikForm from "@/app/components/surat/ListrikForm";
import JalanForm from "@/app/components/surat/JalanForm";
import UsahaForm from "@/app/components/surat/UsahaForm";
import KebenaranDataForm from "@/app/components/surat/KebenaranDataForm";
import KematianForm from "@/app/components/surat/KematianForm";
import PenghasilanForm from "@/app/components/surat/PenghasilanForm";
import TafsiranHargaTanahForm from "@/app/components/surat/TafsiranHargaTanahForm";
import BedaNamaIdentitasForm from "@/app/components/surat/BedaNamaIdentitasForm";
import KehilanganForm from "@/app/components/surat/KehilanganForm";
import IzinKeramaianForm from "@/app/components/surat/IzinKeramaianForm";
import TidakMampuForm from "@/app/components/surat/TidakMampuForm";
import TidakBerlanggananAirForm from "@/app/components/surat/TidakBerlangganAirForm";

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

    case "SKJ":
      return (
        <JalanForm
          mode="edit"
          initialData={initialData}
        />
      );

    case "SKU":
    return (
      <UsahaForm
        mode="edit"
        initialData={data}
      />
    );

    case "SKKD":
    return (
      <KebenaranDataForm
        mode="edit"
        initialData={data}
      />
    );

    case "SKPHS":
    return (
      <PenghasilanForm
        mode="edit"
        initialData={data}
      />
    );

    case "SKM":
    return (
      <KematianForm
        mode="edit"
        initialData={data}
      />
    );

    case "STHT":
    return (
      <TafsiranHargaTanahForm
        mode="edit"
        initialData={data}
      />
    );

    case "SKBNI":
    return (
      <BedaNamaIdentitasForm
        mode="edit"
        initialData={data}
      />
    );

    case "SKH":
    return (
      <KehilanganForm
        mode="edit"
        initialData={data}
      />
    );
    
    case "SKIK":
    return (
      <IzinKeramaianForm
        mode="edit"
        initialData={data}
      />
    );

    case "SKTM":
    return (
      <TidakMampuForm
        mode="edit"
        initialData={data}
      />
    );

    case "SKTBAPT":
    return (
      <TidakBerlanggananAirForm
        mode="edit"
        initialData={data}
      />
    );

    default:
      notFound();
  }
}