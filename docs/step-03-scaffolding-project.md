# Step 3: Scaffolding Project

Pemetaan folder (folder structure architecture) pada sistem dan persiapan alat-alat inti. Di tahap ini belum ada *code* UI utuh melainkan pondasi untuk Drizzle, NextAuth dan UI Skeleton.

## 1. Folder Structure (Standar Next.js App Router)
Buat struktur direktori berikut di root proyek:
```text
/app
  /api              # API Endpoints (seluruh logic database/REST)
  /dashboard        # Main dashboard screen
  /request-partner  # Laman PMO Ops request module
  /data-team        # Laman Manajemen tim oleh Partner/Procurement
  /user-setting     # Laman User Admin Registrasi
  layout.tsx        # Base Layout (Siderbar + Wrapper)
  page.tsx          # Homepage / Login Redirection
/components         # Reusable UI component (Button, Modal, Card, Table)
/db
  index.ts          # Setup koneksi database Drizzle
  schema.ts         # Deklarasi tabel schema Drizzle 
drizzle.config.ts   # Konfigurasi migrations
```

## 2. Konfigurasi Drizzle (db/schema.ts dan db/index.ts)
Buat file `db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const poolConnection = mysql.createPool(process.env.DATABASE_URL!);
export const db = drizzle(poolConnection);
```

Buat spesifikasi schema di `db/schema.ts`. (Sesuai dengan arahan tabel di `02-planning.md`).
Pastikan mendefinisikan *Varchar* dengan Limit. Contoh:
```typescript
import { mysqlTable, int, varchar, timestamp, text, enum as mysqlEnum } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 150 }).notNull(),
  email: varchar('email', { length: 150 }).unique().notNull(),
  // ... lengkap di step Code Generation
});
```

Kemudian setup di root `drizzle.config.ts`:
```typescript
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```
Jalankan perintah `npx drizzle-kit push` untuk mengaplikasikan skeleton ini ke MySQL.
