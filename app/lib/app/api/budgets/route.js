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

    const budgets = rows
      .filter((r) => r[3] /* kode MARS/PM wajib ada */)
      .map((r) => ({
        title: r[0] || "",
        bulan: r[1] || "",
        tahun: r[2] || "",
        mars: r[3] || "",
        budget: Number(String(r[4] || "0").replace(/[^0-9.-]/g, "")) || 0,
        totalUsed: Number(String(r[5] || "0").replace(/[^0-9.-]/g, "")) || 0,
        saldo: Number(String(r[6] || "0").replace(/[^0-9.-]/g, "")) || 0,
      }));

    return NextResponse.json({ budgets });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Gagal ambil data budget" }, { status: 500 });
  }
}
