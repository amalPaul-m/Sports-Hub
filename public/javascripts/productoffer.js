
  window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  if (success === '1' || success === '2') {
    Swal.fire({
      title: success === '1' ? 'Offer Created!' : 'Coupon Updated!',
      text: 'Redirecting to offers list...',
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        icon: 'swal-icon',
        confirmButton: 'swal-button'
      }
    }).then(() => window.location.href = "/offers");
  }
});


  window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  if (error === '1' || error === '2') {
    Swal.fire({
      title: error === '1' ? 'Coupon Exist!' : 'Coupon Updated!',
      text: 'Redirecting to coupon list...',
      icon: 'error',
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title-failure',
        icon: 'swal-icon',
        confirmButton: 'swal-button'
      }
    }).then(() => window.location.href = "/coupon/add");
  }
});


(() => {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            const percentageInput = form.querySelector('.percentage-input');
            const activeDateInput = form.querySelector('#activeDate1');
            const expiryDateInput = form.querySelector('#activeDate2');

            const percentageValue = percentageInput.value.trim();
            const activeDateValue = activeDateInput.value;
            const expiryDateValue = expiryDateInput.value;

            let customValidationFailed = false;
           
            if (activeDateValue && expiryDateValue && new Date(activeDateValue) > new Date(expiryDateValue)) {
                customValidationFailed = true;
                activeDateInput.classList.add('is-invalid');
                expiryDateInput.classList.add('is-invalid');
            } else {
                activeDateInput.classList.remove('is-invalid');
                expiryDateInput.classList.remove('is-invalid');
            }


            if (!form.checkValidity() || customValidationFailed) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated');
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







