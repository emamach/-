"use strict";

/* =========================================
   منتجات دجاج اليمامة
   ========================================= */

window.YamamaProducts = {

  getAll() {
    const saved = localStorage.getItem("yamama_products");

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("خطأ في قراءة المنتجات:", error);
      return [];
    }
  },


  getById(id) {
    const products = this.getAll();

    return products.find(product => {
      return product.id === id;
    });
  },


  save(product) {

    const products = this.getAll();

    const index = products.findIndex(item => {
      return item.id === product.id;
    });

    if (index === -1) {
      products.push(product);
    } else {
      products[index] = product;
    }

    localStorage.setItem(
      "yamama_products",
      JSON.stringify(products)
    );

    return true;
  },


  delete(id) {

    const products = this.getAll();

    const filtered = products.filter(product => {
      return product.id !== id;
    });

    localStorage.setItem(
      "yamama_products",
      JSON.stringify(filtered)
    );

    return true;
  },


  create(name, price, image = "") {

    const product = {

      id:
        "product-" +
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .substring(2, 8),

      name: String(name).trim(),

      price: String(price).trim(),

      image: image,

      active: true,

      createdAt:
        new Date().toISOString()

    };

    this.save(product);

    return product;
  }

};
