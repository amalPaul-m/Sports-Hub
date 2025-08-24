
  window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  if (success === '1' || success === '2') {
    Swal.fire({
      title: success === '1' ? 'Coupon Created!' : 'Coupon Updated!',
      text: 'Redirecting to coupon list...',
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        icon: 'swal-icon',
        confirmButton: 'swal-button'
      }
    }).then(() => window.location.href = "/coupon");
  }
});



(() => {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            const amountInput = form.querySelector('.amount-input');
            const minOrderInput = form.querySelector('.minimum-order-input');
            const percentageInput = form.querySelector('.percentage-input');
            const activeDateInput = form.querySelector('#activeDate1');
            const expiryDateInput = form.querySelector('#activeDate2');

            const amountValue = amountInput.value.trim();
            const minOrderValue = minOrderInput.value.trim();
            const percentageValue = percentageInput.value.trim();
            const activeDateValue = activeDateInput.value;
            const expiryDateValue = expiryDateInput.value;

            let customValidationFailed = false;

      
            if ((!amountValue && !percentageValue) || (amountValue && percentageValue)) {
                customValidationFailed = true;
                amountInput.classList.add('is-invalid');
                percentageInput.classList.add('is-invalid');
            } else {
                amountInput.classList.remove('is-invalid');
                percentageInput.classList.remove('is-invalid');
            }

         
            if (activeDateValue && expiryDateValue && new Date(activeDateValue) > new Date(expiryDateValue)) {
                customValidationFailed = true;
                activeDateInput.classList.add('is-invalid');
                expiryDateInput.classList.add('is-invalid');
            } else {
                activeDateInput.classList.remove('is-invalid');
                expiryDateInput.classList.remove('is-invalid');
            }

            if (!isNaN(amountValue) && !isNaN(minOrderValue)) {
                if (minOrderValue < amountValue) {
                    customValidationFailed = true;
                    minOrderInput.classList.add('is-invalid');
                } else {
                    minOrderInput.classList.remove('is-invalid');
                }
            }

            if (!form.checkValidity() || customValidationFailed) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated');
        });

        // Optional: Remove error on typing
        form.querySelector('.amount-input').addEventListener('input', () => {
            form.querySelector('.amount-input').classList.remove('is-invalid');
            form.querySelector('.percentage-input').classList.remove('is-invalid');
        });
        form.querySelector('.percentage-input').addEventListener('input', () => {
            form.querySelector('.amount-input').classList.remove('is-invalid');
            form.querySelector('.percentage-input').classList.remove('is-invalid');
        });
        form.querySelector('#activeDate1').addEventListener('change', () => {
            form.querySelector('#activeDate1').classList.remove('is-invalid');
            form.querySelector('#activeDate2').classList.remove('is-invalid');
        });
        form.querySelector('#activeDate2').addEventListener('change', () => {
            form.querySelector('#activeDate1').classList.remove('is-invalid');
            form.querySelector('#activeDate2').classList.remove('is-invalid');
        });
    });
})();






const couponInput = document.getElementById('couponCodeInput');

couponInput.addEventListener('input', () => {
    couponInput.value = couponInput.value.toUpperCase();
});



const today = new Date().toISOString().split('T')[0];
document.getElementById('activeDate1').setAttribute('min', today);
document.getElementById('activeDate2').setAttribute('min', today);





function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('topbar').classList.toggle('collapsed');
    document.getElementById('main').classList.toggle('collapsed');
  }

  const ctx = document.getElementById('lineChart').getContext('2d');
  const lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Sales',
        data: [120, 190, 300, 250, 200, 300, 250],
        fill: false,
        borderColor: '#3b82f6',
        tension: 0.4
      }]
    }
  });

  const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
  new Chart(doughnutCtx, {
    type: 'doughnut',
    data: {
      labels: ['Youtube', 'Facebook', 'Twitter'],
      datasets: [{
        label: 'Revenue',
        data: [50, 30, 20],
        backgroundColor: ['#ef4444', '#3b82f6', '#14b8a6']
      }]
    },
    options: {
      cutout: '70%'
    }
  });







