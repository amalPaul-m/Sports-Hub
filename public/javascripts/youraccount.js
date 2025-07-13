window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  if (success === '1' || success === '2') {
    Swal.fire({
      title: success === '1' ? 'Password Changed' : 'Invalid password',
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
    }).then(() => window.location.href = "/youraccount");
  }
});

