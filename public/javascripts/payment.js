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
                
                window.location.href = '/checkout/payment-cancelled';
            }
        }
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
};