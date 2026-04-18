# Panduan Operasional Docker Produksi

Panduan ini menjelaskan langkah-langkah detail untuk menjalankan aplikasi **Partner Team Onboarding** di server produksi menggunakan infrastruktur Docker yang telah dioptimalkan.

## 1. Persiapan Variabel Lingkungan
Gunakan file `docker-compose.yml` untuk mengelola konfigurasi. Pastikan variabel berikut dikonfigurasi dengan benar sebelum deployment:

```yaml
environment:
  - DATABASE_URL=mysql://root:password_asli_anda@db:3306/db_onboarding
  - NEXTAUTH_URL=https://partner-onboarding.alita.id
  - NEXTAUTH_SECRET=gunakan_string_acak_yang_sangat_panjang
```
> [!NOTE]
> Perhatikan bahwa `db` di dalam `DATABASE_URL` merujuk pada nama layanan database di dalam jaringan internal Docker, bukan `localhost`.

## 2. Pembangunan & Eksekusi
Aplikasi ini menggunakan **Multi-stage Build** untuk meminimalisir ukuran image. Untuk membangun dan menjalankan:

```bash
docker compose up -d --build
```
- Image ini sudah menyertakan **Chromium & dependencies** sistem yang diperlukan agar fitur **Penerbitan Sertifikat PDF** berjalan lancar di dalam kontainer.

## 3. Persistensi Data (Sangat Penting)
Aplikasi menyimpan file fisik yang krusial. Pastikan *volume* berikut tetap terpasang:

1.  **mysql_data**: Menyimpan seluruh record database.
2.  **./public/uploads**: Menyimpan dokumen fisik (**KTP, Selfie, dan Sertifikat PDF**). 
    > [!IMPORTANT]
    > Folder ini wajib di-backup secara rutin karena berisi dokumen legalitas personil.

## 4. Sinkronisasi Database
Setelah pertama kali dijalankan, lakukan sinkronisasi skema database dari mesin lokal yang memiliki akses ke server:

```bash
npx drizzle-kit push
```

## 5. Troubleshooting & Log
- **Cek Status**: `docker compose ps`
- **Melihat Log Real-time**: `docker compose logs -f app`
- **Reputasi Puppeteer**: Jika sertifikat gagal dibuat, pastikan kontainer memiliki akses ke memory yang cukup (minimal 1GB RAM disarankan untuk Chromium).

---
© 2026 PT. Alita Praya Mitra. Produksi-Ready Infrastructure.
