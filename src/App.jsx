import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";
import "./style.css";
import ProductModal from "./components/ProductModal";
import Pagination from "./components/Pagination";
import Login from "./views/Login";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  group_price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
};

function App() {
  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  // 產品資料狀態
  const [products, setProducts] = useState([]);
  // 目前選中的產品
  // const [tempProduct, setTempProduct] = useState(null);
  // const [mainImage, setMainImage] = useState();

  const [templateData, setTemplateData] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState(""); // "create", "edit", "delete"

  const [pagination, setPagination] = useState({});

  const productModalRef = useRef(null);

  useEffect(() => {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }

    // 初始化 Bootstrap Modal
    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false,
    });
    // Modal 關閉時移除焦點
    document.querySelector("#productModal").addEventListener("hide.bs.modal", () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });

    const checkLogin = async () => {
      try {
        const res = await axios.post(`${API_BASE}/api/user/check`);

        setIsAuth(true);
        getProducts();
      } catch (error) {
        console.log(error.response.data.message);
      }
    };
    checkLogin();
  }, []);

  const openModal = (type, product) => {
    setModalType(type);
    setTemplateData({ ...INITIAL_TEMPLATE_DATA, ...product });
    productModalRef.current.show();
  };
  const closeModal = () => {
    productModalRef.current.hide();
  };

  const getProducts = async (page = 1) => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  return (
    <>
      {!isAuth ? (
        <Login setIsAuth={setIsAuth} getProducts={getProducts} />
      ) : (
        <div className="container">
          <h2>產品列表</h2>
          <div className="text-end mt-4">
            <button type="button" className="btn btn-primary" onClick={() => openModal("creat", INITIAL_TEMPLATE_DATA)}>
              建立新的產品
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">分類</th>

                <th scope="col">產品名稱</th>
                <th scope="col">原價</th>
                <th scope="col">售價</th>
                <th scope="col">是否啟用</th>
                <th scope="col">編輯</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <th scope="row">{product.category}</th>

                  <th scope="row">{product.title}</th>
                  <td>{product.origin_price}</td>
                  <td>{product.price}</td>
                  <td className={product.is_enabled ? "text-success" : ""}>{product.is_enabled ? "啟用" : "未啟用"}</td>
                  <td>
                    <div className="btn-group" role="group" aria-label="Basic example">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm "
                        onClick={() => {
                          openModal("edit", product);
                        }}
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => {
                          openModal("delete", product);
                        }}
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination pagination={pagination} getProducts={getProducts} />
        </div>
      )}

      <ProductModal
        getProducts={getProducts}
        modalType={modalType}
        templateData={templateData}
        closeModal={closeModal}
      />
    </>
  );
}

export default App;
