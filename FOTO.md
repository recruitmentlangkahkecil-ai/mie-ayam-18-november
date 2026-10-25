# CARA MEMASUKKAN FOTO, WALLPAPER, PROFIL, DAN IKON (versi paling mudah)

Kamu TIDAK perlu membuat folder. Cukup upload foto ke halaman utama repo GitHub-mu
(tempat `index.html` berada) dengan NAMA FILE yang tepat. Aplikasi mencarinya otomatis.
Boleh .jpg / .jpeg / .png / .webp. Ukuran foto bebas, dipotong otomatis.

## Langkah umum (berlaku untuk semua foto)
1. Buka repo di github.com.
2. Klik **Add file** lalu **Upload files**.
3. Drag foto-fotonya. Sebelum upload, GANTI NAMA tiap foto sesuai tabel di bawah (huruf kecil, tanpa spasi).
4. Klik **Commit changes**. Tunggu sekitar 30 detik, lalu refresh keras (Cmd+Shift+R di Mac, Ctrl+Shift+R di Windows).

## Tabel nama file
| Mau ganti | Nama file |
|---|---|
| Wallpaper lockscreen | `lockscreen.jpg` |
| Wallpaper homescreen | `wallpaper.jpg` |
| Foto di widget homescreen | `widget-photo.jpg` |
| Wallpaper chat WhatsApp | `chat-bg.jpg` |
| Foto profil Riku | `riku.jpg` |
| Foto profil Sion / Yushi / Daeyoung / Ryo / Sakuya | `sion.jpg` / `yushi.jpg` / `daeyoung.jpg` / `ryo.jpg` / `sakuya.jpg` |
| Foto profil Mama, Coach, Jeno, Haechan, Jisung, Jaemin | `mama.jpg`, `coach.jpg`, `jeno.jpg`, `haechan.jpg`, `jisung.jpg`, `jaemin.jpg` |
| Foto grup chat | `group-mieayam.jpg`, `group-voli.jpg` |
| Foto profil akun X | `x-siaga.jpg`, `x-peta.jpg`, `x-hana.jpg`, `x-resident.jpg` |
| Foto profil Instagram | `ig-<nama akun>.jpg`, contoh `ig-riku.setter3.jpg` |
| Foto di Galeri (aplikasi Foto) | `gal-01.jpg`, `gal-02.jpg`, dst |
| Foto di Instagram | `ig-01.jpg`, `ig-02.jpg`, dst |
| Foto di tweet X | `xt-01.jpg`, `xt-02.jpg`, dst |
| Foto yang dikirim di chat | `foto-01.jpg`, `foto-02.jpg`, dst |
| Voice note | `vn-01.mp3`, `vn-02.mp3`, dst |

## Cara tahu nomor foto yang mana (PENTING)
Buka web-mu dengan tambahan `?edit=1` di belakang link, misalnya
`https://mie-ayam-18-november.vercel.app/?edit=1`.
Di mode ini, setiap kotak foto yang masih kosong menampilkan NAMA FILE-nya
(contoh `gal-03 · foto jersey nomor sepuluh`). Tinggal upload foto dengan nama itu.
Daftar lengkap semua nama juga ada di file `ASET.md`.

## Cara ganti ikon
Semua ikon (telepon, video call, kamera, keyboard, love, dll) sudah berupa simbol garis, bukan emoji.
Kalau mau ikon sendiri, upload gambar (.png, .svg, atau .webp, sebaiknya latar transparan, kotak)
dengan nama `ic-<nama ikon>`. Contoh:
- ikon telepon di pojok kanan atas chat: `ic-phone.png`
- ikon video call: `ic-video.png`
- kamera dan mikrofon di kolom ketik: `ic-camera.png`, `ic-mic.png`
- tombol kirim: `ic-sendup.png`
- love, komentar, retweet di X: `ic-heart.png`, `ic-comment.png`, `ic-retweet.png`
Daftar nama ikon: location, cloud, search, flashlight, camera, airplane, wifi, people, compose, check,
checks, play, pause, video, phone, plus, sendup, shift, backspace, bell, close, dots, share, comment,
retweet, heart, chart, verified, xlogo, home, grok, mail, star, clock, user, keypad, voicemail, info,
speaker, album, photos, igsend, reels, globe, alarm, stopwatch, timer, mic, arrowr.
Satu ikon dipakai di semua tempat yang sama, jadi sekali ganti, semuanya berubah.

## Kalau mau rapi pakai folder (opsional)
Kamu juga boleh menaruh file di folder `assets/avatars/`, `assets/photos/`, `assets/ui/`, `assets/audio/`, `assets/icons/`.
Aplikasi mencari di folder dulu, baru di halaman utama.
