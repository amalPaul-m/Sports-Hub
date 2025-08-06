
let dataStock = 0 ;
document.querySelectorAll('.qty-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const productId = button.getAttribute('data-product-id');
    const action = button.classList.contains('increment') ? 'increase' : 'decrease';
    document.getElementById('promo').value = '';
    document.getElementById('coupon-error').innerText = '';
    const response = await fetch(`/cart/${action}/${productId}`, {
      method: 'PATCH'
    });

    const data = await response.json();

    if (data.success) {
      dataStock = Number(data.stock);
      // update quantity
      document.querySelector(`#price-total`).textContent = data.grandTotal.toFixed(2);
      document.querySelector(`#cart-total`).textContent = data.netAmount.toFixed(2);
      document.querySelector(`#total-tax`).textContent = data.totalTax.toFixed(2);
      document.querySelector(`#payable`).textContent = data.payable.toFixed(2);
      document.querySelector(`#discount-total`).textContent = data.couponAmount.toFixed(2);
      document.querySelector(`#shipping-charge`).textContent = data.shippingCharge.toFixed(2);

      updateQty(button, action === 'increase' ? 1 : -1, dataStock);
    } else if (data.removeItem) {
      // Optionally remove the item if quantity is 0
      document.getElementById(`cart-item-${productId}`).remove();
    } else if (!data.success) {
      document.querySelector('#error-msg').textContent = data.message;
      dataStock = data.stock;
      
    }
  });
});


function updateQty(btn, delta) {
  const span = btn.parentElement.querySelector("span.mx-1");
  let qty = parseInt(span.innerText);
  const minquantity = Math.min(3, parseInt(dataStock));
  qty = Math.min(3, Math.max(1, qty + delta));

  span.innerText = qty;

  const incrementBtn = btn.parentElement.querySelector(".increment");
  const decrementBtn = btn.parentElement.querySelector(".decrement");

  if (incrementBtn) incrementBtn.disabled = qty >= 3;
  if (decrementBtn) decrementBtn.disabled = qty <= 1;
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
