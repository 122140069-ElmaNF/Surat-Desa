"use client";

import { ReactNode } from "react";
import KopSurat from "./KopSurat";

type Props = {
  children: ReactNode;
  useKop?: boolean;
};

export default function SuratCanvas({
  children,
  useKop = true,
}: Props) {
  return (
    <>
      {useKop && <KopSurat />}

      {children}
    </>
  );
}