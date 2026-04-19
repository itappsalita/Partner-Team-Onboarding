# Panduan Konfigurasi SSH Keys & GitHub Secrets 🔐

Dokumen ini berisi langkah-langkah teknis untuk menghubungkan repositori GitHub Anda dengan server VM (Dev & Prod) menggunakan SSH Key.

---

## Langkah 1: Membuat SSH Key Baru

Jalankan perintah ini di terminal laptop Anda (atau di server salah satu) untuk membuat kunci pengenal:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy"
```

- Ketika ditanya **"Enter file in which to save the key"**, tekan `Enter` (default).
- Ketika ditanya **"Enter passphrase"**, tekan `Enter` (kosongkan saja agar otomatisasi lancar).

**Hasilnya:**
- Kunci Privat (Rahasia): `~/.ssh/id_ed25519`
- Kunci Publik: `~/.ssh/id_ed25519.pub`

---

## Langkah 2: Daftarkan Kunci Publik ke Server

Agar server mengenali GitHub, Anda harus memasukkan kunci publik ke server.

1. Lihat isi kunci publik Anda:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. Salin teks yang muncul (biasanya diawali `ssh-ed25519 ...`).
3. Masuk ke **Server VM Dev** dan **Server VM Prod** via SSH.
4. Jalankan perintah ini di dalam server:
   ```bash
   mkdir -p ~/.ssh
   nano ~/.ssh/authorized_keys
   ```
5. Tempelkan (paste) teks kunci publik tadi di baris baru.
6. Simpan (`Ctrl+O`, `Enter`) dan keluar (`Ctrl+X`).

---

## Langkah 3: Daftarkan Kunci Privat ke GitHub Secrets

Ini adalah langkah agar GitHub bisa "menyamar" menjadi Anda dan masuk ke server.

1. Lihat isi kunci privat Anda:
   ```bash
   cat ~/.ssh/id_ed25519
   ```
2. Salin seluruh isinya (termasuk baris `-----BEGIN OPENSSH PRIVATE KEY-----` dan `-----END ...`).
3. Buka repositori Anda di GitHub.
4. Ke menu **Settings** -> **Secrets and variables** -> **Actions**.
5. Klik **New repository secret**.
6. Simpan dengan nama berikut:
   - `DEV_SSH_KEY`: Isi dengan Kunci Privat tadi.
   - `PROD_SSH_KEY`: Isi dengan Kunci Privat tadi (jika menggunakan kunci yang sama).

Jangan lupa tambahkan juga Secret lainnya:
- `DEV_SSH_HOST`: IP VM Dev.
- `DEV_SSH_USER`: `root` (atau user lain).
- `PROD_SSH_HOST`: IP VM Prod.
- `PROD_SSH_USER`: `root`.

---

## Langkah 4: Uji Coba

Setiap kali Anda melakukan **Push** ke branch `develop` atau `main`, lihat tab **Actions** di GitHub. Anda akan melihat proses "Test and Build" berjalan terlebih dahulu, baru kemudian proses "Deploy" ke server.

> [!TIP]
> Jika deployment gagal karena "Permission Denied", pastikan kunci publik sudah terpasang dengan benar di file `~/.ssh/authorized_keys` pada server tujuan.
