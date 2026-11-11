import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addCartItem } from "../redux/slices/cartSlice";
import api from "../services/api";

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartFeedback, setCartFeedback] = useState("");

  const addToCart = async () => {
    setCartFeedback("");
    try {
      await dispatch(addCartItem({ productId: product._id, quantity: 1 })).unwrap();
      navigate("/cart");
    } catch (requestError) {
      setCartFeedback(requestError);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api.get(`/products/${id}`)
      .then((response) => { if (active) setProduct(response.data.product); })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Could not load this product.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return (
    <main className="container">
      <p><Link to="/">← Back to products</Link></p>
      {loading && <p>Loading product...</p>}
      {!loading && error && <p className="error">{error}</p>}
      {!loading && product && (
        <article className="product-detail">
          {product.image ? <img src={product.image} alt={product.name} /> : <div className="image-placeholder">No image</div>}
          <div className="product-info">
            <small>{product.category}</small>
            <h1>{product.name}</h1>
            <p>{product.description || "No description available."}</p>
            <strong>₹{product.price}</strong>
            <small>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</small>
            {user && <button disabled={product.stock < 1} onClick={addToCart}>Add to cart</button>}
            {cartFeedback && <small role="status">{cartFeedback}</small>}
            {!user && <p><Link to="/login">Log in</Link> to add this product to your cart.</p>}
          </div>
        </article>
      )}
    </main>
  );
}
