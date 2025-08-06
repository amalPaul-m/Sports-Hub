document.getElementById('addToCartForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;                   
  submitBtn.textContent = 'In Cart';         

  const data = {
    productId: formData.get('productId'),
    selectedColor: formData.get('selectedColor'),
    selectedSize: formData.get('selectedVariant'),
    action: formData.get('action')
  };

  try {
    const res = await fetch('/cart/add-buy-cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
      window.location.href = '/cart';
    } else {

      showToast('Failed to add to cart.', true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add to Cart';
    }

  } catch (err) {
    console.error(err);
    showToast('Error occurred', true);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add to Cart';
  }
});



//product zooming

const zoom = document.getElementById("mainImage");

  function changeImage(event, src) {
    zoom.src = src;
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    event.currentTarget.classList.add('active');
  }

  zoom.addEventListener("mousemove", function (e) {
    const rect = zoom.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    zoom.style.setProperty('--x', `${x}%`);
    zoom.style.setProperty('--y', `${y}%`);
  });

  zoom.addEventListener("mouseleave", function () {
    zoom.style.setProperty('--x', `50%`);
    zoom.style.setProperty('--y', `50%`);
  });

  
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


// review image hover

  const lightbox = document.getElementById("lightbox");
  const popupImg = document.getElementById("popup-img");

  function openLightbox(src) {
    popupImg.src = src;
    lightbox.style.display = "flex";
  }

  // Close when clicking outside the image
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = "none";
    }
  });

  // Optional: Close with ESC
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      lightbox.style.display = "none";
    }
  });


// text toggle

  function toggleDescription() {
    const dots = document.getElementById('dots');
    const moreText = document.getElementById('moreText');
    const btnText = document.getElementById('descBtn');

    if (dots.style.display === 'none') {
      dots.style.display = 'inline';
      moreText.style.display = 'none';
      btnText.innerText = 'Show More';
    } else {
      dots.style.display = 'none';
      moreText.style.display = 'inline';
      btnText.innerText = 'Show Less';
    }
  }




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

