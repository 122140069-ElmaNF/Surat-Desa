import {
  Mail,
  CalendarDays,
  Clock3,
  CircleCheckBig,
} from "lucide-react";

type Props = {
  data: {
    total_surat: number;
    surat_hari_ini: number;
    pending: number;
    selesai: number;
  };
};

export default function AdminDashboardStats({
  data,
}: Props) {
  return (
    <div className="stat-grid">
      <div className="stat-card">
        <div className="stat-top">
          <div>
            <div className="stat-label">
              Total Surat Masuk
            </div>

            <div className="stat-value">
              {data.total_surat}
            </div>
          </div>

          <div className="stat-icon blue">
            <Mail size={28} />
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-top">
          <div>
            <div className="stat-label">
              Surat Hari Ini
            </div>

            <div className="stat-value">
              {data.surat_hari_ini}
            </div>
          </div>

          <div className="stat-icon cyan">
            <CalendarDays size={28} />
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-top">
          <div>
            <div className="stat-label">
              Pending
            </div>

            <div className="stat-value">
              {data.pending}
            </div>
          </div>

          <div className="stat-icon orange">
            <Clock3 size={28} />
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-top">
          <div>
            <div className="stat-label">
              Selesai
            </div>

            <div className="stat-value">
              {data.selesai}
            </div>
          </div>

          <div className="stat-icon green">
            <CircleCheckBig size={28} />
          </div>
        </div>
      </div>
    </div>
  );
}