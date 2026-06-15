import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM jenis_surat");
    return new Response(JSON.stringify(rows), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("ERROR GET jenis-surat:", err);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}