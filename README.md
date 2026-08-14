# Pantau Maggot Kita — panduan struktur

## Struktur folder

```
pantau-maggot-kita-web/
├── admin.html        halaman pengurus (tab Isi Data + Pantau + Panduan)
├── index.html        halaman publik, dituju QR code di kandang && default site
├── css/
│   └── style.css   satu file, semua tampilan
├── js/
│   ├── config.js   URL Apps Script — edit di sini kalau berubah
│   ├── dashboard.js ambil data, render KPI/box/grafik/Panduan (dipakai 2 halaman)
│   └── form.js     logika form isi data + tab switching (khusus admin.html)
└── images/          taruh foto di sini, nama file harus persis di bawah
```

Arsitektur datanya: **Pengurus → Admin Form (admin.html) → Google Apps Script → Google Sheets → Dashboard Publik (index.html)**. Pengurus cukup isi form di tab "Isi data", tidak perlu edit kode atau deploy ulang apa pun — dashboard publik otomatis membaca data terbaru lewat `APPS_SCRIPT_URL` di `js/config.js`. File tampilan (HTML/CSS/JS) dan sumber data (Google Sheets) sengaja dipisah: perubahan mingguan cukup terjadi di data, bukan di struktur website.

## Nama file gambar yang dicari otomatis

Kalau file belum ada, halaman tetap tampil rapi (pakai ilustrasi bawaan), jadi aman dicoba dulu tanpa gambar. Begitu file dengan nama ini ditaruh di folder `images/`, otomatis kepakai.

| Nama file | Dipakai di | Ukuran disaranin |
|---|---|---|
| `images/hero-maggot.jpg` | Foto besar di hero halaman Pantau | rasio 4:3, minimal 800x600px |
| `images/siklus-telur.jpg` | Tahap 1 siklus hidup | rasio 1:1, minimal 400x400px |
| `images/siklus-larva.jpg` | Tahap 2 siklus hidup | rasio 1:1, minimal 400x400px |
| `images/siklus-prepupa.jpg` | Tahap 3 siklus hidup | rasio 1:1, minimal 400x400px |
| `images/siklus-dewasa.jpg` | Tahap 4 siklus hidup | rasio 1:1, minimal 400x400px |

Format `.jpg` bisa diganti `.png` asal nama filenya diedit juga di HTML (cari `src="images/..."` di `index.html`).

## Menyambungkan data asli (Google Sheets)

Sekarang `js/dashboard.js` pakai data contoh (`DATA_CONTOH`) sebagai fallback. Begitu Apps Script sudah di-deploy dan URL-nya diisi di `js/config.js`, data otomatis ambil dari Sheets — format JSON yang diharapkan (versi baru, per Agustus 2026):

```json
{
  "kpi": { "sampahDiolah": 184, "totalPanen": 37, "boxBerjalan": 4, "siklusRata": 18 },
  "boxes": [
    { "nama": "Box A", "hari": 4, "siklus": 18, "updated": "2 jam lalu", "kondisi": "Normal" }
  ],
  "jaring": {
    "fase": "Lalat dewasa & bertelur",
    "hari": 6,
    "siklus": 10,
    "jumlahLalat": 240,
    "telurTerakhir": "3 hari lalu",
    "updated": "3 jam lalu"
  },
  "trend": {
    "7h": [ { "label": "Sen", "kg": 18 } ],
    "1b": [ { "label": "Mgg 1", "kg": 128 } ],
    "3b": [ { "label": "Jun", "kg": 480 } ]
  }
}
```

Perubahan dari versi lama:
- `trend` sekarang objek berisi 3 rentang (`"7h"`, `"1b"`, `"3b"`), bukan array tunggal. Tiap rentang array of `{ label, kg }`. Untuk `"1b"`, agregasi per minggu (4–5 titik) dalam bulan berjalan. Untuk `"3b"`, agregasi per bulan (3 titik: bulan ini + 2 bulan sebelumnya).
- Ada objek baru `jaring`, opsional — kalau di Apps Script belum ada datanya, kirim `null`/kosongkan field ini dan kartu jaring otomatis disembunyikan di halaman.
- **Baru:** tiap item di `boxes` sebaiknya menyertakan `kondisi`, diisi persis dengan nilai dropdown "Kondisi box" di form Isi Data (`"Normal"`, `"Terlalu basah"`, `"Terlalu kering"`, atau `"Berbau"`). Kalau `kondisi` bukan `"Normal"`, kartu box di tab Pantau otomatis menampilkan tombol "Lihat panduan" yang langsung membuka penjelasan terkait dari fitur Panduan — tanpa field ini, tombolnya cukup tidak muncul (tidak error).
- `kpi` dan `boxes` formatnya sama seperti sebelumnya — kartu ringkasan dan detailnya dihitung otomatis di frontend dari data ini, jadi tidak perlu field tambahan di Sheets untuk itu.

## Fitur Panduan & penanganan masalah

Ada di tab ketiga admin.html (`Panduan`). Isinya diambil dari `PANDUAN_DATA` di `js/dashboard.js` — tiap entri punya 6 bagian sesuai standar yang diminta: apa yang terjadi, kemungkinan penyebab, langkah penanganan, hal yang harus dihindari, kapan dipantau kembali, dan sumber informasi.

**Perlu ditindaklanjuti sebelum publikasi final:** konten 5 topik yang sudah ada (`Terlalu basah`, `Terlalu kering`, `Berbau`, `Muncul hama`, `Larva sedikit`) saat ini disusun dari rangkuman praktik teknis umum budidaya BSF, bukan dari kutipan jurnal/publikasi kampus/pedoman pemerintah spesifik seperti yang diminta di dokumen revisi. Silakan cek ulang tiap bagian dan tambahkan rujukan ilmiah resminya (mis. jurnal tentang *Hermetia illucens*, publikasi universitas, atau pedoman teknis Kementerian LHK/Pertanian) di field `sumber` masing-masing topik, dan sesuaikan kalau ada praktik lokal Randuacir yang berbeda dari rangkuman umum ini.

3 topik pertama (basah/kering/bau) sudah otomatis tertaut ke kartu box lewat field `kondisi`. 2 topik terakhir masih murni referensi manual — kalau mau ditautkan juga, tambahkan pilihan senama di dropdown `#kondisiBox` pada `admin.html`.

## Menjalankan di lokal

Klik kanan `index.html` atau `admin.html` di VS Code → Open with Live Server.
