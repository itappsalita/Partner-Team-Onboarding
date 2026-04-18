# Tutorial Deployment: Zero to Production 🚀

Panduan ini dirancang khusus bagi Anda yang belum pernah melakukan deployment aplikasi ke server. Kita akan menempuh 5 langkah sederhana untuk menghidupkan aplikasi **Partner Team Onboarding**.

---

## Bab 1: Masuk ke Dalam Server

Setelah Anda membeli server (misal di DigitalOcean atau Alibaba Cloud), Anda akan mendapatkan **IP Address** dan **Password**.

1.  **Buka Terminal** (di Mac/Linux) atau **Putty** (di Windows).
2.  Ketik perintah berikut (ganti `[IP_SERVER]` dengan angka IP Anda):
    ```bash
    ssh root@[IP_SERVER]
    ```
3.  Ketik `yes` jika muncul pertanyaan pertama kali, lalu masukkan password Anda.
4.  **Siapkan Server**: Jalankan perintah ini untuk memperbarui sistem keamanan Linux:
    ```bash
    apt update && apt upgrade -y
    ```

---

## Bab 2: Instalasi "Mesin" Docker

Aplikasi kita berjalan di dalam **Docker**. Ibarat kontainer pengiriman, Docker memastikan aplikasi berjalan sama persis di laptop saya dan di server Anda.

**Cara Tercepat:** Jalankan perintah otomatis ini untuk menginstal Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
```

---

## Bab 3: Mengambil Kode Aplikasi

Sekarang kita masukkan "isi" aplikasinya ke dalam server.

1.  Pindah ke folder rumah: `cd ~`
2.  Ambil kode dari GitHub:
    ```bash
    git clone https://github.com/itappsalita/Partner-Team-Onboarding.git
    ```
3.  Masuk ke folder proyek:
    ```bash
    cd Partner-Team-Onboarding
    ```

---

## Bab 4: Pengaturan & Menghidupkan Aplikasi

### 1. File Rahasia (.env)
Aplikasi butuh pengenal. Kita akan membuat file rahasia berisi password database dan kunci keamanan.
```bash
nano .env
```
Copy-paste isi berikut (dan ganti passwordnya agar aman!):
```env
DATABASE_URL='mysql://root:password_asli_anda@db:3306/db_onboarding'
NEXTAUTH_URL='http://[IP_SERVER_ANDA]:3000'
NEXTAUTH_SECRET='buat-kunci-acak-panjang'
```
*Tekan `Ctrl+O` lalu `Enter` untuk menyimpan, dan `Ctrl+X` untuk keluar.*

### 2. Mulai Menjalankan!
Cukup satu perintah untuk menghidupkan Aplikasi + Database:
```bash
docker compose up -d --build
```
Tunggu sekitar 2-5 menit. Setelah selesai, cek dengan: `docker compose ps`.

---

## Bab 5: Finalisasi & Database

Sesaat setelah aplikasi hidup, "perabot" database-nya harus kita tata. Jalankan perintah ini (dari server Anda):
```bash
npx drizzle-kit push
```

---

## Bab 6: Tips Akses & SSL (Opsional tapi Penting)
Aplikasi Anda sekarang sudah bisa dibuka di browser melalui: `http://[IP_SERVER]:3000`.

**Agar Jadi Profesional (`https://`):**
Saya menyarankan menggunakan alat bantu visual bernama **Nginx Proxy Manager**. 
1. Alat ini memudahkan Anda mengarahkan domain (misal: `onboarding.alita.id`) ke IP server tersebut.
2. Anda bisa klik tombol "Get Certificate" untuk mendapatkan **SSL Gratis** (ikon gembok aman).

---
### 🆘 Apa yang Harus Dilakukan Jika Error?
Jangan panik. Anda bisa melihat "keluhan" aplikasi dengan mengetik:
```bash
docker compose logs -f app
```
Baca baris paling bawah, biasanya di sana ada petunjuk apa yang salah.

---
© 2026 PT. Alita Praya Mitra. Developed for Success.
