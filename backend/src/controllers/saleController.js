const Sale = require("../models/Sale");
const Product = require("../models/Product");



/* ======================================================
   CREATE SALE (DISPATCH)
====================================================== */
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

    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "Unauthorized user" });

    // Check stock availability
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product)
        return res.status(404).json({ message: `Product not found: ${item.productName}` });

      if (product.quantity < item.quantity)
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.quantity}`,
        });
    }

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
    }

    // Serial number
    const lastSale = await Sale.findOne({ serialNumber: { $exists: true } })
      .sort({ serialNumber: -1 })
      .lean();

    const nextSerial = lastSale ? lastSale.serialNumber + 1 : 1;

    // Create sale
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

    res.status(201).json({ success: true, data: sale });

  } catch (err) {
    console.error("CREATE SALE ERROR:", err);
    res.status(500).json({ message: "Error creating sale" });
  }
};



/* ======================================================
   GET ALL SALES
====================================================== */
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({})
      .populate("soldBy", "firstName lastName")
      .populate("items.product", "name")
      .sort({ serialNumber: 1 })
      .lean();

    res.json({ success: true, data: sales });

  } catch (err) {
    console.error("GET SALES ERROR:", err);
    res.status(500).json({ message: "Error fetching sales" });
  }
};



/* ======================================================
   UPDATE SALE (SAFE STOCK ADJUSTMENT)
====================================================== */
const updateSale = async (req, res) => {
  try {
    const saleId = req.params.id;
    const { items, customerName, customerLocation, customerPhone, notes } = req.body;

    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    // 1️⃣ Restore previous stock
    for (const oldItem of sale.items) {
      await Product.findByIdAndUpdate(oldItem.product, {
        $inc: { quantity: oldItem.quantity }
      });
    }

    // 2️⃣ Check new stock
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product)
        return res.status(404).json({ message: `Product not found: ${item.productName}` });

      if (product.quantity < item.quantity)
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.quantity}`
        });
    }

    // 3️⃣ Deduct new stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });
    }

    // 4️⃣ Update sale
    sale.customerName = customerName;
    sale.customerLocation = customerLocation;
    sale.customerPhone = customerPhone;
    sale.notes = notes;
    sale.items = items;

    await sale.save();

    res.json({
      success: true,
      message: "Sale updated & stock adjusted",
      data: sale
    });

  } catch (err) {
    console.error("UPDATE SALE ERROR:", err);
    res.status(500).json({ message: "Error updating sale" });
  }
};



/* ======================================================
   DELETE SALE (RESTORE STOCK)
====================================================== */
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    // Restore stock
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity }
      });
    }

    await sale.deleteOne();

    res.json({
      success: true,
      message: "Sale deleted & stock restored"
    });

  } catch (err) {
    console.error("DELETE SALE ERROR:", err);
    res.status(500).json({ message: "Error deleting sale" });
  }
};



module.exports = {
  createSale,
  getSales,
  updateSale,
  deleteSale
};
