document.querySelector('input[name="pinCode"]').addEventListener('change', async function () {
  const pincode = this.value.trim();

  if (/^\d{6}$/.test(pincode)) {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];

        // Auto-fill District and State
        document.querySelector('select[name="district"]').value = postOffice.District;
        document.querySelector('select[name="state"]').value = postOffice.State;

        // Optional: Autofill area/street field
        document.querySelector('input[name="street"]').value = postOffice.Name;

      } else {
        alert('Invalid or unsupported PIN code');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch address info. Please try again later.');
    }
  }
});

  
  
  
  (() => {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', e => {
        if (!form.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
        }
        form.classList.add('was-validated');
      });
    });
  })();


  
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