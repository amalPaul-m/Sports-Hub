
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



const new_arraival = document.getElementById('new_arraival');
const top_selling = document.getElementById('top_selling');

new_arraival.addEventListener('click', e => {
    new_arraival.classList.add('active');
    top_selling.classList.remove('active');
});

top_selling.addEventListener('click', e => {
    top_selling.classList.add('active');
    new_arraival.classList.remove('active');
});


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


    
// sliding
  function switchTab(elem) {
      document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
      elem.classList.add('active');
    }


