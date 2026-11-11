import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";

const statuses = ["placed", "processing", "shipped", "delivered"];
const formatDate = (date) => new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  useEffect(() => {
    let active = true;
    api.get(`/orders/${id}`).then(({ data }) => { if (active) setOrder(data.order); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Could not load this order."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  const currentStep = order ? statuses.indexOf(order.status) : -1;

  const cancelOrder = async () => {
    if (!window.confirm("Cancel this order? The items will be returned to stock.")) return;
    setCancelling(true);
    setActionError("");
    try {
      const { data } = await api.patch(`/orders/${id}/cancel`);
      setOrder(data.order);
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || "Could not cancel this order.");
    } finally {
      setCancelling(false);
    }
  };

  const deleteCancelledOrder = async () => {
    if (!window.confirm("Permanently delete this cancelled order from your order history?")) return;
    setDeleting(true);
    setActionError("");
    try {
      await api.delete(`/orders/${id}`);
      navigate("/orders", { replace: true });
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || "Could not delete this order.");
    } finally {
      setDeleting(false);
    }
  };

  return <main className="container order-detail-page">
    <Link to="/orders">← My orders</Link>
    {loading && <p>Loading order…</p>}
    {error && <p className="error">{error}</p>}
    {order && <>
      {location.state?.justPlaced && order.status !== "cancelled" && <section className="order-confirmation"><span>✓</span><div><h2>Thank you. Your order is confirmed.</h2><p>We’ll deliver it to you as soon as possible.</p></div></section>}
      <div className="page-heading"><div><p className="eyebrow">ORDER #{order._id.slice(-8).toUpperCase()}</p><h1>Order details</h1></div><div className="order-detail-actions"><span className={`status-pill status-${order.status}`}>{order.status}</span>{user?.role !== "admin" && ["placed", "processing"].includes(order.status) && <button className="danger" disabled={cancelling} onClick={cancelOrder}>{cancelling ? "Cancelling…" : "Cancel order"}</button>}{user?.role !== "admin" && order.status === "cancelled" && <button className="danger" disabled={deleting} onClick={deleteCancelledOrder}>{deleting ? "Deleting…" : "Delete order"}</button>}</div></div>
      {actionError && <p className="error form-message">{actionError}</p>}
      <p className="muted">Placed {formatDate(order.createdAt)}</p>
      {order.status === "cancelled" ? <div className="status-banner">This order was cancelled.</div> : <div className="tracking-steps">{statuses.map((status, index) => <div className={`tracking-step ${index <= currentStep ? "complete" : ""}`} key={status}><span>{index < currentStep ? "✓" : index + 1}</span><small>{status}</small></div>)}</div>}
      <div className="order-detail-grid">
        <section className="panel"><h2>Items</h2>{order.items.map((item) => <div className="summary-line order-item" key={item.product}><span>{item.name}<small>Qty {item.quantity} · ₹{item.price} each</small></span><strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong></div>)}<div className="summary-total"><span>Total</span><strong>₹{order.total.toLocaleString("en-IN")}</strong></div></section>
        <aside className="panel"><h2>Delivery</h2>{order.shippingAddress ? <><p><strong>{order.shippingAddress.fullName}</strong></p><p>{order.shippingAddress.addressLine}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p><p>Phone: {order.shippingAddress.phone}</p></> : <p>Delivery details were not saved for this order.</p>}<hr /><h3>Payment</h3><p>Cash on delivery</p></aside>
      </div>
    </>}
  </main>;
}
