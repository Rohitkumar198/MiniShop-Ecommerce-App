import React, { useEffect, useState } from "react";
import api from "../../services/api";

const activeStatuses = ["processing", "shipped", "delivered", "cancelled"];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const loadOrders = async () => {
    try {
      const { data } = await api.get("/orders/admin/all");
      setOrders(data.orders);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load orders.");
    } finally { setLoading(false); }
  };
  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      await loadOrders();
    } catch (error) { setMessage(error.response?.data?.message || "Could not update order."); }
  };

  const deleteOrder = async (order) => {
    if (!window.confirm(`Permanently delete order #${order._id.slice(-8).toUpperCase()}?`)) return;
    setDeletingId(order._id);
    try {
      await api.delete(`/orders/admin/${order._id}`);
      await loadOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete order.");
    } finally {
      setDeletingId(null);
    }
  };

  return <main className="container admin-orders-page">
    <div className="page-heading"><div><p className="eyebrow">STORE OPERATIONS</p><h1>Manage orders</h1></div><span className="admin-count">{orders.length} total</span></div>
    {message && <p className={loading ? "" : "error"}>{message}</p>}
    {loading && <p>Loading orders…</p>}
    {!loading && !orders.length && !message && <div className="empty-state"><span>📦</span><h2>No orders yet</h2><p>New customer orders will appear here.</p></div>}
    <div className="admin-order-list">{orders.map((order) => <section className="admin-order-card" key={order._id}>
      <div className="order-card-top"><div><strong>#{order._id.slice(-8).toUpperCase()}</strong><p>{order.user?.name || "Deleted customer"} · {order.user?.email || ""}</p></div><div className="admin-order-top-actions"><span className={`status-pill status-${order.status}`}>{order.status}</span><button className="danger" disabled={deletingId === order._id} onClick={() => deleteOrder(order)}>{deletingId === order._id ? "Deleting…" : "Delete"}</button></div></div>
      <div className="admin-order-content"><div>{order.items.map((item) => <p key={item.product}>{item.name} <span className="muted">× {item.quantity}</span></p>)}</div><div><strong>₹{order.total.toLocaleString("en-IN")}</strong><small>Cash on delivery</small></div></div>
      <div className="order-card-bottom"><span>{order.shippingAddress ? `${order.shippingAddress.city}, ${order.shippingAddress.state}` : "Delivery address unavailable"} · {new Date(order.createdAt).toLocaleDateString("en-IN")}</span><label className="status-control">Update status <select disabled={["delivered", "cancelled"].includes(order.status)} value={activeStatuses.includes(order.status) ? order.status : ""} onChange={(event) => updateStatus(order._id, event.target.value)}><option value="">Select status</option>{activeStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label></div>
    </section>)}</div>
  </main>;
}
