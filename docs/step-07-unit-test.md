# Step 7: Verification & Testing (ACTUAL)

Fase ini mencatat strategi pengujian dan validasi yang telah dilakukan untuk memastikan kesiapan produksi sistem "Partner Team Onboarding".

## 1. Verifikasi Fungsional (Manual & Automasi)
Pengujian utama difokuskan pada validasi alur bisnis (*End-to-End*) daripada sekadar pengujian komponen mikro:
- **Alur Onboarding Lengkap**: Pengujian pendaftaran anggota baru -> registrasi tim -> evaluasi training -> hingga penerbitan sertifikat digital.
- **Validasi Role (RBAC)**: Mematikan akses ilegal (misal: Partner mencoba mengedit tim yang sudah masuk tahap verifikasi).

## 2. Pengujian Automasi Browser (Browser Subagent)
Selama pengembangan, pengujian UI yang kompleks dilakukan menggunakan sub-agen browser otomatis:
- **UI Consistency Check**: Memastikan seluruh tombol aksi dan navigasi sidebar muncul dengan benar di berbagai ukuran layar.
- **Form Submission Test**: Menguji pengiriman formulir massal (seperti pendaftaran 10 anggota tim sekaligus) untuk memastikan tidak ada kebocoran memori atau keterlambatan respon.

## 3. Uji Validasi Output Media
- **Audit PDF**: Pengujian visual terhadap hasil render sertifikat (keselarasan QR Code, foto, dan tanda tangan digital).
- **Audit Excel**: Pengujian pembukaan file ekspor di berbagai aplikasi (Microsoft Excel, Google Sheets, LibreOffice) untuk memastikan integrasi gambar KTP/Selfie tetap presisi.

## 4. Perbaikan Bug Berkelanjutan
Sistem pengujian ini berhasil mendeteksi dan menyelesaikan beberapa kendala kritis sebelum serah terima, seperti penanganan nilai null pada ID penugasan dan sinkronisasi status yang tidak tepat pada dashboard.
