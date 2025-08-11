const usersSchema = require('../models/usersSchema');
const ordersSchema = require('../models/ordersSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');


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
        usersSchema.countDocuments(filter),
        usersSchema
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
  } catch (error) {
    errorLogger.error('Error fetching customers', {
      message: error.message,
      stack: error.stack
    });
    next(error);
  }
};



const unblockCustomers = async function (req, res, next) {
  try {
    const userId = req.params.id;

    // status set to active
    await usersSchema.findByIdAndUpdate(userId,{status: 'active'});

    apiLogger.info('User unblocked successfully', {
      controller: 'customers',
      action: 'unblockCustomers',
      userId
    });

    // Redirect back to the customers page
    res.redirect('/customers');
  } catch (error) {
    errorLogger.error('Error unblocking user', {
      message: error.message,
      stack: error.stack
    });
    next(error);
  }
};



const blockCustomers = async function (req, res, next) {
  try {
    const userId = req.params.id;

    // status set to active
    await usersSchema.findByIdAndUpdate(userId, {status: 'blocked'});

    apiLogger.info('User blocked successfully', {
      controller: 'customers',
      action: 'blockCustomers',
      userId
    });

    // Redirect back to the customers page
    res.redirect('/customers');
  } catch (error) {
    errorLogger.error('Error blocking user', {
      message: error.message,
      stack: error.stack
    });
    next(error);
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
    
  } catch (error) {
    errorLogger.error('Error searching customers', {
      message: error.message,
      stack: error.stack
    });
    next(error);
  }
};


module.exports = {getCustomers, unblockCustomers, blockCustomers, searchCustomers}