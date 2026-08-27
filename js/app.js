/* =========================================
   دجاج اليمامة - app.js
   ========================================= */

const apiKey = "AQ.Ab8RN6KUuahNyqDAiCX6owjD5BpyyDBcbgsJk9YR0zOu_yRkxw";
"use strict";

/* -----------------------------------------
   المنتجات الافتراضية
   ----------------------------------------- */

const defaultProducts = [
  {
    id: "p1",
    name: "قطع دجاج",
    price: "18000",
    image: "",
    active: true
  },
  {
    id: "p2",
    name: "دجاج كامل",
    price: "25000",
    image: "",
    active: true
  },
  {
    id: "p3",
    name: "صدور دجاج",
    price: "24000",
    image: "",
    active: true
  },
  {
    id: "p4",
    name: "أجنحة دجاج",
    price: "16000",
    image: "",
    active: true
  },
  {
    id: "p5",
    name: "أوراك دجاج",
    price: "15000",
    image: "",
    active: true
  },
  {
    id: "p6",
    name: "كبدة دجاج",
    price: "12000",
    image: "",
    active: true
  },
  {
    id: "p7",
    name: "أعناق دجاج",
    price: "10000",
    image: "",
    active: true
  },
  {
    id: "p8",
    name: "قوانص دجاج",
    price: "11000",
    image: "",
    active: true
  }
];

/* -----------------------------------------
   إعدادات التطبيق
   ----------------------------------------- */

const defaultSettings = {
  ticker:
    "🔥 أهلاً بكم في متجر دجاج اليمامة - دجاج طازج يومياً وتوصيل مباشر 🔥",

  driverName: "عامل التوصيل",

  driverPhone: "",

  camera1: "",

  camera2: "",

  broadcastDuration: 45
};

/* -----------------------------------------
   قراءة المنتجات
   ----------------------------------------- */

function getProducts() {

  const saved =
    localStorage.getItem("yamama_products");

  if (!saved) {

    localStorage.setItem(
      "yamama_products",
      JSON.stringify(defaultProducts)
    );

    return defaultProducts;
  }

  try {

    return JSON.parse(saved);

  } catch (error) {

    console.error(
      "تعذر قراءة المنتجات",
      error
    );

    return defaultProducts;
  }
}

/* -----------------------------------------
   حفظ المنتجات
   ----------------------------------------- */

function saveProducts(products) {

  localStorage.setItem(
    "yamama_products",
    JSON.stringify(products)
  );
}

/* -----------------------------------------
   قراءة الإعدادات
   ----------------------------------------- */

function getSettings() {

  const saved =
    localStorage.getItem("yamama_settings");

  if (!saved) {

    localStorage.setItem(
      "yamama_settings",
      JSON.stringify(defaultSettings)
    );

    return {
      ...defaultSettings
    };
  }

  try {

    return {
      ...defaultSettings,
      ...JSON.parse(saved)
    };

  } catch (error) {

    return {
      ...defaultSettings
    };
  }
}

/* -----------------------------------------
   حفظ الإعدادات
   ----------------------------------------- */

function saveSettings(settings) {

  localStorage.setItem(
    "yamama_settings",
    JSON.stringify(settings)
  );
}

/* -----------------------------------------
   الشريط المتحرك
   ----------------------------------------- */

function loadTicker() {

  const ticker =
    document.getElementById("ticker-el");

  if (!ticker) return;

  const settings =
    getSettings();

  ticker.textContent =
    settings.ticker;
}

/* -----------------------------------------
   إنشاء بطاقة المنتج
   ----------------------------------------- */

function createProductCard(product) {

  const card =
    document.createElement("div");

  card.className =
    "product-card";

  let imageHTML = "";

  if (product.image) {

    imageHTML = `
      <img
        class="product-image"
        src="${product.image}"
        alt="${escapeHTML(product.name)}"
      >
    `;

  } else {

    imageHTML = `
      <div class="product-placeholder">
        🐔
      </div>
    `;
  }

  card.innerHTML = `

    <div>

      <div class="product-top">

        <div class="product-info">

          <div class="product-name">
            ${escapeHTML(product.name)}
          </div>

          <div class="product-fresh">
            طازج يومياً
          </div>

        </div>

        <div class="product-image-box">
          ${imageHTML}
        </div>

      </div>

      <div class="price-title">
        سعر المنتج
      </div>

      <div class="product-price">
        ${formatPrice(product.price)} ل.س
      </div>

    </div>

    <button
      class="order-button"
      type="button"
      onclick="openOrderForm('${product.id}')"
    >
      طلب
    </button>

  `;

  return card;
}

/* -----------------------------------------
   عرض المنتجات
   ----------------------------------------- */

function renderProducts() {

  const grid =
    document.getElementById(
      "products-grid"
    );

  if (!grid) return;

  const products =
    getProducts();

  grid.innerHTML = "";

  products
    .filter(product => product.active !== false)
    .forEach(product => {

      grid.appendChild(
        createProductCard(product)
      );

    });
}

/* -----------------------------------------
   تنسيق السعر
   ----------------------------------------- */

function formatPrice(price) {

  const number =
    Number(
      String(price)
        .replace(/[^\d.]/g, "")
    );

  if (Number.isNaN(number)) {
    return price;
  }

  return number.toLocaleString("ar-SA");
}

/* -----------------------------------------
   حماية النصوص من HTML
   ----------------------------------------- */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* -----------------------------------------
   فتح نموذج الطلب
   ----------------------------------------- */

function openOrderForm(productId) {

  const products =
    getProducts();

  const product =
    products.find(
      item => item.id === productId
    );

  if (!product) {

    showToast(
      "تعذر العثور على المنتج"
    );

    return;
  }

  localStorage.setItem(
    "yamama_selected_product",
    JSON.stringify(product)
  );

  if (
    typeof window.openCustomerOrder ===
    "function"
  ) {

    window.openCustomerOrder(product);

  } else {

    showToast(
      "تم اختيار: " + product.name
    );

  }
}

/* -----------------------------------------
   فتح المحادثة
   ----------------------------------------- */

function openChat() {

  const modal =
    document.getElementById(
      "chat-modal"
    );

  if (!modal) {

    showToast(
      "المحادثة ستكون متاحة في المرحلة القادمة"
    );

    return;
  }

  modal.classList.add("active");
}

/* -----------------------------------------
   إغلاق المحادثة
   ----------------------------------------- */

function closeChat() {

  const modal =
    document.getElementById(
      "chat-modal"
    );

  if (!modal) return;

  modal.classList.remove("active");
}

/* -----------------------------------------
   رسالة مؤقتة
   ----------------------------------------- */

function showToast(message) {

  let toast =
    document.getElementById(
      "yamama-toast"
    );

  if (!toast) {

    toast =
      document.createElement("div");

    toast.id =
      "yamama-toast";

    toast.className =
      "toast";

    document.body.appendChild(toast);
  }

  toast.textContent =
    message;

  toast.classList.add("show");

  clearTimeout(
    window.yamamaToastTimer
  );

  window.yamamaToastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 2500);
}

/* -----------------------------------------
   تهيئة التطبيق
   ----------------------------------------- */

function initYamamaApp() {

  loadTicker();

  renderProducts();

  if (
    "serviceWorker" in navigator
  ) {

    navigator.serviceWorker
      .register("sw.js")
      .catch(error => {

        console.log(
          "Service Worker:",
          error
        );

      });
  }
}

/* -----------------------------------------
   تشغيل التطبيق
   ----------------------------------------- */

document.addEventListener(
  "DOMContentLoaded",
  initYamamaApp
);
