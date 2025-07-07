document.addEventListener("DOMContentLoaded", function() {
    function OTPInput() {
        const inputs = document.querySelectorAll('#otp > input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('input', function() {
                if (this.value.length > 1) {
                    this.value = this.value[0]; //    
                }
                if (this.value !== '' && i < inputs.length - 1) {
                    inputs[i + 1].focus(); //   
                }
            });

            inputs[i].addEventListener('keydown', function(event) {
                if (event.key === 'Backspace') {
                    this.value = '';
                    if (i > 0) {
                        inputs[i - 1].focus();   
                    }
                }
            });
        }
    }

    OTPInput();

    const validateBtn = document.getElementById('validateBtn');
    validateBtn.addEventListener('click', function() {
        let otp = '';
        document.querySelectorAll('#otp > input').forEach(input => otp += input.value); 
    });
});





// If you want to use the OTPInput function, you can call it here


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('otpForm');

    form.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent default form submit

        const otp = [
            document.getElementById('first').value,
            document.getElementById('second').value,
            document.getElementById('third').value,
            document.getElementById('fourth').value,
            document.getElementById('fifth').value,
            document.getElementById('sixth').value
        ].join('');

        if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            return Swal.fire('Error', 'Please enter a 6-digit OTP', 'warning');
        }

        try {
            const path1 = window.location.pathname;

            const endpoint1 = path1.includes('/forgot') ? '/forgot/verifyOtp' : '/verifyOtp';

            const response = await fetch(endpoint1, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    title: 'OTP Verified!',
                    text: 'Your OTP was successfully verified!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    customClass: {
                        popup: 'swal-popup',
                        title: 'swal-title',
                        icon: 'swal-icon',
                        confirmButton: 'swal-button'
                    }
                }).then(() => {
                    window.location.href = result.redirectUrl;
                });
            } else {
                Swal.fire({
                    title: result.message || 'Invalid OTP',
                    text: 'Please try again',
                    icon: 'failure',
                    showConfirmButton: false,
                    timer: 2000,
                    customClass: {
                        popup: 'swal-popup',
                        title: 'swal-title-failure',
                        icon: 'swal-icon',
                        confirmButton: 'swal-button'
                    }
                })
            }

        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: 'Something went wrong',
                icon: 'error',
                showConfirmButton: false,
                timer: 2000,
                customClass: {
                    popup: 'swal-popup',
                    title: 'swal-title-failure',
                    icon: 'swal-icon',
                    confirmButton: 'swal-button'
                }
            })
        }
    });
});



    // resend otp

let countdown = 60;
let timer;

// Reusable countdown starter
function startCountdown() {
    clearInterval(timer);
    countdown = 10;

    // Disable button during countdown
    document.getElementById('resendOtpBtn').style.pointerEvents = 'none';
    document.getElementById('resendOtpBtn').style.opacity = '0.8';

    timer = setInterval(() => {
        countdown--;

        let minutes = Math.floor(countdown / 60);
        let seconds = countdown % 60;

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        document.getElementById('resendTimer').textContent = `Resend OTP in ${minutes}:${seconds}`;

        if (countdown <= 0) {
            clearInterval(timer);
            document.getElementById('resendOtpBtn').style.pointerEvents = 'auto';
            document.getElementById('resendOtpBtn').style.display = 'block'; // Show button
            document.getElementById('resendTimer').textContent = '';
        }
    }, 1000);
}

// Start countdown on page load
window.addEventListener('load', () => {
    startCountdown(); // ← Start timer immediately on load
});

document.getElementById('resendOtpBtn').addEventListener('click', function (e) {
    e.preventDefault();

    const path = window.location.pathname;

    const endpoint = path.includes('/forgot') ? '/forgot/resendOtp' : '/verifyOtp/resendOtp';

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: document.getElementById("emailHidden").value })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    title: 'OTP Send!',
                    text: 'check your email for the new OTP',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    customClass: {
                        popup: 'swal-popup',
                        title: 'swal-title',
                        icon: 'swal-icon',
                        confirmButton: 'swal-button'
                    }
                })
                startCountdown(); // ← Restart countdown after successful resend
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Could not send OTP try again',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 2000,
                    customClass: {
                        popup: 'swal-popup',
                        title: 'swal-title-failure',
                        icon: 'swal-icon',
                        confirmButton: 'swal-button'
                    }
                })
                document.getElementById('resendOtpBtn').style.pointerEvents = 'auto';
                document.getElementById('resendOtpBtn').style.opacity = '1';
                document.getElementById('resendOtpBtn').style.display = 'block'; // Show button again
            }
        })
        .catch(() => {
            Swal.fire({
                title: 'Server Error',
                text: 'Try again later',
                icon: 'error',
                showConfirmButton: false,
                timer: 2000,
                customClass: {
                    popup: 'swal-popup',
                    title: 'swal-title-failure',
                    icon: 'swal-icon',
                    confirmButton: 'swal-button'
                }
            })
            document.getElementById('resendOtpBtn').style.pointerEvents = 'auto';
            document.getElementById('resendOtpBtn').style.opacity = '1';
            document.getElementById('resendOtpBtn').style.display = 'block'; // Show button again
        });
});

