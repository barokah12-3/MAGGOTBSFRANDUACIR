/* ==========================================================
   SMARTMAG — dashboard.js
   Logika sisi "Pantau": ambil data, hitung status, render ke HTML.
   Dipakai bareng oleh index.html (tab Pantau) dan pantau.html.
   Butuh config.js dimuat SEBELUM file ini (pakai APPS_SCRIPT_URL).
   ========================================================== */

/* ---------- Data contoh (dipakai kalau Apps Script belum tersambung) ---------- */
const DATA_CONTOH = {
  kpi: { sampahDiolah: 184, totalPanen: 37, boxBerjalan: 4, siklusRata: 18 },
  boxes: [
    { nama: "Box A", hari: 4, siklus: 18, updated: "2 jam lalu", kondisi: "Normal" },
    { nama: "Box B", hari: 12, siklus: 18, updated: "5 jam lalu", kondisi: "Terlalu basah" },
    { nama: "Box C", hari: 16, siklus: 18, updated: "1 hari lalu", kondisi: "Normal" },
    { nama: "Box D", hari: 8, siklus: 18, updated: "3 jam lalu", kondisi: "Normal" }
  ],
  /* Kandang jaring: tempat larva yang tidak dipanen menyelesaikan siklusnya
     jadi prepupa - pupa - lalat dewasa - bertelur lagi. Ini yang bikin siklus
     jalan sendiri, bukan cuma tanam-panen-abis. */
  jaring: {
    fase: "Lalat dewasa & bertelur",
    hari: 6,
    siklus: 10,
    jumlahLalat: 240,
    telurTerakhir: "3 hari lalu",
    updated: "3 jam lalu"
  },
  trend: {
    "7h": [
      { label: "Sen", kg: 18 }, { label: "Sel", kg: 22 }, { label: "Rab", kg: 15 },
      { label: "Kam", kg: 26 }, { label: "Jum", kg: 20 }, { label: "Sab", kg: 24 }, { label: "Min", kg: 30 }
    ],
    "1b": [
      { label: "Mgg 1", kg: 128 }, { label: "Mgg 2", kg: 145 },
      { label: "Mgg 3", kg: 132 }, { label: "Mgg 4", kg: 156 }
    ],
    "3b": [
      { label: "Jun", kg: 480 }, { label: "Jul", kg: 512 }, { label: "Ags", kg: 184 }
    ]
  }
};

/* ---------- Judul tren per rentang waktu ---------- */
const TREND_TITLES = {
  "7h": "Sampah masuk 7 hari terakhir",
  "1b": "Sampah masuk bulan ini",
  "3b": "Sampah masuk 3 bulan terakhir"
};

/* ---------- Detail tiap tahap siklus hidup, dipakai modal ---------- */
const STAGE_DETAILS = {
  telur: {
    title: "Telur",
    hari: "Hari 0–4",
    img: "images/siklus-telur.jpg",
    icon: `<svg width="34" height="34" viewBox="0 0 44 44" aria-hidden="true"><ellipse cx="22" cy="22" rx="10" ry="14" fill="var(--cream)" stroke="var(--gold)" stroke-width="2"/></svg>`,
    ciri: [
      "Menempel berkelompok di media bertekstur, misalnya kardus bergelombang",
      "Diletakkan induk lalat dekat sumber bau fermentasi sebagai umpan",
      "Warna putih kekuningan, ukuran sangat kecil, sekitar 1 mm",
      "Menetas dalam 3–4 hari, tergantung suhu ruang"
    ],
    rawat: [
      "Jaga media tetap lembab, jangan sampai basah menggenang",
      "Simpan di tempat teduh dan hangat, sekitar 27–30°C",
      "Begitu menetas, segera pindahkan ke media pakan"
    ]
  },
  larva: {
    title: "Larva makan aktif",
    hari: "Hari 5–18",
    img: "images/siklus-larva.jpg",
    icon: `<svg width="40" height="40" viewBox="0 0 50 50" aria-hidden="true"><path d="M8 25 Q15 15 25 25 Q35 35 42 25" fill="none" stroke="var(--moss)" stroke-width="5" stroke-linecap="round"/></svg>`,
    ciri: [
      "Warna putih krem, badan bersegmen dan aktif bergerak",
      "Nafsu makan sangat tinggi, tumbuh cepat dari kurang dari 1 mm sampai sekitar 2 cm",
      "Fase inilah yang paling banyak mengolah sampah organik jadi bobot badan"
    ],
    rawat: [
      "Beri pakan organik segar secara rutin, jangan sampai kehabisan",
      "Jaga kelembaban media di kisaran 60–70%",
      "Pastikan sirkulasi udara cukup dan box tidak terlalu padat",
      "Hindari genangan air atau bau busuk berlebih"
    ]
  },
  prepupa: {
    title: "Prepupa & pupa",
    hari: "Hari 19–32",
    img: "images/siklus-prepupa.jpg",
    icon: `<svg width="34" height="34" viewBox="0 0 44 44" aria-hidden="true"><rect x="10" y="16" width="24" height="12" rx="6" fill="var(--gold-light)" stroke="var(--gold)" stroke-width="2"/></svg>`,
    ciri: [
      "Warna berubah gelap kecoklatan hingga kehitaman",
      "Gerakan melambat, berhenti makan sepenuhnya",
      "Mulai merayap naik mencari tempat kering untuk pupasi",
      "Kulit luar mengeras membentuk cangkang pupa"
    ],
    rawat: [
      "Sediakan jalur atau ram miring supaya bisa merayap keluar sendiri dari media basah",
      "Siapkan wadah penampung kering di ujung jalur itu",
      "Jangan diganggu atau dipindah kasar selama masa ini",
      "Fase ini dipantau di kandang jaring, bukan di box panen biasa"
    ]
  },
  dewasa: {
    title: "Lalat BSF dewasa",
    hari: "Hari 33–40",
    img: "images/siklus-dewasa.jpg",
    icon: `<svg width="36" height="36" viewBox="0 0 46 46" aria-hidden="true"><ellipse cx="23" cy="23" rx="14" ry="7" fill="var(--clay-light)" stroke="var(--clay)" stroke-width="2"/></svg>`,
    ciri: [
      "Bentuk menyerupai tawon tapi tidak menyengat dan tidak berbahaya",
      "Tidak makan sama sekali, hanya perlu minum air",
      "Umur hidup pendek, sekitar 5–8 hari",
      "Betina kawin lalu bertelur di celah dekat sumber bau fermentasi"
    ],
    rawat: [
      "Sediakan kandang jaring dengan cahaya cukup — lalat butuh cahaya untuk kawin",
      "Taruh media bertelur seperti kardus bergelombang dekat umpan berbau",
      "Sediakan air minum di dalam jaring",
      "Kumpulkan telur setiap beberapa hari untuk memulai siklus box berikutnya"
    ]
  }
};

/* ---------- Panduan & penanganan masalah ----------
   Key untuk 3 item pertama SENGAJA sama persis dengan pilihan "Kondisi box"
   di form Isi Data (lihat admin.html <select id="kondisiBox">), supaya
   box yang kondisinya tidak "Normal" bisa otomatis menautkan tombol
   "Lihat Panduan" ke penjelasan yang tepat. Dua item terakhir murni
   referensi, belum ada field form-nya.
   Sumber: rangkuman praktik teknis budidaya larva BSF (Hermetia illucens)
   dari berbagai panduan pengelolaan sampah organik berbasis maggot dan
   referensi umum budidaya BSF — cek berkas revisi untuk daftar sumber
   ilmiah resmi yang perlu ditambahkan sebelum publikasi final. */
const PANDUAN_DATA = {
  "Terlalu basah": {
    judul: "Media terlalu basah",
    tag: "Perlu ditangani",
    apa: "Media pakan tampak becek atau menggenang air, larva terlihat lesu dan berkumpul di permukaan, mulai tercium bau tidak sedap.",
    penyebab: [
      "Sampah yang dimasukkan terlalu basah atau berkuah",
      "Lubang drainase di dasar box tersumbat sehingga cairan lindi tidak keluar",
      "Pemberian pakan berlebihan sehingga menumpuk sebelum sempat diurai"
    ],
    langkah: [
      "Tambahkan bahan kering penyerap sedikit demi sedikit — karton bergelombang sobek, sekam, atau serbuk gergaji — sambil diaduk ringan",
      "Pastikan lubang drainase tidak tersumbat supaya cairan lindi bisa keluar",
      "Kurangi jumlah pakan basah untuk sementara sampai media kembali normal"
    ],
    hindari: [
      "Jangan menambah air sama sekali",
      "Jangan menutup box rapat tanpa ventilasi, ini memperparah kondisi kekurangan oksigen",
      "Jangan mengaduk seluruh media sekaligus, larva bisa terluka"
    ],
    pantau: "Cek lagi dalam 1x24 jam. Tekstur target seperti spons yang sudah diperas — lembab tapi tidak menetes."
  },
  "Terlalu kering": {
    judul: "Media terlalu kering",
    tag: "Perlu ditangani",
    apa: "Media tampak kering dan berdebu, larva bergerak lambat atau menggerombol mencari sisa kelembapan.",
    penyebab: [
      "Cuaca panas dan kering di sekitar kandang",
      "Pakan yang dimasukkan sudah kering, misalnya nasi basi yang mengeras",
      "Terlalu jarang menambahkan sampah berkadar air tinggi"
    ],
    langkah: [
      "Percikkan air bersih secara merata ke permukaan media, jangan disiram deras di satu titik",
      "Tambahkan sisa sayur atau buah yang berkadar air tinggi",
      "Aduk ringan supaya kelembapan tersebar merata"
    ],
    hindari: [
      "Jangan menyiram sampai tergenang",
      "Jangan menambahkan air sekaligus banyak dalam satu waktu",
      "Jangan biarkan box terkena matahari langsung sepanjang hari"
    ],
    pantau: "Cek lagi 6–12 jam setelah penambahan air. Larva seharusnya sudah kembali aktif bergerak."
  },
  "Berbau": {
    judul: "Bau menyengat",
    tag: "Perlu ditangani",
    apa: "Bau asam atau menyengat sudah tercium sebelum dekat ke box.",
    penyebab: [
      "Ada pakan berlebih yang belum sempat diurai dan mulai membusuk",
      "Kondisi media terlalu basah sehingga kekurangan oksigen",
      "Ada bahan yang sebenarnya tidak cocok masuk, misalnya minyak, santan, atau daging"
    ],
    langkah: [
      "Kurangi porsi pakan dan beri jeda sekitar 1 hari sebelum menambah lagi",
      "Buang gumpalan pakan yang sudah membusuk atau berjamur",
      "Tambahkan bahan kering penyerap dan pastikan drainase lancar (lihat juga panduan Media terlalu basah)"
    ],
    hindari: [
      "Jangan menutup box rapat tanpa ventilasi",
      "Jangan memasukkan pakan berminyak, bersantan, atau daging",
      "Jangan menambah pakan baru sebelum pakan lama habis dimakan"
    ],
    pantau: "Cek harian sampai bau hilang. Biasanya membaik dalam 1–2 hari setelah penyesuaian."
  },
  "Muncul hama": {
    judul: "Muncul hama atau lalat rumah",
    tag: "Referensi",
    apa: "Ada semut, kecoa, atau lalat rumah biasa yang mengerumuni box — bukan lalat BSF dewasa yang memang menghuni kandang jaring.",
    penyebab: [
      "Sisa pakan tercecer di luar box mengundang hama lain",
      "Celah pada box tidak tertutup rapat",
      "Bau dari media yang bermasalah menarik hama tambahan"
    ],
    langkah: [
      "Bersihkan area sekitar box dari ceceran sampah",
      "Tutup celah yang jadi jalan masuk hama, tapi tetap sisakan ventilasi udara",
      "Gunakan penghalang air (water moat) di kaki box untuk mencegah semut naik"
    ],
    hindari: [
      "Jangan pakai insektisida di dalam atau di sekitar box — larva BSF juga ikut mati",
      "Jangan taruh sampah non-organik di dekat box"
    ],
    pantau: "Cek harian, terutama pagi dan sore saat hama biasanya paling aktif."
  },
  "Larva sedikit": {
    judul: "Larva sedikit atau pertumbuhan lambat",
    tag: "Referensi",
    apa: "Jumlah larva terlihat sedikit dibanding biasanya, atau ukurannya tidak kunjung membesar sesuai umur box.",
    penyebab: [
      "Telur yang ditanam dari kandang jaring jumlahnya sedikit",
      "Suhu media di luar kisaran ideal sekitar 27–30°C",
      "Variasi pakan kurang sehingga larva kurang asupan gizi"
    ],
    langkah: [
      "Pastikan telur dari kandang jaring rutin dipanen dan ditanam ke box baru",
      "Jaga box tetap di tempat teduh dan hangat",
      "Variasikan jenis sampah organik — sayur, buah, ampas kopi — jangan satu jenis terus-menerus"
    ],
    hindari: [
      "Jangan terlalu sering memindahkan larva muda, mereka rentan stres",
      "Jangan biarkan box kosong dari pakan dalam waktu lama"
    ],
    pantau: "Bandingkan pertumbuhan setiap 3–4 hari untuk melihat ada perbaikan atau belum."
  }
};

/* ---------- State ---------- */
let DATA_CACHE = null;
let currentTrendRange = "7h";

/* ---------- Ambil data dari Apps Script (fallback ke data contoh kalau gagal) ---------- */
async function ambilDataDashboard() {
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?aksi=dashboard");
    if (!res.ok) throw new Error("respons tidak ok");
    return await res.json();
  } catch (err) {
    console.warn("Gagal ambil data dari Apps Script, pakai data contoh:", err);
    return DATA_CONTOH;
  }
}

/* ---------- Hitung status & fase 1 box berdasarkan umur siklusnya ---------- */
function hitungStatusBox(hari, siklus) {
  const persen = Math.min(100, Math.round((hari / siklus) * 100));

  let label, kelas;
  if (persen < 55) { label = "Sedang tumbuh"; kelas = "tumbuh"; }
  else if (persen < 85) { label = "Menjelang panen"; kelas = "menjelang"; }
  else { label = "Siap panen"; kelas = "siap"; }

  /* fase biologis, lebih rinci daripada badge status di atas */
  let fase, faseKelas;
  if (persen < 8) { fase = "Telur / larva muda"; faseKelas = "telur"; }
  else if (persen < 55) { fase = "Larva aktif makan"; faseKelas = "larva"; }
  else if (persen < 85) { fase = "Larva besar"; faseKelas = "besar"; }
  else { fase = "Prepupa, siap dipanen"; faseKelas = "siap"; }

  return { label, kelas, persen, fase, faseKelas };
}

/* ---------- Ikon kecil per fase, dipasang di kartu box ---------- */
function faseIconSVG(kelas) {
  const icons = {
    telur: `<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><ellipse cx="7" cy="7" rx="4" ry="5.5" fill="none" stroke="var(--gold)" stroke-width="1.6"/></svg>`,
    larva: `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 9 Q5 5 8 9 Q11 13 14 9" fill="none" stroke="var(--moss)" stroke-width="2" stroke-linecap="round"/></svg>`,
    besar: `<svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true"><rect x="1" y="1" width="14" height="8" rx="4" fill="none" stroke="var(--gold)" stroke-width="1.6"/></svg>`,
    siap: `<svg width="16" height="9" viewBox="0 0 16 9" aria-hidden="true"><ellipse cx="8" cy="4.5" rx="7" ry="3.6" fill="none" stroke="var(--clay)" stroke-width="1.6"/></svg>`
  };
  return icons[kelas] || icons.larva;
}

/* ---------- Render kartu KPI + delta + detail ---------- */
function renderKPI(kpi, boxes, trend7h) {
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setVal("kpi-sampah", kpi.sampahDiolah);
  setVal("kpi-panen", kpi.totalPanen);
  setVal("kpi-box", kpi.boxBerjalan);
  setVal("kpi-siklus", kpi.siklusRata);

  /* Delta sampah hari ini vs kemarin, dihitung dari 2 titik terakhir tren 7 hari */
  const deltaEl = document.getElementById("kpi-sampah-delta");
  if (deltaEl && Array.isArray(trend7h) && trend7h.length >= 2) {
    const hariIni = trend7h[trend7h.length - 1].kg;
    const kemarin = trend7h[trend7h.length - 2].kg;
    const selisih = hariIni - kemarin;
    deltaEl.textContent = selisih === 0 ? "Sama seperti kemarin" : `${selisih > 0 ? "+" : ""}${selisih} kg dari kemarin`;
    deltaEl.className = "kpi-delta " + (selisih > 0 ? "up" : selisih < 0 ? "down" : "");
  }

  const jumlahStatus = { tumbuh: 0, menjelang: 0, siap: 0 };
  boxes.forEach(b => { jumlahStatus[hitungStatusBox(b.hari, b.siklus).kelas]++; });

  const detailSampah = document.getElementById("kpi-detail-sampah");
  if (detailSampah && Array.isArray(trend7h) && trend7h.length) {
    const rata = (trend7h.reduce((a, d) => a + d.kg, 0) / trend7h.length).toFixed(1);
    const puncak = trend7h.reduce((a, d) => (d.kg > a.kg ? d : a));
    detailSampah.innerHTML = `
      <li>Rata-rata <strong>${rata} kg/hari</strong> dalam 7 hari terakhir</li>
      <li>Hari paling banyak: <strong>${puncak.label}, ${puncak.kg} kg</strong></li>`;
  }

  const detailPanen = document.getElementById("kpi-detail-panen");
  if (detailPanen) {
    const efisiensi = kpi.sampahDiolah > 0 ? Math.round((kpi.totalPanen / kpi.sampahDiolah) * 100) : 0;
    const rataBox = kpi.boxBerjalan > 0 ? (kpi.totalPanen / kpi.boxBerjalan).toFixed(1) : "0";
    detailPanen.innerHTML = `
      <li>Sekitar <strong>${efisiensi}%</strong> dari sampah yang diolah jadi hasil panen</li>
      <li>Rata-rata <strong>${rataBox} kg</strong> per box</li>`;
  }

  const detailBox = document.getElementById("kpi-detail-box");
  if (detailBox) {
    detailBox.innerHTML = `
      <li><strong>${jumlahStatus.tumbuh}</strong> box sedang tumbuh</li>
      <li><strong>${jumlahStatus.menjelang}</strong> box menjelang panen</li>
      <li><strong>${jumlahStatus.siap}</strong> box siap panen</li>`;
  }

  const detailSiklus = document.getElementById("kpi-detail-siklus");
  if (detailSiklus && boxes.length) {
    const tercepat = boxes.reduce((a, b) => (a.siklus < b.siklus ? a : b));
    const terlama = boxes.reduce((a, b) => (a.siklus > b.siklus ? a : b));
    detailSiklus.innerHTML = `
      <li>Target tercepat: <strong>${tercepat.nama}, ${tercepat.siklus} hari</strong></li>
      <li>Target terlama: <strong>${terlama.nama}, ${terlama.siklus} hari</strong></li>`;
  }
}

/* ---------- Dropdown "Rentang" — ambil ulang sampah diolah & total panen per periode ---------- */
async function ambilKPIPeriode(periode) {
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?aksi=kpi&periode=" + periode);
    if (!res.ok) throw new Error("respons tidak ok");
    return await res.json();
  } catch (err) {
    console.warn("Gagal ambil KPI periode:", err);
    return null;
  }
}

async function terapkanPeriodeKPI(periode) {
  const sampahEl = document.getElementById("kpi-sampah");
  const panenEl = document.getElementById("kpi-panen");
  if (!sampahEl || !panenEl) return;

  const data = await ambilKPIPeriode(periode);
  if (!data) return;

  sampahEl.textContent = data.sampahDiolah;
  panenEl.textContent = data.totalPanen;

  const detailPanen = document.getElementById("kpi-detail-panen");
  if (detailPanen && DATA_CACHE) {
    const efisiensi = data.sampahDiolah > 0 ? Math.round((data.totalPanen / data.sampahDiolah) * 100) : 0;
    const boxBerjalan = DATA_CACHE.kpi.boxBerjalan || 0;
    const rataBox = boxBerjalan > 0 ? (data.totalPanen / boxBerjalan).toFixed(1) : "0";
    detailPanen.innerHTML = `
      <li>Sekitar <strong>${efisiensi}%</strong> dari sampah yang diolah jadi hasil panen</li>
      <li>Rata-rata <strong>${rataBox} kg</strong> per box</li>`;
  }
}

function initKpiPeriode() {
  const select = document.getElementById("kpi-periode");
  if (!select) return;
  select.addEventListener("change", () => terapkanPeriodeKPI(select.value));
}

/* ---------- Buka/tutup detail kartu KPI ---------- */
function initKpiToggle() {
  document.querySelectorAll(".kpi-detail-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".kpi-card").classList.toggle("expanded");
    });
  });
}

/* ---------- Render grid status box ---------- */
function renderBoxGrid(boxes) {
  const grid = document.getElementById("box-grid");
  if (!grid) return;
  grid.innerHTML = "";
  boxes.forEach(b => {
    const s = hitungStatusBox(b.hari, b.siklus);
    const isAdminPage = !!document.getElementById("panduan-modal");
    const perluPerhatian = isAdminPage && b.kondisi && b.kondisi !== "Normal" && PANDUAN_DATA[b.kondisi];
    const card = document.createElement("div");
    card.className = "box-card reveal";
    card.innerHTML = `
      <div class="box-card-top">
        <div class="box-id">
          <span class="fase-icon ${s.faseKelas}">${faseIconSVG(s.faseKelas)}</span>
          <span class="box-name">${b.nama}</span>
        </div>
        <span class="box-badge ${s.kelas}">${s.label}</span>
      </div>
      <p class="box-fase-text">${s.fase}</p>
      <div class="progress-track">
        <div class="progress-fill ${s.kelas}" data-target="${s.persen}"></div>
      </div>
      <div class="box-meta">
        <span>Hari ke-${b.hari} dari ${b.siklus}</span>
        <span>${b.updated}</span>
      </div>
      ${perluPerhatian ? `<div class="box-warning"><span>${b.kondisi}</span><button type="button" class="box-warning-link" data-panduan="${b.kondisi}">Lihat panduan</button></div>` : ""}`;
    grid.appendChild(card);
  });
  grid.querySelectorAll("[data-panduan]").forEach(btn => {
    btn.addEventListener("click", () => bukaModalPanduan(btn.dataset.panduan));
  });
  requestAnimationFrame(() => {
    document.querySelectorAll(".progress-fill").forEach(el => {
      el.style.width = el.dataset.target + "%";
    });
  });
}

/* ---------- Render kartu kandang jaring (breeding net) ---------- */
function renderJaring(jaring) {
  const el = document.getElementById("jaring-card");
  if (!el) return;
  if (!jaring) { el.style.display = "none"; return; }
  el.style.display = "";
  el.innerHTML = `
    <div class="jaring-icon">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <ellipse cx="13" cy="13" rx="10" ry="5" fill="none" stroke="var(--clay)" stroke-width="2"/>
        <circle cx="13" cy="13" r="2" fill="var(--clay)"/>
      </svg>
    </div>
    <div class="jaring-info">
      <h3>Kandang jaring</h3>
      <p>${jaring.fase} &middot; hari ke-${jaring.hari} dari ${jaring.siklus} &middot; diperbarui ${jaring.updated}</p>
      <p>Larva yang tidak dipanen tumbuh jadi lalat dewasa di sini, lalu bertelur lagi buat mulai box baru — siklus jalan sendiri, bukan cuma tanam-panen-abis.</p>
    </div>
    <div class="jaring-stats">
      <div class="jaring-stat"><span class="val">${jaring.jumlahLalat}</span><span class="lbl">ekor lalat</span></div>
      <div class="jaring-stat"><span class="val">${jaring.telurTerakhir}</span><span class="lbl">telur terakhir</span></div>
    </div>`;
}

/* ---------- Render grafik tren (batang CSS sederhana), sesuai rentang aktif ---------- */
function renderTrendChart(rangeKey) {
  const chart = document.getElementById("trend-chart");
  if (!chart || !DATA_CACHE) return;
  const trend = (DATA_CACHE.trend && DATA_CACHE.trend[rangeKey]) || [];
  chart.innerHTML = "";
  if (!trend.length) return;

  const maxKg = Math.max(...trend.map(d => d.kg));
  const terakhir = trend.length - 1;
  trend.forEach((d, i) => {
    const col = document.createElement("div");
    col.className = "trend-col";
    const tinggiPx = maxKg > 0 ? Math.round((d.kg / maxKg) * 120) : 0;
    col.innerHTML = `
      <span class="trend-label-val">${d.kg}</span>
      <div class="trend-bar ${i === terakhir ? "today" : ""}" data-target="${tinggiPx}"></div>
      <span class="trend-label-day">${d.label}</span>`;
    chart.appendChild(col);
  });
  requestAnimationFrame(() => {
    chart.querySelectorAll(".trend-bar").forEach(el => {
      el.style.height = el.dataset.target + "px";
    });
  });

  const titleEl = document.getElementById("trend-title");
  if (titleEl) titleEl.textContent = TREND_TITLES[rangeKey] || TREND_TITLES["7h"];
}

/* ---------- Tab pemilih rentang tren ---------- */
function initTrendTabs() {
  const tabs = document.querySelectorAll(".trend-tab-btn");
  if (!tabs.length) return;
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentTrendRange = btn.dataset.range;
      renderTrendChart(currentTrendRange);
    });
  });
}

/* ---------- Modal detail tahap siklus hidup ---------- */
function bukaModalSiklus(stageId) {
  const data = STAGE_DETAILS[stageId];
  const overlay = document.getElementById("siklus-modal");
  if (!data || !overlay) return;
  const imgHtml = data.img
    ? `<img src="${data.img}" alt="${data.title}" width="84" height="84" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
       <div class="fallback-illustration" style="display:none;">${data.icon}</div>`
    : data.icon;
  overlay.querySelector(".modal-stage-img").innerHTML = imgHtml;
  overlay.querySelector(".modal-stage-day").textContent = data.hari;
  overlay.querySelector(".modal-stage-title").textContent = data.title;
  overlay.querySelector(".modal-ciri").innerHTML = data.ciri.map(c => `<li>${c}</li>`).join("");
  overlay.querySelector(".modal-rawat").innerHTML = data.rawat.map(r => `<li>${r}</li>`).join("");
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  overlay.querySelector(".modal-close").focus();
}

function tutupModalSiklus() {
  const overlay = document.getElementById("siklus-modal");
  if (!overlay) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function initSiklusModal() {
  document.querySelectorAll(".siklus-step[data-stage]").forEach(step => {
    step.setAttribute("tabindex", "0");
    step.setAttribute("role", "button");
    step.setAttribute("aria-label", "Lihat detail tahap " + step.querySelector(".stage-name").textContent);
    const buka = () => bukaModalSiklus(step.dataset.stage);
    step.addEventListener("click", buka);
    step.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); buka(); }
    });
  });

  const overlay = document.getElementById("siklus-modal");
  if (!overlay) return;
  overlay.querySelector(".modal-close").addEventListener("click", tutupModalSiklus);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) tutupModalSiklus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") tutupModalSiklus(); });
}

/* ---------- Ikon kecil per kartu Panduan ---------- */
function panduanIconSVG(key) {
  const icons = {
    "Terlalu basah": `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2 C9 2 4 8.5 4 12 a5 5 0 0 0 10 0 C14 8.5 9 2 9 2 Z" fill="none" stroke="var(--moss)" stroke-width="1.6"/></svg>`,
    "Terlalu kering": `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="4.5" fill="none" stroke="var(--gold)" stroke-width="1.6"/><path d="M9 1.5 V4 M9 14 V16.5 M1.5 9 H4 M14 9 H16.5" stroke="var(--gold)" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    "Berbau": `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 15 Q4 10 6 10 Q4 6 7 3 Q6 7 9 6 Q8 3 11 2 Q9 7 12 7 Q15 8 13 15 Z" fill="none" stroke="var(--clay)" stroke-width="1.4"/></svg>`,
    "Muncul hama": `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="3" fill="none" stroke="var(--clay)" stroke-width="1.6"/><path d="M9 2 V6 M9 12 V16 M2 9 H6 M12 9 H16 M4 4 L6.5 6.5 M13.5 6.5 L16 4 M4 14 L6.5 11.5 M13.5 11.5 L16 14" stroke="var(--clay)" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    "Larva sedikit": `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 12 Q6 6 9 12 Q12 18 15 12" fill="none" stroke="var(--moss)" stroke-width="1.8" stroke-linecap="round"/></svg>`
  };
  return icons[key] || icons["Larva sedikit"];
}

/* ---------- Render daftar kartu Panduan (tab Panduan di admin.html) ---------- */
function renderPanduanList() {
  const list = document.getElementById("panduan-list");
  if (!list) return;
  list.innerHTML = "";
  Object.keys(PANDUAN_DATA).forEach(key => {
    const p = PANDUAN_DATA[key];
    const card = document.createElement("div");
    card.className = "panduan-card";
    card.innerHTML = `
      <div class="panduan-card-head">
        <span class="panduan-card-icon">${panduanIconSVG(key)}</span>
        <div>
          <p class="panduan-card-title">${p.judul}</p>
          <p class="panduan-card-sub">${p.tag}</p>
        </div>
      </div>
      <button type="button" class="btn btn-ghost" data-panduan="${key}">Lihat detail</button>`;
    list.appendChild(card);
  });
  list.querySelectorAll("[data-panduan]").forEach(btn => {
    btn.addEventListener("click", () => bukaModalPanduan(btn.dataset.panduan));
  });
}

/* ---------- Modal detail Panduan (dipakai dari tab Panduan maupun dari kartu box di Pantau) ---------- */
function bukaModalPanduan(key) {
  const data = PANDUAN_DATA[key];
  const overlay = document.getElementById("panduan-modal");
  if (!data || !overlay) return;
  overlay.querySelector(".panduan-modal-tag").textContent = data.tag;
  overlay.querySelector("#panduan-modal-title").textContent = data.judul;
  overlay.querySelector("#panduan-apa").textContent = data.apa;
  overlay.querySelector("#panduan-penyebab").innerHTML = data.penyebab.map(c => `<li>${c}</li>`).join("");
  overlay.querySelector("#panduan-langkah").innerHTML = data.langkah.map(c => `<li>${c}</li>`).join("");
  overlay.querySelector("#panduan-hindari").innerHTML = data.hindari.map(c => `<li>${c}</li>`).join("");
  overlay.querySelector("#panduan-pantau").textContent = data.pantau;
  overlay.querySelector("#panduan-sumber").textContent = "Rangkuman praktik teknis budidaya larva BSF (Hermetia illucens) dari panduan pengelolaan sampah organik berbasis maggot dan referensi umum budidaya BSF.";
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  overlay.querySelector(".modal-close").focus();
}

function tutupModalPanduan() {
  const overlay = document.getElementById("panduan-modal");
  if (!overlay) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function initPanduanModal() {
  const overlay = document.getElementById("panduan-modal");
  if (!overlay) return;
  overlay.querySelector(".modal-close").addEventListener("click", tutupModalPanduan);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) tutupModalPanduan(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") tutupModalPanduan(); });
}

/* ---------- Animasi scroll reveal (Intersection Observer) ---------- */
function aktifkanScrollReveal() {
  const target = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    target.forEach(el => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  target.forEach(el => observer.observe(el));
}

/* ---------- Inisialisasi semua bagian Pantau ---------- */
async function initDashboard() {
  const data = await ambilDataDashboard();
  DATA_CACHE = data;
  renderKPI(data.kpi, data.boxes, (data.trend && data.trend["7h"]) || []);
  renderBoxGrid(data.boxes);
  renderJaring(data.jaring);
  renderTrendChart(currentTrendRange);
  aktifkanScrollReveal();

  /* Kalau dropdown periode lagi tidak di "Total", terapkan ulang biar tidak balik ke total
     begitu data direfresh (misal habis submit form baru). */
  const periodeSelect = document.getElementById("kpi-periode");
  if (periodeSelect && periodeSelect.value !== "total") {
    terapkanPeriodeKPI(periodeSelect.value);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initKpiToggle();
  initKpiPeriode();
  initTrendTabs();
  initSiklusModal();
  initPanduanModal();
  renderPanduanList();
  initDashboard();
});