"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAdminPage() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] =
useState(false);

async function handleSubmit() {

    if (
        !nama ||
        !username ||
        !password
    ) {
        alert("Semua field harus diisi.");
        return;
    }

    try{

        setLoading(true);

        const res = await fetch(
            "/api/admin/users",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json",
                },

                body:JSON.stringify({
                    nama,
                    username,
                    password,
                    role,
                }),
            }
        );

        const result =
        await res.json();

        if(result.success){

            alert("Admin berhasil ditambahkan.");

            router.push("/admin/users");

            router.refresh();

        }else{

            alert(result.message);

        }

    }catch(error){

        console.error(error);

        alert("Terjadi kesalahan.");

    }finally{

        setLoading(false);

    }

}

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Tambah Admin
          </h1>

          <p className="page-subtitle">
            Tambahkan akun Admin atau Pimpinan
          </p>
        </div>
      </div>

      <section className="card">

        <div className="admin-form">

          <div className="admin-form-group">
            <label>Nama Lengkap</label>

            <input
              type="text"
              value={nama}
              onChange={(e) =>
                setNama(e.target.value)
              }
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div className="admin-form-group">
            <label>Username</label>

            <input
                type="text"
                value={username}
                onChange={(e) =>
                    setUsername(e.target.value)
                }
                placeholder="Masukkan username"
                />
          </div>

          <div className="admin-form-group">
            <label>Password</label>

            <input
                type="password"
                value={password}
                onChange={(e) =>
                    setPassword(e.target.value)
                }
                placeholder="Masukkan password"
                />
          </div>

          <div className="admin-form-group">
            <label>Role</label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="admin">
                Admin
              </option>

              <option value="pimpinan">
                Pimpinan
              </option>
            </select>
          </div>

        </div>

        <div className="form-action">

          <button
            className="secondary-btn"
            onClick={() =>
              router.back()
            }
          >
            Batal
          </button>

          <button
            className="primary-btn"
            onClick={handleSubmit}
            disabled={loading}
        >
            {loading ? "Menyimpan..." : "Simpan"}
        </button>

        </div>

      </section>
    </div>
  );
}