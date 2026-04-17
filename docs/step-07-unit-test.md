# Step 7: Unit Test

Panduan dalam menguji kualitas arsitektur platform secara mikro (*Micro / Component level test*). Disini kita dapat menggunakan `Vitest` atau standar `Jest` didalam env Next.js. Disarankan `Vitest` karena portabilitas dan *speed* di JavaScript Framework modern.

## 1. Setup Vitest di Next.js
Gunakan package manager untuk memasang instrumen testing:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react
```
Tambahkan scrip `"test": "vitest"` di `package.json`.

## 2. Mocking NextAuth Module
Sebuah halaman web tidak bisa ter-*render* oleh modul Test jika terhalang authentication.
Buat file *mock* untuk menstimulasikan Role login tertentu.
```javascript
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { role: "PROCUREMENT" } },
    status: "authenticated",
  }),
}));
```

## 3. Test Cases Mandatory (Minimal Skala Requirement Project)
Setidaknya pastikan unit test berjalan sukses untuk skenario berikut ini:
- **Test Tombol "Sourcing / Update Status":** Pastikan fungsi *API Request* status berganti secara *mock* dari `REQUESTED` ke `VERIFICATION`.
- **Test Kelulusan QA:** Test API *route handler* `tanggal_training` dan `status_training`. Minta AI membuatkan data stub valid untuk Team, lalu cek apabila field dapat disisipkan data berstatus tipe Date dengan benar di *query Drizzle*.
- **Test UI Rendering:** Lakukan render tes untuk `Dashboard` metric card, pastikan angka tampil atau minimal component statisnya sukses termanifestasi *(Render Tanpa Crash)*. 
