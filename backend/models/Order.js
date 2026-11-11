const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true }
    },
    paymentMethod: { type: String, enum: ["cash_on_delivery"], default: "cash_on_delivery" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 }
      }
    ],
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["placed", "processing", "shipped", "delivered", "cancelled"], default: "placed" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
