import { useState, useEffect } from 'react';
import {
  Button,
  Container,
  VStack,
  Box,
  Heading,
  Select,
  Text,
  Input,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useOrderStore } from '../store/order';
import { useProductStore } from '../store/product';
import { useNavigate } from 'react-router-dom';

const CreateOrder = () => {
  // Hooks
  const toast = useToast();
  const navigate = useNavigate();
  const { products, fetchProducts } = useProductStore();
  const { createOrder } = useOrderStore();

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [order, setOrder] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    items: []
  });
  const [newItem, setNewItem] = useState({
    product: '',
    quantity: 1
  });

  // Effects
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (field, value) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    const selectedProduct = products.find(p => p._id === newItem.product);
    if (!selectedProduct) return;

    setOrder(prev => {
      const existingItemIndex = prev.items.findIndex(item => item.product === selectedProduct._id);

      // Create a new state object to avoid any reference issues
      if (existingItemIndex !== -1) {
        return {
          ...prev,
          items: prev.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          )
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, {
            product: selectedProduct._id,
            quantity: newItem.quantity,
            _displayName: selectedProduct.name,
            _displayPrice: selectedProduct.price
          }]
        };
      }
    });

    // Reset the new item form
    setNewItem({ product: '', quantity: 1 });
  };

  const handleRemoveItem = (index) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        receiverName: order.receiverName.trim(),
        receiverPhone: order.receiverPhone.trim(),
        receiverAddress: order.receiverAddress.trim(),
        items: order.items.map(item => ({
          product: item.product,  // Send only the product ID
          quantity: parseInt(item.quantity)  // Ensure quantity is a number
        }))
      };

      // Debug logs
      console.log('Submitting order data:', orderData);
      console.log('Items being sent:', orderData.items);

      const result = await createOrder(orderData);

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      } else {
        throw new Error(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create order',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations
  const totalAmount = Number((order.items.reduce((sum, item) =>
    sum + (item._displayPrice * item.quantity), 0)).toFixed(2));

  // Render helpers
  const isFormValid = order.items.length > 0 &&
    order.receiverName &&
    order.receiverPhone &&
    order.receiverAddress;

  return (
    <Container maxW="container.sm">
      <VStack spacing={8}>
        <Heading as="h1" size="2xl" textAlign="center" mb={8}>
          Create New Order
        </Heading>

        <Box w="full" bg={useColorModeValue("white", "gray.800")}
          p={6} rounded="lg" shadow="md">

          {/* Products Selection */}
          <VStack spacing={4} mb={6}>
            <Heading size="md">Add Products</Heading>
            <Select
              placeholder="Select product"
              value={newItem.product}
              onChange={(e) => handleItemChange('product', e.target.value)}
            >
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} - {product.price}
                </option>
              ))}
            </Select>

            <NumberInput
              min={1}
              value={newItem.quantity}
              onChange={(valueString, valueNumber) => handleItemChange('quantity', valueNumber)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <Button
              onClick={handleAddItem}
              isDisabled={!newItem.product}
              colorScheme="blue"
              w="full"
            >
              Add Item
            </Button>
          </VStack>

          {/* Selected Items */}
          {order.items.length > 0 && (
            <VStack spacing={3} mb={6}>
              <Heading size="md">Selected Items</Heading>
              {order.items.map((item, index) => (
                <Box key={index} p={3} w="full" borderWidth={1} borderRadius="md">
                  <Text>
                    {item._displayName} - {item._displayPrice} × {item.quantity}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleRemoveItem(index)}
                    mt={2}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
              <Text fontWeight="bold">Total: {totalAmount.toFixed(2)}</Text>
            </VStack>
          )}

          <Divider my={6} />

          {/* Receiver Information */}
          <VStack spacing={4}>
            <Heading size="md">Receiver Information</Heading>
            <Input
              placeholder="Receiver Name"
              name="receiverName"
              value={order.receiverName}
              onChange={handleInputChange}
            />
            <Input
              placeholder="Receiver Phone"
              name="receiverPhone"
              value={order.receiverPhone}
              onChange={handleInputChange}
            />
            <Input
              placeholder="Receiver Address"
              name="receiverAddress"
              value={order.receiverAddress}
              onChange={handleInputChange}
            />

            <Button
              type="submit"
              colorScheme="green"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={!isFormValid || isSubmitting}
              w="full"
            >
              Create Order
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreateOrder;