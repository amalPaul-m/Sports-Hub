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


// sliding
  function switchTab(elem) {
      document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
      elem.classList.add('active');
    }





const btn1 = document.getElementById('btn-1');
const btn2 = document.getElementById('btn-2');
const btn3 = document.getElementById('btn-3');
const btn4 = document.getElementById('btn-4');

btn1.addEventListener('click', () => {
    // nothing disables on first click
});

btn2.addEventListener('click', () => {
    btn1.disabled = true;
    btn1.classList.add('disabled');
});

btn3.addEventListener('click', () => {
    btn1.disabled = true;
    btn1.classList.add('disabled');
    btn2.disabled = true;
    btn2.classList.add('disabled');
});

btn4.addEventListener('click', () => {
    btn1.disabled = true;
    btn1.classList.add('disabled');
    btn2.disabled = true;
    btn2.classList.add('disabled');
    btn3.disabled = true;
    btn3.classList.add('disabled');
});



function showProcessing() {
    document.getElementById('processing-overlay').style.display = 'flex';
    document.getElementById('accept').style.display = 'none';
}
