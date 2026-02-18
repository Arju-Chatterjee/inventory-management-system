const Product = require('../models/Product');
const Sale = require('../models/Sale');
const { Parser } = require('json2csv');



/* =========================================================
   DASHBOARD (STOCK BASED)
========================================================= */
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();

    // Today
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Week (Monday start)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = (day === 0 ? 6 : day - 1);
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total products
    const totalProducts = await Product.countDocuments();

    // Low stock
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    }).select('name sku quantity minStockLevel');

    const lowStockCount = lowStockProducts.length;

    // Count dispatches today
    const salesToday = await Sale.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // Helper to calculate units
    const unitsSold = async (date) => {
      const result = await Sale.aggregate([
        { $match: { createdAt: { $gte: date } } },
        { $unwind: '$items' },
        { $group: { _id: null, total: { $sum: '$items.quantity' } } }
      ]);
      return result[0]?.total || 0;
    };

    const salesTodayUnits = await unitsSold(startOfToday);
    const salesThisWeekUnits = await unitsSold(startOfWeek);
    const salesThisMonthUnits = await unitsSold(startOfMonth);

    // Top moving products (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topSellingProducts = await Sale.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantitySold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        lowStockCount,
        lowStockProducts,
        salesToday,
        salesTodayUnits,
        salesThisWeekUnits,
        salesThisMonthUnits,
        topSellingProducts
      }
    });

  } catch (error) {
    next(error);
  }
};



/* =========================================================
   SALES REPORT (UNITS BASED)
========================================================= */
const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day', format = 'json' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // SUMMARY (count + units)
    const summary = await Sale.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalDispatches: { $addToSet: '$_id' },
          totalUnits: { $sum: '$items.quantity' }
        }
      }
    ]);

    const summaryData = {
      totalDispatches: summary[0]?.totalDispatches?.length || 0,
      totalUnits: summary[0]?.totalUnits || 0
    };

    // GROUPING
    let dateFormat;
    switch (groupBy) {
      case 'week':
        dateFormat = { $week: '$createdAt' };
        break;
      case 'month':
        dateFormat = { $month: '$createdAt' };
        break;
      default:
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const salesByPeriod = await Sale.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: dateFormat,
          dispatches: { $addToSet: '$_id' },
          units: { $sum: '$items.quantity' }
        }
      },
      {
        $project: {
          period: '$_id',
          dispatchCount: { $size: '$dispatches' },
          units: 1,
          _id: 0
        }
      },
      { $sort: { period: 1 } }
    ]);

    // CSV export
    if (format === 'csv') {
      const fields = ['period', 'dispatchCount', 'units'];
      const parser = new Parser({ fields });
      const csv = parser.parse(salesByPeriod);

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', `attachment; filename=dispatch_report_${startDate}_${endDate}.csv`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data: {
        summary: summaryData,
        salesByPeriod
      }
    });

  } catch (error) {
    next(error);
  }
};



/* =========================================================
   INVENTORY REPORT (NO PRICE)
========================================================= */
const getInventoryReport = async (req, res, next) => {
  try {
    const { format = 'json', category } = req.query;

    const query = category ? { category } : {};

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ 'category.name': 1, name: 1 });

    const summary = products.reduce((acc, product) => {
      return {
        totalProducts: acc.totalProducts + 1,
        totalUnits: acc.totalUnits + product.quantity,
        lowStockCount: acc.lowStockCount + (product.isLowStock ? 1 : 0)
      };
    }, { totalProducts: 0, totalUnits: 0, lowStockCount: 0 });

    const productsData = products.map(p => ({
      sku: p.sku,
      name: p.name,
      category: p.category?.name || '',
      quantity: p.quantity,
      isLowStock: p.isLowStock
    }));

    if (format === 'csv') {
      const fields = ['sku', 'name', 'category', 'quantity', 'isLowStock'];
      const parser = new Parser({ fields });
      const csv = parser.parse(productsData);

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', `attachment; filename=inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data: {
        summary,
        products: productsData
      }
    });

  } catch (error) {
    next(error);
  }
};



module.exports = {
  getDashboard,
  getSalesReport,
  getInventoryReport
};
