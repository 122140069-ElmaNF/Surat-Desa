"use client";

type Activity = {
  id: number;
  status: string;
  aktivitas: string;
  created_at: string;
  nama: string | null;
  role: string |null;
};

type Props = {
  activities: Activity[];
  showUserInfo?: boolean;
};

export default function ActivityTimeline({
  activities,
  showUserInfo = false,
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

  const getIcon = (
    status: string,
    aktivitas: string
  ) => {
    const text = aktivitas.toLowerCase();

    // Pengajuan awal
    if (
      text.includes("berhasil dikirim")
    ) {
      return "🟢";
    }

    // Perbaikan pengajuan
    if (
      text.includes("perbaikan")
    ) {
      return "🔵";
    }

    switch (status) {
      case "pending":
        return "🟡";

      case "menunggu_persetujuan":
        return "🟠";

      case "selesai":
        return "✅";

      case "ditolak":
        return "🔴";

      default:
        return "⚪";
    }
  };

  return (
    <div className="activity-timeline">
      <h3 className="timeline-heading">
        Riwayat Aktivitas
      </h3>

      {activities.map((item, index) => (
        <div
          key={item.id}
          className="timeline-item"
        >
          <div className="timeline-icon">
            {getIcon(
              item.status,
              item.aktivitas
            )}
          </div>

          <div className="timeline-content">
            <div className="timeline-title">
              {item.aktivitas}
            </div>

            {showUserInfo &&
              item.nama && (
                <div className="timeline-user">
                  {item.nama}
                  {item.role &&
                    ` • ${item.role}`}
                </div>
              )}

            <div className="timeline-date">
              {formatDate(item.created_at)} WIB
            </div>
          </div>

          {index !==
            activities.length - 1 && (
            <div className="timeline-line" />
          )}
        </div>
      ))}
    </div>
  );
}