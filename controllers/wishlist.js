const mongoose = require('mongoose');
const wishlistSchema = require('../models/wishlistSchema');
const productsSchema = require('../models/productsSchema');
const usersSchema = require('../models/usersSchema');
const reviewSchema = require('../models/reviewSchema');

const getWishlist = async (req, res, next) => {
    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });


    const [wishlist, reviewSummary] = await Promise.all([
            wishlistSchema.findOne({ userId: usersData._id })
            .populate('productId').sort({ createdAt: -1 }),
            reviewSchema.aggregate([
            {
              $group: {
                _id: "$productId",
                avgRating: { $avg: "$rating" }
              }
            },
            {
              $project: {
                _id: 0,
                productId: { $toString: "$_id" }, 
                avgRating: { $round: ["$avgRating", 1] }
              }
            }
          ])
        ]);

    res.render('wishlist', { wishlist, reviewSummary });
};

const toggleWishlist = async (req, res) => {
  const email = req.session.users?.email;
  const usersData = await usersSchema.findOne({ email });
  const userId = usersData._id;

  const productId = req.params?.productId;
  const productObjectId = new mongoose.Types.ObjectId(productId); 

  console.log('Product ID:', productObjectId);

  let wishlist = await wishlistSchema.findOne({ userId });

  if (!wishlist) {
    wishlist = new wishlistSchema({
      userId,
      productId: [productObjectId]
    });
  } else {
    wishlist.productId = wishlist.productId || [];

    const index = wishlist.productId.findIndex(id => id.equals(productObjectId));

    if (index > -1) {
      wishlist.productId.splice(index, 1); 
    } else {
      wishlist.productId.push(productObjectId); 
    }
  }

  await wishlist.save();
  res.json({ success: true });
};

module.exports = { getWishlist, toggleWishlist };
