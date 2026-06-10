"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function AdminPreviewPage() {
	const [data, setData] = useState("");
	const [useKop, setUseKop] = useState(true);
	const [loading, setLoading] = useState<"acc" | "tolak" | null>(null);

	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const isPrint = searchParams?.get("print") !== null;
	const id = params.id;

	useEffect(() => {
		if (!id) return;

		fetch(`/api/generate/${id}`)
			.then((res) => res.json())
			.then((res) => {
				setData(res.hasil);
				setUseKop(res.use_kop);
			});
	}, [id]);

	const updatePersetujuan = async (action: "acc" | "tolak") => {
		const yakin =
			action === "acc"
				? confirm("ACC surat ini dan tampilkan tanda tangan?")
				: confirm("Tolak surat ini?");

		if (!yakin) {
			return;
		}

		setLoading(action);

		try {
			const res = await fetch(`/api/pimpinan/surat/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ action }),
			});

			if (!res.ok) {
				alert("Gagal memproses surat");
				return;
			}

			router.push("/admin");
			router.refresh();
		} catch (error) {
			console.error("ERROR PERSETUJUAN:", error);
			alert("Terjadi kesalahan");
		} finally {
			setLoading(null);
		}
	};

	return (
		<div
			style={{
				background: "#e5e7eb",
				minHeight: "100vh",
				padding: "32px",
			}}
		>
			<div
				style={{
					maxWidth: "800px",
					margin: "0 auto 18px",
					display: "flex",
					justifyContent: "space-between",
					gap: "10px",
					flexWrap: "wrap",
				}}
			>
				<button onClick={() => router.push("/admin")} style={outlineButtonStyle}>
					Kembali
				</button>

				{!isPrint ? (
					<div style={{ display: "flex", gap: "10px" }}>
						<button
							onClick={() => updatePersetujuan("acc")}
							disabled={loading !== null}
							style={{ ...actionButtonStyle, backgroundColor: "#16a34a" }}
						>
							{loading === "acc" ? "Memproses..." : "ACC"}
						</button>
						<button
							onClick={() => updatePersetujuan("tolak")}
							disabled={loading !== null}
							style={{ ...actionButtonStyle, backgroundColor: "#dc2626" }}
						>
							{loading === "tolak" ? "Memproses..." : "Tolak"}
						</button>
					</div>
				) : (
					<div style={{ display: "flex", gap: "10px" }}>
						<button
							onClick={() => {
								try {
									window.print();
								} catch (e) {
									console.error(e);
								}
							}}
							style={{ ...actionButtonStyle, backgroundColor: "#111827" }}
						>
							Print
						</button>
					</div>
				)}
			</div>

			<div
				style={{
					maxWidth: "800px",
					margin: "auto",
					background: "white",
					padding: "40px 60px",
					fontFamily: "Times New Roman, serif",
					lineHeight: "1.6",
					boxShadow: "0 0 10px rgba(0,0,0,0.1)",
				}}
			>
				{useKop && (
					<>
						<div style={{ display: "flex", alignItems: "center" }}>
							<img
								src="/logo.png"
								alt="logo"
								style={{ width: "80px", marginRight: "20px" }}
							/>

							<div style={{ textAlign: "center", flex: 1 }}>
								<div style={{ fontWeight: "bold", fontSize: "18px" }}>
									PEMERINTAH DESA SUMBEREJO
								</div>
								<div>Kecamatan Way Jepara</div>
								<div>Kabupaten Lampung Timur</div>
							</div>
						</div>

						<hr style={{ border: "2px solid black", margin: "10px 0 20px" }} />
					</>
				)}

				<div style={{ whiteSpace: "pre-line" }}>{data}</div>

				<div
					style={{
						marginTop: "50px",
						marginLeft: "auto",
						width: "260px",
						textAlign: "center",
					}}
				>
					<div>Kepala Desa</div>
					<div style={{ height: "70px" }} />
					<div style={{ fontWeight: "bold", textDecoration: "underline" }}>
						Nama Kepala Desa
					</div>
				</div>
			</div>
		</div>
	);
}

const outlineButtonStyle = {
	padding: "10px 14px",
	border: "1px solid #d1d5db",
	borderRadius: "6px",
	backgroundColor: "white",
	color: "#111827",
	cursor: "pointer",
	fontWeight: 700,
};

const actionButtonStyle = {
	padding: "10px 16px",
	border: "none",
	borderRadius: "6px",
	color: "white",
	cursor: "pointer",
	fontWeight: 700,
};

