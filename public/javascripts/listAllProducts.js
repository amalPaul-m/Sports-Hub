// sliding
  function switchTab(elem) {
      document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
      elem.classList.add('active');
    }


// wishlist

const wishlistBtn = document.getElementById('wishlistBtn');

wishlistBtn.addEventListener('click', () => {
  wishlistBtn.classList.toggle('active');
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