# Step 1: Setup Project (ACTUAL)

Dokumen ini mencatat inisialisasi nyata dari proyek "Partner Team Onboarding" untuk PT. Alita Praya Mitra.

## 1. Inisialisasi Proyek Next.js
Proyek dibangun menggunakan versi Next.js terbaru dengan dukungan fitur App Router.
```bash
npx create-next-app@latest .
```
**Konfigurasi Terpasang:**
- **Next.js Version**: 16.2.3
- **React Version**: 19
- **TypeScript**: Yes
- **ESLint**: Yes
- **Tailwind CSS**: Yes (Versi 4.0)
- **App Router**: Yes
- **`src/` directory**: No (Struktur root `/app`)

## 2. Instalasi Dependencies Utama
Sistem menggunakan berbagai pustaka modern untuk audit, ekspor data, dan rendering dokumen.
```bash
# Runtime Dependencies
npm install drizzle-orm mysql2 next-auth bcrypt
npm install exceljs puppeteer qrcode lucide-react rechart framer-motion
npm install clsx tailwind-merge swagger-ui-react swagger-jsdoc fs-extra

# Development Dependencies
npm install -D drizzle-kit @types/bcrypt @types/node @types/react @types/fs-extra typescript
```

## 3. Konfigurasi Lingkungan (.env)
File `.env` di direktori root mengelola kredensial krusial:
```env
DATABASE_URL="mysql://root:password@localhost:3306/partner_onboarding_db"
NEXTAUTH_SECRET="[TOKEN-RAHASIA-ALITA]"
NEXTAUTH_URL="http://localhost:3000"
```

## 4. Konfigurasi Media & Persistensi
Karena aplikasi menangani dokumen legal (KTP/Selfie/Sertifikat), direktori penyimpanan lokal telah disiapkan:
- **Path**: `public/uploads/`
- **Aturan Git**: File di dalam path ini dikecualikan dari repositori (`.gitignore`) untuk menjaga privasi data partner, namun dikelola melalui sistem Volume di Docker untuk persistensi data di server produksi.
