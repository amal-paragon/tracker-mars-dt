import { NextResponse } from "next/server";
import { getSheetsClient, getSheetId } from "../../../lib/googleSheets";

// Kolom di tab "Budget Summary" (sesuai sheet asli):
// A=No, B=Title, C=Bulan, D=Tahun, E=MARS/PM, F=Budget, G=Total Used, H=Saldo

export async function GET() {
  try {
    const sheetId = getSheetId();
    const budgetTab = process.env.GOOGLE_BUDGET_TAB || "Budget Summary";
    const sheets = getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${budgetTab}'!B2:H`,
    });

    const rows = res.data.values || [];

    // Tabel budget utama ada di baris paling atas Budget Summary, diikuti baris
    // kosong, baru tabel-tabel rekap lain (per Bulan, per Category per Bulan).
    // Berhenti baca begitu ketemu baris pertama yang kolom Title-nya kosong,
    // biar tabel rekap di bawahnya gak ikut kebaca jadi "budget" palsu.
    const budgets = [];
    for (const r of rows) {
      if (!r[0]) break; // baris kosong = akhir tabel budget utama
      if (!r[3]) continue; // lewati baris tanpa kode MARS/PM
      budgets.push({
        title: r[0] || "",
        bulan: r[1] || "",
        tahun: r[2] || "",
        mars: r[3] || "",
        budget: Number(String(r[4] || "0").replace(/[^0-9.-]/g, "")) || 0,
        totalUsed: Number(String(r[5] || "0").replace(/[^0-9.-]/g, "")) || 0,
        saldo: Number(String(r[6] || "0").replace(/[^0-9.-]/g, "")) || 0,
      });
    }

    return NextResponse.json({ budgets });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Gagal ambil data budget" }, { status: 500 });
  }
}
