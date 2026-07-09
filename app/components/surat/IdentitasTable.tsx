"use client";

type Item = {
  label: string;
  value: React.ReactNode;
};

type Props = {
  items: Item[];
};

export default function IdentitasTable({
  items,
}: Props) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: 16,
        marginBottom: 24,
        fontFamily: '"Times New Roman", serif',
        fontSize: "16px",
      }}
    >
      <tbody>
        {items.map((item) => (
          <tr
            key={item.label}
            style={{
              verticalAlign: "top",
            }}
          >
            <td
              style={{
                width: "180px",
                paddingBottom: "8px",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </td>

            <td
              style={{
                width: "15px",
                paddingBottom: "8px",
              }}
            >
              :
            </td>

            <td
              style={{
                paddingBottom: "8px",
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