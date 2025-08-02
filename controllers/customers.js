const usersSchema = require('../models/usersSchema');
const ordersSchema = require('../models/ordersSchema');


const getCustomers = async (req, res, next) => {

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const query = req.query.q ? req.query.q.trim() : '';

    // Filter
    const filter = query
      ? {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { status: { $regex: query, $options: 'i' } },
        ],
      }
      : {};

    // Query data
      const [totalUsers, users] = await Promise.all([
        await usersSchema.countDocuments(filter),
        await usersSchema
        .find(filter)
        .sort({ _id: -1 }) 
        .skip(skip)
        .limit(limit)
      ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.render('customers', {
      users,
      currentPage: page,
      totalPages,
      query
    });
  } catch (err) {
    err.message = 'Error fetching customers';
    next(err);
  }
};



const unblockCustomers = async function (req, res, next) {
  try {
    const userId = req.params.id;

    // status set to active
    await usersSchema.findByIdAndUpdate(userId,{status: 'active'});

    // Redirect back to the customers page
    res.redirect('/customers');
  } catch (err) {
    err.message = 'Error unblock user';
    next(err);
  }
};



const blockCustomers = async function (req, res, next) {
  try {
    const userId = req.params.id;

    // status set to active
    await usersSchema.findByIdAndUpdate(userId, {status: 'blocked'});

    // Redirect back to the customers page
    res.redirect('/customers');
  } catch (err) {
    err.message = 'Error block user';
    next(err);
  }
};



const searchCustomers = async (req, res, next) => {
  try {
    const query = req.query.q?.trim() || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const filter = query
      ? {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      : {};

    const totalUsers = await usersSchema.countDocuments(filter);

    const users = await usersSchema
      .find(filter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalUsers / limit);

    res.render('customers', {
      users,
      query,
      currentPage: page,
      totalPages
    });
    
  } catch (err) {
    err.message = 'Error searching customers';
    next(err);
  }
};


module.exports = {getCustomers, unblockCustomers, blockCustomers, searchCustomers}