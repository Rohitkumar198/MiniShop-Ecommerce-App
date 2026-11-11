import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addCartItem } from "../redux/slices/cartSlice";


export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [feedback, setFeedback] = useState("");

  const addToCart = async () => {
    setFeedback("");
    try {
      await dispatch(addCartItem({ productId: product._id, quantity: 1 })).unwrap();
      navigate("/cart");
    } catch (error) {
      setFeedback(error);
    }
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} aria-label={`View ${product.name}`}>
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="image-placeholder">No image</div>
        )}
      </Link>
      <div className="product-info">
        <small className="product-category">{product.category || "Everyday essentials"}</small>
        <h3><Link to={`/products/${product._id}`}>{product.name}</Link></h3>
        <p>{product.description}</p>
        <strong>₹{product.price}</strong>
        <small>Stock: {product.stock}</small>
        {user && (
          <button
            disabled={product.stock < 1}
            onClick={addToCart}
          >
            Buy Now
          </button>
        )}
        {feedback && <small role="status">{feedback}</small>}
      </div>
    </article>
  );
}
