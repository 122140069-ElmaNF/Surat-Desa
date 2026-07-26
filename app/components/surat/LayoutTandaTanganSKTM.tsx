"use client";

import { ReactNode } from "react";

type Props = {
  kepalaDesa: ReactNode;
  tksk: ReactNode;
  camat: ReactNode;
};

export default function LayoutTandaTanganSKTM({
  kepalaDesa,
  tksk,
  camat,
}: Props) {
  return (
    <div
      style={{
        marginTop: "70px",
        width: "100%",
      }}
    >
      {/* ================= BARIS ATAS ================= */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                width: "50%",
                verticalAlign: "top",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                {kepalaDesa}
              </div>
            </td>

            <td
              style={{
                width: "50%",
                verticalAlign: "top",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                {tksk}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= BARIS BAWAH ================= */}
      <div
        style={{
          marginTop: "50px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {camat}
      </div>
    </div>
  );
}