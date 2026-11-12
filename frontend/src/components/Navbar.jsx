import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { resetCart } from "../redux/slices/cartSlice";
import React, { useEffect, useState } from "react";
import { fetchCart } from "../redux/slices/cartSlice";

export default function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const cartCount = useSelector((state) => {
    const items = state.cart?.data?.items || [];
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [dispatch, user?.id]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link className="brand" to="/" onClick={() => setMenuOpen(false)}><span className="brand-mark">m</span><span>mini<span>shop</span></span></Link>
      <button className="menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
      {menuOpen && <button className="nav-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        {user && <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart  &#128722; <sup><span className="cart-count">{cartCount}</span></sup> </Link>}
        {user && <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>}
        {user && <Link to="/profile" onClick={() => setMenuOpen(false)}>Account</Link>}
        {user?.role === "admin" && <Link to="/admin" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
        {user ? (
          <>
            <span className="nav-greeting">Hello, {user.name}</span>
            <button className="secondary nav-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
