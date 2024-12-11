import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
});


const orderSchema = new mongoose.Schema(
  {
    items: [orderItemSchema], 
    receiverName: {
      type: String,
      required: true,
    },
    receiverPhone: {
      type: String,
      required: true,
    },
    receiverAddress: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true, 
  }
);

// Calculate the total amount of the order
orderSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("items")) return next();

    let total = 0;
    for (const item of this.items) {
      const product = await mongoose.model("Product").findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }
      total += product.price * item.quantity;
    }

  this.totalAmount = total;
  next();
  } catch (error) {
    next(error);
  }
});

// Helper method to get item price
orderSchema.methods.getItemPrice = async function (itemId) {
  const item = this.items.id(itemId);
  if (!item) return 0;
  const product = await mongoose.model("Product").findById(item.product);
  return product ? product.price * item.quantity : 0;
}

// Method to update order status
orderSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;
  return this.save();
}

const Order = mongoose.model("Order", orderSchema);

export default Order;
