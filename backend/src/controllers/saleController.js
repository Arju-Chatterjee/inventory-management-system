const Sale = require("../models/Sale");
const Product = require("../models/Product");

// ================= CREATE SALE =================
const createSale = async (req, res) => {
  try {
    const {
      items,
      customerName,
      customerLocation,
      customerPhone,
      amountReceived,
      notes,
    } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "No items provided" });

    // verify user
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "Unauthorized user" });

    // check stock availability
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product)
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productName}` });

      if (product.quantity < item.quantity)
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.quantity}`,
        });
    }

    // deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: -item.quantity } },
        { new: true },
      );
    }

    // safer serial generator (ignores old records without serialNumber)
    const lastSale = await Sale.findOne({ serialNumber: { $exists: true } })
      .sort({ serialNumber: -1 })
      .lean();

    const nextSerial = lastSale ? lastSale.serialNumber + 1 : 1;

    // create sale
    const sale = await Sale.create({
      serialNumber: nextSerial,
      customerName,
      customerLocation,
      customerPhone,
      amountReceived,
      notes,
      items,
      soldBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: sale,
    });
  } catch (err) {
    console.error("CREATE SALE ERROR:", err);
    res.status(500).json({ message: "Error creating sale" });
  }
};

// ================= GET ALL SALES =================
const getSales = async (req, res) => {
  try {

    const sales = await Sale.find({})
      .populate('soldBy', 'firstName lastName')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })   // ← use timestamp instead
      .lean();

    res.json({
      success: true,
      data: sales
    });

  } catch (err) {
    console.error("GET SALES ERROR:", err);
    res.status(500).json({ message: 'Error fetching sales' });
  }
};


// ================= DELETE SALE =================
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) return res.status(404).json({ message: "Sale not found" });

    // restore stock
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity },
      });
    }

    await sale.deleteOne();

    res.json({
      success: true,
      message: "Sale deleted & stock restored",
    });
  } catch (err) {
    console.error("DELETE SALE ERROR:", err);
    res.status(500).json({ message: "Error deleting sale" });
  }
};

module.exports = {
  createSale,
  getSales,
  deleteSale,
};
