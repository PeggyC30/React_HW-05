import axios from "axios";
import { useEffect, useState } from "react";
import { currency } from "../../utils/filter";
import { toastError, toastSuccess } from "../../utils/toast";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Cart() {
  const [cart, setCart] = useState([]);
  useEffect(() => {
    const getCart = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
        setCart(res.data.data);
      } catch (error) {
        console.log(error.response);
      }
    };
    getCart();
  }, []);
  const updateCart = async (cartId, productId, qty = 1) => {
    try {
      const data = { product_id: productId, qty };
      const res = await axios.put(`${API_BASE}/api/${API_PATH}/cart/${cartId}`, { data });
      const res2 = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCart(res2.data.data);
      toastSuccess("已更新購物車");
    } catch (error) {
      console.log(error.response);
      toastError(`購物車更新失敗,${error.response.data.message}`);
    }
  };
  const delCart = async (cartId, cartProductTitle) => {
    try {
      const res = await axios.delete(`${API_BASE}/api/${API_PATH}/cart/${cartId}`);
      const res2 = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCart(res2.data.data);
      toastSuccess(`已刪除「${cartProductTitle}」`);
    } catch (error) {
      console.log(error.response);
      toastError(`刪除${cartProductTitle}失敗,${error.response.data.message}`);
    }
  };

  const delAllCart = async () => {
    try {
      const res = await axios.delete(`${API_BASE}/api/${API_PATH}/carts`);
      const res2 = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCart(res2.data.data);
      toastSuccess("購物車已清空");
    } catch (error) {
      console.log(error.response);
      toastError(`刪除購物車失敗,${error.response.data.message}`);
    }
  };

  return (
    <div className="container">
      <h2>購物車列表</h2>
      <div className="text-end mt-4">
        <button type="button" className="btn btn-outline-danger" onClick={() => delAllCart()}>
          清空購物車
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">品名</th>
            <th scope="col">數量/單位</th>
            <th scope="col">小計</th>
          </tr>
        </thead>
        <tbody>
          {cart?.carts?.map((cartItem) => (
            <tr key={cartItem.id}>
              <td>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => delCart(cartItem.id, cartItem.product.title)}
                >
                  刪除
                </button>
              </td>
              <td scope="row">{cartItem.product.title}</td>

              <td>
                <div className="input-group input-group-sm mb-3">
                  <input
                    style={{ maxWidth: "60px" }}
                    type="number"
                    min={0}
                    className="form-control text-center"
                    aria-label="Sizing example input"
                    aria-describedby="inputGroup-sizing-sm"
                    defaultValue={cartItem.qty}
                    onKeyDown={(e) => {
                      console.log(e);
                      if (e.key === "Enter") {
                        const qty = Number(e.target.value);

                        if (qty <= 0) {
                          delCart(cartItem.id, cartItem.product.title);
                        } else {
                          updateCart(cartItem.id, cartItem.product_id, qty);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const qty = Number(e.target.value);

                      if (qty == 0) {
                        delCart(cartItem.id, cartItem.product.title);
                      } else {
                        updateCart(cartItem.id, cartItem.product_id, qty);
                      }
                    }}
                  />

                  <span className="input-group-text" id="inputGroup-sizing-sm">
                    {cartItem.product.unit}
                  </span>
                </div>
              </td>
              <td>{currency(cartItem.final_total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="text-end" colSpan="3">
              總計
            </td>
            <td className="text-end">{currency(cart.final_total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default Cart;
