window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const fail = params.get('blocked');
  if (fail === 'true') {
    Swal.fire({
      title: 'Sorry User!',
      text: 'Your account has been blocked, please contact to toll free : 111000011',
      icon: 'error',
      showConfirmButton: false,
      timer: 10000,
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title-failure',
        icon: 'swal-icon',
        confirmButton: 'swal-button'
      }
    }).then(() => window.location.href = "/login");
  }
});



function password_show_hide() {
  var x = document.getElementById("floatingPassword");
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