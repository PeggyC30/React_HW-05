import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toastError, toastSuccess } from "../utils/toast";
import Pagination from "./Pagination";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({ getProducts, pagination, modalType, templateData, closeModal }) {
  const [tempProduct, setTempProduct] = useState(templateData);
  const fileUploadInputRef = useRef(null);
  useEffect(() => {
    setTempProduct(templateData);
  }, [templateData]);

  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTempProduct((preData) => ({ ...preData, [name]: type === "checkbox" ? checked : value }));
  };

  const handleModalImageChange = (index, value) => {
    setTempProduct((pre) => {
      const newImages = [...pre.imagesUrl];
      newImages[index] = value;

      if (value !== "" && index === newImages.length - 1 && newImages.length < 5) {
        newImages.push("");
      }
      if (value === "" && newImages.length > 1 && newImages[newImages.length - 1] === "") {
        newImages.pop();
      }

      return { ...pre, imagesUrl: newImages };
    });
  };

  const handleAddImage = () => {
    setTempProduct((pre) => {
      const newImages = [...pre.imagesUrl];
      newImages.push("");
      return { ...pre, imagesUrl: newImages };
    });
  };

  const handleRemoveImage = () => {
    setTempProduct((pre) => {
      const newImages = [...pre.imagesUrl];
      newImages.pop();
      return { ...pre, imagesUrl: newImages };
    });
  };

  const validateProduct = () => {
    if (!tempProduct.title?.trim()) return "請輸入產品標題";
    if (tempProduct.price === "" || tempProduct.price === null) return "請輸入售價";

    return null;
  };

  const updataProduct = async (id) => {
    const errorMsg = validateProduct();
    if (errorMsg) {
      toastError(errorMsg);
      return; // ❌ 中斷送出
    }
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = "post";

    if (modalType === "edit") {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = "put";
    }

    const productData = {
      data: {
        ...tempProduct,
        origin_price: Number(tempProduct.origin_price),
        price: Number(tempProduct.price),
        group_priceprice: Number(tempProduct.group_priceprice),
        is_enabled: tempProduct.is_enabled ? 1 : 0,
        imagesUrl: [...tempProduct.imagesUrl.filter((url) => url !== "")],
      },
    };

    try {
      const res = await axios[method](url, productData);
      toastSuccess("商品更新成功");
      getProducts(pagination.current_page);
      closeModal();
    } catch (error) {
      console.log(error.response);
      toastError(`商品更新失敗,${error.response.data.message}`);
    }
  };

  const delProduct = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);
      toastSuccess("商品刪除成功");
      closeModal();
      getProducts();
    } catch (error) {
      console.log(error.response);
      toastError(`商品刪除失敗,${error.response.data.message}`);
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    try {
      const formData = new FormData();
      formData.append("file-to-upload", file);
      const res = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, formData);
      setTempProduct((pre) => ({ ...pre, imageUrl: res.data.imageUrl }));
      fileUploadInputRef.current.value = "";
    } catch (error) {
      console.log(error.response);
    }
  };
  return (
    <div className="modal fade" id="productModal" tabIndex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0">
          <div className={`modal-header bg-${modalType === "delete" ? "danger" : "dark"} text-white`}>
            <h5 id="productModalLabel" className="modal-title">
              <span>{modalType === "delete" ? "刪除" : modalType === "edit" ? "編輯" : "新增"}產品</span>
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {modalType === "delete" ? (
              <p className="fs-4">
                確認刪除<span className="text-danger">{tempProduct.title}</span>?
              </p>
            ) : (
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-3">
                      {" "}
                      <label htmlFor="fileUpload" className="form-label">
                        上傳/更換主圖片
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="file-to-upload"
                        id="fileUpload"
                        accept=".jpg,.jpeg,.png"
                        ref={fileUploadInputRef}
                        onChange={(e) => {
                          uploadImage(e);
                        }}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="imageUrl" className="form-label">
                        輸入圖片網址
                      </label>
                      <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                        value={tempProduct.imageUrl}
                        onChange={(e) => {
                          handleModalInputChange(e);
                        }}
                      />
                    </div>
                    {tempProduct.imageUrl && <img className="img-fluid" src={tempProduct.imageUrl} alt="主圖" />}
                  </div>
                  <div>
                    {tempProduct.imagesUrl.map((url, index) => (
                      <div key={index}>
                        <label htmlFor="imageUrl" className="form-label">
                          輸入圖片網址
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`圖片網址${index + 1}`}
                          value={url}
                          onChange={(e) => handleModalImageChange(index, e.target.value)}
                        />
                        {url && <img className="img-fluid" src={url} alt={`副圖${index + 1}`} />}
                      </div>
                    ))}
                  </div>

                  <div>
                    {tempProduct.imagesUrl.length < 5 &&
                      tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1] !== "" && (
                        <button className="btn btn-outline-primary btn-sm d-block w-100" onClick={handleAddImage}>
                          新增圖片
                        </button>
                      )}
                  </div>
                  <div>
                    {tempProduct.imagesUrl.length >= 1 && (
                      <button className="btn btn-outline-danger btn-sm d-block w-100" onClick={handleRemoveImage}>
                        刪除圖片
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題<small className="text-danger ms-1">*必填</small>
                    </label>
                    <input
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                      value={tempProduct.title}
                      onChange={(e) => {
                        handleModalInputChange(e);
                      }}
                      disabled={modalType === "edit"}
                    />
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="category" className="form-label">
                        分類
                      </label>
                      <input
                        name="category"
                        id="category"
                        type="text"
                        className="form-control"
                        placeholder="請輸入分類"
                        value={tempProduct.category}
                        onChange={(e) => {
                          handleModalInputChange(e);
                        }}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="unit" className="form-label">
                        單位
                      </label>
                      <input
                        name="unit"
                        id="unit"
                        type="text"
                        className="form-control"
                        placeholder="請輸入單位"
                        value={tempProduct.unit}
                        onChange={(e) => {
                          handleModalInputChange(e);
                        }}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-4">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入原價"
                        value={tempProduct.origin_price}
                        onChange={(e) => {
                          handleModalInputChange(e);
                        }}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <label htmlFor="price" className="form-label">
                        售價<small className="text-danger ms-1">*必填</small>
                      </label>
                      <input
                        name="price"
                        id="price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入售價"
                        value={tempProduct.price}
                        onChange={(e) => {
                          handleModalInputChange(e);
                        }}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <label htmlFor="group_price" className="form-label">
                        團購價
                      </label>
                      <input
                        name="group_price"
                        id="group_price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入團購價"
                        value={tempProduct.group_price}
                        onChange={(e) => {
                          handleModalInputChange(e);
                        }}
                      />
                    </div>
                  </div>

                  <hr />

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      className="form-control"
                      placeholder="請輸入產品描述"
                      value={tempProduct.description}
                      onChange={(e) => {
                        handleModalInputChange(e);
                      }}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      name="content"
                      id="content"
                      className="form-control"
                      placeholder="請輸入說明內容"
                      value={tempProduct.content}
                      onChange={(e) => {
                        handleModalInputChange(e);
                      }}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        name="is_enabled"
                        id="is_enabled"
                        className="form-check-input"
                        type="checkbox"
                        checked={tempProduct.is_enabled}
                        onChange={(e) => {
                          handleModalInputChange(e);
                        }}
                      />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              data-bs-dismiss="modal"
              onClick={() => closeModal()}
            >
              取消
            </button>
            {modalType === "delete" ? (
              <button type="button" className="btn btn-danger" onClick={() => delProduct(templateData.id)}>
                刪除
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => updataProduct(templateData.id)}>
                確認
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
