# PANDUAN: AU Interaktif "MIE AYAM 18 NOVEMBER" di Vercel

Ini website statis (HTML + CSS + JavaScript biasa). Tidak perlu install apa pun, tidak ada build.
Cara termudah: simpan di **GitHub**, sambungkan ke **Vercel**. Setiap kamu edit file di GitHub, Vercel otomatis update website-nya.

---

## BAGIAN A. Pasang pertama kali (sekali saja)

### 1. Siapkan akun
1. Buat akun GitHub di https://github.com (gratis).
2. Buat akun Vercel di https://vercel.com, pilih **Continue with GitHub** (gratis, paket Hobby).

### 2. Buat repository dan upload file
1. Ekstrak file ZIP proyek ini di komputermu. Isinya: `index.html`, folder `css`, `js`, `data`, `assets`, `tools`, dan file panduan.
2. Di GitHub klik tanda **+** kanan atas, lalu **New repository**.
3. Isi nama, misalnya `au-mie-ayam`. Pilih **Public** (atau Private juga bisa). Klik **Create repository**.
4. Di halaman repo kosong, klik link **uploading an existing file**.
5. Buka folder hasil ekstrak, **pilih SEMUA isinya** (bukan folder induknya), lalu drag ke halaman GitHub. Pastikan `index.html` ada di paling atas (bukan di dalam folder lain).
6. Tunggu selesai, tulis pesan commit bebas (misal "upload awal"), klik **Commit changes**.

> Kalau drag folder kosong (seperti `assets/photos`) tidak terbawa, tidak apa-apa, folder akan terbentuk sendiri saat kamu upload foto pertama (lihat Bagian C).

### 3. Hubungkan ke Vercel
1. Di Vercel klik **Add New... > Project**.
2. Di daftar repository GitHub, cari `au-mie-ayam`, klik **Import**. (Kalau belum muncul, klik **Adjust GitHub App Permissions** dan izinkan akses ke repo itu.)
3. Di halaman konfigurasi, **jangan ubah apa-apa**:
   - Framework Preset: **Other**
   - Build Command: kosongkan
   - Output Directory: kosongkan
   - Root Directory: `./`
4. Klik **Deploy**. Tunggu sekitar 30 detik.
5. Selesai! Vercel memberi link seperti `au-mie-ayam.vercel.app`. Itu link yang kamu bagikan ke pembaca.

### 4. Tes
Buka link, ketuk layar, masukkan kode sandi **0221**. Beberapa detik kemudian notifikasi pertama muncul, ketuk, dan cerita berjalan.

---

## BAGIAN B. Cara kerja cerita (supaya kamu paham yang kamu edit)

- Layar kunci, sandi `0221`. Setelah terbuka, notifikasi pertama masuk (catatan 13, jam 05.58).
- Cerita Day 9 adalah daftar **scene** berurutan di `data/story.js` bagian `scenes`. Satu scene = satu chat / telepon / catatan / timeline X.
- Saat scene mulai: muncul notifikasi beberapa detik. Kalau tidak diketuk, tidak apa-apa: pesan sudah ada di chat saat pembaca masuk (lihat titik merah di ikon aplikasi).
- Di dalam chat: pesan tokoh lain muncul sendiri. Saat giliran Riku, kolom ketik menyala. Pembaca **ketuk kolom ketik**, teks mengetik otomatis, lalu **ketuk tombol kirim**, dan cerita lanjut.
- Kalau pembaca keluar chat/aplikasi sebelum scene selesai, muncul notifikasi pengingat beberapa detik.
- Telepon: layar telepon masuk, ketuk **Terima**. Timer detik berjalan terus. Teks percakapan muncul satu per satu: **ketuk layar** untuk ganti ke ucapan berikutnya (yang lama hilang).
- Pembaca bebas buka Galeri, Catatan, X, Instagram, Kalender, Jam, Safari, Telepon kapan saja.
- Riwayat sebelum hari ini (chat, catatan 1 sampai 12, telepon lama, galeri, X, Instagram, kalender) sudah terisi dari Word-mu.
- Jam di status bar mengikuti jam cerita, baterai mengikuti narasi (38% sampai 9%).

---

## BAGIAN C. Mengganti foto, wallpaper, foto profil, voice note

Semua gambar **dipotong otomatis**: foto profil jadi bulat, foto chat berrasio tetap, galeri kotak. Jadi upload foto ukuran apa saja.

### Cara upload file di GitHub (tanpa install apa-apa)
1. Buka repo di GitHub, masuk ke folder tujuan (misal `assets/avatars`).
2. Klik **Add file > Upload files**, drag fotonya, lalu **Commit changes**.
3. Tunggu sekitar 30 detik, Vercel otomatis memperbarui website. Tekan refresh.

Nama file = nama yang diminta, ekstensi bebas (`.jpg`, `.png`, `.webp`). Contoh: `sion.jpg`.

### Daftar folder
| Mau ganti | Folder | Nama file |
|---|---|---|
| Foto profil tokoh | `assets/avatars/` | `riku`, `sion`, `yushi`, `daeyoung`, `ryo`, `sakuya`, `mama`, `coach`, `jeno`, `haechan`, `jisung`, `jaemin` |
| Foto grup chat | `assets/avatars/` | `group-mieayam`, `group-voli` |
| Foto profil akun X | `assets/avatars/` | `x-siaga`, `x-peta`, `x-hana`, `x-resident` |
| Wallpaper lockscreen | `assets/ui/` | `lockscreen` |
| Wallpaper homescreen | `assets/ui/` | `wallpaper` |
| Foto di widget homescreen | `assets/ui/` | `widget-photo` |
| Wallpaper chat WhatsApp (opsional) | `assets/ui/` | `chat-bg` |
| Foto di dalam chat, galeri, Instagram | `assets/photos/` | sesuai **id** di file `ASET.md` (contoh `foto-01`, `gal-03`, `ig-02`) |
| Voice note | `assets/audio/` | sesuai id (contoh `vn-01.mp3`) |

**Foto yang dikirim di chat (misal foto zombie dari Yushi):** buka `ASET.md`, cari barisnya (lokasi, jam, deskripsi dari Word), lihat id-nya (misal `foto-12`), lalu upload fotomu sebagai `assets/photos/foto-12.jpg`. Selama file belum ada, yang tampil kotak abu-abu bertuliskan deskripsi dari Word.

**Voice note Daeyoung menyanyi:** id-nya `vn-01`. Upload `assets/audio/vn-01.mp3`. Pembaca ketuk tombol play dan suaranya keluar. Kalau file belum ada, tombol play tetap jalan sebagai simulasi durasi.

---

## BAGIAN D. Mengedit cerita dan teks

### D1. Teks cerita: `data/story.js`
1. Di GitHub, buka `data/story.js`, klik ikon pensil (**Edit**).
2. Tekan Ctrl+F untuk mencari kalimat yang mau diubah, lalu ubah teks di dalam tanda kutip. Contoh baris pesan:
   `{"k":"msg","t":"06.10","from":"sion","text":"absen pagi. posisi dan kondisi. mulai dari riku."}`
   - `t` = jam pesan, `from` = pengirim (`me` = Riku, `sion`, `yushi`, `daeyoung`, `ryo`, `sakuya`, `mama`, `coach`, ...)
   - `text` = isi pesan. Ubah ini saja.
3. **Jangan hapus** tanda kutip, koma di akhir baris, atau kurung `{ }`. Kalau teksmu mengandung tanda kutip ganda, tulis `\"` (miring dulu).
4. Klik **Commit changes**. Kalau ada salah ketik di tanda baca, website bisa kosong. Tinggal buka **History** di GitHub dan kembalikan versi sebelumnya.

### D2. Jenis baris yang ada
| Baris | Fungsi |
|---|---|
| `{"k":"msg", "t":"jam", "from":"nama", "text":"..."}` | pesan teks |
| `{"k":"msg", ..., "type":"photo", "id":"foto-05", "desc":"..."}` | pesan foto (id = nama file foto) |
| `{"k":"msg", ..., "type":"voice", "id":"vn-01", "dur":"0:52", "desc":"..."}` | voice note |
| `{"k":"narr", "text":"..."}` | catatan narasi kecil di tengah chat |
| `{"k":"typing", "who":"Daeyoung"}` | indikator "sedang mengetik" beberapa detik |
| `{"k":"battery", "v":28}` | ubah baterai Riku jadi 28% |
| `{"k":"big", "text":"12.00"}` | teks besar layar penuh (bel berbunyi) |
| `{"k":"switch", "chat":"mieayam"}` | pindah otomatis ke chat lain |
| `{"k":"end"}` | akhir cerita ("TO BE CONTINUED") |

Pesan dengan `"from":"me"` adalah giliran Riku: **pembaca yang menekan kirim**.

### D3. Menambah pesan baru
Copy satu baris `msg`, paste di bawahnya, lalu ubah jam, pengirim, teks. Urutan baris = urutan cerita. Untuk foto baru, beri id baru (misal `foto-99`) lalu upload `assets/photos/foto-99.jpg`.

### D4. Menambah scene baru (chat/telepon/catatan lanjutan)
Di bagian `scenes`, copy satu scene serupa:
- chat: `"type":"chat"`, `"chat":"yushi"` (id chat: `mieayam`, `voli`, `daeyoung`, `sion`, `yushi`, `ryo`, `sakuya`, `mama`, `coach`), isi `items`.
- telepon: `"type":"call"`, `who`, `whoLabel`, `dur`, `intro`, dan `lines` berisi `{"from":"sion","text":"..."}` atau `{"action":"..."}`.
- catatan: `"type":"note"` dengan `note` berisi `no`, `title`, `date`, `body` (daftar paragraf).
- X: `"type":"twitter"` dengan `items` berisi tweet.
Taruh sebelum scene `end` terakhir, lalu pindahkan baris `{"k":"end"}` ke scene paling akhir.

### D5. Pengaturan: `data/config.js`
Ubah di sini: sandi (`passcode`), tanggal lockscreen, lama notifikasi tampil (`bannerMs`), kecepatan ketik otomatis (`typeSpeedMs`), rasio foto chat (`photoRatio`, misal `"3 / 4"` atau `"1 / 1"`), rasio galeri, cuaca widget, nama tampil tokoh, daftar alarm, dan pencarian Safari.

### D6. Mengetes bagian tengah cerita
Tambahkan `?debug=NOMOR` di link, misal `https://.../index.html?debug=10` untuk langsung mulai dari scene ke-10 (hitungan mulai dari 0). Riwayat chat Day 9 sebelumnya tidak terisi saat debug, jadi ini hanya untuk tes.

---

## BAGIAN E. Kalau ada masalah

| Masalah | Penyebab / solusi |
|---|---|
| Halaman putih / tidak bisa dibuka | Ada salah tanda baca di `story.js`. Cek **History** di GitHub dan kembalikan. Atau buka link, tekan F12, tab Console, baca pesan error dan nomor barisnya. |
| Foto belum berubah setelah upload | Tunggu 1 menit (Vercel deploy), lalu refresh keras (Ctrl+Shift+R). Pastikan nama file sama persis dengan id, huruf kecil, tanpa spasi. |
| Foto bulat tapi wajah terpotong | Ganti dengan foto yang wajahnya di tengah. Pemotongan selalu di tengah gambar. |
| Voice note tidak bunyi | Pastikan format mp3 / m4a, nama `vn-01.mp3`. Di iPhone, suara baru keluar setelah ketuk tombol play. |
| Mau domain sendiri | Di Vercel buka Project > Settings > Domains. |
| Mau cerita dilindungi password | Pakai Vercel Password Protection (paket berbayar) atau cukup andalkan kode sandi lockscreen. |

---

## Isi proyek
```
index.html          halaman utama
css/style.css       tampilan iPhone
js/app.js           mesin ponsel (jarang perlu diedit)
data/story.js       SEMUA ISI CERITA (edit di sini)
data/config.js      pengaturan, nama, rasio, sandi
assets/             tempat foto, profil, wallpaper, audio
ASET.md             daftar id foto/voice note yang bisa kamu isi
tools/build_story.py  (opsional) skrip pembuat story.js dari Word
```
