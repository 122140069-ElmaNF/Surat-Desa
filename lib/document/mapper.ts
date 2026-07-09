type Pengajuan = Record<string, any>;

type DetailItem = {
  key: string;
  value: any;
};

type Profil = {
  jabatan?: string;
  nama_kepala_desa?: string;
  tanda_tangan?: string;
};

export function mapDomisili(
  pengajuan: Pengajuan,
  detail: DetailItem[],
  profil: Profil
) {
  const get = (key: string) =>
    detail.find(
      (item) => item.key === key
    )?.value ?? "";

  return {
    nomorSurat:
      pengajuan.nomor_surat ?? "",

    nama: get("nama"),

    nik: get("nik"),

    ttl: get("ttl"),

    jenisKelamin:
      get("jenis_kelamin"),

    agama: get("agama"),

    pekerjaan:
      get("pekerjaan"),

    alamat:
      get("alamat"),

    tanggal:
      pengajuan.tanggal_surat ?? "",

    useKop: Boolean(
      pengajuan.use_kop
    ),

    profil: {
      jabatan:
        profil.jabatan ??
        "Kepala Desa",

      nama:
        profil.nama_kepala_desa ??
        "",

      tandaTangan:
        profil.tanda_tangan ??
        "",
    },

    showTtd:
      pengajuan.status ===
      "selesai",
  };
}