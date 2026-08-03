"use client";

type Activity = {
  id: number;
  status: string;
  aktivitas: string;
  created_at: string;
  nama: string | null;
  role: string | null;
};

type Props = {
  activities: Activity[];
  showUserInfo?: boolean;
  showTitle?: boolean;
};

export default function ActivityTimeline({
  activities,
  showUserInfo = false,
  showTitle = true,
}: Props) {
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(new Date(date));
  };

  const getColor = (
    status: string,
    aktivitas: string
  ) => {
    const text = aktivitas.toLowerCase();

    if (text.includes("berhasil dikirim"))
      return "#22c55e";

    if (text.includes("perbaikan"))
      return "#3b82f6";

    switch (status) {
      case "pending":
        return "#f59e0b";

      case "menunggu_persetujuan":
        return "#fb923c";

      case "selesai":
        return "#22c55e";

      case "ditolak":
        return "#ef4444";

      default:
        return "#9ca3af";
    }
  };

  return (
    <div className="activity-timeline">
      {showTitle && (
        <h3
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          Riwayat Aktivitas
        </h3>
      )}

      {activities.map((item, index) => {
        const color = getColor(
          item.status,
          item.aktivitas
        );

        return (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: 16,
              position: "relative",
              paddingBottom: 24,
            }}
          >
            {/* Timeline */}
            <div
              style={{
                width: 28,
                display: "flex",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: color,
                  marginTop: 6,
                  zIndex: 2,
                }}
              />

              {index !== activities.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    width: 2,
                    bottom: -8,
                    background: "#d1d5db",
                  }}
                />
              )}
            </div>

            {/* Card */}
            <div
              style={{
                flex: 1,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                boxShadow:
                  "0 1px 3px rgba(0,0,0,.06)",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: 8,
                  lineHeight: 1.5,
                }}
              >
                {item.aktivitas}
              </div>

              {showUserInfo &&
                item.nama && (
                  <div
                    style={{
                      color: "#4b5563",
                      fontSize: 14,
                      marginBottom: 10,
                    }}
                  >
                    {item.nama}
                    {item.role &&
                      ` • ${item.role}`}
                  </div>
                )}

              <div
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                🕒{" "}
                {formatDate(
                  item.created_at
                )}{" "}
                WIB
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}