function updateQty(btn, delta) {
    const span = btn.parentElement.querySelector("span.mx-1");
    let qty = parseInt(span.innerText);
    qty = Math.max(1, qty + delta);
    span.innerText = qty;
  }