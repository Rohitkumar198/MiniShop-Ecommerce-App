import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/slices/authSlice";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      navigate(result.payload.user.role === "admin" ? "/admin" : "/");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-promo"><p className="eyebrow">A LITTLE JOY, EVERY DAY</p><h1>Good finds.<br /><span>Better days.</span></h1><p>Sign in to keep your favorites close and your orders easy to follow.</p><div className="auth-promo-stamp">m<span>✦</span></div></section>
      <form className="form-card auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">WELCOME BACK</p><h2>Sign in to MiniShop</h2><p className="auth-subtitle">Your next favorite find is waiting.</p>
        <label>Email address<input type="email" autoComplete="email" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {error && <p className="error">{error}</p>}
        <button disabled={loading}>{loading ? "Please wait..." : "Login"}</button>
        <p className="auth-switch">New to MiniShop? <Link to="/register">Create an account</Link></p>
      </form>
    </main>
  );
}
