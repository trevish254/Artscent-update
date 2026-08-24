/**
 * Artscent Shopping Cart Drawer
 * Recreates the exact luxury slide-out cart drawer matching the reference image.
 */

(function() {
  const STORAGE_KEY = 'artscent_cart_items';
  const FREE_SHIPPING_THRESHOLD = 5000; // 5,000 KSh

  // Helper to determine accurate checkout URL from any page location
  function getCheckoutUrl() {
    const pathname = window.location.pathname.replace(/\\/g, '/');
    if (pathname.indexOf('/Checkout/') !== -1) {
      return 'order.html';
    }
    return '../Checkout/order.html';
  }

  // Load cart from localStorage or initialize with sample if empty
  function getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(e);
    }
    // Default sample item matching real fragrance in KSh
    return [
      {
        id: 'scandal-eau-de-parfum',
        name: 'SCANDAL EAU DE PARFUM',
        variant: '50ml - Noir Edition',
        price: 4500,
        priceFormatted: 'Ksh 4,500',
        quantity: 1,
        image: 'https://placehold.co/400x500/1e1e1e/d4af37?text=Scandal+EDP'
      }
    ];
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
    if (window.artscentUserAuth && typeof window.artscentUserAuth.syncCart === 'function') {
      window.artscentUserAuth.syncCart(cart);
    }
    renderCart();
  }

  // Format currency in KSH
  function formatPrice(num) {
    const val = parseFloat(num) || 0;
    return 'Ksh ' + val.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  // Build drawer DOM if not already present
  function ensureDrawerMarkup() {
    if (document.getElementById('artscentCartDrawer')) return;

    const drawerHTML = `
      <div class="as-cart-backdrop" id="asCartBackdrop"></div>
      <div class="as-cart-drawer" id="artscentCartDrawer">
        <!-- Header -->
        <div class="as-cart-header">
          <h2 class="as-cart-title">SHOPPING CART</h2>
          <button type="button" class="as-cart-close" id="asCartClose" aria-label="Close cart">✕</button>
        </div>

        <!-- Free Shipping Notification & Progress Bar -->
        <div class="as-cart-shipping-wrap" id="asCartShippingWrap">
          <p class="as-cart-shipping-text" id="asCartShippingText">You qualified for free shipping!</p>
          <div class="as-cart-shipping-track">
            <div class="as-cart-shipping-bar" id="asCartShippingBar" style="width: 100%;"></div>
          </div>
        </div>

        <!-- Scrollable Items List -->
        <div class="as-cart-items-list" id="asCartItemsList">
          <!-- Items will be injected here dynamically -->
        </div>

        <!-- Sticky Footer -->
        <div class="as-cart-footer">
          <!-- Checkout Button -->
          <a href="${getCheckoutUrl()}" class="as-cart-checkout-btn" id="asCartCheckoutBtn">
            CHECKOUT · <span id="asCartTotalText">KSH 4,500</span>
          </a>

          <!-- Taxes & Shipping Note -->
          <p class="as-cart-note">Shipping and taxes calculated at checkout</p>

          <!-- Coupon Code Input Row -->
          <div class="as-cart-coupon-row">
            <input type="text" class="as-cart-coupon-input" id="asCouponInput" placeholder="Coupon code" />
            <button type="button" class="as-cart-coupon-apply" id="asCouponApply">Apply</button>
          </div>

          <!-- Payment Provider Badges Row -->
          <div class="as-cart-payment-icons">
            <span class="as-pay-icon mpesa" style="background:#00A859;color:#fff;font-weight:bold;font-size:11px;" title="M-Pesa">M-PESA</span>
            <span class="as-pay-icon mastercard" title="Mastercard">MC</span>
            <span class="as-pay-icon visa" title="Visa">VISA</span>
            <span class="as-pay-icon apple-pay" title="Apple Pay">Pay</span>
            <span class="as-pay-icon gpay" title="Google Pay">G Pay</span>
            <span class="as-pay-icon paypal" title="PayPal">PayPal</span>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    // Event listeners for close
    document.getElementById('asCartClose').addEventListener('click', closeCart);
    document.getElementById('asCartBackdrop').addEventListener('click', closeCart);

    // Coupon button interaction
    document.getElementById('asCouponApply').addEventListener('click', function() {
      const input = document.getElementById('asCouponInput');
      if (input && input.value.trim()) {
        alert('Coupon code "' + input.value.trim() + '" applied!');
        input.value = '';
      }
    });
  }

  // Render items in cart
  function renderCart() {
    ensureDrawerMarkup();
    const cart = getCart();
    const listEl = document.getElementById('asCartItemsList');
    const totalEl = document.getElementById('asCartTotalText');
    const shippingTextEl = document.getElementById('asCartShippingText');
    const shippingBarEl = document.getElementById('asCartShippingBar');
    const checkoutBtn = document.getElementById('asCartCheckoutBtn');

    if (checkoutBtn) {
      checkoutBtn.href = getCheckoutUrl();
    }

    if (!listEl) return;

    if (cart.length === 0) {
      listEl.innerHTML = `
        <div class="as-cart-empty">
          <p>Your shopping cart is empty.</p>
          <a href="../Products/products.html" class="as-cart-continue-btn" onclick="artscentCart.close()">Discover Products</a>
        </div>
      `;
      if (totalEl) totalEl.textContent = 'KSH 0';
      if (shippingTextEl) shippingTextEl.textContent = 'Add items to qualify for free shipping!';
      if (shippingBarEl) shippingBarEl.style.width = '0%';
      return;
    }

    let subtotal = 0;
    let html = '';

    cart.forEach(item => {
      const itemPrice = parseFloat(item.price) || 0;
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      html += `
        <div class="as-cart-item" data-id="${item.id}">
          <div class="as-cart-item-img-box">
            <img src="${item.image}" alt="${item.name}" class="as-cart-item-img" onerror="this.src='https://placehold.co/400x500?text=Artscent'" />
          </div>
          <div class="as-cart-item-details">
            <div class="as-cart-item-top">
              <span class="as-cart-item-name">${item.name}</span>
              <button type="button" class="as-cart-item-remove" data-remove="${item.id}" title="Remove item">✕</button>
            </div>
            <div class="as-cart-item-variant">${item.variant || 'Standard 100 ml'}</div>
            <div class="as-cart-item-bottom">
              <span class="as-cart-item-price">${formatPrice(itemPrice)}</span>
              <div class="as-cart-qty-stepper">
                <button type="button" class="as-qty-btn" data-minus="${item.id}">−</button>
                <span class="as-qty-val">${item.quantity}</span>
                <button type="button" class="as-qty-btn" data-plus="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;

    // Total text
    if (totalEl) {
      totalEl.textContent = formatPrice(subtotal).toUpperCase();
    }

    // Shipping progress calculation
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      if (shippingTextEl) shippingTextEl.textContent = 'You qualified for free shipping!';
      if (shippingBarEl) shippingBarEl.style.width = '100%';
    } else {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      if (shippingTextEl) shippingTextEl.textContent = `Add ${formatPrice(remaining)} more for free shipping!`;
      const pct = Math.min(100, Math.max(0, (subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      if (shippingBarEl) shippingBarEl.style.width = `${pct}%`;
    }

    // Attach listeners for remove & stepper
    listEl.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        removeItem(this.getAttribute('data-remove'));
      });
    });

    listEl.querySelectorAll('[data-minus]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        updateQuantity(this.getAttribute('data-minus'), -1);
      });
    });

    listEl.querySelectorAll('[data-plus]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        updateQuantity(this.getAttribute('data-plus'), 1);
      });
    });
  }

  function openCart() {
    ensureDrawerMarkup();
    renderCart();
    const drawer = document.getElementById('artscentCartDrawer');
    const backdrop = document.getElementById('asCartBackdrop');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    const drawer = document.getElementById('artscentCartDrawer');
    const backdrop = document.getElementById('asCartBackdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id || item.name === product.name);

    if (existing) {
      existing.quantity += (product.quantity || 1);
    } else {
      cart.push({
        id: product.id || 'prod_' + Math.random().toString(36).substr(2, 9),
        name: product.name || 'Artscent Perfume',
        variant: product.variant || 'Every 60 days',
        price: parseFloat(product.price) || 586.50,
        priceFormatted: product.priceFormatted || formatPrice(parseFloat(product.price) || 586.50),
        quantity: product.quantity || 1,
        image: product.image || 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_194048_278bf3cc-7d1f-43c1-9dc7-73d8fcd9949c.png&w=1280&q=85'
      });
    }

    saveCart(cart);
    openCart();
  }

  function updateQuantity(id, delta) {
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
      saveCart(cart);
    }
  }

  function removeItem(id) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
  }

  // Public API
  window.artscentCart = {
    open: openCart,
    close: closeCart,
    add: addToCart,
    get: getCart,
    render: renderCart
  };

  // DOM initialization & global click binding
  document.addEventListener('DOMContentLoaded', function() {
    ensureDrawerMarkup();
    renderCart();

    // Bind all navbar cart trigger buttons
    document.querySelectorAll('.aevi-cart-btn, [data-open-cart]').forEach(el => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        openCart();
      });
    });

    // Delegate clicks on product buttons or cards
    document.addEventListener('click', function(e) {
      const pillBtn = e.target.closest('.aevi-hero-pill-btn');
      if (pillBtn) {
        e.preventDefault();
        addToCart({
          id: 'vitamin-c-collagen-serum',
          name: 'VITAMIN C + COLLAGEN SERUM',
          variant: 'Every 60 days',
          price: 586.50,
          image: 'images/aevi-hero-bg.jpg'
        });
        return;
      }

      const scentBtn = e.target.closest('.scent-shop-btn');
      if (scentBtn) {
        e.preventDefault();
        const section = scentBtn.closest('#wildScentSection') || scentBtn.closest('#scentFinderSection');
        if (section && section.id === 'wildScentSection') {
          addToCart({
            id: 'eau-so-extra',
            name: 'EAU SO EXTRA',
            variant: '100 ml / 3.3 oz',
            price: 586.50,
            image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260511_151621_4fba6892-ed21-4c2e-8cb3-0bd2ec2abefa.png&w=1280&q=85'
          });
        } else {
          addToCart({
            id: 'eau-so-sweet',
            name: 'EAU SO SWEET',
            variant: '100 ml / 3.3 oz',
            price: 586.50,
            image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260511_151640_5b4a7bf8-4eb2-4a49-aa63-17a9bb642b88.png&w=1280&q=85'
          });
        }
        return;
      }
    });
  });

  window.artscentAddToCart = addToCart;
  window.artscentOpenCart = openCart;
  window.artscentCloseCart = closeCart;
})();
