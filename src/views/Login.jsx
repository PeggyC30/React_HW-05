import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login({ setIsAuth, getProducts }) {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

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

      axios.defaults.headers.common["Authorization"] = token;
      setIsAuth(true);
      getProducts();
    } catch (error) {
      setIsAuth(false);
      console.log(error.response.data.message);
    }
  };

  return (
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
  );
}

export default Login;
