"use client";

import { useState, useEffect, useMemo } from "react";

function formatRupiah(n) {
  const num = Number(n) || 0;
  return "Rp" + num.toLocaleString("id-ID");
}

const CATEGORY_LIST = ["Personal Care", "Face Care", "Advanced Face Care", "Lifestyle", "All Category"];
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
  const [budgets, setBudgets] = useState([]);
  const [budgetsStatus, setBudgetsStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    fetch("/api/budgets")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setBudgets(data.budgets || []);
        setBudgetsStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setBudgetsStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedBudget = useMemo(
    () => budgets.find((b) => b.mars === form.marsPM),
    [budgets, form.marsPM]
  );

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

            {budgetsStatus === "error" ? (
              <input
                value={form.marsPM}
                onChange={(e) => update("marsPM", e.target.value)}
                placeholder="M0226017042"
                required
              />
            ) : (
              <select
                value={form.marsPM}
                onChange={(e) => update("marsPM", e.target.value)}
                required
              >
                <option value="" disabled>
                  {budgetsStatus === "loading" ? "Memuat daftar budget..." : "Pilih kode MARS/PM"}
                </option>
                {budgets.map((b) => (
                  <option key={b.mars} value={b.mars}>
                    {b.mars} — {b.title} (Sisa: {formatRupiah(b.saldo)})
                  </option>
                ))}
              </select>
            )}

            {selectedBudget && (
              <div className="budget-hint">
                <span>Budget: {formatRupiah(selectedBudget.budget)}</span>
                <span>Terpakai: {formatRupiah(selectedBudget.totalUsed)}</span>
                <span className={selectedBudget.saldo < 0 ? "budget-neg" : "budget-pos"}>
                  Sisa: {formatRupiah(selectedBudget.saldo)}
                </span>
              </div>
            )}
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
