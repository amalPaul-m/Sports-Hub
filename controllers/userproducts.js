const productsSchema = require('../models/productsSchema')
const productTypesSchema = require('../models/productTypesSchema')
const wishlistSchema = require('../models/wishlistSchema')
const usersSchema = require('../models/usersSchema');
const offersSchema = require('../models/offersSchema');

const getUserProducts = async function (req, res, next) {
  try {

    //Active offers Checking

    const productsList = await productsSchema.find();

    for(const product of productsList) {

      if(product.discountPercentage>0) {
      const currentDate = new Date();
      const activeFrom = new Date(product.startDate);
      const expireTo = new Date(product.endDate);

      const dateCheck = currentDate >= activeFrom && currentDate <= expireTo;
console.log(dateCheck)
      if(dateCheck){
        const offerAmount = Math.ceil(product.regularPrice - ((product.regularPrice * product.
        discountPercentage)/100));

        await productsSchema.findByIdAndUpdate({_id: product._id},
          {$set: {salePrice: offerAmount}}
        );
      }else{
        await productsSchema.findByIdAndUpdate({_id: product._id},
          {$set: {salePrice: product.regularPrice}}
        );
      }

    }else {
        await productsSchema.findByIdAndUpdate({_id: product._id},
          {$set: {salePrice: product.regularPrice}}
        );
    }
    }


    // Pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 6;
    const skip = (page - 1) * limit;

    const totalProducts = await productsSchema.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalProducts / limit);

    // Fetch active categories
    const categories = await productTypesSchema
      .find({ status: 'active' })
      .sort({ _id: 1 });

    // Fetch paginated products
    const products = await productsSchema
      .find({ isActive: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

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
          


    // Group by category
    const groupedData = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      products: updatedProducts.filter(p => p.category === cat.name),
    }));

    // All tab
    const allProductsTab = {
      _id: 'all',
      name: 'All',
      products: updatedProducts // already paginated
    };

    const finalData = [allProductsTab, ...groupedData];

    // fiter gets
    const productMaterial = (await productsSchema.distinct('material')).sort();
    const productBrand = (await productsSchema.distinct('brandName')).sort();



  
    res.render('allproducts', {
      groupedData: finalData,
      currentPage: page,
      totalPages,
      productMaterial,
      productBrand
    });

  } catch (err) {
    console.error('Product loading error:', err);
    err.message = 'Cannot access category or products';
    next(err);
  }
};



const filterUserProducts = async function (req, res, next) {
  try {

    const { brandFilter, filtermaterial, price } = req.query;

    const brands = [].concat(brandFilter || []);
    const materials = [].concat(filtermaterial || []);

    const filter = { isActive: true };

    if (brands.length > 0) {
      filter.brandName = { $in: brands };
    }

    if (materials.length > 0) {
      filter.material = { $in: materials };
    }

    let sortOption = {};
    if (price === 'dessending') sortOption.salePrice = -1;
    else if (price === 'assending') sortOption.salePrice = 1;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 6;
    const skip = (page - 1) * limit;

    const totalProducts = await productsSchema.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    const categories = await productTypesSchema
      .find({ status: 'active' })
      .sort({ _id: 1 });

    const products = await productsSchema
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

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

    const groupedData = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      products: updatedProducts.filter(p => p.category === cat.name),
    }));

    const allProductsTab = {
      _id: 'all',
      name: 'All',
      products: updatedProducts,
    };

    const finalData = [allProductsTab, ...groupedData];

        // fiter gets
    const productMaterial = (await productsSchema.distinct('material')).sort();
    const productBrand = (await productsSchema.distinct('brandName')).sort();

    res.render('allproducts', {
      groupedData: finalData,
      currentPage: page,
      totalPages,
      productMaterial,
      productBrand
    });

  } catch (err) {
    console.error('Product loading error:', err);
    err.message = 'Cannot access category or products';
    next(err);
  }
};


const searchUserProducts = async (req,res,next)=>{

 try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 6;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.searchItem?.trim() || '';

    const filter = { isActive: true };

    if (searchQuery) {
      filter.productName = { $regex: searchQuery, $options: 'i' };
    }

    const totalProducts = await productsSchema.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    const categories = await productTypesSchema.find({ status: 'active' }).sort({ _id: 1 });

    const products = await productsSchema
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();


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

    const productMaterial = (await productsSchema.distinct('material')).sort();
    const productBrand = (await productsSchema.distinct('brandName')).sort();

    res.render('allproducts', {
      groupedData: finalData,
      currentPage: page,
      totalPages,
      productMaterial,
      productBrand,
      query: searchQuery, 
    });

  } catch (err) {
    console.error('Product loading error:', err);
    err.message = 'Cannot access category or products';
    next(err);
  }
}


module.exports = { getUserProducts, filterUserProducts, searchUserProducts };
