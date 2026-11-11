import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api.get("/orders/mine").then(({ data }) => setOrders(data.orders))
      .catch((requestError) => setError(requestError.response?.data?.message || "Could not load your orders."))
      .finally(() => setLoading(false));
  }, []);

  return <main className="container">
    <div className="page-heading"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>My orders</h1></div><Link to="/">Continue shopping →</Link></div>
    {loading && <p>Loading your orders…</p>}
    {error && <p className="error">{error}</p>}
    {!loading && !error && orders.length === 0 && <section className="empty-state"><span>📦</span><h2>No orders yet</h2><p>Your orders will appear here after checkout.</p><Link className="button-link" to="/">Explore products</Link></section>}
    <div className="order-list">{orders.map((order) => <Link className="order-card" to={`/orders/${order._id}`} key={order._id}>
      <div className="order-card-top"><span>Order <strong>#{order._id.slice(-8).toUpperCase()}</strong></span><span className={`status-pill status-${order.status}`}>{order.status}</span></div>
      <p>{formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? "item" : "items"}</p>
      <div className="order-card-bottom"><span>{order.items.slice(0, 2).map((item) => item.name).join(", ")}{order.items.length > 2 ? ` +${order.items.length - 2} more` : ""}</span><strong>₹{order.total.toLocaleString("en-IN")}</strong></div>
    </Link>)}</div>
  </main>;
}
