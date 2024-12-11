// store/order.js
import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  orders: [],
  error: null,
  loading: false,

  // Create a new order
  createOrder: async (orderData) => {
    set({ loading: true });
    try {
      console.log('Sending to server:', orderData); // Debug log

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log('Server response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      set((state) => ({
        orders: [...state.orders, data.data],
        error: null
      }));

      return {
        success: true,
        message: data.message || 'Order created successfully',
        data: data.data
      };
    } catch (error) {
      console.error('Store error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create order'
      };
    } finally {
      set({ loading: false });
    }
  },

  // Delete an order by ID
  deleteOrder: async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete order');
      }

      set((state) => ({
        orders: state.orders.filter((order) => order._id !== orderId),
      }));

      return { success: true, message: 'Order deleted successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Clear any errors
  clearError: () => {
    set({ error: null });
  },

  fetchOrders: async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (data.success) {
        set({ orders: data.data });
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      
      if (data.success) {
        set(state => ({
          orders: state.orders.map(order =>
            order._id === orderId ? { ...order, status } : order
          )
        }));
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

}));