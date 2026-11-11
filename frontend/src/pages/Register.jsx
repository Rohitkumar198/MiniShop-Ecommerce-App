import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slices/authSlice";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) navigate("/");
  };

  return (
    <main className="auth-page">
      <section className="auth-promo"><p className="eyebrow">YOUR EVERYDAY, UPGRADED</p><h1>Find the little<br /><span>things you love.</span></h1><p>Create an account for a smoother way to shop and track your orders.</p><div className="auth-promo-stamp">m<span>✦</span></div></section>
      <form className="form-card auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">JOIN THE GOOD FINDS</p><h2>Create your account</h2><p className="auth-subtitle">It only takes a minute to get started.</p>
        <label>Your name<input autoComplete="name" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Email address<input type="email" autoComplete="email" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password <span className="field-hint">At least 6 characters</span><input type="password" autoComplete="new-password" minLength="6" required value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {error && <p className="error">{error}</p>}
        <button disabled={loading}>{loading ? "Please wait..." : "Register"}</button>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </main>
  );
}
