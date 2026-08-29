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
          >

        `;

      } else {

        imageHTML = `

          <div
            class="product-no-image"
          >
            🐔
          </div>

        `;

      }


      card.innerHTML = `

        <div>

          <h3>
            ${escapeStoreHTML(product.name)}
          </h3>

          <div class="tag">
            طازج يومياً
          </div>

          ${imageHTML}

        </div>


        <div>

          <div class="price-tag">
            ${escapeStoreHTML(product.price)}
            ل.س
          </div>


          <button
            class="order-btn"
            type="button"
            onclick="startOrder('${product.id}')"
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
