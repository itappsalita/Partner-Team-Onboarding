# Step 1: Setup Project

Dokumen ini memandu pembuatan kerangka awal proyek "Partner Team Onboarding". Ikuti setiap instruksi di bawah ini dengan tepat.

## 1. Inisialisasi Proyek Next.js
Gunakan perintah berikut di terminal untuk membuat proyek berbasis Next.js App Router.
```bash
npx create-next-app@latest .
# Konfigurasi disarankan:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: No (Kita menggunakan Vanilla CSS / CSS Modules atas instruksi desain ini)
# - `src/` directory: No (Gunakan App Router langsung di root `/app`)
# - App Router: Yes
# - Customize default import alias: No
```

## 2. Instalasi Dependencies Utama
Sistem kita akan menggunakan Drizzle ORM, MySQL2, NextAuth, bcrypt, dll.
```bash
# Install Runtime Dependencies
npm install drizzle-orm mysql2 next-auth bcrypt
npm install formidable fs-extra # Untuk keperluan upload gambar/dokumen secara offline ke folder uploads/

# Install Development Dependencies
npm install -D drizzle-kit @types/bcrypt @types/node @types/react @types/formidable typescript
```

## 3. Konfigurasi Lingkungan (.env)
Bikin file `.env` di dalam folder root kerja. Isikan kredensial berikut. Perhatikan bahwa String MySQL dibutuhkan oleh Drizzle.
```env
# URL Koneksi Database ke Instance MySQL (Silakan ubah user, password, host, dan nama db)
DATABASE_URL="mysql://root:password@localhost:3306/partner_onboarding_db"

# Next Auth Secret
NEXTAUTH_SECRET="buat_string_rahasia_dan_taruh_disini_sebagai_token_auth"
NEXTAUTH_URL="http://localhost:3000"
```

## 4. Konfigurasi Upload Directory
Aplikasi kita butuh tempat menyimpan file lokal (seperti file BAK, TOR, Foto KTP, dan KTP, Sertifikat).
1. Buat direktori bernama `public/uploads` di dalam root direktori.
2. Pastikan Next.js mengetahui bahwa lokasi `/uploads` bisa diakses secara publik, dan file konfigurasi *gitignore* telah diatur (`echo "public/uploads/*" >> .gitignore`).
