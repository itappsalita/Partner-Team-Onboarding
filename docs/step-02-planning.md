# Step 2: Planning & Architecture (ACTUAL)

Dokumen ini mencatat keputusan arsitektural dan logika bisnis final yang diimplementasikan pada sistem Partner Team Onboarding.

## 1. Hak Akses Berbasis Peran (RBAC)
Sistem menggunakan 4 peran utama dengan tanggung jawab sebagai berikut:
- **`SUPERADMIN`**: Kendali penuh sistem, manajemen user, dan pengawasan seluruh rute API.
- **`PROCUREMENT`**: Inisiator Request For Partner (RFP), verifikasi dokumen TOR/BAK, dan pemantauan pipeline pemenuhan personil.
- **`PARTNER`**: Manajemen tim dan registrasi personil, pengisian formulir sertifikasi teknis (TKPK), dan pengelolaan data anggota aktif.
- **`QA (Quality Assurance)`**: Evaluasi hasil pelatihan, penetapan kelulusan tim, dan validasi data training.

## 2. Alur Status & Sinkronisasi Otomatis (Cascading)
Salah satu fitur inti sistem adalah **Akurasi Status Real-time**. Sistem tidak hanya menyimpan status, tapi menyinkronkannya secara otomatis:
- **Update Anggota** -> Memicu kalkulasi ulang status **Tim** (misal: jika ada anggota baru, tim menjadi `SOURCING`).
- **Update Tim** -> Memicu kalkulasi ulang status **Penugasan (ASG)**.
- **Update Penugasan** -> Memicu kalkulasi ulang status **Request (REQ)** utama (berdasarkan persentase pemenuhan kuota tim).

## 3. Logika "Returning Member"
Sistem memiliki memori terhadap NIK yang pernah terdaftar. Jika anggota lama (pernah tersertifikasi) didaftarkan kembali, sistem secara otomatis:
- Memulihkan data sertifikat teknis lama.
- Melalui pengecekan status kredensial email yang sudah ada.
- Mempercepat proses verifikasi tim di sisi Procurement.

## 4. Standar Desain
- **UI Framework**: Tailwind CSS 4.0.
- **Aesthetic**: Modern, Clean, Professional (Alita Blue Theme).
- **Komponen**: Unified Modals dan Global Action Buttons untuk pengalaman pengguna yang seragam.
