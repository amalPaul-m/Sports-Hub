window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  if (success === '3') {
    Swal.fire({
      title: 'Order Cancelled',
      text: 'Your order cancelled...',
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        icon: 'swal-icon',
        confirmButton: 'swal-button'
      }
    }).then(() => window.location.href = "/youraccount/yourorders");
  }
});


 window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error === '2') {
      const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
      errorModal.show();

      setTimeout(() => {
        errorModal.hide();
      }, 2000);
    }
  });

   window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');

    if (success === '1') {
      const errorModal = new bootstrap.Modal(document.getElementById('successModal'));
      errorModal.show();

      setTimeout(() => {
        errorModal.hide();
      }, 2000);
    }
  });


  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('ratingInput');
  let selectedRating = 3; 

  function updateStars(rating) {
    stars.forEach(star => {
      const value = parseInt(star.getAttribute('data-value'));
      if (value <= rating) {
        ratingInput.value = value;
        star.classList.add('selected');
      } else {
        star.classList.remove('selected');
      }
    });
  }

  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.getAttribute('data-value'));
      updateStars(selectedRating);
    });
  });

  // Initialize default stars
  updateStars(selectedRating);


  const imageUpload = document.getElementById('imageUpload');
  const previewContainer = document.getElementById('previewContainer');

  imageUpload.addEventListener('change', function () {
    previewContainer.innerHTML = ''; // Clear previous previews

    Array.from(this.files).forEach((file, index) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        const previewWrapper = document.createElement('div');
        previewWrapper.classList.add('position-relative');

        const img = document.createElement('img');
        img.src = e.target.result;
        img.classList.add('img-thumbnail');
        img.style.maxHeight = '100px';

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;';
        removeBtn.classList.add('btn', 'btn-sm', 'btn-outline-dark', 'position-absolute');
        removeBtn.style.top = '0';
        removeBtn.style.right = '0';

        removeBtn.addEventListener('click', () => {
          previewWrapper.remove();
          removeFileFromInput(index);
        });

        previewWrapper.appendChild(img);
        previewWrapper.appendChild(removeBtn);
        previewContainer.appendChild(previewWrapper);
      };

      reader.readAsDataURL(file);
    });
  });

  // Workaround to remove file from input
  function removeFileFromInput(indexToRemove) {
    const dataTransfer = new DataTransfer();
    const files = Array.from(imageUpload.files);

    files.forEach((file, index) => {
      if (index !== indexToRemove) {
        dataTransfer.items.add(file);
      }
    });

    imageUpload.files = dataTransfer.files;
  }