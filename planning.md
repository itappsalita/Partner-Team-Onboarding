saya ferdy. saya adalah product manager di pt. alita praya mitra. saya saat ini diminta oleh team procurement untuk membuat sebuah aplikasi untuk membantu proses onboarding partner/vendor. namanya adalah "Partner Team Onboarding" dalam aplikasi tersebut ada menu : 

1. dashboard
2. Request for Partner
3. data team partner
4. user setting


keterangan untuk menu : 

1. dashboard : menampilkan jumlah partner, jumlah total team di semua partner, jumlah total orang di semua team di semua partner, berapa team yang sedang di jadwalkan training, berapa team yang sudah di training, berapa team yang belum dibuatkan certificate dan email ext alita, berapa yang sudah dapat certificate, berapa team yang tidak lolos training dan berapa yang sudah lolos training. 
2. request for partner adalah data yang berisi permintaan dari tim Operation (PMO) untuk kebutuhan team yang harus di penuhi oleh team Procurement. dimana terdiri dari : SOW Pekerjaan, Provinsi Lokasi Pekerjaan, Area, Jumlah Kebutuhan Team (1 team terdiri dari minimal 3 orang)
3. data team partner adalah data yang berisi partner hasil sourcing Partner Management atas request for partner. jadi relasikan ke request for partner. nah di dalam data team partner berisi : 
- dokumen TOR dan BAK yang di isikan oleh tim procurement. 
- ada juga section list team yang di isikan oleh partner di section tersebut headernya adalah No Urut Team, Nama Leader, No Handphone, Nomor Sertifikan TKPK 1, file sertifikat TKPK 1, Nomor Sertifikat Pertolongan Pertama (Opsional), File Sertifikat Pertolongan pertama (Opsional), Nomor Sertifikat kelistrikan (Opsional), File Sertifikat kelistrikan (Opsional), Posisi Team dan Lokasi Pekerjaan. 
- di dalamnya ketika di klik muncul popup atau halaman baru yang berisikan list nama anggota tim tersebut. terdiri dari No Urut Anggota, Nama Anggota, Posisi, NIK, No Handphone, Foto KTP
4. user setting dimana tempat untuk registrasi user yang akses apps tersebut. yang terdiri dari nama user, alamat email, password (menggunakan bscrypt) dan role yaitu : 
- Superadmin
- Partner
- PMO / Ops
- Procurement / Partner Management
- Quality Assurance
- People & Culture


disamping itu. ada fitur-fitur : 

1. isi data team partner oleh procurement dimana mengambil data request for partner dan mengupdate ke request for partner dari status requested ke status verification
2. upload file BAK & TOR
3. tombol request partner training
4. notifikasi ke tim quality assurance dan halaman untuk tim QA cek list request partner training
5. section untuk tim quality assurance update tanggal training
6. section untuk tim quality assurance update hasil training (pengumuman kelulusan)
7. section untuk update justifikasi dibuatnya whatsapp group
8. tombol untuk pengajuan sertifikat training dan email ext alita ke People & Culture
9. section untuk generate certificate oleh People & Culture dan memasukkan email ext alita
10. update request for partner ke status verified dan notifikasi ke Ops / PMO

saya kepikiran untuk aplikasi ini menggunakan tech stack JS agar lebih intuitif. cuma silahkan kamu berikan detail tech stacknya. oiy untuk DB saya mau pake mySQL saja.

saya juga sudah mengupload file pdf business proses didalam folder partner-team-onboarding. kamu bisa compare juga ke file tersebut. 

saya mau kamu hasilkan dokumen yang bisa dibaca oleh junior programmer atau model ai yang lebih murah untuk proses implementasinya nanti 


