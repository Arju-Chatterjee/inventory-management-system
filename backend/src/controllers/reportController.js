const Product = require('../models/Product');
const Sale = require('../models/Sale');
const { Parser } = require('json2csv');

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();

    // Total inventory value
    const inventoryValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      }
    ]);

    // Low stock count
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    });

    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Sales today
    const salesToday = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Sales this week
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const salesThisWeek = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: weekStart }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Sales this month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const salesThisMonth = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Top selling products (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topSellingProducts = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: thirtyDaysAgo }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $project: {
          product: {
            _id: '$_id',
            name: '$productName',
            sku: { $arrayElemAt: ['$productDetails.sku', 0] }
          },
          totalQuantitySold: 1,
          totalRevenue: 1
        }
      }
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    })
      .select('name sku quantity minStockLevel')
      .limit(5)
      .sort({ quantity: 1 });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalInventoryValue: inventoryValue[0]?.totalValue || 0,
        lowStockCount,
        salesToday: salesToday[0]?.count || 0,
        salesTodayAmount: salesToday[0]?.totalAmount || 0,
        salesThisWeek: salesThisWeek[0]?.count || 0,
        salesThisWeekAmount: salesThisWeek[0]?.totalAmount || 0,
        salesThisMonth: salesThisMonth[0]?.count || 0,
        salesThisMonthAmount: salesThisMonth[0]?.totalAmount || 0,
        topSellingProducts,
        lowStockProducts
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Private (Admin, Manager)
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

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Summary
    const summary = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const summaryData = {
      totalSales: summary[0]?.totalSales || 0,
      totalRevenue: summary[0]?.totalRevenue || 0,
      averageOrderValue: summary[0]?.totalSales > 0
        ? summary[0].totalRevenue / summary[0].totalSales
        : 0
    };

    // Sales by period
    let dateFormat;
    switch (groupBy) {
      case 'week':
        dateFormat = { $week: '$saleDate' };
        break;
      case 'month':
        dateFormat = { $month: '$saleDate' };
        break;
      default:
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } };
    }

    const salesByPeriod = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: dateFormat,
          salesCount: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          period: '$_id',
          salesCount: 1,
          revenue: 1,
          _id: 0
        }
      }
    ]);

    // Sales by category
    const salesByCategory = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: start, $lte: end }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$categoryDetails._id',
          category: { $first: '$categoryDetails.name' },
          salesCount: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { revenue: -1 } },
      {
        $project: {
          category: 1,
          salesCount: 1,
          revenue: 1,
          _id: 0
        }
      }
    ]);

    const reportData = {
      summary: summaryData,
      salesByPeriod,
      salesByCategory
    };

    // Return CSV format if requested
    if (format === 'csv') {
      const fields = ['period', 'salesCount', 'revenue'];
      const parser = new Parser({ fields });
      const csv = parser.parse(salesByPeriod);

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', `attachment; filename=sales_report_${startDate}_${endDate}.csv`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private (Admin, Manager)
const getInventoryReport = async (req, res, next) => {
  try {
    const { format = 'json', category } = req.query;

    const query = category ? { category } : {};

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ 'category.name': 1, name: 1 });

    // Calculate summary
    const summary = products.reduce((acc, product) => {
      const value = product.price * product.quantity;
      return {
        totalProducts: acc.totalProducts + 1,
        totalValue: acc.totalValue + value,
        totalUnits: acc.totalUnits + product.quantity,
        lowStockCount: acc.lowStockCount + (product.isLowStock ? 1 : 0)
      };
    }, { totalProducts: 0, totalValue: 0, totalUnits: 0, lowStockCount: 0 });

    const productsData = products.map(p => ({
      _id: p._id,
      name: p.name,
      sku: p.sku,
      category: p.category?.name || '',
      quantity: p.quantity,
      price: p.price,
      value: p.price * p.quantity,
      isLowStock: p.isLowStock
    }));

    // Return CSV format if requested
    if (format === 'csv') {
      const fields = ['sku', 'name', 'category', 'quantity', 'price', 'value', 'isLowStock'];
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
