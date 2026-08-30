"use client";

import { ReactNode, Children } from "react";

type Props = {
  columns: 1 | 2 | 3;
  children: ReactNode;
};

export default function LayoutTandaTangan({
  columns,
  children,
}: Props) {
  const items = Children.toArray(children);

// =========================
// 1 KOLOM
// =========================
if (columns === 1) {
  return (
    <table
      style={{
        width: "100%",
        marginTop: "10px",
        borderCollapse: "collapse",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      <tbody>
        <tr>
          <td style={{ width: "65%" }} />

          <td
            style={{
              width: "35%",
              verticalAlign: "top",
            }}
          >
            {items[0]}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
  // =========================
  // 2 KOLOM
  // =========================
  if (columns === 2) {
    return (
      <table
        style={{
          width: "100%",
          marginTop: "10px",
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
                {items[0]}
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
                {items[1]}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  // =========================
  // 3 KOLOM
  // =========================
  return (
    <table
      style={{
        width: "100%",
        marginTop: "10px",
        borderCollapse: "collapse",
      }}
    >
      <tbody>
        <tr>
          <td
            style={{
              width: "33.33%",
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
              {items[0]}
            </div>
          </td>

          <td
            style={{
              width: "33.33%",
              verticalAlign: "top",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-block",
                textAlign: "center",
              }}
            >
              {items[1]}
            </div>
          </td>

          <td
            style={{
              width: "33.33%",
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
              {items[2]}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}