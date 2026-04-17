# Step 5: Code Review

Panduan untuk mereview (audit) kode generasi atau kode yang di tulis oleh tim pengembang / AI.

## 1. Audit Integrasi Drizzle ORM
- Periksa kesesuaian Tipe Data (`VARCHAR`, `INT`, `ENUM`) dengan schema.ts yang di-*push* pada awal proyek. Pastikan *limit char* dan tipe nullable sesuai dengan desain.
- Validasi fungsi Insert/Update. Pada Drizzle, pembaruan ke suatu baris haruslah secara cermat menggunakan `eq()` operator (`where(eq(Team.id, parameterId))`).

## 2. Audit RBAC dan Route Security
- Pastikan di Next.js Middleware (`middleware.ts`) ada filter pengaman halaman (*Route Protection*). Laman terkait `PMO` tidak boleh di akses Role `QA` secara leluasa.
- Di sisi API Route (app/api/), periksa ekstraksi `context/token` via `getServerSession`. API tidak boleh mengijinkan interaksi (terutama POST/PUT) tanpa header valid Session bersangkutan (hindari vulnerability kebocoran data Partner lain).

## 3. Validasi Form Data dan Upload File
- Saat mereview Endpoint upload `/api/data-team`, pastikan kode secara eksplisit membersihkan path sebelum menyimpannya ke MySQL, dan memitigasi kesalahan apabila folder `public/uploads/` terhapus atau belum di-create (*handle fs.mkdirSync* di API saat *app run*).

## 4. UI Code Audit
- Periksa konsistensi CSS: Tidak ada inline styles liar. Semua element minimalis mengikuti aturan CSS yang distandardisasi.
- Form Input Data Team Member: Karena *payload* datanya besar, validasi bahwa UI memakai form modular/component state untuk mencegah frame lag (komponen re-render tak wajar).
