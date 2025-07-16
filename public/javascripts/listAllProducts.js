// sliding
  function switchTab(elem) {
      document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
      elem.classList.add('active');
    }


// wishlist

document.querySelectorAll('.wishlist-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const productId = button.dataset.productId;
    console.log('Toggling wishlist for product ID:', productId);

    const res = await fetch(`/wishlist/${productId}`, { method: 'POST' });
    const data = await res.json();

    if (data.success) {
      button.classList.toggle('active');
    }
  });
});


// Add to cart button

const cartButtons = document.querySelectorAll('.btn-addCart');

    cartButtons.forEach(button => {
      button.addEventListener('click', () => {
        button.classList.add('clicked');
        setTimeout(() => {
          button.classList.remove('clicked');
        }, 2000); // Reset after 2 seconds
      });
    });