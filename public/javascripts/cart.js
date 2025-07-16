function updateQty(btn, delta) {
  const span = btn.parentElement.querySelector("span.mx-1");
  let qty = parseInt(span.innerText);

  qty = Math.min(3, Math.max(1, qty + delta));

  span.innerText = qty;

  const incrementBtn = btn.parentElement.querySelector(".increment");
  const decrementBtn = btn.parentElement.querySelector(".decrement");

  if (incrementBtn) incrementBtn.disabled = qty >= 3;
  if (decrementBtn) decrementBtn.disabled = qty <= 1;
}




document.querySelectorAll('.qty-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const productId = button.getAttribute('data-product-id');
    const action = button.classList.contains('increment') ? 'increase' : 'decrease';
    const response = await fetch(`/cart/${action}/${productId}`, {
      method: 'PATCH'
    });

    const data = await response.json();

    if (data.success) {
      // update quantity
      document.querySelector(`#price-total`).textContent = data.grandTotal.toFixed(2);
      document.querySelector(`#cart-total`).textContent = data.netAmount.toFixed(2);
      document.querySelector(`#total-tax`).textContent = data.totalTax.toFixed(2);
    } else if (data.removeItem) {
      // Optionally remove the item if quantity is 0
      document.getElementById(`cart-item-${productId}`).remove();
    } else if (!data.success) {
      document.querySelector('#error-msg').textContent = data.message;
    }
  });
});
