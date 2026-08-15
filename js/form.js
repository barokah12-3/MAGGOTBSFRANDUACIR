/* ==========================================================
   SMARTMAG | form.js
   Logika tab "Isi Data": kirim catatan harian ke Apps Script.
   Dipakai HANYA di index.html (pengurus). Butuh config.js.
   ========================================================== */

function initFormIsiData() {
  const form = document.getElementById("form-isi-data");
  if (!form) return;

  const statusEl = document.getElementById("form-status");
  const submitBtn = form.querySelector("button[type=submit]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      tanggal: form.tanggal.value,
      namaPenginput: form.namaPenginput.value.trim(),
      box: form.box.value,
      jenisSampah: form.jenisSampah.value,
      beratSampah: parseFloat(form.beratSampah.value) || 0,
      kondisiBox: form.kondisiBox.value,
      panenHariIni: form.panenHariIni.checked,
      beratPanen: parseFloat(form.beratPanen.value) || 0,
      catatan: form.catatan.value.trim()
    };

    if (!data.namaPenginput || !data.box) {
      statusEl.textContent = "Nama penginput dan box wajib diisi.";
      statusEl.style.color = "var(--clay)";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Menyimpan...";
    statusEl.textContent = "";

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("gagal simpan");

      statusEl.textContent = "Data tersimpan.";
      statusEl.style.color = "var(--moss)";
      form.reset();
      if (typeof initDashboard === "function") initDashboard();
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Gagal menyimpan, coba lagi.";
      statusEl.style.color = "var(--clay)";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Simpan data";
    }
  });
}

/* ---------- Tab switching (Isi Data / Pantau), khusus index.html ---------- */
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".tab-panel").forEach(panel => {
        panel.classList.toggle("active", panel.id === target);
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initFormIsiData();
  initTabs();
});