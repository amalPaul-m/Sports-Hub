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



document.getElementById('rzp-button').onclick = async function () {
    const response = await fetch('/checkout/create-razorpay-order', {
        method: 'POST'
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
            window.location.href = `/checkout/razorpay-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`;
        },
        modal: {
            ondismiss: function () {
                
                window.location.href = '/checkout/payment-cancelled?payment=first';
            }
        }
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
};



document.getElementById('walletPayBtn').addEventListener('click', function () {
    fetch('/checkout/wallet-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/checkout/success';
        } else {
            document.getElementById('walletError').textContent = data.message;
        }
    })
    .catch(err => console.error(err));
});




