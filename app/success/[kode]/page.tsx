import SuccessClient from "../SuccessClient";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;

  return <SuccessClient kode={kode} />;
}