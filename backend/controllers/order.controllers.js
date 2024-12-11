import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const createOrder = async (req, res, next) => {
  try {
    console.log('Received order data:', req.body); // Debug log

    const { items, receiverName, receiverPhone, receiverAddress } = req.body;

    // Validate required fields
    if (!items?.length || !receiverName || !receiverPhone || !receiverAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate items structure
    if (!items.every(item => item.product && item.quantity > 0)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid items structure'
      });
    }

    // Create the order
    const order = new Order({
      items,
      receiverName,
      receiverPhone,
      receiverAddress
    });

    const savedOrder = await order.save();
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('items.product', 'name price');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Server error:', error); // Debug log
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 }); // Latest orders first

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Use the model method to update status
    await order.updateStatus(status);

    const updatedOrder = await Order.findById(req.params.id)
      .populate('items.product', 'name price image');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow deletion of cancelled orders
    if (order.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Only cancelled orders can be deleted'
      });
    }

    await order.deleteOne();

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};