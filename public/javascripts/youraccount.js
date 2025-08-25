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



// const shareLink = referalLink;
const shareLink = "https://sports-hub.shop/signup"

    document.getElementById('shareBtn').addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check this product!',
                    text: 'I found this product for you:',
                    url: shareLink
                });
                console.log('Shared successfully');
            } catch (err) {
                console.error('Share failed:', err.message);
            }
        } else {
            navigator.clipboard.writeText(shareLink);
            alert('Link copied to clipboard!');
        }
    });


    const copyBtn = document.getElementById("copyBtn");

    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(shareLink)
            .then(() => {
                copyBtn.innerHTML = `<i class="bi bi-clipboard2-check"></i> Copied!`;
                setTimeout(() => copyBtn.innerHTML = '<i class="bi bi-clipboard2"></i>', 2000);
            })
            .catch(err => console.error("Failed to copy:", err));
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