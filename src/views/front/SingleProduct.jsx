import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { toastError, toastSuccess } from "../../utils/toast";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState([]);

  useEffect(() => {
    const handleProductDetail = async (id) => {
      try {
        const res = await axios.get(` ${API_BASE}/api/${API_PATH}/product/${id}`);
        setProduct(res.data.product);
      } catch (error) {
        console.log(error.response);
      }
    };
    handleProductDetail(id);
  }, [id]);

  const addCart = async (id, num = 1) => {
    try {
      const data = { product_id: id, qty: num };
      const res = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, { data });
      toastSuccess("已加入購物車");
    } catch (error) {
      console.log(error.response);
      toastError(`加入購物車失敗,${error.response.data.message}`);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="card ">
          <img
            src={product.imageUrl}
            className="card-img-top "
            alt={product.title}
            style={{ height: "400px", objectFit: "cover" }}
          />
          <div className="card-body">
            <h5 className="card-title">{product.title}</h5>
            <p className="card-text">{product.desciption}</p>
            <p className="card-text">價格：{product.price}</p>

            <p className="card-text">
              <small className="text-body-secondary">{product.unit}</small>
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                addCart(product.id);
              }}
            >
              加入購物車
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleProduct;
