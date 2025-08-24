document.querySelector('input[name="pinCode"]').addEventListener("blur", async function () {
  const pincode = this.value.trim();
  const loader = document.getElementById('loader1');
  const errorpop = document.getElementById('error-popup1');

  if (/^\d{6}$/.test(pincode)) {
    loader.style.display = 'inline-block'; 
    try {
      const response = await fetch(`/youraccount/get-pincode-info/${pincode}`);
      const data = await response.json();

      loader.style.display = 'none'; 

      if (data[0].Status === 'Success') {
        const District = data[0].PostOffice[0].District;
        const State = data[0].PostOffice[0].State;
        document.querySelector('input[name="district"]').value = District;
        document.querySelector('input[name="state"]').value = State;
      } else {
        document.querySelector('input[name="pinCode"]').value = '';
        errorpop.style.display = 'inline-block'; 
        setTimeout(() => {
          errorpop.style.display = 'none';
        }, 2000);
      }
    } catch (err) {
      loader.style.display = 'none';
      console.error(err);
      alert('Failed to fetch address info.');
    }
  }else {

    document.getElementById('pinCode').value = '';
    errorpop.style.display = 'inline-block'; 
    setTimeout(() => {
        errorpop.style.display = 'none';
    }, 2000);
  }
});



document.getElementById('pinCode').addEventListener("blur", async function () {
  const pincode = this.value.trim();
  const loader = document.getElementById('loader');
  const errorpop = document.getElementById('error-popup');

  if (/^\d{6}$/.test(pincode)) {
    loader.style.display = 'inline-block'; 
    try {
      const response = await fetch(`/youraccount/get-pincode-info/${pincode}`);
      const data = await response.json();

      loader.style.display = 'none';

      if (data[0].Status === 'Success') {
        const District = data[0].PostOffice[0].District;
        const State = data[0].PostOffice[0].State;
        document.getElementById('district').value = District;
        document.getElementById('state').value = State;
      } else {
        document.getElementById('pinCode').value = '';
        errorpop.style.display = 'inline-block'; 
        setTimeout(() => {
            errorpop.style.display = 'none';
        }, 2000);
      }
    } catch (err) {
      loader.style.display = 'none';
      console.error(err);
      alert('Failed to fetch address info.');
    }
  }else {

    document.getElementById('pinCode').value = '';
    errorpop.style.display = 'inline-block'; 
    setTimeout(() => {
        errorpop.style.display = 'none';
    }, 2000);
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


