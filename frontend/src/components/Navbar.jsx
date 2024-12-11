import { Button, Container, Flex, HStack, Text, useColorMode, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
// import { PlusSquareIcon, AddIcon } from "@chakra-ui/icons";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { Link } from 'react-router-dom';



const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return <Container maxW={"1140px"} px={4}>
    <Flex
      h={16}
      alignItems={"center"}
      justifyContent={"space-between"}
      flexDir={{
        base: "column",
        sm: "row"
      }}
    >
      <Text
        fontSize={{ base: "22", sm: "28" }}
        fontWeight={"bold"}
        textTransform={"uppercase"}
        textAlign={"center"}
        bgGradient={"linear(to-r, cyan.400, blue.500)"}
        bgClip={"text"}
      >
        <Link to={"/"}>X</Link>
      </Text>

      <HStack spacing={2} alignItems={"center"}>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Product
          </MenuButton>
          <MenuList>
            <Link to={"/manageProduct"}>
              <MenuItem>Manage Products</MenuItem>
            </Link>
            <Link to={"/createProduct"}>
              <MenuItem>Create Product</MenuItem>
            </Link>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Order
          </MenuButton>
          <MenuList>
            <Link to={"/orderManagement"}>
              <MenuItem>Manage orders</MenuItem>
            </Link>
            <Link to={"/createOrder"}>
              <MenuItem>Create order</MenuItem>
            </Link>
          </MenuList>
        </Menu>
        <Button onClick={toggleColorMode}>
          {colorMode === "light" ? <IoMoon /> : <LuSun size="20" />}
        </Button>
      </HStack>


    </Flex>
  </Container>
}

export default Navbar;