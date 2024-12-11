import { useState, useEffect } from 'react';
import {
    Container,
    VStack,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    Input,
    Select,
    HStack,
    Text,
    useToast,
    Badge,
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
} from '@chakra-ui/react';
import { useOrderStore } from '../store/order';

const OrderManagement = () => {
    // Hooks
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { orders, fetchOrders, updateOrderStatus, getOrderById, deleteOrder } = useOrderStore();

    // State
    const [searchId, setSearchId] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    // Effects
    useEffect(() => {
        loadOrders();
    }, []);

    // Handlers
    const loadOrders = async () => {
        setLoading(true);
        try {
            await fetchOrders();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load orders',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchId.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter an order ID',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const result = await getOrderById(searchId);
            if (result.success) {
                setSelectedOrder(result.data);
                onOpen();
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'Order not found',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to find order',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                toast({
                    title: 'Success',
                    description: 'Order status updated successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                loadOrders(); // Refresh orders list
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update order status',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order?')) {
            return;
        }

        try {
            const result = await deleteOrder(orderId);
            if (result.success) {
                toast({
                    title: 'Success',
                    description: 'Order deleted successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                loadOrders(); // Refresh orders list
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete order',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Helper functions
    const getStatusColor = (status) => {
        const colors = {
            pending: 'yellow',
            processing: 'blue',
            shipped: 'purple',
            delivered: 'green',
            cancelled: 'red',
        };
        return colors[status] || 'gray';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    // Order Details Modal
    const OrderDetailsModal = () => (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Order Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    {selectedOrder ? (
                        <VStack align="stretch" spacing={4}>
                            <Box>
                                <Text fontWeight="bold">Order ID:</Text>
                                <Text>{selectedOrder._id}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Receiver:</Text>
                                <Text>{selectedOrder.receiverName}</Text>
                                <Text>{selectedOrder.receiverPhone}</Text>
                                <Text>{selectedOrder.receiverAddress}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Items:</Text>
                                <Table size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th>Product</Th>
                                            <Th>Quantity</Th>
                                            <Th>Price</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {selectedOrder.items.map((item, index) => (
                                            <Tr key={index}>
                                                <Td>{item.product ? item.product.name : 'Deleted Product'}</Td>
                                                <Td>{item.quantity}</Td>
                                                <Td>{item.product ? item.product.price : 'N/A'}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Total Amount:</Text>
                                <Text>{selectedOrder.totalAmount}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Status:</Text>
                                <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                                    {selectedOrder.status}
                                </Badge>
                            </Box>
                        </VStack>
                    ) : (
                        <Text>No order details available.</Text>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8}>
                <Heading>Order Management</Heading>

                {/* Search Section */}
                <HStack w="full">
                    <Input
                        placeholder="Enter Order ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                    <Button colorScheme="blue" onClick={handleSearch}>
                        Search
                    </Button>
                    <Button onClick={loadOrders} isLoading={loading}>
                        Refresh
                    </Button>
                </HStack>

                {/* Orders Table */}
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Order ID</Th>
                            <Th>Receiver</Th>
                            <Th>Total Amount</Th>
                            <Th>Status</Th>
                            <Th>Created At</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {orders.map((order) => (
                            <Tr key={order._id}>
                                <Td>{order._id}</Td>
                                <Td>{order.receiverName}</Td>
                                <Td>{order.totalAmount}</Td>
                                <Td>
                                    <Badge colorScheme={getStatusColor(order.status)}>
                                        {order.status}
                                    </Badge>
                                </Td>
                                <Td>{formatDate(order.createdAt)}</Td>
                                <Td>
                                    <HStack spacing={2}>
                                        <Button size="sm" onClick={() => {
                                            setSelectedOrder(order);
                                            onOpen();
                                        }}>
                                            View
                                        </Button>
                                        <Select
                                            size="sm"
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </Select>
                                        <Button
                                            size="sm"
                                            colorScheme="red"
                                            onClick={() => handleDelete(order._id)}
                                        >
                                            Delete
                                        </Button>
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>

                {/* Order Details Modal */}
                <OrderDetailsModal />
            </VStack>
        </Container>
    );
};

export default OrderManagement;