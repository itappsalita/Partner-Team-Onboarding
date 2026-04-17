# Step 2: Planning & Architecture

Dokumen ini merupakan referensi utama (Blueprint) bagi Developer dan AI dalam mengambil keputusan *business logic*.

## 1. Requirement Khusus Role / Hak Akses (RBAC)
Ada 6 peran utama yang terdaftar: `SUPERADMIN`, `PARTNER`, `PMO_OPS`, `PROCUREMENT`, `QA`, `PEOPLE_CULTURE`.
- **PMO_OPS**: Membuat 'Request For Partner', hanya bisa melihat status tracking.
- **PROCUREMENT**: Negosiasi dengan Partner, mengupload TOR & BAK, menandai status menajdi `VERIFICATION`. Menekan tombol Request Partner Training yang masuk ke QA.
- **PARTNER**: Mengelola *Team* dan mengisi formulir *Team Member* (Anggota), mengupload Sertifikat (Kelistrikan/Pertolongan Pertama/dll) & KTP Member.
- **QA**: Melihat list peserta training. Menetapkan Tanggal, Mengupdate Status Training (Lulus/Tidak), Update "Justifikasi Whatsapp Group".
- **PEOPLE_CULTURE (P&C)**: Pasca kelulusan Team, P&C memproduksi Dokumen Sertifikat dan Email Ext Alita, di-upload dan digenarate di tabel `TeamMember`.

## 2. Struktur Database Utama (MySQL + Drizzle)
Semua entitas dan hubungan di aplikasi:
- **Tabel User** -> (`id`, `name`, `email`, `password` (bcrypt), `role`)
- **Tabel RequestForPartner** -> (`id`, `sow_pekerjaan`, `provinsi`, `area`, `jumlah_kebutuhan`, `site_id`, `status`)
- **Tabel DataTeamPartner** -> Memiliki relasi ke User (sebagai partner) dan RequestForPartner.
- **Tabel Team** -> Relasi ke `DataTeamPartner`. Memuat File Sertifikat keahlian Leader, dll.
- **Tabel TeamMember** -> Daftar anggota (relasi ke `Team`). Terdapat data Foto KTP, dan **Sertifikat Training** serta **Email Ext Alita**.
- **Tabel TrainingProcess** -> Logistik Training oleh QA.

## 3. UI/UX Rules
- Pengecualian TailwindCSS telah diberlakukan spesifik.
- UI harus dipoles menggunakan CSS Vanilla atau CSS Modules. Desain Premium (Biru Alita), Glassmorphism, Micro-Animations Hover (Transisi halus di komponen tombol dan Card).
- Layout Web Dashboard Utama (Left Sidebar Navigasi, Top Header User Profile, Dynamic Area Contents).
