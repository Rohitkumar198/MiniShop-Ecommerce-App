import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return <footer className="site-footer">
    <div className="footer-inner"><div><Link className="brand footer-brand" to="/"><span className="brand-mark">m</span><span>mini<span>shop</span></span></Link><p>Little things that make every day better.</p></div><div className="footer-links"><Link to="/">Shop</Link><Link to="/cart">Your cart</Link><Link to="/orders">Order tracking</Link></div><small>© {new Date().getFullYear()} MiniShop. Made for everyday finds.</small></div>
  </footer>;
}
