function password_show_hide() {
  var x = document.getElementById("floatingPassword_signup");
  var show_eye = document.getElementById("show_eye");
  var hide_eye = document.getElementById("hide_eye");
  hide_eye.classList.remove("d-none");
  if (x.type === "password") {
    x.type = "text";
    show_eye.style.display = "none";
    hide_eye.style.display = "block";
  } else {
    x.type = "password";
    show_eye.style.display = "block";
    hide_eye.style.display = "none";
    
  }
}

function password_show_hide_confirm() {
  var y = document.getElementById("floatingPasswordConfirm_signup");
  var show_eye_confirm = document.getElementById("show_eye_confirm");
  var hide_eye_confirm = document.getElementById("hide_eye_confirm");
  hide_eye_confirm.classList.remove("d-none");
  if (y.type === "password") {
    y.type = "text";
    show_eye_confirm.style.display = "none";
    hide_eye_confirm.style.display = "block";
  } else {
    y.type = "password";
    show_eye_confirm.style.display = "block";
    hide_eye_confirm.style.display = "none";
    
  }
}


   document.addEventListener("DOMContentLoaded", () => {
    const toastLiveExample = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastLiveExample, { delay: 10000 }); 
    toast.show();
});


    const nameInput = document.getElementById('floatingText_signup');
    const emailInput = document.getElementById('floatingInput_signup');
    const phoneInput = document.getElementById('floatingPhone_signup');
    const passwordInput = document.getElementById('floatingPassword_signup');
    const confirmPasswordInput = document.getElementById('floatingPasswordConfirm_signup');
    const submitBtn = document.getElementById('logIn');

    const nameError = document.getElementById('nameValidationMsg');
    const emailError = document.getElementById('emailValidationMsg');
    const phoneError = document.getElementById('phoneValidationMsg');
    const passwordError = document.getElementById('passwordValidationMsg');
    const confirmPasswordError = document.getElementById('conPasswordValidationMsg');

    function validateForm() {
      let valid = true;

      const nameValue = nameInput.value.trim();
      const onlyLetters = /^[A-Za-z\s]+$/;

      if (nameValue === '') {
        nameError.textContent = 'Name is required.';
        valid = false;
      } else if (!onlyLetters.test(nameValue)) {
        nameError.textContent = 'Only letters and spaces are allowed.';
        valid = false;
      } else if (nameValue.length < 4) {
        nameError.textContent = 'Name must be at least 4 characters.';
        valid = false;
      } else {
        nameError.textContent = '';
      }

      if (!emailInput.value.includes('@') || !emailInput.value.includes('.')) {
        emailError.textContent = 'Enter a valid email.';
        valid = false;
      } else {
        emailError.textContent = '';
      }

      const phonePattern = /^\d{10}$/;
      if (!phonePattern.test(phoneInput.value)) {
        phoneError.textContent = 'Phone must be 10 digits.';
        valid = false;
      } else {
        phoneError.textContent = '';
      }

      if (passwordInput.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters.';
        valid = false;
      } else {
        passwordError.textContent = '';
      }

      if (confirmPasswordInput.value !== passwordInput.value || confirmPasswordInput.value === '') {
        confirmPasswordError.textContent = 'Passwords do not match.';
        valid = false;
      } else {
        confirmPasswordError.textContent = '';
      }

      submitBtn.disabled = !valid;
    }

    nameInput.addEventListener('input', validateForm);
    emailInput.addEventListener('input', validateForm);
    phoneInput.addEventListener('input', validateForm);
    passwordInput.addEventListener('input', validateForm);
    confirmPasswordInput.addEventListener('input', validateForm);

    document.getElementById('registerForm').addEventListener('submit', function(e) {
      e.preventDefault();

    });


