import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart, updateCartItem, removeCartItem
} from "../redux/slices/cartSlice";

export default function Cart() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const items = data.items || [];
  const total = items.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.price * item.quantity;
  }, 0);

  return <main className="container">
    <div className="page-heading"><div><p className="eyebrow">YOUR PICKS</p><h1>Shopping cart</h1></div><Link to="/">Continue shopping →</Link></div>
    {loading && <p className="inline-status">Updating your cart…</p>}
    {error && <p className="error form-message">{error}</p>}
    {!loading && items.length === 0 ? <section className="empty-state"><span>🛍️</span><h2>Your cart is waiting</h2><p>Looks like you haven’t added anything yet.</p><Link className="button-link" to="/">Explore the shop</Link></section> : items.length > 0 && <div className="cart-layout">
      <section className="cart-items-panel">
        <div className="cart-items-heading"><strong>Your items</strong><span>{items.length} {items.length === 1 ? "item" : "items"}</span></div>
        {items.map((item) => item.product && <article className="cart-item" key={item.product._id}>
          <Link className="cart-item-image" to={`/products/${item.product._id}`}>
            {item.product.image ? <img src={item.product.image} alt={item.product.name} /> : <span>No image</span>}
          </Link>
          <div className="cart-item-info"><Link className="cart-item-name" to={`/products/${item.product._id}`}>{item.product.name}</Link><small>{item.product.category}</small><button className="text-button" onClick={() => dispatch(removeCartItem(item.product._id))}>Remove</button></div>
          <div className="cart-item-quantity"><div className="quantity-control"><button aria-label={`Decrease ${item.product.name} quantity`} disabled={item.quantity <= 1} onClick={() => dispatch(updateCartItem({ productId: item.product._id, quantity: item.quantity - 1 }))}>−</button><span>{item.quantity}</span><button aria-label={`Increase ${item.product.name} quantity`} disabled={item.quantity >= item.product.stock} onClick={() => dispatch(updateCartItem({ productId: item.product._id, quantity: item.quantity + 1 }))}>+</button></div><small>{item.quantity >= item.product.stock ? "Max stock reached" : `${item.product.stock} in stock`}</small></div>
          <strong className="cart-item-price">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</strong>
        </article>)}
      </section>
      <aside className="order-summary cart-summary"><h2>Order summary</h2><div className="summary-line"><span>Subtotal</span><strong>₹{total.toLocaleString("en-IN")}</strong></div><div className="summary-line"><span>Delivery</span><strong className="free-label">FREE</strong></div><div className="summary-total"><span>Total</span><strong>₹{total.toLocaleString("en-IN")}</strong></div><p>Taxes included · Cash on delivery</p><Link className="button-link checkout-link" to="/checkout">Continue to checkout <span>→</span></Link><div className="checkout-promise">✓ &nbsp; Safe and secure checkout</div></aside>
    </div>}
  </main>;
}
