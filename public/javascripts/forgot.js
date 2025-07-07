


    const emailInput_forgot = document.getElementById('floatingEmail_forgot');
    const submitBtn_forgot = document.getElementById('forgot');
    const emailError_forgot = document.getElementById('emailValidationMsg_forgot');


    function validateForm_forgot() {
      let valid = true;

      if (!emailInput_forgot.value.includes('@') || !emailInput_forgot.value.includes('.')) {
        emailError_forgot.textContent = 'Enter a valid email.';
        valid = false;
      } else {
        emailError_forgot.textContent = '';
      }

      submitBtn_forgot.disabled = !valid;
    }

    
    emailInput_forgot.addEventListener('input', validateForm_forgot);

    document.getElementById('forgot_password').addEventListener('submit', function(e) {
      e.preventDefault();

    });