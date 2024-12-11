import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes } from 'react-router-dom';
import CreateProduct from './pages/CreateProduct';
import CreateOrder from "./pages/CreateOrder";
import ManageProduct from "./pages/ManageProduct";
import OrderManagement from "./pages/OrderManagement";
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';

function App() {
  return (
    <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/createProduct" element={<CreateProduct />} />
        <Route path="/manageProduct" element={<ManageProduct />} />
        <Route path="/createOrder" element={<CreateOrder />} />
        <Route path="/orderManagement" element={<OrderManagement />} />
      </Routes>
    </Box>
  );
}

export default App;