
  window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  if (success === '1' || success === '2') {
    Swal.fire({
      title: success === '1' ? 'Offer Removed!' : 'Offer Updated!',
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