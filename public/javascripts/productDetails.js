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
