# Step 4: Code Generation

Fase memproduksi kode utama aplikasi. Bagi Model AI, perintahkan ini dalam prompt bertahap satu persatu (Iterative Mode). 

## 1. Generate Skema Database Valid (Drizzle Mode)
- **Tindakan**: Tulis keseluruhan file `db/schema.ts` secara lengkap menggunakan API `drizzle-orm/mysql-core` menyesuaikan atribut dengan limit string (misal Foto KTP URL `varchar('foto_ktp_path', { length:255 })`).
- Jangan lupa menambahkan deklarasi relasi (*relations*) Drizzle antar entitas.
- Push Skema: `npx drizzle-kit push`

## 2. Generate NextAuth Authentication
- **Tindakan**: Buat file `/app/api/auth/[...nextauth]/route.ts`.
- Tambahkan library `bcrypt` dan lakukan compare password dengan tabel User (`db.select().from(users).where(eq(users.email, credentials.email))`).
- Export konfigurasi Auth dan bungkus aplikasi menggunakan *Context Provider* di `/app/layout.tsx`.

## 3. Generate Rest API / Route Handlers (app/api/)
- `/api/users`: POST untuk daftar, GET untuk ambil list (RBAC: Superadmin).
- `/api/requests`: Modul PMO. Mendukung insert dan update via method POST / PUT.
- `/api/data-team`: Modul upload form. Gunakan `formidable` atau `next/server Request.formData()` untuk menerima file lokal, memindahkannya dengan Node `fs` / `fs.promises` ke `public/uploads/` lalu menginsert *file path URL* ke Database dengan Drizzle.

## 4. Generate UI Components & Laman Dashboard Khusus
- Di `/components`: Buat `Sidebar.tsx`, `Header.tsx`, `ModernTable.tsx`, `Modal.tsx`. Tulis styling di `Dashboard.module.css`. 
- Ingat untuk memakai gaya Premium CSS. Gunakan warna standar Alita, shadow minimalis untuk depth, transisi pada klik, font Roboto/Inter standar Next.js bawaan.
- Untuk menampilkan popup relasi antar *Team* dan *Team Member* bisa gunakan Modal PopUp.
- Bangun halaman view untuk role `QA` yang akan menampilkan tombol *Approval Training* yang meng-hit `/api/training-process`.
