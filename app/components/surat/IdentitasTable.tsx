import { ReactNode } from "react";

type Item = {
  label: string;
  value: ReactNode;
};

type Props = {
  items: Item[];
};

export default function IdentitasTable({
  items,
}: Props) {
  return (
    <table
      className="identitas-table"
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "12pt",
        marginBottom: "18pt",
        fontFamily: '"Times New Roman", serif',
        fontSize: "12pt",
      }}
    >
      <tbody>
        {items.map((item) => (
          <tr key={item.label}>
            {/* Label */}
            <td
              className="identitas-label"
              style={{
                width: "4.5cm",
                verticalAlign: "top",
                padding: 0,
              }}
            >
              {item.label}
            </td>

            {/* Titik dua */}
            <td
              className="identitas-titik"
              style={{
                width: "0.5cm",
                textAlign: "center",
                verticalAlign: "top",
                padding: 0,
              }}
            >
              :
            </td>

            {/* Value */}
            <td
              style={{
                verticalAlign: "top",
                padding: 0,
                textAlign: "justify",
              }}
            >
              {item.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}