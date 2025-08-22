document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.qty-btn').forEach(btn => btn.addEventListener('click', onQtyClick));
});

async function onQtyClick(e) {
  const button = e.currentTarget;
  const productId = button.dataset.productId;
  const size = button.dataset.size?.trim();
  const color = button.dataset.color?.trim();
  const action = button.classList.contains('increment') ? 'increase' : 'decrease';

  // quick checks
  if (!productId || typeof size === 'undefined' || typeof color === 'undefined') {
    console.error('Missing productId/size/color on button', button);
    return;
  }

  // clear UI coupon messages (your existing logic)
  const promoInput = document.getElementById('promo');
  const couponError = document.getElementById('coupon-error');
  if (promoInput) promoInput.value = '';
  if (couponError) couponError.innerText = '';

  try {
    const resp = await fetch(`/cart/${action}/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ size, color })
    });

    const data = await resp.json();
    console.log('cart update response', data);

    if (!data.success) {
      // show server message (if any)
      const errorMsg = document.getElementById('error-msg');
      if (errorMsg) errorMsg.textContent = data.message || 'Failed to update quantity';
      // If server requests removal
      if (data.removeItem) removeCartRow(productId, size, color);
      return;
    }

    // Find and update the correct quantity span
    const qtySpan = findQtySpan(productId, size, color);
    if (qtySpan) qtySpan.textContent = data.newQty;

    // Update the +/- buttons disabled state for that variant
    const { incBtn, decBtn } = findButtons(productId, size, color);
    const maxQty = Math.min(3, Number(data.stock || 3));
    if (incBtn) incBtn.disabled = data.newQty >= maxQty;
    if (decBtn) decBtn.disabled = data.newQty <= 1;

    // Update totals if provided by backend (prefer backend values)
    if (typeof data.grandTotal !== 'undefined') {
      setTextIfPresent('price-total', formatNumber(data.grandTotal));
      setTextIfPresent('cart-total', formatNumber(data.netAmount));
      setTextIfPresent('total-tax', formatNumber(data.totalTax));
      setTextIfPresent('payable', formatNumber(data.payable));
      setTextIfPresent('discount-total', formatNumber(data.couponAmount || 0));
      setTextIfPresent('shipping-charge', (data.shippingCharge || 0).toString());
    }

    // If server indicates the item was removed (qty 0) remove from DOM
    if (data.removeItem) removeCartRow(productId, size, color);

  } catch (err) {
    console.error('Error updating cart quantity:', err);
  }
}

// helpers

function findQtySpan(productId, size, color) {

  const nodes = document.querySelectorAll('.item-qty');
  for (const n of nodes) {
    if (n.dataset.productId === String(productId) &&
        (n.dataset.size || '').trim() === (size || '').trim() &&
        (n.dataset.color || '').trim() === (color || '').trim()) {
      return n;
    }
  }
  return null;
}

function findButtons(productId, size, color) {

  const inc = Array.from(document.querySelectorAll('.qty-btn.increment')).find(b =>
    b.dataset.productId === String(productId) &&
    (b.dataset.size || '').trim() === (size || '').trim() &&
    (b.dataset.color || '').trim() === (color || '').trim()
  );
  const dec = Array.from(document.querySelectorAll('.qty-btn.decrement')).find(b =>
    b.dataset.productId === String(productId) &&
    (b.dataset.size || '').trim() === (size || '').trim() &&
    (b.dataset.color || '').trim() === (color || '').trim()
  );
  return { incBtn: inc, decBtn: dec };
}

function removeCartRow(productId, size, color) {

  const row = document.querySelector(`.cart-item[data-product-id="${productId}"][data-size="${size}"][data-color="${color}"]`);
  if (row) { row.remove(); return; }

  const span = findQtySpan(productId, size, color);
  if (span) {
    const parent = span.closest('.cart-item');
    if (parent) parent.remove();
  }
}

function setTextIfPresent(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function formatNumber(v) {
  return Number(v).toFixed(2);
}






// coupon applied

document.getElementById('couponbtn').addEventListener('click', () => {
    const couponCode = document.getElementById('promo').value.trim();

    fetch('/cart/checkCoupon', {
        method: 'POST',
        body: JSON.stringify({ couponCode: couponCode }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        const errorSpan = document.getElementById('coupon-error');
        if (data.success) {
            errorSpan.innerText = data.message;
            errorSpan.style.color = 'green';  
            document.querySelector(`#discount-total`).textContent = data.couponAmount.toFixed(2);
            document.querySelector(`#payable`).textContent = data.payable.toFixed(2);
          
        } else {
            errorSpan.innerText = data.message;
            errorSpan.style.color = 'red';
        }
    })
    .catch(err => {
        console.error(err);
        document.getElementById('coupon-error').innerText = 'Something went wrong!';
    });
});




document.addEventListener('DOMContentLoaded', () => {
  const homeWishlist = document.getElementById('home-badge-wishlist');
  const homeCart = document.getElementById('home-badge-cart');

  fetch('/home/home-badge')
    .then(response => response.json())
    .then(data => {
      if (homeWishlist) homeWishlist.innerText = data.wishlistCount || 0;
      if (homeCart) homeCart.innerText = data.cartCount || 0;
    })
    .catch(err => console.error('Error fetching badge counts:', err));
}); 
