"use strict";

/* =========================================
   منتجات دجاج اليمامة
   ========================================= */

/*
  المنتجات الأساسية.
  إذا لم توجد منتجات محفوظة في المتصفح،
  سيتم إنشاء هذه المنتجات تلقائياً.
*/

const DEFAULT_PRODUCTS = [

  {
    id: "p1",
    name: "قطع دجاج",
    price: "18000",
    image: "https://kimi-web-img.kimi.ai/img/static.vecteezy.com/7ca47ffc2bd97e9acbab069f199f8e93cc12607c.jpg",
    active: true
  },

  {
    id: "p2",
    name: "دجاج كامل",
    price: "25000",
    image: "https://kimi-web-img.kimi.ai/img/c8.alamy.com/6aa849cb70f891bbeadcbf72763c238958923703.jpg",
    active: true
  },

  {
    id: "p3",
    name: "صدور دجاج",
    price: "24000",
    image: "https://kimi-web-img.kimi.ai/img/img.magnific.com/024b6148b62dc4a1d85654da6b6805c2fdee21b1.jpg",
    active: true
  },

  {
    id: "p4",
    name: "أجنحة دجاج",
    price: "16000",
    image: "https://kimi-web-img.kimi.ai/img/static.vecteezy.com/e2c73704e51fc4650566e1a571a87fe2ca16a484.jpg",
    active: true
  },

  {
    id: "p5",
    name: "أوراك دجاج",
    price: "15000",
    image: "https://kimi-web-img.kimi.ai/img/static.vecteezy.com/e6629db8551ef44aa4cde6031c26bacd573650f5.JPG",
    active: true
  },

  {
    id: "p6",
    name: "كبدة دجاج",
    price: "12000",
    image: "https://kimi-web-img.kimi.ai/img/media02.stockfood.com/cc406167ec693c1be2f071f7ff70657bb8991d86.jpg",
    active: true
  },

  {
    id: "p7",
    name: "أعناق دجاج",
    price: "10000",
    image: "https://kimi-web-img.kimi.ai/img/as2.ftcdn.net/b03a039d12ce028a2dda3d409bd9ba16f6a1fda1.jpg",
    active: true
  },

  {
    id: "p8",
    name: "قوانص دجاج",
    price: "11000",
    image: "https://kimi-web-img.kimi.ai/img/c8.alamy.com/c82e7d8f10c343c12bede7c7a16e46903921291f.jpg",
    active: true
  }

];


/* =========================================
   الحصول على المنتجات
   ========================================= */

function getStoreProducts() {

  const saved =
    localStorage.getItem(
      "yamama_products"
    );


  if (!saved) {

    localStorage.setItem(
      "yamama_products",
      JSON.stringify(
        DEFAULT_PRODUCTS
      )
    );

    return DEFAULT_PRODUCTS;

  }


  try {

    const products =
      JSON.parse(saved);


    if (
      !Array.isArray(products)
    ) {

      return DEFAULT_PRODUCTS;

    }


    return products;

  } catch {

    return DEFAULT_PRODUCTS;

  }

}


/* =========================================
   عرض المنتجات
   ========================================= */

function renderStoreProducts() {

  const grid =
    document.getElementById(
      "products-grid"
    );


  if (!grid) {
    return;
  }


  const products =
    getStoreProducts()
      .filter(
        product =>
          product.active !== false
      );


  grid.innerHTML = "";


  products.forEach(
    product => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "card";


      /*
        صورة المنتج:
        إذا اختار المدير صورة من الهاتف
        يتم عرضها.
      */

      let imageHTML;


      if (product.image) {

        imageHTML = `

          <img
            src="${product.image}"
            alt="${escapeStoreHTML(product.name)}"
            class="product-img"
          >

        `;

      } else {

        imageHTML = `

          <div
            class="product-no-image"
            style="font-size:2rem"
          >
            🐔
          </div>

        `;

      }


      card.innerHTML = `

        <div>

          <div class="image-wrapper">
            <div class="wooden-plate"></div>
            ${imageHTML}
          </div>

          <div class="product-title">
            ${escapeStoreHTML(product.name)}
          </div>

          <div class="tag">
            طازج يومياً
          </div>

        </div>


        <div>

          <div class="price-box price-tag">
            ${escapeStoreHTML(product.price)}
            ل.س
          </div>


          <button
            class="order-btn"
            type="button"
            data-id="${product.id}"
          >
            طلب
          </button>

        </div>

      `;


      grid.appendChild(
        card
      );

    }
  );

}


/* =========================================
   بدء الطلب
   ========================================= */

function startOrder(productId) {

  const products =
    getStoreProducts();


  const product =
    products.find(
      item =>
        item.id === productId
    );


  if (!product) {

    alert(
      "تعذر العثور على المنتج."
    );

    return;

  }


  /*
    حفظ المنتج الذي اختاره الزبون.
  */

  const order = {

    id:
      "YM-" +
      Date.now(),

    productId:
      product.id,

    productName:
      product.name,

    price:
      product.price,

    quantity:
      1,

    status:
      "تم الاستلام",

    createdAt:
      new Date().toISOString()

  };


  localStorage.setItem(
    "yamama_last_order",
    JSON.stringify(order)
  );


  /*
    الانتقال إلى صفحة الطلب
    حيث سيُطلب من الزبون:
    الاسم
    رقم الهاتف
    العنوان
    الموقع
  */

  window.location.href =
    "order.html";

}


/* =========================================
   حماية النصوص
   ========================================= */

function escapeStoreHTML(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================
   تشغيل المنتجات
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    renderStoreProducts();

  }
);
