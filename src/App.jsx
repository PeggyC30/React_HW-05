import { useState } from "react";
import axios from "axios";
import "./style.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  // 產品資料狀態
  const [products, setProducts] = useState([]);
  // 目前選中的產品
  const [tempProduct, setTempProduct] = useState(null);
  const [mainImage, setMainImage] = useState();

  const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  axios.defaults.headers.common["Authorization"] = token;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((preData) => ({ ...preData, [name]: value }));
  };

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = res.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)}`;
      setIsAuth(true);
      getProducts();
    } catch (error) {
      setIsAuth(false);
      console.log(error.response.data.message);
    }
  };

  const checkLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/user/check`);
      console.log(res.data);
    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  const getProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>登入</h1>
          <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="username"
                name="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-2">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container">
          <div className="row mt-2">
            <div className="col-md-6">
              <button className="btn btn-danger mb-5" type="button" onClick={() => checkLogin()}>
                確認是否登入
              </button>
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <th scope="row">{product.title}</th>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>{product.is_enabled ? "啟用" : "未啟用"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            setTempProduct(product);
                            setMainImage(product.imageUrl);
                          }}
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>產品明細</h2>
              {tempProduct ? (
                <div className="card">
                  <img
                    src={mainImage || tempProduct.imageUrl}
                    className="card-img-top"
                    alt="main-img"
                    style={{ height: "300px" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{tempProduct.title}</h5>
                    <p className="card-text">商品描述：{tempProduct.description}</p>
                    <p>商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <del className="text-secondary">{tempProduct.origin_price}</del> 元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex">
                      {tempProduct.imagesUrl.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          style={{ height: "100px", marginRight: "5px", cursor: "pointer" }}
                          onClick={() => setMainImage(url)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                "請選擇產品"
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
