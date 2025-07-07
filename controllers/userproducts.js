const productsSchema = require('../models/productsSchema')
const productTypesSchema = require('../models/productTypesSchema')

const getUserProducts = async function (req, res, next) {
  try {

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
      .limit(limit);

    // Group by category
    const groupedData = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      products: products.filter(p => p.category === cat.name),
    }));

    // All tab
    const allProductsTab = {
      _id: 'all',
      name: 'All',
      products: products, // already paginated
    };

    const finalData = [allProductsTab, ...groupedData];

    // fiter gets
    const productMaterial = (await productsSchema.distinct('material')).sort();
    const productBrand = (await productsSchema.distinct('brandName')).sort();

    res.render('allproducts', {
      cssFile: '/stylesheets/listAllProducts.css',
      jsFile: '/javascripts/listAllProducts.js',
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
      .limit(limit);

    const groupedData = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      products: products.filter(p => p.category === cat.name),
    }));

    const allProductsTab = {
      _id: 'all',
      name: 'All',
      products: products,
    };

    const finalData = [allProductsTab, ...groupedData];

        // fiter gets
    const productMaterial = (await productsSchema.distinct('material')).sort();
    const productBrand = (await productsSchema.distinct('brandName')).sort();

    res.render('allproducts', {
      cssFile: '/stylesheets/listAllProducts.css',
      jsFile: '/javascripts/listAllProducts.js',
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
      .limit(limit);

    const allProductsTab = {
      _id: 'all',
      name: 'All',
      products: products,
    };

    const finalData = [allProductsTab];

    const productMaterial = (await productsSchema.distinct('material')).sort();
    const productBrand = (await productsSchema.distinct('brandName')).sort();

    res.render('allproducts', {
      cssFile: '/stylesheets/listAllProducts.css',
      jsFile: '/javascripts/listAllProducts.js',
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
