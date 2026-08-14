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
    { nama: "Box A", hari: 4, siklus: 18, updated: "2 jam lalu" },
    { nama: "Box B", hari: 12, siklus: 18, updated: "5 jam lalu" },
    { nama: "Box C", hari: 16, siklus: 18, updated: "1 hari lalu" },
    { nama: "Box D", hari: 8, siklus: 18, updated: "3 jam lalu" }
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
      </div>`;
    grid.appendChild(card);
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
  overlay.querySelector(".modal-stage-img").innerHTML = data.icon;
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
}

document.addEventListener("DOMContentLoaded", () => {
  initKpiToggle();
  initTrendTabs();
  initSiklusModal();
  initDashboard();
});
