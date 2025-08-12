document.addEventListener('DOMContentLoaded', function () {
  const char = document.getElementById('salesChart');
  if (char) {
    const ctx = char.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['JAN','FEB','MAR','APR','MAY','JUN','JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
        datasets: [{
          label: 'Sales',
          data: monthlySales,
          borderColor: '#000000',
          backgroundColor: 'rgba(0,0,0,0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#000',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return '₹' + value;
              }
            }
          }
        }
      }
    });
  }
});




document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const fromDateInput = document.querySelector('input[name="fromDate"]');
  const toDateInput = document.querySelector('input[name="toDate"]');
  const filterBtn = document.querySelector('button[type="submit"]');

  // Set max date to today
  fromDateInput.max = today;
  toDateInput.max = today;

  filterBtn.disabled = true;

  fromDateInput.addEventListener('change', () => {
    const fromDate = fromDateInput.value;
    if (fromDate) {
      toDateInput.min = fromDate;
      if (toDateInput.value && toDateInput.value < fromDate) {
        toDateInput.value = '';
      }
    } else {
      toDateInput.min = '';
    }

    checkDatesFilled();
  });

  toDateInput.addEventListener('change', checkDatesFilled);

  function checkDatesFilled() {
    if (fromDateInput.value && toDateInput.value) {
      filterBtn.disabled = false;
    } else {
      filterBtn.disabled = true;
    }
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