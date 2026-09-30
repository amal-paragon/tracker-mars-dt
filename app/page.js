"use client";

import { useState } from "react";

const CATEGORY_LIST = ["Personal Care", "Face Care", "Advanced Face Care", "Lifestyle"];
const BULAN_LIST = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const STATUS_INVOICE_LIST = ["Waiting for Invoice", "Invoice Signed"];
const TAX_LIST = ["Include", "Exclude"];

const now = new Date();
const currentBulan = BULAN_LIST[now.getMonth()];
const currentTahun = now.getFullYear();

const initialForm = {
  adminPIC: "",
  namaUser: "",
  namaVendor: "",
  namaProject: "",
  category: CATEGORY_LIST[0],
  statusInvoice: STATUS_INVOICE_LIST[0],
  nominal: "",
  tax: TAX_LIST[0],
  marsPM: "",
  bulan: currentBulan,
  tahun: currentTahun,
  linkBukti: "",
  tanggalPayment: "",
  statusPayment: "",
  noInvoice: "",
};

export default function Page() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim data");
      setStatus("success");
      setForm({ ...initialForm, adminPIC: form.adminPIC, namaUser: form.namaUser });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Input Project Tracker</h1>
        <p>Data yang kamu submit di sini langsung masuk ke sheet "Project Tracker" — rekap budget otomatis ke-update.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <p className="section-title">Info Dasar</p>
          <div className="row2">
            <div className="field">
              <label>Admin PIC</label>
              <input value={form.adminPIC} onChange={(e) => update("adminPIC", e.target.value)} required />
            </div>
            <div className="field">
              <label>Nama User</label>
              <input value={form.namaUser} onChange={(e) => update("namaUser", e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label>Nama Vendor</label>
            <input value={form.namaVendor} onChange={(e) => update("namaVendor", e.target.value)} required />
          </div>
          <div className="field">
            <label>Nama Project</label>
            <input value={form.namaProject} onChange={(e) => update("namaProject", e.target.value)} required />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => update("category", e.target.value)}>
              {CATEGORY_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="card">
          <p className="section-title">Budget &amp; Periode</p>
          <div className="row2">
            <div className="field">
              <label>Nominal (Rp)</label>
              <input type="number" min="0" value={form.nominal} onChange={(e) => update("nominal", e.target.value)} required />
            </div>
            <div className="field">
              <label>Tax</label>
              <select value={form.tax} onChange={(e) => update("tax", e.target.value)}>
                {TAX_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Kode MARS/PM</label>
            <input value={form.marsPM} onChange={(e) => update("marsPM", e.target.value)} placeholder="M0226017042" required />
          </div>
          <div className="row2">
            <div className="field">
              <label>Bulan</label>
              <select value={form.bulan} onChange={(e) => update("bulan", e.target.value)}>
                {BULAN_LIST.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tahun</label>
              <input type="number" value={form.tahun} onChange={(e) => update("tahun", e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="card">
          <p className="section-title">Status &amp; Dokumen</p>
          <div className="field">
            <label>Status Invoice</label>
            <select value={form.statusInvoice} onChange={(e) => update("statusInvoice", e.target.value)}>
              {STATUS_INVOICE_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Link Bukti Pekerjaan</label>
            <input value={form.linkBukti} onChange={(e) => update("linkBukti", e.target.value)} placeholder="https://..." />
          </div>
          <div className="row2">
            <div className="field">
              <label>Tanggal Payment (Exp)</label>
              <input value={form.tanggalPayment} onChange={(e) => update("tanggalPayment", e.target.value)} placeholder="dd-mm-yyyy" />
            </div>
            <div className="field">
              <label>No Invoice/PO</label>
              <input value={form.noInvoice} onChange={(e) => update("noInvoice", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Status Payment</label>
            <input value={form.statusPayment} onChange={(e) => update("statusPayment", e.target.value)} placeholder="mis. Jadwal Transfer 26-06-2026" />
          </div>
        </div>

        <button className="submit-btn" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Mengirim..." : "Kirim ke Sheet"}
        </button>

        {status === "success" && (
          <div className="msg success">Berhasil! Data sudah masuk ke Project Tracker.</div>
        )}
        {status === "error" && (
          <div className="msg error">Gagal kirim: {errorMsg}</div>
        )}
      </form>
    </div>
  );
}
