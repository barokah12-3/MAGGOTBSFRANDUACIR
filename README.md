# Smartmag — panduan struktur

## Struktur folder

```
smartmag-web/
├── admin.html        halaman pengurus (tab Isi Data + Pantau)
├── index.html        halaman publik, dituju QR code di kandang && default site
├── css/
│   └── style.css   satu file, semua tampilan
├── js/
│   ├── config.js   URL Apps Script — edit di sini kalau berubah
│   ├── dashboard.js ambil data, render KPI/box/grafik (dipakai 2 halaman)
│   └── form.js     logika form + tab switching (khusus index.html)
└── images/          taruh foto di sini, nama file harus persis di bawah
```

## Nama file gambar yang dicari otomatis

Kalau file belum ada, halaman tetap tampil rapi (pakai ilustrasi bawaan), jadi aman dicoba dulu tanpa gambar. Begitu file dengan nama ini ditaruh di folder `images/`, otomatis kepakai.

| Nama file | Dipakai di | Ukuran disaranin |
|---|---|---|
| `images/hero-maggot.jpg` | Foto besar di hero halaman Pantau | rasio 4:3, minimal 800x600px |
| `images/siklus-telur.jpg` | Tahap 1 siklus hidup | rasio 1:1, minimal 400x400px |
| `images/siklus-larva.jpg` | Tahap 2 siklus hidup | rasio 1:1, minimal 400x400px |
| `images/siklus-prepupa.jpg` | Tahap 3 siklus hidup | rasio 1:1, minimal 400x400px |
| `images/siklus-dewasa.jpg` | Tahap 4 siklus hidup | rasio 1:1, minimal 400x400px |

Format `.jpg` bisa diganti `.png` asal nama filenya diedit juga di HTML (cari `src="images/..."` di `pantau.html`).

## Menyambungkan data asli (Google Sheets)

Sekarang `js/dashboard.js` pakai data contoh (`DATA_CONTOH`) sebagai fallback. Begitu Apps Script sudah di-deploy dan URL-nya diisi di `js/config.js`, data otomatis ambil dari Sheets — format JSON yang diharapkan (versi baru, per Agustus 2026):

```json
{
  "kpi": { "sampahDiolah": 184, "totalPanen": 37, "boxBerjalan": 4, "siklusRata": 18 },
  "boxes": [
    { "nama": "Box A", "hari": 4, "siklus": 18, "updated": "2 jam lalu" }
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
- Ada objek baru `jaring`, opsional — kalau di-Apps-Script belum ada datanya, kirim `null`/kosongkan field ini dan kartu jaring otomatis disembunyikan di halaman. Ini mewakili kandang jaring tempat larva yang tidak dipanen menyelesaikan siklus jadi prepupa → pupa → lalat dewasa → bertelur, lalu telurnya dipakai buat mulai box baru.
- `kpi` dan `boxes` formatnya sama seperti sebelumnya — kartu ringkasan dan detailnya sekarang dihitung otomatis di frontend dari data ini (rata-rata harian, efisiensi panen, sebaran status box, dll), jadi tidak perlu field tambahan di Sheets untuk itu.

## Menjalankan di lokal

Klik kanan `index.html` atau `pantau.html` di VS Code → Open with Live Server. Sama persis caranya kayak project UMKM Dlepih sebelumnya.
