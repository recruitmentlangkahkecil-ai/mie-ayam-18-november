// =====================================================================
//  config.js  -  PENGATURAN. Semua yang sering kamu ganti ada di sini.
//
//  CARA PAKAI GAMBAR / AUDIO:
//   - Tulis nama file TANPA ekstensi. Contoh 'assets/avatars/sion' akan
//     otomatis mencari sion.jpg / sion.jpeg / sion.png / sion.webp.
//   - Kalau file belum ada, tampil placeholder (inisial / kotak abu-abu).
//   - Gambar dipotong otomatis (bulat untuk foto profil, rasio tetap untuk
//     foto chat dan galeri), jadi kamu boleh upload ukuran apa saja.
// =====================================================================
window.CONFIG = {
  passcode: "0221",                 // kode sandi lockscreen
  lockDateLabel: "Selasa, 11 November",
  startTime: "05.57",               // jam di lockscreen sebelum cerita mulai
  bannerMs: 4500,                   // lama notifikasi tampil (milidetik)
  typeSpeedMs: 30,                  // kecepatan ngetik otomatis (makin kecil makin cepat)
  replyDelayMs: 900,                // jeda dasar sebelum balasan tokoh lain muncul
  photoRatio: "4 / 5",              // rasio foto di dalam chat (lebar / tinggi)
  galleryRatio: "1 / 1",            // rasio kotak di galeri

  images: {
    lockscreen:  "assets/ui/lockscreen",    // wallpaper lockscreen
    wallpaper:   "assets/ui/wallpaper",     // wallpaper homescreen
    widgetPhoto: "assets/ui/widget-photo",  // foto di widget homescreen
    chatBg:      "assets/ui/chat-bg"        // (opsional) wallpaper chat WhatsApp
  },

  weather: { place: "Neo City", temp: "24°", cond: "Berawan", hi: "T:29°", lo: "R:21°" },

  // Foto profil -> assets/avatars/<avatar>.jpg  (nama tampil bisa diubah di sini)
  people: {
    me:       { name: "Riku",     chatName: "Riku",           avatar: "assets/avatars/riku",     color: "#34b7f1" },
    sion:     { name: "Sion",     chatName: "Kak Sion",       avatar: "assets/avatars/sion",     color: "#c27cf0" },
    yushi:    { name: "Yushi",    chatName: "Yushi",          avatar: "assets/avatars/yushi",    color: "#4fa3ff" },
    daeyoung: { name: "Daeyoung", chatName: "Daeyoung",       avatar: "assets/avatars/daeyoung", color: "#5bd26c" },
    ryo:      { name: "Ryo",      chatName: "Ryo",            avatar: "assets/avatars/ryo",      color: "#ff9f43" },
    sakuya:   { name: "Sakuya",   chatName: "Sakuya",         avatar: "assets/avatars/sakuya",   color: "#ff6b9d" },
    mama:     { name: "Mama",     chatName: "Mama",           avatar: "assets/avatars/mama",     color: "#f5c542" },
    coach:    { name: "Coach Jaehyun", chatName: "Coach Jaehyun", avatar: "assets/avatars/coach", color: "#ff7a59" },
    jeno:     { name: "Jeno",     chatName: "Jeno",           avatar: "assets/avatars/jeno",     color: "#4dd0c8" },
    haechan:  { name: "Haechan",  chatName: "Haechan",        avatar: "assets/avatars/haechan",  color: "#e5d352" },
    jisung:   { name: "Jisung",   chatName: "Jisung",         avatar: "assets/avatars/jisung",   color: "#9bd45a" },
    jaemin:   { name: "Jaemin",   chatName: "Jaemin",         avatar: "assets/avatars/jaemin",   color: "#ff8e72" }
  },

  // Avatar grup chat -> assets/avatars/group-<id>.jpg
  groupAvatars: { voli: "assets/avatars/group-voli", mieayam: "assets/avatars/group-mieayam" },

  // Urutan awal daftar chat WhatsApp (paling atas dulu)
  chatOrder: ["daeyoung", "mieayam", "sion", "yushi", "ryo", "sakuya", "voli", "coach", "mama"],

  // Akun X (Twitter): nama tampil, centang biru, foto -> assets/avatars/x-<nama>.jpg
  xAccounts: {
    "@NeoCity_Siaga": { name: "Pusat Komando Siaga Neo City", verified: true,  avatar: "assets/avatars/x-siaga" },
    "@peta_wabah":    { name: "Peta Wabah Neo City",           verified: true,  avatar: "assets/avatars/x-peta" },
    "@dr_hana":       { name: "dr. Hana",                      verified: false, avatar: "assets/avatars/x-hana" },
    "@neo_resident":  { name: "warga neo city",                verified: false, avatar: "assets/avatars/x-resident" }
  },
  xMyAvatar: "assets/avatars/riku",

  // Instagram: foto profil akun -> assets/avatars/ig-<nama>.jpg  (nama kecil, tanpa spasi)
  igHandles: { Riku: "riku.setter3", Sakuya: "sakuya.drums", Daeyoung: "dae_young11", Jeno: "jeno.libero", "akun sekolah": "sma.neolumina" },

  alarms: [
    { t: "04.30", label: "Absen terakhir", on: true },
    { t: "06.00", label: "Bangun", on: false },
    { t: "15.30", label: "Latihan voli", on: false }
  ],
  safariRecents: ["cara menyaring air tanpa listrik", "tanda dehidrasi sedang", "gang orbit neo city peta", "cara kerja mixer audio"]
};
