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


//   document.addEventListener("DOMContentLoaded", () => {

//     document.querySelectorAll(".modal").forEach(modal => {
//       const stars = modal.querySelectorAll(".star");
//       const ratingInput = modal.querySelector(".rating-input");
//       const ratingValue = modal.querySelector(".rating-value");
//       let selectedRating = ratingValue?.value ? parseInt(ratingValue.value) : 3;

//       function updateStars(rating) {
//         stars.forEach(star => {
//           const value = parseInt(star.getAttribute("data-value"));
//           if (value <= rating) {
//             star.classList.add("selected");
//           } else {
//             star.classList.remove("selected");
//           }
//         });
//         if (ratingInput) ratingInput.value = rating;
//       }

//       stars.forEach(star => {
//         star.addEventListener("click", () => {
//           selectedRating = parseInt(star.getAttribute("data-value"));
//           updateStars(selectedRating);
//         });
//       });

//       updateStars(selectedRating);
//     });
//   });


// document.querySelectorAll('.imageUpload').forEach((input, i) => {
//   const previewContainer = document.querySelectorAll('.previewContainer')[i];

//   input.addEventListener('change', function () {
//     previewContainer.innerHTML = ''; // Clear previous previews

//     Array.from(this.files).forEach((file, index) => {
//       const reader = new FileReader();

//       reader.onload = function (e) {
//         const previewWrapper = document.createElement('div');
//         previewWrapper.classList.add('position-relative', 'me-2');

//         const img = document.createElement('img');
//         img.src = e.target.result;
//         img.classList.add('img-thumbnail');
//         img.style.maxHeight = '100px';

//         const removeBtn = document.createElement('button');
//         removeBtn.type = 'button';
//         removeBtn.innerHTML = '&times;';
//         removeBtn.classList.add('btn', 'btn-sm', 'btn-outline-dark', 'position-absolute');
//         removeBtn.style.top = '0';
//         removeBtn.style.right = '0';

//         removeBtn.addEventListener('click', () => {
//           previewWrapper.remove();
//           removeFileFromInput(input, index); // Pass the specific input
//         });

//         previewWrapper.appendChild(img);
//         previewWrapper.appendChild(removeBtn);
//         previewContainer.appendChild(previewWrapper);
//       };

//       reader.readAsDataURL(file);
//     });
//   });
// });

// // Workaround to remove file from input
// function removeFileFromInput(inputElement, indexToRemove) {
//   const dataTransfer = new DataTransfer();
//   Array.from(inputElement.files).forEach((file, index) => {
//     if (index !== indexToRemove) {
//       dataTransfer.items.add(file);
//     }
//   });
//   inputElement.files = dataTransfer.files;
// }


document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".edit-review-form").forEach(form => {
    const modal = form.closest(".modal");

    // ⭐ Initialize rating stars
    const stars = modal.querySelectorAll(".star");
    const ratingInput = modal.querySelector(".rating-input");
    const ratingValue = modal.querySelector(".rating-value");
    let selectedRating = ratingValue?.value ? parseInt(ratingValue.value) : 3;

    function updateStars(rating) {
      stars.forEach(star => {
        const value = parseInt(star.dataset.value);
        star.classList.toggle("selected", value <= rating);
      });
      ratingInput.value = rating;
    }

    stars.forEach(star => {
      star.addEventListener("click", () => {
        selectedRating = parseInt(star.dataset.value);
        updateStars(selectedRating);
      });
    });

    updateStars(selectedRating);

    // 🖼 Handle new file upload preview
    const imageUpload = modal.querySelector(".imageUpload");
    const previewContainer = modal.querySelector(".previewContainer");

    if (imageUpload && previewContainer) {
      imageUpload.addEventListener("change", function () {
        Array.from(this.files).forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = function (e) {
            const previewWrapper = document.createElement('div');
            previewWrapper.classList.add('position-relative');
            previewWrapper.dataset.index = index;

            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('img-thumbnail');
            img.style.maxHeight = '100px';

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.innerHTML = '&times;';
            removeBtn.classList.add('btn', 'btn-sm', 'btn-outline-dark', 'position-absolute');
            removeBtn.style.top = '0';
            removeBtn.style.right = '0';

            removeBtn.addEventListener('click', () => {
              previewWrapper.remove();
              removeFileFromInput(imageUpload, index);
            });

            previewWrapper.appendChild(img);
            previewWrapper.appendChild(removeBtn);
            previewContainer.appendChild(previewWrapper);
          };
          reader.readAsDataURL(file);
        });
      });
    }

    // 🗑 Handle removing existing images
    const removedImagesInput = modal.querySelector(".removed-images-input");
    const existingImages = modal.querySelectorAll(".existing-image");

    existingImages.forEach(wrapper => {
      const removeBtn = wrapper.querySelector(".remove-existing");
      removeBtn.addEventListener("click", () => {
        const filename = wrapper.dataset.filename;
        wrapper.remove();
        // Track removed image
        const removed = removedImagesInput.value ? removedImagesInput.value.split(",") : [];
        removed.push(filename);
        removedImagesInput.value = removed.join(",");
      });
    });

    // Remove file from input
    function removeFileFromInput(inputElement, indexToRemove) {
      const dataTransfer = new DataTransfer();
      Array.from(inputElement.files).forEach((file, index) => {
        if (index !== indexToRemove) {
          dataTransfer.items.add(file);
        }
      });
      inputElement.files = dataTransfer.files;
    }
  });
});




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


  document.addEventListener('DOMContentLoaded', function () {
    const radios = document.querySelectorAll('.reason-radio');

    radios.forEach(radio => {
      radio.addEventListener('change', function () {
        const textareaId = this.dataset.textareaId;
        const showTextarea = this.dataset.showTextarea === 'true';
        const textarea = document.getElementById(textareaId);

        if (textarea) {
          const allRelated = document.querySelectorAll(`#${textareaId}`);
          allRelated.forEach(t => t.style.display = 'none');

          if (showTextarea) {
            textarea.style.display = 'block';
          }
        }
      });
    });
  });



  document.addEventListener('DOMContentLoaded', function () {
    const allRadios = document.querySelectorAll('.reason-radio-cancel');

    allRadios.forEach(radio => {
      radio.addEventListener('change', function () {
        const textareaId = this.dataset.textareaId;
        const showTextarea = this.dataset.showTextarea === 'true';

        const textarea = document.getElementById(textareaId);
        if (!textarea) return;

        document.querySelectorAll(`#${textareaId}`).forEach(el => el.style.display = 'none');

        if (showTextarea) {
          textarea.style.display = 'block';
        }
      });
    });
  });



  document.getElementById('rzp-button-failed').onclick = async function () {
    const order_Id = this.getAttribute('data-order-id');
    const orderNumber = this.getAttribute('data-order-number');
    const response = await fetch('/checkout/retry-razorpay-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ orderId: order_Id })
    });
    const data = await response.json();
    
    const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: "INR",
        name: "Sports Hub",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async function (response) {
            window.location.href = `/checkout/razorpay-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&orderId=${orderNumber}`;
        },
        modal: {
            ondismiss: function () {
                
                window.location.href = '/checkout/payment-cancelled?payment=retry';
            }
        }
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
};