const walletInput = document.getElementById('walletInput');
const quickAddButtons = document.querySelectorAll('.quick-add');

quickAddButtons.forEach(button => {
    button.addEventListener('click', () => {
        const amount = button.getAttribute('data-amount');
        walletInput.value = amount;
    });
});


document.getElementById('walletPayBtn').addEventListener('click', async () => {
    
    const walletAmount = document.getElementById('walletInput').value;
    if (!walletAmount || walletAmount <= 0) {
        document.getElementById('wallet-amount-error').innerText = "Please Enter an Amount"
        return;
    }

    const response = await fetch('/wallet/create-wallet-order', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ walletAmount })
    });

    const data = await response.json();

    const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: "INR",
        name: "SportsHub Wallet",
        description: "Add to Wallet",
        order_id: data.orderId,
        handler: function (response){
            window.location.href = `/wallet/payment-success?order_id=${response.razorpay_order_id}&payment_id=${response.razorpay_payment_id}&amount=${data.amount}`;
        },
        modal: {
        ondismiss: function () {
            Swal.fire({
            title: 'Recharge Failed!',
            icon: 'error',
            color: '#fff',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
                popup: 'glass-effect',
                icon: 'custom-error-icon'
            }
            })
         }
        },
        "theme": {
            "color": "#000"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
});


// Swal.fire({
//   title: "Drag me!",
//   icon: "success",
//   draggable: true
// });

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  if (success === '3') {
    Swal.fire({
    title: 'Recharge Successful!',
    icon: 'success',
    color: '#fff',
    timer: 2000,
    showConfirmButton: false,
    customClass: {
        popup: 'glass-effect',
        icon: 'custom-icon-color'
    }
    }).then(() => window.location.href = "/wallet");
  }
});
