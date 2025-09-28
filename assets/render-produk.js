// Nomor WA Toko
const WA_NUMBER = "6281389709411";

let allProducts = [];
let currentProducts = [];
let displayedCount = 0;
const step = 4;
const produkList = document.getElementById("produk-list");
const loadMoreBtn = document.getElementById("loadMoreBtn");

// Fetch data
fetch("assets/products-seo.json")
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    renderProducts(allProducts); // awalnya semua
    generateJSONLD(allProducts);
  })
  .catch(err => console.error("Gagal load JSON:", err));

// Render produk
function renderProducts(filtered) {
  produkList.innerHTML = "";
  displayedCount = 0;
  currentProducts = filtered; // simpan produk aktif
  loadMore(currentProducts);
}

// Load More
function loadMore(products) {
  const slice = products.slice(displayedCount, displayedCount + step);
  slice.forEach((produk, index) => {
    const card = document.createElement("div");
    card.classList.add("produk-item");
    card.style.animationDelay = `${index * 0.15}s`;

    const waMessage = encodeURIComponent(
      `Halo, saya ingin memesan produk:\n\nID: ${produk.id}\nNama: ${produk.name}\nDeskripsi: ${produk.description || "-"}\nHarga: Rp ${produk.price.toLocaleString("id-ID")}`
    );

    card.innerHTML = `
      <img src="${produk.image}" alt="${produk.name}" loading="lazy">
      <h3>${produk.name}</h3>
      <p class="price">Rp ${produk.price.toLocaleString("id-ID")}</p>
      <div class="produk-actions">
        <button class="btn-detail">Lihat Detail</button>
        <a href="https://wa.me/${WA_NUMBER}?text=${waMessage}" target="_blank" class="btn-pesan">Pesan Sekarang</a>
      </div>
    `;

    // Event Lihat Detail
    card.querySelector(".btn-detail").addEventListener("click", () => openModal(produk));

    produkList.appendChild(card);

    // animasi muncul
    setTimeout(() => card.classList.add("show"), 100 * index);
  });

  displayedCount += slice.length;
  loadMoreBtn.style.display = displayedCount >= products.length ? "none" : "block";
}

// Tombol Load More
loadMoreBtn.addEventListener("click", () => {
  loadMore(currentProducts); // selalu pakai produk aktif
});

// Filter Kategori
const tabButtons = document.querySelectorAll(".tab-btn, .sub-btn");
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.dataset.category;
    let filtered;

    if (category === "all") {
      filtered = allProducts;
    } else if (category === "karangan-bunga") {
      filtered = allProducts.filter(p => p.category.startsWith("karangan-"));
    } else {
      filtered = allProducts.filter(p => p.category === category);
    }

    renderProducts(filtered);
    generateJSONLD(filtered);
  });
});

// Filter Harga
document.getElementById("filterPriceBtn").addEventListener("click", () => {
  const min = parseInt(document.getElementById("minPrice").value) || 0;
  const max = parseInt(document.getElementById("maxPrice").value) || Infinity;

  const filtered = allProducts.filter(p => p.price >= min && p.price <= max);
  renderProducts(filtered);
  generateJSONLD(filtered);
});

// ---------------- JSON-LD Generator ----------------
function generateJSONLD(products) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "ItemList",
    "itemListElement": products.map((p, i) => ({
      "@type": "Product",
      "position": i + 1,
      "name": p.name,
      "image": p.image,
      "offers": {
        "@type": "Offer",
        "priceCurrency": p.currency || "IDR",
        "price": p.price,
        "availability": "https://schema.org/InStock",
        "url": p.url || ""
      }
    }))
  };

  // hapus schema lama
  const old = document.getElementById("jsonld-products");
  if (old) old.remove();

  // inject schema baru
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "jsonld-products";
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
}

// ---------------- Modal Detail Produk ----------------
function openModal(product) {
  document.getElementById("modalName").textContent = product.name || "Produk";
  document.getElementById("modalImage").src = product.image || "assets/no-image.jpg";
  document.getElementById("modalPrice").textContent = 
    product.price ? "Rp " + product.price.toLocaleString("id-ID") : "";
 document.getElementById("modalDesc").innerHTML = `
  <p><strong>Deskripsi Singkat:</strong> ${product.shortDescription || "-"}</p>
  <p><strong>Detail Produk:</strong> ${product.description || "-"}</p>
  
  <p><strong>Fitur Utama:</strong></p>
  <ul>
    ${(product.features || []).map(f => `<li>${f}</li>`).join("")}
  </ul>
  
  <p><strong>Cocok Untuk:</strong></p>
  <p>${product.suitable || ""}</p>

  <p class="cta"><em>🌸 Pesan sekarang untuk membuat momen Anda lebih berkesan!</em></p>
`;

  document.getElementById("modalSku").textContent = "Kode Produk: " + (product.id || product.sku || "-");

  // Reset form
  document.getElementById("orderForm").reset();

  const waBtn = document.getElementById("waButton");
  waBtn.onclick = function () {
    const name = document.getElementById("recipientName").value;
    const address = document.getElementById("address").value;
    const delivery = document.getElementById("deliveryDate").value;
    const note = document.getElementById("note").value;
    const extra = document.getElementById("extraNote").value;

    const message = `Halo, saya ingin memesan:

ID Produk: ${product.id || product.sku}
Nama Produk: ${product.name}
Harga: Rp ${product.price?.toLocaleString("id-ID")}

--- Data Pengiriman ---
Nama Penerima: ${name}
Alamat: ${address}
Tanggal/Waktu: ${delivery}
Catatan: ${note}
Catatan Tambahan: ${extra}`;

    waBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  document.getElementById("overlay").classList.add("active");
  document.getElementById("produkModal").classList.add("active");
}

function closeModal() {
  document.getElementById("overlay").classList.remove("active");
  document.getElementById("produkModal").classList.remove("active");
}

document.getElementById("overlay").addEventListener("click", closeModal);

// ---------------- Produk Populer: showDetail ----------------
function showDetail(id) {
  const produkPopuler = {
    "BMR-001": {
  id: "BMR-001",
  name: "Buket Mawar Merah Putih - Cinta Abadi",
  slug: "buket-mawar-merah-putih-cinta",
  price: 350000,
  currency: "IDR",
  image: "assets/img/pp/pp1.webp",
  url: "/produk/buket-mawar-merah-putih",
  category: "buket-mawar",
  metaTitle: "Buket Mawar Merah Putih - Hadiah Cinta & Romantis",
  metaDescription: "Buket mawar merah dan putih segar, simbol cinta abadi. Cocok untuk Valentine, ulang tahun, dan hari jadi.",
  keywords: [
    "buket mawar merah",
    "buket mawar putih",
    "hadiah valentine",
    "hadiah romantis",
    "toko bunga online"
  ],
  shortDescription: "Buket mawar merah putih segar, simbol cinta abadi. Hadiah romantis untuk Valentine dan momen spesial.",
  description: "Buket mawar merah putih ini adalah ungkapan cinta yang sempurna. Mawar merah melambangkan gairah dan cinta sejati, sementara mawar putih melambangkan kesucian dan keabadian. Cocok untuk Valentine, ulang tahun, hari jadi, atau sekadar untuk menunjukkan kasih sayang.",
  features: [
    "Mawar Merah Premium",
    "Mawar Putih Segar",
    "Wrapping Elegan",
    "Pita Satin Merah"
  ],
  tags: [
    "buket-bunga",
    "bunga-segar",
    "mawar",
    "merah",
    "putih",
    "valentine",
    "hadiah",
    "romantis",
    "toko-bunga"
  ],
  suitable : [
      "Hadiah romantis",
      "Anniversary",
      "Ulang tahun"]
},
    "BLP-002": {
  id: "BLP-002",
  name: "Buket Meja Elegansi Abadi - Rangkaian Bunga Meja Mewah",
  slug: "buket-meja-elegansi-abadi",
  price: 650000,
  currency: "IDR",
  image: "assets/img/pp/pp-01.webp",
  url: "#",
  category: "rangkaian-bunga",
  metaTitle: "Rangkaian Bunga Mewah - Anggrek, Mawar, Lili - Elegan & Memukau",
  metaDescription: "Rangkaian bunga mewah dengan anggrek bulan, mawar, lili, dan hydrangea. Cocok untuk hadiah korporat, ucapan selamat, dan dekorasi acara spesial.",
  keywords: [
    "rangkaian bunga mewah",
    "anggrek bulan",
    "mawar",
    "lili",
    "hadiah korporat",
    "toko bunga online"
  ],
  shortDescription: "Rangkaian bunga mewah dengan anggrek bulan, mawar, lili, dan hydrangea. Hadiah elegan untuk momen spesial.",
  description: "Rangkaian bunga mewah ini memadukan keindahan anggrek bulan putih, mawar berbagai warna, lili Casablanca yang harum, serta hydrangea hijau yang segar. Cocok untuk hadiah korporat, ucapan selamat, dekorasi acara, atau ungkapan kasih sayang.",
  features: [
    "Anggrek Bulan Premium",
    "Mawar Segar Berbagai Warna",
    "Lili Casablanca Harum",
    "Hydrangea Hijau Segar",
    "Desain Elegan & Mewah"
  ],
  tags: [
    "rangkaian-bunga",
    "bunga-segar",
    "anggrek",
    "mawar",
    "lili",
    "hadiah",
    "korporat",
    "toko-bunga"
  ],
  suitable : 
  ["Hadiah spesial","Pernikahan","Ulang tahun","Dekorasi Rumah"]
    },
    "KRG-001": {
      id: "KRG-001",
      name: "Karangan Bunga Duka Cita - Simpati Tulus",
      slug: "karangan-bunga-duka-cita-simpati",
      price: 1000000,currency: "IDR",
      image: "assets/img/pp/pp3.webp",
      url: "/produk/karangan-bunga-duka-cita",
      category: "karangan-bunga",
      metaTitle: "Karangan Bunga Duka Cita - Ungkapan Simpati & Penghormatan",
      metaDescription: "Karangan bunga duka cita segar, ungkapan simpati dan penghormatan terakhir. Desain elegan dan penuh makna.",keywords: ["karangan bunga duka cita","bunga duka cita","simpati","penghormatan","toko bunga online"],
      shortDescription: "Karangan bunga duka cita segar, ungkapan simpati dan penghormatan terakhir. Sampaikan belasungkawa dengan tulus.",description: "Karangan bunga duka cita ini adalah ungkapan simpati dan penghormatan terakhir kepada mendiang. Dirangkai dengan bunga-bunga segar pilihan dan desain yang elegan, karangan bunga ini menyampaikan pesan belasungkawa yang tulus kepada keluarga yang ditinggalkan.",
      features: ["Bunga Segar Pilihan","Desain Elegan","Pesan Simpati",],
      tags: ["karangan-bunga","bunga-duka-cita","simpati","belasungkawa","penghormatan","toko-bunga"],
      suitable : ["Ungkapan Belasungkawa","Penghormatan Terakhir","Simpati"]},
    "STND-001":{
      id: "STND-001",
  name: "Standing Flower - Elegi Putih",
  slug: "standing-flower-duka-cita-putih",
  price: 750000,
  currency: "IDR",
  image: "assets/img/pp/pp2.webp",
  url: "/produk/standing-flower-duka-cita",
  category: "standing-flower",
  metaTitle: "Standing Flower Duka Cita - Simbol Penghormatan Terakhir",
  metaDescription: "Standing flower duka cita dengan nuansa putih elegan, menyampaikan pesan simpati dan penghormatan mendalam.",
  keywords: [
    "standing flower duka cita",
    "bunga standing duka cita",
    "rangkaian bunga duka cita",
    "simpati",
    "penghormatan",
    "toko bunga online"
  ],
  shortDescription: "Standing flower duka cita nuansa putih, simbol ketulusan dan penghormatan terakhir. Kirimkan ungkapan belasungkawa terbaik.",
  description: "Standing flower duka cita ini dirangkai dengan bunga-bunga putih pilihan seperti mawar, krisan, dan baby's breath. Desain elegan dan tinggi menjulang memberikan kesan mendalam sebagai ungkapan simpati dan penghormatan terakhir kepada mendiang.",
  features: [
    "Bunga Segar Pilihan",
    "Desain Tinggi dan Elegan",
    "Nuansa Putih Simbolis"
  ],
  tags: [
    "standing-flower",
    "bunga-duka-cita",
    "simpati",
    "belasungkawa",
    "penghormatan",
    "toko-bunga"
  ],
  suitable: [
    "Ungkapan Belasungkawa",
    "Penghormatan Terakhir",
    "Simpati"
  ]
}
};

  const produk = produkPopuler[id];
  if (produk) {
    openModal(produk);
  } else {
    alert("Produk tidak ditemukan!");
  }
}
