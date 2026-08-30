// ============================================
// Yamama common app helpers (fixed)
// ============================================

// Ensure we use a single toast element. Some pages use id="yamama-toast".
function ensureToastElement() {
  let toast = document.getElementById('toast') || document.getElementById('yamama-toast');

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

function showToast(message, timeout = 2500) {
  const toast = ensureToastElement();
  toast.textContent = message;
  toast.style.visibility = 'visible';
  toast.style.opacity = '1';

  clearTimeout(window.yamamaToastTimer);
  window.yamamaToastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    // keep visibility hidden after animation
    setTimeout(() => { toast.style.visibility = 'hidden'; }, 300);
  }, timeout);
}

// Lightweight helpers used across pages
function safeTextFromCard(card) {
  if (!card) return { name: 'منتج', price: '' };
  const nameEl = card.querySelector('.product-title') || card.querySelector('h3') || card.querySelector('.selected-product-name');
  const priceEl = card.querySelector('.price-box') || card.querySelector('.price-tag') || card.querySelector('.price') || card.querySelector('.selected-product-price');
  const name = nameEl ? nameEl.textContent.trim() : 'منتج';
  const price = priceEl ? priceEl.textContent.trim() : '';
  return { name, price };
}

// Handle clicks for buttons and links in a robust way.
function handleButtonClick(event) {
  // Ignore right clicks / modified clicks
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const target = event.target.closest('button, a');
  if (!target) return;

  // If button has data-id (modern markup), prefer that for starting an order
  if (target.classList.contains('order-btn') && target.dataset && target.dataset.id) {
    // defend in case startOrder isn't available
    if (typeof window.startOrder === 'function') {
      window.startOrder(target.dataset.id);
      return;
    }
  }

  // Legacy: some pages rely on onclick="startOrder('id')" on the button itself.
  // We only need to show a toast when an order button is clicked.
  if (target.classList.contains('order-btn')) {
    const card = target.closest('.card');
    const { name, price } = safeTextFromCard(card);
    // normalize price display: ensure currency appears as "ل.س" with no extra spaces
    const normalizedPrice = price.replace(/\s*ل\.?\s?س\.?\s*/g, '') || price;
    showToast(`تمت إضافة "${name}" (${normalizedPrice ? normalizedPrice + ' ل.س' : 'سعر غير معروف'}) إلى السلة`);
    return;
  }

  // Buttons that are links or actions we can enhance here (call manager / home)
  if (target.classList.contains('call-button') || target.matches('a.call-manager')) {
    // let existing onclick or href handle it; we could add analytics here
    return;
  }
}

function initYamamaApp() {
  // old page helpers
  if (typeof loadTicker === 'function') {
    try { loadTicker(); } catch (e) { /* ignore */ }
  }
  if (typeof renderProducts === 'function') {
    try { renderProducts(); } catch (e) { /* ignore */ }
  }

  // Global delegated click handler (robust and won't break inline onclick handlers)
  document.addEventListener('click', handleButtonClick);

  // Register service worker if available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(error => {
      console.log('Service Worker:', error);
    });
  }
}

document.addEventListener('DOMContentLoaded', initYamamaApp);
