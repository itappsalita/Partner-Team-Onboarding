# Step 6: Debugging & Troubleshooting (ACTUAL)

Dokumen ini mencatat masalah teknis nyata yang ditemukan selama pengembangan sistem Partner Team Onboarding dan solusi yang telah diterapkan.

## 1. Kendala Puppeteer di Lingkungan Docker
**Masalah**: Rendering sertifikat PDF gagal di dalam kontainer karena hilangnya dependensi Chromium sistem.
**Solusi**: Memperbarui `Dockerfile` untuk menginstal paket `chromium` dan dependensi pustaka Linux (`libnss3`, `libatk-bridge2.0-0`, dll) secara manual, serta menjalankan Puppeteer dalam mode `--no-sandbox`.

## 2. Error "Possibly Null" pada ID Generation (seqNumber)
**Masalah**: TypeScript mendeteksi potensi error null saat sistem mencoba melakukan *padding* nol pada `seqNumber` (misal: `TRN-00001`) sesaat setelah insert data.
**Solusi**: Menambahkan penanganan nilai cadangan (*fallback*) menggunakan pola `(newRecord?.seqNumber || 0)` dan *optional chaining* di setiap modul API (Teams, Members, Training).

## 3. Sinkronisasi Skema Database (Drizzle Push)
**Masalah**: Terjadi *out of sync* atau *error drift* saat tabel database MySQL mengalami perubahan kolom manual.
**Solusi**: Menggunakan `npx drizzle-kit push` secara ketat untuk menyelaraskan skema, dan melakukan audit manual pada tabel untuk menghapus *constraint* lama yang menghalangi migrasi.

## 4. Issue Image pada ExcelJS
**Masalah**: Foto KTP/Selfie tidak terpaku pada baris yang benar saat filter Excel diterapkan.
**Solusi**: Menggunakan properti `editAs: 'oneCell'` pada penempatan gambar di `ExcelJS` untuk memastikan foto tetap berada di dalam sel yang sesuai meskipun terjadi perubahan ukuran baris atau filter.
