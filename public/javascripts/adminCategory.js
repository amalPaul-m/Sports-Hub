
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  if (success === '1' || success === '2') {
    Swal.fire({
      title: success === '1' ? 'Category Created!' : 'Category Updated!',
      text: 'Redirecting to category list...',
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        icon: 'swal-icon',
        confirmButton: 'swal-button'
      }
    }).then(() => window.location.href = "/category");
  }
});


window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const fail = params.get('fail');
  if (fail === '1') {
    Swal.fire({
      title: 'Category is exist!',
      text: 'Try another category..',
      icon: 'error',
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title-failure',
        icon: 'swal-icon',
        confirmButton: 'swal-button'
      }
    }).then(() => window.location.href = "/category");
  }
});




  const sourceText = document.getElementById("sourceText");
    const liveOutput = document.getElementById("liveOutput");

    function capitalizeWords(str) {
      return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    sourceText.addEventListener("input", () => {
      const capitalized = capitalizeWords(sourceText.value.toLowerCase());
      liveOutput.textContent = capitalized;
    });



  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('categoryForm');

    form.addEventListener('submit', function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    });

    // Optional: live preview update
    const input = document.getElementById('sourceText');
    const output = document.getElementById('liveOutput');
    input.addEventListener('input', () => {
      output.textContent = input.value || 'Example';
    });
  });



   document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('categoryFormUpdate');

    form.addEventListener('submit', function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    }, false);
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


// sliding
  function switchTab(elem) {
      document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
      elem.classList.add('active');
    }

// image uplaod
function handleFileUpload(event) {
      const preview = document.getElementById('preview');
      preview.classList.remove('d-none');
    }

    function removeFile() {
      const preview = document.getElementById('preview');
      preview.classList.add('d-none');
      document.getElementById('imageUpload').value = "";
    }



    // image uplaod - edit category
    function handleFileUploadEdit(event) {
      const preview = document.getElementById('preview-edit');
      preview.classList.remove('d-none');
    }

    function removeFileEdit() {
      const preview = document.getElementById('preview-edit');
      preview.classList.add('d-none');
      document.getElementById('imageUpload-edit').value = "";
    }
    





   