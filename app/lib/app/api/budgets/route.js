import { NextResponse } from "next/server";
import { getSheetsClient, getSheetId } from "../../../lib/googleSheets";

// Kolom di sheet "Project Tracker" HARUS urut seperti ini (A sampai O):
// Admin PIC | Nama User | Nama Vendor | Nama Project | Category | Status Invoice |
// Nominal | Tax | MARS/PM | Bulan | Tahun | Link Bukti Pekerjaan |
// Tanggal Payment (Exp) | Status Payment | No Invoice/PO

export async function POST(req) {
  try {
    const body = await req.json();

    const required = ["adminPIC", "namaUser", "namaVendor", "namaProject", "nominal", "marsPM", "bulan", "tahun"];
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json({ error: `Field ${field} wajib diisi` }, { status: 400 });
      }
    }

    const tabName = process.env.GOOGLE_SHEET_TAB || "Project Tracker";
    const sheetId = getSheetId();
    const sheets = getSheetsClient();

    const row = [
      body.adminPIC,
      body.namaUser,
      body.namaVendor,
      body.namaProject,
      body.category || "",
      body.statusInvoice || "",
      Number(body.nominal) || 0,
      body.tax || "",
      body.marsPM,
      body.bulan,
      Number(body.tahun) || "",
      body.linkBukti || "",
      body.tanggalPayment || "",
      body.statusPayment || "",
      body.noInvoice || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `'${tabName}'!A:O`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 });
  }
}
