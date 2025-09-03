const productsSchema = require('../models/productsSchema');
const productTypesSchema = require('../models/productTypesSchema');
const wishlistSchema = require('../models/wishlistSchema');
const usersSchema = require('../models/usersSchema');
const offersSchema = require('../models/offersSchema');
const reviewSchema = require('../models/reviewSchema');
const stockHoldSchema = require('../models/stockHoldSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');

const getUserProducts = async (req, res, next) => {
  try {

        const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });


    const userId = usersData._id;
    let stockHoldData = await stockHoldSchema.findOne({ userId: userId });
    
    if (stockHoldData?.items?.length) {
    for (const product of stockHoldData.items) {
      const productId = product.productId;
      const color = product.color;
      const size = product.size;
      const quantity = product.quantity;
  
      await productsSchema.findOneAndUpdate(
        {
          _id: productId,
          variants: {
            $elemMatch: {
              color: color,
              size: size,
            },
          },
        },
        {
          $inc: { "variants.$.stockQuantity": quantity },
        },
        { new: true }
      );
  
    }
    }
  
    await stockHoldSchema.updateOne(
      { userId: userId },
      { $set: { items: [] } }
    );

    

    const productsList = await productsSchema.find();
    const currentDate = new Date();

    await Promise.all(
      productsList.map(async (product) => {
        const activeFrom = new Date(product.startDate);
        const expireTo = new Date(product.endDate);

        const dateCheck = currentDate >= activeFrom && currentDate <= expireTo;

        const salePrice = (product.discountPercentage > 0 && dateCheck)
          ? Math.ceil(product.regularPrice - ((product.regularPrice * product.discountPercentage) / 100))
          : product.regularPrice;

        await productsSchema.findByIdAndUpdate(product._id, { $set: { salePrice } });
      })
    );


    const wishlistProductIds = await wishlistSchema.find({ userId: usersData._id }).distinct('productId');
    const wishlistProductIdStrings = wishlistProductIds.map(id => id.toString());


    const categories = await productTypesSchema.find({ status: 'active' }).sort({ _id: 1 });


    const groupedData = await Promise.all(
      categories.map(async (cat) => {
        const pageKey = `page_${cat._id}`;
        const currentPage = Math.max(parseInt(req.query[pageKey]) || 1, 1);
        const limit = 6;
        const skip = (currentPage - 1) * limit;

        const [products, totalProducts] = await Promise.all([
          productsSchema.find({ isActive: true, category: cat.name }).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
          productsSchema.countDocuments({ isActive: true, category: cat.name }),
        ]);

        return {
          _id: cat._id,
          name: cat.name,
          products: products.map(p => ({
            ...p,
            isWishlisted: wishlistProductIdStrings.includes(p._id.toString())
          })),
          totalPages: Math.ceil(totalProducts / limit),
          currentPage
        };
      })
    );

    // All tab pagination
    const allPageKey = `page_all`;
    const allCurrentPage = Math.max(parseInt(req.query[allPageKey]) || 1, 1);
    const allLimit = 6;
    const allSkip = (allCurrentPage - 1) * allLimit;

    const [allProducts, allTotalProducts] = await Promise.all([
      productsSchema.find({ isActive: true }).sort({ updatedAt: -1 }).skip(allSkip).limit(allLimit).lean(),
      productsSchema.countDocuments({ isActive: true })
    ]);

    const allTab = {
      _id: 'all',
      name: 'All',
      products: allProducts.map(p => ({
        ...p,
        isWishlisted: wishlistProductIdStrings.includes(p._id.toString())
      })),
      totalPages: Math.ceil(allTotalProducts / allLimit),
      currentPage: allCurrentPage
    };

    const finalData = [allTab, ...groupedData];

    // Filters and reviews
    const [productMaterial, productBrand, reviewSummary] = await Promise.all([
      productsSchema.distinct('material').then(arr => arr.sort()),
      productsSchema.distinct('brandName').then(arr => arr.sort()),
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

    res.render('allproducts', {
      groupedData: finalData,
      productMaterial,
      productBrand,
      reviewSummary
    });

  } catch (error) {
    errorLogger.error('Failed to get user products', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'userproducts',
      action: 'getUserProducts'
    });
    next(error);
  }
};



const filterUserProducts = async (req, res, next) => {
  try {
    const { brandFilter, filtermaterial, price, searchItem, ...pages } = req.query;

    const filter = { isActive: true };

    const brands = [].concat(brandFilter || []);
    const materials = [].concat(filtermaterial || []);

    if (brands.length > 0) {
      filter.brandName = { $in: brands };
    }
    if (materials.length > 0) {
      filter.material = { $in: materials };
    }

    if (searchItem?.trim()) {
      filter.productName = { $regex: searchItem.trim(), $options: "i" };
    }


    let sortOption = {};
    if (price === 'dessending') sortOption.salePrice = -1;
    else if (price === 'assending') sortOption.salePrice = 1;
    else sortOption.updatedAt = -1; 

    const limit = 6;

    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });

    const wishlistProductIds = usersData
      ? await wishlistSchema.find({ userId: usersData._id }).distinct('productId')
      : [];
    const wishlistProductIdStrings = wishlistProductIds.map(id => id.toString());


    const [categories, allProducts] = await Promise.all([
      productTypesSchema.find({ status: 'active' }).sort({ _id: 1 }),
      productsSchema.find(filter).sort(sortOption).lean()
    ]);


    const updatedProducts = allProducts.map(product => ({
      ...product,
      isWishlisted: wishlistProductIdStrings.includes(product._id.toString())
    }));

    const groupedData = categories.map(cat => {
      const catProducts = updatedProducts.filter(p => p.category === cat.name);
      const catPage = Math.max(parseInt(pages[`page_${cat._id}`]) || 1, 1);
      const start = (catPage - 1) * limit;
      const paginated = catProducts.slice(start, start + limit);
      const totalPages = Math.ceil(catProducts.length / limit);

      return {
        _id: cat._id,
        name: cat.name,
        products: paginated,
        currentPage: catPage,
        totalPages,
      };
    });


    const allPage = Math.max(parseInt(pages.page_all) || 1, 1);
    const allStart = (allPage - 1) * limit;
    const allPaginated = updatedProducts.slice(allStart, allStart + limit);
    const allTotalPages = Math.ceil(updatedProducts.length / limit);

    const allProductsTab = {
      _id: 'all',
      name: 'All',
      products: allPaginated,
      currentPage: allPage,
      totalPages: allTotalPages,
    };

    const finalData = [allProductsTab, ...groupedData];

    const [productMaterial, productBrand, reviewSummary] = await Promise.all([
      productsSchema.distinct('material').then(arr => arr.sort()),
      productsSchema.distinct('brandName').then(arr => arr.sort()),
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


    const queryObj = { ...req.query };
    Object.keys(queryObj).forEach(k => {
      if (k.startsWith("page_") || k === "page") delete queryObj[k];
    });
    const queryParams = new URLSearchParams(queryObj).toString();

    res.render('allproducts', {
      groupedData: finalData,
      productMaterial,
      productBrand,
      reviewSummary,
      queryParams,
      query: searchItem || '' 
    });

  } catch (error) {
    errorLogger.error('Failed to filter/search user products', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'userproducts',
      action: 'filterAndSearchUserProducts'
    });
    next(error);
  }
};



const searchUserProducts = async (req, res, next) => {

  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 6;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.searchItem?.trim() || '';

    const filter = { isActive: true };

    if (searchQuery) {
      filter.productName = { $regex: searchQuery, $options: 'i' };
    }

    const [totalProducts, categories, products] = await Promise.all([
      productsSchema.countDocuments(filter),
      productTypesSchema.find({ status: 'active' }).sort({ _id: 1 }),
      productsSchema.find(filter).sort({ updatedAt: -1 }).skip(skip)
        .limit(limit).lean()
    ]);

    const totalPages = Math.ceil(totalProducts / limit);
    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });

    // Fetch user's wishlist product IDs
    const wishlistProductIds = await wishlistSchema.find({ userId: usersData._id }).distinct('productId');
    const wishlistProductIdStrings = wishlistProductIds.map(id => id.toString());

    // Mark wishlisted products
    const updatedProducts = products.map(product => ({
      ...product,
      isWishlisted: wishlistProductIdStrings.includes(product._id.toString())
    }));


    const allProductsTab = {
      _id: 'all',
      name: 'All',
      products: updatedProducts,
    };

    const finalData = [allProductsTab];

    const [productMaterial, productBrand, reviewSummary] = await Promise.all([
      (productsSchema.distinct('material')).sort(),
      (productsSchema.distinct('brandName')).sort(),
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

    res.render('allproducts', {
      groupedData: finalData,
      currentPage: page,
      totalPages,
      productMaterial,
      productBrand,
      query: searchQuery,
      reviewSummary
    });

  } catch (error) {
    errorLogger.error('Failed to search user products', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'userproducts',
      action: 'searchUserProducts'
    });
    next(error);
  }
}


module.exports = { getUserProducts, filterUserProducts, searchUserProducts };
