import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, placeOrder } from "../redux/slices/cartSlice";

const initialAddress = { fullName: "", phone: "", addressLine: "", city: "", state: "", postalCode: "" };

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.cart);
  const [address, setAddress] = useState(initialAddress);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const items = data.items || [];
  const total = items.reduce((sum, item) => sum + (item.product ? item.product.price * item.quantity : 0), 0);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const order = await dispatch(placeOrder(address)).unwrap();
      navigate(`/orders/${order._id}`, { state: { justPlaced: true } });
    } catch (requestError) {
      setSubmitError(requestError);
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && items.length === 0) {
    return <main className="container"><h1>Checkout</h1><p>Your cart is empty.</p><Link to="/">Continue shopping</Link></main>;
  }

  return (
    <main className="container">
      <div className="page-heading"><div><p className="eyebrow">ALMOST THERE</p><h1>Checkout</h1></div><Link to="/cart">← Back to cart</Link></div>
      {loading && <p>Loading your cart…</p>}
      {(submitError || error) && <p className="error form-message">{submitError || error}</p>}
      <div className="checkout-layout">
        <form className="form-card checkout-form" onSubmit={submit}>
          <h2>Delivery details</h2>
          <div className="field-grid">
            {[["fullName", "Full name", "text"], ["phone", "Phone number", "tel"], ["addressLine", "Street address", "text"], ["city", "City", "text"], ["state", "State", "text"], ["postalCode", "PIN code", "text"]].map(([key, label, type]) => (
              <label className={key === "addressLine" ? "field-wide" : ""} key={key}>{label}
                <input required type={type} autoComplete={key === "fullName" ? "name" : key === "phone" ? "tel" : key === "addressLine" ? "street-address" : key === "postalCode" ? "postal-code" : "address-level2"} value={address[key]} onChange={(event) => setAddress({ ...address, [key]: event.target.value })} />
              </label>
            ))}
          </div>
          <h2>Payment</h2>
          <div className="payment-choice"><span className="payment-icon">₹</span><div><strong>Cash on delivery</strong><small>Pay when your order arrives</small></div><span className="radio-selected" /></div>
          <button disabled={submitting || loading || items.length === 0}>{submitting ? "Placing your order…" : "Place order"}</button>
        </form>
        <aside className="order-summary">
          <h2>Order summary</h2>
          {items.map((item) => item.product && <div className="summary-line" key={item.product._id}><span>{item.product.name} <small>× {item.quantity}</small></span><strong>₹{item.product.price * item.quantity}</strong></div>)}
          <div className="summary-line"><span>Delivery</span><strong className="free-label">FREE</strong></div>
          <div className="summary-total"><span>Total</span><strong>₹{total.toLocaleString("en-IN")}</strong></div>
          <p>Secure checkout · Cash on delivery</p>
        </aside>
      </div>
    </main>
  );
}
