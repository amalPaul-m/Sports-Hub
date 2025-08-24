window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  if (success === '1' || success === '2') {
    Swal.fire({
      title: success === '1' ? 'Product Created!' : 'Product Updated!',
      text: 'Redirecting to product list...',
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        icon: 'swal-icon',
        confirmButton: 'swal-button'
      }
    }).then(() => window.location.href = "/products");
  }
});



// ------------Image Cropper  ------------


const imageInput = document.getElementById("imageUpload");
const thumbnailsContainer = document.getElementById("thumbnailsContainer");
const mainPreview = document.getElementById("mainPreview");
const uploadArea = document.getElementById("uploadArea");
const cropImage = document.getElementById("cropImage");
const saveCropBtn = document.getElementById("saveCropBtn");

let cropper;
let currentThumbImg = null;
let croppedFiles = [];
let uploadedImageCount = 0;

uploadArea.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", function () {
  const files = Array.from(this.files);

  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const thumbItem = document.createElement("div");
      thumbItem.className = "thumb-item";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = file.name;
      img.style.cursor = "pointer";

      img.addEventListener("click", () => {
        cropImage.src = e.target.result;
        mainPreview.src = e.target.result;
        currentThumbImg = img;

        const cropModalEl = document.getElementById('cropModal');
        const cropModal = new bootstrap.Modal(cropModalEl);

        function initCropperOnce() {
          if (cropper) cropper.destroy();
          cropper = new Cropper(cropImage, {
            aspectRatio: 1,
            viewMode: 1
          });

          document.getElementById('zoomRange').addEventListener('input', function () {
            cropper.zoomTo(parseFloat(this.value));
          });

          cropModalEl.removeEventListener('shown.bs.modal', initCropperOnce);
        }

        cropModalEl.addEventListener('shown.bs.modal', initCropperOnce);
        cropModal.show();
      });

      const fileName = document.createElement("span");
      fileName.className = "file-name d-block small text-center mt-1";
      fileName.textContent = file.name;

      const removeBtn = document.createElement("button");
      removeBtn.className = "btn btn-outline-dark btn-sm d-block mx-auto mt-1";
      removeBtn.innerHTML = "&times;";
      removeBtn.onclick = () => {
        thumbItem.remove();
        uploadedImageCount--;
        croppedFiles = croppedFiles.filter(f => f.name !== file.name);
      };

      thumbItem.appendChild(img);
      thumbItem.appendChild(fileName);
      thumbItem.appendChild(removeBtn);
      thumbnailsContainer.appendChild(thumbItem);

      if (index === 0) img.click();
    };
    reader.readAsDataURL(file);
  });
});

saveCropBtn.addEventListener('click', () => {
  if (cropper && currentThumbImg) {
    cropper.getCroppedCanvas({ width: 400, height: 400 }).toBlob(blob => {
      const fileName = currentThumbImg.alt || `cropped_${Date.now()}.png`;
      const croppedFile = new File([blob], fileName, { type: 'image/png' });

      croppedFiles = croppedFiles.filter(f => f.name !== fileName);
      croppedFiles.push(croppedFile);

      const reader = new FileReader();
      reader.onload = function (e) {
        mainPreview.src = e.target.result;
        currentThumbImg.src = e.target.result;
      };
      reader.readAsDataURL(croppedFile);

      cropper.destroy();
      cropper = null;

      const cropModalEl = document.getElementById('cropModal');
      const modalInstance = bootstrap.Modal.getInstance(cropModalEl);
      modalInstance.hide();
    }, 'image/png');
  }
});



// ------------ Submit Form with Cropped Images ------------
const form = document.getElementById('productForm');
const imageError = document.getElementById('imageError');

  const regularPriceInput = document.getElementById('regularPrice');
  const salePriceInput = document.getElementById('salePrice');
  const salePriceError = document.getElementById('salePriceError');

form.addEventListener('submit', async function (event) {
  event.preventDefault();




    const regularPrice = parseFloat(regularPriceInput.value);
  const salePrice = parseFloat(salePriceInput.value);

  // Reset custom error
  salePriceInput.classList.remove('is-invalid');
  salePriceError.textContent = 'Sale price required.';

  if (regularPrice < salePrice) {
    salePriceInput.classList.add('is-invalid');
    salePriceError.textContent = 'Sale price cannot be greater than regular price.';
    return;
  }





  if (!form.checkValidity() || croppedFiles.length < 4) {
    event.stopPropagation();
    imageError.style.display = croppedFiles.length < 4 ? 'block' : 'none';
    form.classList.add('was-validated');
    return;
  }

  const formData = new FormData(form);
  croppedFiles.forEach(file => {
    formData.append('images', file);
  });

  try {
    const res = await fetch('/products/add', {
      method: 'POST',
      body: formData
    });

    if (res.redirected) {
      window.location.href = res.url;
    } else {
      const text = await res.text();
      throw new Error(text);
    }
  } catch (err) {
    console.error("Upload error:", err);
    Swal.fire("Error", "Upload failed", "error");
  }
});




//add varient 


let variantCount = 0;

  function addVariant() {
    const container = document.getElementById('variantContainer');

    const variantDiv = document.createElement('div');
    variantDiv.className = 'variant-block';
    variantDiv.innerHTML = `
      <button type="button" class=" btn btn-none remove-btn fs-3 float-end mt-3" onclick="this.parentElement.remove()">×</button>
      <div class="row mt-3 ms-0">
              <div class="col-md-5 mb-3">
                <label class="form-label">Size</label>
                <input type="text" class="form-control shadow-none" name="variantSize_${variantCount}" required
                  placeholder="Enter product size">
                <div class="invalid-feedback">Size is required.</div>
              </div>
              <div class="col-md-5 mb-3">
                <label class="form-label">Stock Quantity</label>
                <input type="number" class="form-control shadow-none" name="variantStock_${variantCount}" required min="1"
                  placeholder="Stock quantity">
                <div class="invalid-feedback">Enter valid stock quantity.</div>
              </div>  
            <div class="col-md-2 mb-3">
            <label for="exampleColorInput" class="form-label">Color</label>
            <input type="color" class="form-control form-control-color shadow-none" id="exampleColorInput" name="variantColor_${variantCount}" value="#563d7c" title="Choose your color">
            </div>
        </div>
     `;
    container.appendChild(variantDiv);
    variantCount++;
  }





//toggle bar


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




  // const regularPriceInput = document.getElementById('regularPrice');
  // const salePriceInput = document.getElementById('salePrice');
  // const salePriceError = document.getElementById('salePriceError');

  // form.addEventListener('submit', function (e) {
  //   const regularPrice = parseFloat(regularPriceInput.value);
  //   const salePrice = parseFloat(salePriceInput.value);

  //   // Reset custom error
  //   salePriceInput.classList.remove('is-invalid');
  //   salePriceError.textContent = 'Sale price required.';

  //   if (regularPrice < salePrice) {
  //     e.preventDefault();
  //     salePriceInput.classList.add('is-invalid');
  //     salePriceError.textContent = 'Sale price cannot be greater than regular price.';
  //   } else {
  //     form.classList.add('was-validated');
  //   }
  // });