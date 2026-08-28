// ============================================
// 1. إنشاء عنصر Toast (إشعار) إذا لم يكن موجودًا
// ============================================
function ensureToastElement() {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      background: #1d5287;
      color: #fff;
      padding: 12px 24px;
      border-radius: 30px;
      font-size: 0.9rem;
      font-weight: 700;
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toast);
  }
  return toast;
}

// ============================================
// 2. دالة إظهار Toast مع إخفاء تلقائي
// ============================================
function showToast(message) {
  const toast = ensureToastElement();
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.visibility = 'visible';

  // إلغاء أي مؤقت سابق
  clearTimeout(window.yamamaToastTimer);

  // إخفاء بعد 2.5 ثانية
  window.yamamaToastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.visibility = 'hidden';
  }, 2500);
}

// ============================================
// 3. دوال تحميل البيانات (اختيارية – لن نستخدمها هنا)
// ============================================
function loadTicker() {
  // يمكن تنفيذ أي تهيئة هنا (مثل شريط أخبار)
  console.log('Ticker loaded');
}

function renderProducts() {
  // المنتجات موجودة في HTML ثابت، فلا حاجة لإعادة الرسم
  console.log('Products rendered');
}

// ============================================
// 4. معالجة النقر على الأزرار (تفويض الأحداث)
// ============================================
function handleButtonClick(event) {
  const target = event.target.closest('button, a'); // نبحث عن أقرب زر أو رابط

/  if (!target) return;

  // ✅ زر "طلب" الخاص بالمنتج
  if (target.classList.contains('order-btn')) {
    const card = target.closest('.card');
    if (card) {
      const productName = card.querySelector('.product-title')?.textContent || 'منتج';
      const price = card.querySelector('.price-box')?.textContent || '';
      showToast(`تمت إضافة "${productName}" (${price} د.ل) إلى السلة`);
    }
  }

  // ✅ زر "تحدث مع المدير"
  if (target.classList.contains('chat-btn')) {
    showToast('جارٍ فتح المحادثة مع المدير...');
    // يمكن هنا فتح رابط خارجي أو نافذة دردشة
    // window.open('https://wa.me/218917163888', '_blank');
  }

  // ✅ أيقونة السلة (profile-icon)
  if (target.closest('.profile-icon')) {
    showToast('السلة فارغة حالياً');
    // يمكن فتح صفحة السلة أو عرض محتوياتها
  }

  // ✅ رابط رقم الهاتف في الفوتر
  if (target.classList.contains('phone-number')) {
    // لا نعرض toast حتى لا نزعج المستخدم، فقط نسمح بالاتصال
    console.log('اتصال بالرقم');
  }
}

// ============================================
// 5. تهيئة التطبيق
// ============================================
function initYamamaApp() {
  // تحميل البيانات (حتى لو كانت فارغة)
  loadTicker();
  renderProducts();

  // ربط الأحداث
  document.addEventListener('click', handleButtonClick);

  // تسجيل Service Worker (اختياري)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('sw.js')
      .catch(error => {
        console.log('Service Worker:', error);
      });
  }
}

// ============================================
// 6. تشغيل التطبيق عند اكتمال تحميل الصفحة
// ============================================
document.addEventListener('DOMContentLoaded', initYamamaApp);
