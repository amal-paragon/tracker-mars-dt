# Project Tracker — Form Input

Website simpel untuk input data project, yang langsung menulis baris baru ke
Google Sheets kamu (tab "Project Tracker"). Setelah data masuk, semua rumus
rekap (Total Used, Saldo, rekap per kategori) yang sudah ada di sheet-mu akan
otomatis ke-update — karena rumusnya sudah mereferensikan seluruh kolom.

Cara kerjanya: form (di browser) mengirim data ke `/api/submit` (jalan di
server Vercel, bukan di browser), lalu server itu yang menulis ke Google
Sheets pakai Google Sheets API. Ini kenapa pendekatan ini bisa berhasil
menulis ke Sheets, sementara halaman yang di-publish langsung dari Claude
tidak bisa (dibatasi keamanan browser).

## Setup (sekali saja, ±15 menit)

### 1. Siapkan Google Sheets kamu
Pastikan sheet punya tab bernama **"Project Tracker"** dengan urutan kolom
persis seperti ini di baris pertama (A sampai O):

```
Admin PIC | Nama User | Nama Vendor | Nama Project | Category | Status Invoice |
Nominal | Tax | MARS/PM | Bulan | Tahun | Link Bukti Pekerjaan |
Tanggal Payment (Exp) | Status Payment | No Invoice/PO
```

(Kalau urutan kolommu beda, edit array `row` di `app/api/submit/route.js`
biar urutannya cocok.)

### 2. Buat Service Account di Google Cloud
1. Buka https://console.cloud.google.com/ → buat project baru (atau pakai yang ada).
2. Di search bar, cari **"Google Sheets API"** → klik **Enable**.
3. Buka menu **APIs & Services > Credentials** → **Create Credentials** → **Service Account**.
4. Kasih nama bebas (mis. `project-tracker-writer`) → Create and Continue → Done.
5. Klik service account yang baru dibuat → tab **Keys** → **Add Key** → **Create new key** → pilih **JSON** → akan ke-download file JSON. **Simpan file ini baik-baik, jangan di-share ke publik.**
6. Buka file JSON itu, cari `client_email` dan `private_key` — dua nilai ini yang nanti dipakai.

### 3. Share sheet ke Service Account
1. Buka Google Sheets kamu → klik **Share**.
2. Paste email dari `client_email` (formatnya kira-kira `...@...iam.gserviceaccount.com`).
3. Kasih akses **Editor** → Send/Share.

Tanpa langkah ini, service account tidak akan bisa menulis ke sheet-mu.

### 4. Deploy ke Vercel
1. Push folder ini ke GitHub repo (bisa lewat GitHub Desktop atau `git push`).
2. Buka https://vercel.com → **Add New Project** → import repo tadi.
3. Sebelum klik Deploy, buka bagian **Environment Variables**, isi 4 variabel ini (nilainya dari file JSON tadi + sheet kamu):
   - `GOOGLE_SHEET_ID` → ambil dari URL sheet: `.../spreadsheets/d/INI_SHEET_ID/edit`
   - `GOOGLE_SHEET_TAB` → `Project Tracker`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` → nilai `client_email` dari JSON
   - `GOOGLE_PRIVATE_KEY` → nilai `private_key` dari JSON (termasuk `-----BEGIN PRIVATE KEY-----` dst, biarkan `\n` apa adanya)
4. Klik **Deploy**. Selesai — kamu dapat URL seperti `nama-project.vercel.app`.

### 5. Coba isi form
Buka URL yang muncul, isi form, klik "Kirim ke Sheet" → cek sheet, baris baru harus muncul di tab "Project Tracker".

## Testing di komputer sendiri (opsional)
```bash
npm install
cp .env.local.example .env.local   # lalu isi nilainya
npm run dev
```
Buka http://localhost:3000

## Kustomisasi
- Ganti daftar Category, Bulan, Status, dsb di `app/page.js` (bagian `_LIST`).
- Ganti urutan/kolom yang dikirim ke sheet di `app/api/submit/route.js`.
- Kalau mau beberapa orang isi form ini bareng-bareng dari HP, tinggal share link Vercel-nya — gak perlu login apa pun (kecuali kamu mau tambahin proteksi password, bisa ditambahkan nanti).
