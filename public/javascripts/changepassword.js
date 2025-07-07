
function password_show_hide() {
  const x = document.getElementById("floatingPassword_change");
  const show_eye = document.getElementById("show_eye");
  const hide_eye = document.getElementById("hide_eye");
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
  const y = document.getElementById("floatingPasswordConfirm_change");
  const show_eye_confirm = document.getElementById("show_eye_confirm");
  const hide_eye_confirm = document.getElementById("hide_eye_confirm");
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


function password_show_hide_old() {
  const y = document.getElementById("floatingPassword_old");
  const show_eye_change = document.getElementById("show_eye_change");
  const hide_eye_change = document.getElementById("hide_eye_change");
  hide_eye_change.classList.remove("d-none");
  if (y.type === "password") {
    y.type = "text";
    show_eye_change.style.display = "none";
    hide_eye_change.style.display = "block";
  } else {
    y.type = "password";
    show_eye_change.style.display = "block";
    hide_eye_change.style.display = "none";
    
  }
}

// function validatePhoneNumber() {

//     const phoneNumber = document.getElementById('floatingPhone_signup').value.trim();
//     const pattern = /^\d{10}$/;
//     const isValid = pattern.test(phoneNumber);
//     const logIn = document.getElementById('logIn');
//     if(isValid){
//       document.getElementById('phoneValidationMsg').textContent = '';
//       logIn.classList.remove("disabled");
//       return isValid;
//     }else{
//       document.getElementById('phoneValidationMsg').textContent = 'Please enter a valid mobile number';
//     }
    
    
// }

// function validateEmail() {

//     const emailid = document.getElementById('floatingInput_signup').value;
//     const logIn1 = document.getElementById('logIn');
//     if (!emailid.includes("@") || !emailid.includes(".")) {
//         document.getElementById('emailValidationMsg').textContent = 'Please enter a valid emailid';
//       }else{
//         document.getElementById('emailValidationMsg').textContent = '';
//         logIn1.classList.remove("disabled");
//       }
// }

// function validateInput() {
//     const emptyInput = document.getElementById('floatingText_signup').value;
//     const logIn2 = document.getElementById('logIn');
//     if (emptyInput.length===0) {
//         document.getElementById('nameValidationMsg').textContent = 'Please enter full name';
//       }else{
//         document.getElementById('nameValidationMsg').textContent = '';
//         logIn2.classList.remove("disabled");
//       }
// }

// function validatePassword() {
//     const passwordInput = document.getElementById('floatingPassword_signup').value;
//     const logIn3 = document.getElementById('logIn');
//     if (passwordInput.length<6) {
//         document.getElementById('passwordValidationMsg').textContent = 'Please enter 6 characters';
//       }else{
//         document.getElementById('passwordValidationMsg').textContent = '';
//         logIn3.classList.remove("disabled");
//       }
// }

// function validateConPassword() {
//     const passwordInput1 = document.getElementById('floatingPasswordConfirm_signup').value;
//     const passwordInput2 = document.getElementById('floatingPassword_signup').value;
//     const logIn4 = document.getElementById('logIn');
//     if (passwordInput1!==passwordInput2) {
//         document.getElementById('conPasswordValidationMsg').textContent = 'Password and confirm password is not same';
//       }else{
//         document.getElementById('conPasswordValidationMsg').textContent = '';
//         logIn4.classList.remove("disabled");
        
//       }
// }








    const passwordInput = document.getElementById('floatingPassword_change');
    const confirmPasswordInput = document.getElementById('floatingPasswordConfirm_change');
    const submitBtn = document.getElementById('logIn');


    const passwordError = document.getElementById('passwordValidationMsg');
    const confirmPasswordError = document.getElementById('conPasswordValidationMsg');

    function validateForm() {
      let valid = true;



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

    passwordInput.addEventListener('input', validateForm);
    confirmPasswordInput.addEventListener('input', validateForm);

    document.getElementById('registerForm').addEventListener('submit', function(e) {
      e.preventDefault();

    });