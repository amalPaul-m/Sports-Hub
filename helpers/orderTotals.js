const calculateNetOrderTotal = (order) => {
  let orderTotal = 0;

  for (const product of order.productInfo) {
    if (product.status === 'confirmed') {
      orderTotal += product.price * product.quantity;
    }
  }

  const discount = order.couponInfo?.[0]?.discountAmount || 0;
  return orderTotal - discount;
}

module.exports = { calculateNetOrderTotal };
