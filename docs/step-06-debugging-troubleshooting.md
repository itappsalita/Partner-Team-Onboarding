# Step 6: Debugging & Troubleshooting

Bagian ini adalah *cheat-sheet* untuk masalah lazim pada konfigurasi ekosistem ini selama implementasi.

## 1. Kesalahan Sinkronisasi MySQL dan Drizzle-Kit
**Issue:** *Tabel tidak berubah/muncul pesan schema drift saat menjalankan Push.*
**Solusi:** Kemungkinan kredensial / akses database terhambat, atau ada nama tabel bertabrakan di database yang sama.
Hapus `drizzle/` migrations folder (local cache database state), lalu ulangi perintah `npx drizzle-kit push`.

## 2. Error pada Proses Hash Password Bcrypt
**Issue:** *Next.js menampilkan "fs module not found" build error saat mengimport `bcrypt` dari React Client Component.*
**Solusi:** Bcrypt membutuhkan node/C++ binding untuk bekerja. Jangan pernah memanggil fungsi validasi kriptografi atau `bcrypt` didalam block code "use client". Letakkan logika tersebut hanya di Router `app/api/...` atau Server Actions minimal. 

## 3. Upload Direktori Hilang setelah Proses Server
**Issue:** *File berhasil terupload tapi menghilang selang beberapa saat (terutama kalau ini menumpang Serverless cloud / Vercel deployment).*
**Solusi:** Ingat, Next.js standar di Serverless akan melakukan *wiping* pada local path setelah memori dibersihkan. Pastikan tim Ops merevisi alur ke penyedia External S3 Bucket jikalau Aplikasi Production di deploy di Platform Serverless. Jika deploy via VM standard lokal Alita, penyimpanan *filesystem* `public/uploads/` berstatus *persistent* (aman).

## 4. Error Type NextAuth
**Issue:** *Typescript error pada "Property role does not exist on type Session".*
**Solusi:** Dalam `route.ts`, harus ada deklarasi penimpaan struktur type bawaan (Extending Sub-Interface global module) agar types role bisa dimuat oleh NextAuth JWT Handler. 
