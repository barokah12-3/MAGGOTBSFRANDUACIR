/* config.js: GANTI URL DI BAWAH INI kalau Apps Script di-deploy ulang.
   Ini satu-satunya tempat yang perlu diedit kalau link Apps Script berubah. */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyeFRZ_zfHm2UafIxznGeZjqzhONDpOnh8ckeDxVEZqiJAKtDt3ejhxdsDajW_fjFCV/exec";

/* ---------- Data "Cek sampahmu cocok atau enggak" ----------
   Tinggal tambah/edit item di sini, tidak perlu sentuh logic di dashboard.js.
   - kata: daftar kata kunci yang bikin item ini ketemu (termasuk variasi/informal,
     misal "nasi goreng" ikut ketemu walau intinya cuma "nasi")
   - cocok: true (boleh masuk kandang) / false (tidak boleh)
   - alasan: alasan singkat, 1 kalimat
   - saran: (opsional) khusus item "tidak cocok", saran alternatif pembuangan */
const SAMPAH_DATA = [
  /* ---------- Cocok: sisa makanan & dapur ---------- */
  { kata: ["nasi", "nasi goreng", "nasi basi", "nasi sisa", "nasi kering", "nasi keras"], cocok: true, alasan: "Cepat lembek, disukai larva. Kalau sudah keras, remukkan dulu dan campur bahan basah." },
  { kata: ["sayur", "sisa sayur", "sayuran", "kulit sayur", "sawi", "kangkung", "bayam", "wortel", "kol", "kubis", "buncis", "terong"], cocok: true, alasan: "Cepat terurai dan jadi sumber gizi utama larva." },
  { kata: ["buah", "kulit buah", "buah busuk", "buah membusuk"], cocok: true, alasan: "Kadar air tinggi, disukai larva, tapi jangan berlebihan sekaligus." },
  { kata: ["kulit pisang", "pisang", "pisang busuk"], cocok: true, alasan: "Cepat lembek dan cepat diurai larva." },
  { kata: ["kulit jeruk", "jeruk"], cocok: true, alasan: "Boleh, tapi beri porsi kecil dulu. Kandungan minyak kulit jeruk agak asam kalau kebanyakan." },
  { kata: ["kulit mangga", "mangga", "biji mangga"], cocok: true, alasan: "Daging dan kulitnya boleh, tapi biji yang keras sebaiknya dipisah dulu." },
  { kata: ["semangka", "kulit semangka", "melon", "kulit melon"], cocok: true, alasan: "Kadar air sangat tinggi, disukai larva. Potong dulu biar cepat diurai." },
  { kata: ["nanas", "kulit nanas"], cocok: true, alasan: "Boleh, tapi porsi kecil dulu karena agak asam." },
  { kata: ["kulit durian", "durian"], cocok: true, alasan: "Boleh, tapi kulitnya keras dan besar, sebaiknya dipotong kecil dulu." },
  { kata: ["kulit rambutan", "rambutan"], cocok: true, alasan: "Boleh, cepat terurai." },
  { kata: ["ampas kopi", "kopi", "bubuk kopi"], cocok: true, alasan: "Bagus buat campuran, sekaligus bantu kurangi bau." },
  { kata: ["ampas teh", "teh", "teh celup"], cocok: true, alasan: "Aman, tapi buang dulu kantong tehnya kalau bukan bahan alami (banyak teh celup pakai plastik/nilon)." },
  { kata: ["kulit telur", "cangkang telur"], cocok: true, alasan: "Boleh, tapi remukkan dulu supaya lebih cepat terurai." },
  { kata: ["roti", "roti basi", "roti sisa", "biskuit", "kue basi", "kue sisa"], cocok: true, alasan: "Boleh, cepat lembek terutama kalau sudah agak basi." },
  { kata: ["ampas tahu", "ampas kelapa", "ampas kedelai", "ampas"], cocok: true, alasan: "Boleh, kadar air dan nutrisinya cocok buat larva." },
  { kata: ["tahu busuk", "tempe busuk", "tahu", "tempe"], cocok: true, alasan: "Boleh kalau sudah tidak layak konsumsi, cepat diurai larva." },
  { kata: ["nasi kucing", "sisa lauk", "sisa makanan", "makanan basi", "makanan sisa"], cocok: true, alasan: "Boleh, asal bukan yang berminyak/bersantan banyak. Pisahkan dulu kuahnya." },
  { kata: ["kulit bawang", "bawang merah", "bawang putih", "kulit bawang merah", "kulit bawang putih"], cocok: true, alasan: "Boleh dalam jumlah sedikit, tapi jangan jadi bahan utama karena baunya cukup tajam buat larva." },
  { kata: ["cabai", "sisa cabai", "batang cabai"], cocok: true, alasan: "Boleh dalam porsi kecil, dicampur bahan lain." },
  { kata: ["kulit kentang", "kentang", "kentang busuk"], cocok: true, alasan: "Boleh, cepat terurai terutama yang sudah lembek." },
  { kata: ["kulit singkong", "singkong", "ketela"], cocok: true, alasan: "Boleh, tapi kulitnya cukup keras, sebaiknya dipotong kecil dulu." },
  { kata: ["jagung", "kulit jagung", "bonggol jagung", "janggel jagung"], cocok: true, alasan: "Isi/daging jagung boleh, tapi bonggolnya keras dan lama terurai, sebaiknya dipisah atau dipotong kecil dulu." },
  { kata: ["daun kering", "daun", "rontokan daun", "sampah daun", "daun pisang"], cocok: true, alasan: "Boleh sebagai campuran kecil, tapi butuh waktu lebih lama terurai. Jangan jadi bahan utama." },
  { kata: ["rumput", "potongan rumput", "rumput kering"], cocok: true, alasan: "Boleh dalam jumlah sedikit sebagai campuran, tidak sebagai bahan utama." },
  { kata: ["susu basi", "susu kadaluarsa", "susu"], cocok: true, alasan: "Boleh dalam jumlah kecil, tapi jangan berlebihan karena cepat berbau asam." },
  { kata: ["nasi tumpeng", "sisa hajatan", "sisa katering"], cocok: true, alasan: "Boleh, sama seperti sisa makanan lain, pisahkan dulu dari plastik/kemasan pembungkusnya." },

  /* ---------- Tidak cocok: plastik & kemasan ---------- */
  { kata: ["plastik", "kresek", "kantong plastik", "bungkus plastik"], cocok: false, alasan: "Tidak bisa diurai larva sama sekali, malah mencemari media.", saran: "Pisahkan ke tempat sampah anorganik / bank sampah." },
  { kata: ["styrofoam", "sterofoam", "gabus", "kotak makan styrofoam"], cocok: false, alasan: "Bukan bahan organik, larva tidak bisa mengurainya.", saran: "Pisahkan ke tempat sampah anorganik." },
  { kata: ["bungkus mi instan", "bungkus indomie", "bungkus snack", "bungkus chiki", "bungkus kopi sachet", "sachet"], cocok: false, alasan: "Lapisan plastik/aluminiumnya tidak bisa diurai larva.", saran: "Pisahkan ke tempat sampah anorganik / bank sampah." },
  { kata: ["botol plastik", "botol minum plastik", "botol aqua"], cocok: false, alasan: "Bukan bahan organik.", saran: "Kumpulkan terpisah, botol plastik biasanya laku dijual ke bank sampah / pemulung." },
  { kata: ["sedotan plastik", "sedotan"], cocok: false, alasan: "Bukan bahan organik, tidak bisa diurai.", saran: "Pisahkan ke tempat sampah anorganik." },
  { kata: ["gelas plastik", "sendok plastik", "garpu plastik", "alat makan plastik"], cocok: false, alasan: "Bukan bahan organik.", saran: "Pisahkan ke tempat sampah anorganik." },
  { kata: ["plastik bening", "plastik wrap", "cling wrap", "plastik pembungkus"], cocok: false, alasan: "Bukan bahan organik, malah bisa menyumbat media.", saran: "Pisahkan ke tempat sampah anorganik." },
  { kata: ["aluminium foil", "alumunium foil", "foil"], cocok: false, alasan: "Bukan bahan organik.", saran: "Kumpulkan terpisah untuk didaur ulang lewat bank sampah." },
  { kata: ["kaleng", "kaleng bekas", "kaleng minuman", "kaleng makanan"], cocok: false, alasan: "Bukan bahan organik.", saran: "Kumpulkan terpisah, kaleng biasanya laku dijual ke bank sampah / pemulung." },

  /* ---------- Tidak cocok: minyak, santan, sisa berlemak ---------- */
  { kata: ["minyak", "minyak goreng", "minyak jelantah"], cocok: false, alasan: "Melapisi media dan bikin larva sulit bernapas.", saran: "Kumpulkan terpisah, banyak titik daur ulang minyak jelantah menerimanya." },
  { kata: ["santan", "kuah santan", "kuah bersantan"], cocok: false, alasan: "Kadar minyaknya tinggi, bikin media lengket dan cepat berbau.", saran: "Buang ke saluran pembuangan biasa, jangan ke kandang." },
  { kata: ["gorengan", "sisa gorengan", "makanan berminyak"], cocok: false, alasan: "Kadar minyaknya terlalu tinggi buat media larva.", saran: "Kalau minyaknya ditiriskan dulu, sisanya sebenarnya masih bisa masuk dalam porsi kecil. Tanya pengurus kalau ragu." },

  /* ---------- Tidak cocok: tulang, cangkang keras, daging/ikan mentah ---------- */
  { kata: ["tulang", "tulang ayam", "tulang ikan", "tulang sapi", "tulang kambing"], cocok: false, alasan: "Terlalu keras, larva tidak bisa mengunyahnya.", saran: "Buang ke sampah residu biasa." },
  { kata: ["cangkang keras", "kerang", "cangkang kerang", "kulit kerang"], cocok: false, alasan: "Terlalu keras dan lambat terurai, bisa melukai media.", saran: "Buang ke sampah residu biasa." },
  { kata: ["cangkang kepiting", "kulit udang", "kepala udang", "cangkang udang"], cocok: false, alasan: "Cukup keras dan berbau tajam kalau menumpuk, sebaiknya dihindari dulu.", saran: "Buang ke sampah residu biasa, kecuali pengurus bilang boleh dalam porsi kecil." },
  { kata: ["daging", "daging mentah", "daging busuk", "daging ayam mentah"], cocok: false, alasan: "Cepat busuk dan mengundang hama/bakteri berbahaya, bukan cuma lalat BSF.", saran: "Kalau porsi kecil dan segar sebenarnya masih bisa, tapi paling aman dihindari dulu. Tanya pengurus kandang kalau ragu." },
  { kata: ["ikan mentah", "ikan busuk", "jeroan", "jeroan ayam", "jeroan ikan"], cocok: false, alasan: "Cepat busuk dan berbau sangat menyengat, berisiko menarik hama lain.", saran: "Sebaiknya dihindari dulu, tanya pengurus kandang kalau ragu." },

  /* ---------- Tidak cocok: kertas/karton (bukan pakan) ---------- */
  { kata: ["kertas", "kertas bekas", "koran", "koran bekas"], cocok: false, alasan: "Bukan pakan larva, tapi terlalu kering untuk jadi bahan utama.", saran: "Bisa disimpan buat pengurus sebagai media telur atau penyerap kelembapan, tapi bukan dicampur sebagai makanan." },
  { kata: ["kardus", "karton", "kardus bekas"], cocok: false, alasan: "Bukan pakan, tapi justru berguna sebagai media kering penyerap kelembapan.", saran: "Simpan buat pengurus, sering dipakai sebagai media telur atau penyerap kelembapan box." },
  { kata: ["tisu", "tisu bekas", "tisu basah"], cocok: false, alasan: "Terurai lambat dan kadang mengandung bahan kimia (tisu basah), sebaiknya dihindari.", saran: "Buang ke sampah residu biasa." },
  { kata: ["kertas nasi", "kertas minyak", "kertas pembungkus"], cocok: false, alasan: "Umumnya dilapisi bahan yang sulit diurai.", saran: "Buang ke sampah residu biasa." },

  /* ---------- Tidak cocok: bahan berbahaya / B3 ---------- */
  { kata: ["popok", "diapers", "pembalut", "popok bayi"], cocok: false, alasan: "Bahan sintetis, tidak bisa diurai dan berisiko higienis.", saran: "Buang ke sampah residu biasa, bukan sampah organik." },
  { kata: ["baterai", "batu baterai", "baterai bekas"], cocok: false, alasan: "Mengandung bahan kimia berbahaya yang bisa meracuni media dan larva.", saran: "Kumpulkan ke drop box limbah B3 / elektronik." },
  { kata: ["obat", "obat kedaluwarsa", "kapsul", "pil", "obat kadaluarsa"], cocok: false, alasan: "Kandungan kimianya bisa berbahaya buat larva dan mencemari hasil panen.", saran: "Kembalikan ke apotek atau puskesmas untuk pembuangan obat yang benar." },
  { kata: ["kaca", "beling", "botol kaca", "pecahan kaca", "pecahan piring"], cocok: false, alasan: "Tidak bisa diurai dan berisiko melukai.", saran: "Buang ke sampah anorganik, bungkus rapat dulu dan tulis peringatan supaya aman." },
  { kata: ["sabun", "deterjen", "sisa deterjen", "sabun cuci"], cocok: false, alasan: "Kandungan kimianya bisa meracuni larva.", saran: "Buang ke saluran pembuangan biasa." },
  { kata: ["pestisida", "racun serangga", "insektisida", "obat nyamuk"], cocok: false, alasan: "Sangat berbahaya, bisa membunuh seluruh larva di box.", saran: "Jangan pernah dekatkan ke kandang. Ikuti aturan pembuangan limbah B3 setempat." },
  { kata: ["cat", "kaleng cat", "sisa cat", "thinner"], cocok: false, alasan: "Mengandung bahan kimia keras yang berbahaya buat larva dan lingkungan.", saran: "Kumpulkan ke drop box limbah B3." },
  { kata: ["lampu bekas", "bohlam", "lampu neon"], cocok: false, alasan: "Terutama lampu neon/CFL mengandung merkuri yang berbahaya.", saran: "Kumpulkan ke drop box limbah elektronik/B3." },
  { kata: ["rokok", "puntung rokok", "abu rokok"], cocok: false, alasan: "Mengandung nikotin dan bahan kimia yang bisa meracuni larva.", saran: "Buang ke sampah residu biasa." },
  { kata: ["jarum suntik", "masker bekas", "sampah medis", "limbah medis"], cocok: false, alasan: "Berisiko higienis dan bisa mencemari, bukan kategori sampah organik biasa.", saran: "Ikuti prosedur pembuangan limbah medis, biasanya lewat puskesmas/faskes terdekat." },

  /* ---------- Tidak cocok: lain-lain ---------- */
  { kata: ["puntung", "karet", "ban bekas", "karet gelang"], cocok: false, alasan: "Bahan sintetis, sangat lambat terurai bahkan tidak bisa diurai larva.", saran: "Buang ke sampah residu biasa." },
  { kata: ["kain", "baju bekas", "pakaian bekas", "kain perca"], cocok: false, alasan: "Umumnya campuran serat sintetis, tidak bisa diurai larva.", saran: "Sumbangkan kalau masih layak, atau buang ke sampah residu." },
  { kata: ["logam", "besi", "paku", "kawat", "seng"], cocok: false, alasan: "Bukan bahan organik, dan berisiko melukai.", saran: "Kumpulkan terpisah untuk dijual/didaur ulang." },
  { kata: ["puing", "puing bangunan", "semen", "keramik pecah"], cocok: false, alasan: "Bukan sampah organik, dan bisa merusak struktur media.", saran: "Buang ke tempat pembuangan puing/limbah konstruksi." },
  { kata: ["sampah elektronik", "kabel", "handphone rusak", "charger rusak"], cocok: false, alasan: "Bukan bahan organik dan berpotensi mengandung bahan berbahaya.", saran: "Kumpulkan ke drop box limbah elektronik." },
  { kata: ["kotoran hewan", "kotoran kucing", "pasir kucing", "tinja hewan"], cocok: false, alasan: "Berisiko membawa parasit/bakteri yang mengganggu kesehatan larva dan kebersihan kandang.", saran: "Sebaiknya dihindari dulu, tanya pengurus kandang kalau ragu ada pengecualian." }
];