import { createHashRouter } from "react-router";
import FrontendLayout from "./layout/FrontendLayout";
import Products from "./views/front/Products";
import SingleProduct from "./views/front/SingleProduct";
import Cart from "./views/front/Cart";
import NOtFound from "./views/front/NotFound";
import Home from "./views/front/Home";
import App from "./App";

export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <FrontendLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "product", element: <Products /> },
          { path: "product/:id", element: <SingleProduct /> },
          { path: "cart", element: <Cart /> },
        ],
      },
      { path: "*", element: <NOtFound /> },
    ],
  },
]);
