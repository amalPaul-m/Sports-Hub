// const slide = document.getElementById('stepSlide');
//     const indicators = document.querySelectorAll('.step-indicator div');
//     let currentStep = 0;

//     function updateStep(direction) {
//       currentStep += direction;
//       currentStep = Math.max(0, Math.min(currentStep, 2));
//       slide.style.transform = `translateX(-${currentStep * 100}%)`;
//       indicators.forEach((el, index) => {
//         el.classList.toggle('active-step', index === currentStep);
//       });
//     }

//     document.querySelectorAll('.next-btn').forEach(btn => {
//       btn.addEventListener('click', () => updateStep(1));
//     });
//     document.querySelectorAll('.back-btn').forEach(btn => {
//       btn.addEventListener('click', () => updateStep(-1));
//     });

//     const termsCheckbox = document.getElementById('termsCheck');
//     const payBtn = document.getElementById('payBtn');
//     if (termsCheckbox) {
//       termsCheckbox.addEventListener('change', () => {
//         payBtn.disabled = !termsCheckbox.checked;
//       });
//     }


 function goToTab(tabId) {
      const tabTrigger = new bootstrap.Tab(document.getElementById(tabId));
      tabTrigger.show();
    }

    const termsCheckbox = document.getElementById('termsCheck');
    const payButton = document.getElementById('payButton');
    if (termsCheckbox && payButton) {
      termsCheckbox.addEventListener('change', () => {
        payButton.disabled = !termsCheckbox.checked;
      });
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