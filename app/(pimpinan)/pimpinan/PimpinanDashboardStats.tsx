type Props = {
  data: {
    totalMenunggu: number;
  };
};

export default function PimpinanDashboardStats({
  data,
}: Props) {
  return (
    <div className="dashboard-card-row">
      <div className="stat-card dashboard-small-card">
        <div className="stat-label">
          Menunggu Persetujuan
        </div>

        <div className="stat-value">
          {data.totalMenunggu}
        </div>
      </div>
    </div>
  );
}