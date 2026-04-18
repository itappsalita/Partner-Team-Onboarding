# Step 3: Scaffolding Project (ACTUAL)

Dokumen ini mencatat struktur dasar dan kerangka kerja yang telah diimplementasikan pada proyek ini.

## 1. Struktur Folder Nyata
```text
/app
  /(main)           # Group rute yang terproteksi login & sidebar
  /(auth)           # Rute Login & Authentication
  /api              # Seluruh REST API Handlers
  /api-docs         # Portal Dokumentasi API (Standalone)
/db
  schema.ts         # Skema Drizzle & Relasi Database
/lib
  status-utils.ts   # Logika bisnis sinkronisasi status otomatis
  swagger.ts        # Konfigurasi spesifikasi OpenAPI
  auth.ts           # Konfigurasi NextAuth
/public
  /uploads          # Media penyimpanan fisik (KTP/Selfie/Sertifikat)
```

## 2. Abstraksi Konfigurasi Database
Koneksi database telah diabstraksi menggunakan *pool connection* untuk efisiensi di lingkungan produksi:
```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const poolConnection = mysql.createPool(process.env.DATABASE_URL!);
export const db = drizzle(poolConnection, { mode: 'default' });
```

## 3. Integrasi Utilitas Global
Setiap bagian aplikasi merujuk pada `lib/` untuk menjaga konsistensi:
- **`lib/status-utils.ts`**: Menjadi "otak" di balik sinkronisasi status otomatis yang dipanggil oleh berbagai rute API.
- **`lib/swagger.ts`**: Menangani ekstraksi anotasi `@swagger` dari setiap file rute untuk dijadikan dokumentasi standar OpenAPI 3.0.
