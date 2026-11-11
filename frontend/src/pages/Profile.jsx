import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  return (
    <main className="container">
      <div className="page-heading"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>My profile</h1></div><Link to="/orders">View my orders →</Link></div>
      <section className="profile-card"><div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div><div className="profile-main"><p className="eyebrow">ACCOUNT DETAILS</p><h2>{user?.name}</h2><p>{user?.email}</p><span className="profile-role">{user?.role === "admin" ? "Store administrator" : "MiniShop customer"}</span></div><Link className="button-link profile-orders" to="/orders">Track your orders</Link></section>
    </main>
  );
}
