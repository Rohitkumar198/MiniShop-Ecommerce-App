import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/slices/productSlice";
import ProductCard from "../components/ProductCard";
import React from "react";

export default function Home() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...new Set(items.map((item) => item.category).filter(Boolean))], [items]);
  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesSearch = `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (category === "All" || item.category === category);
  }), [items, search, category]);

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  return (
    <main className="container">
      <section className="shop-hero"><div><p className="eyebrow">EVERYDAY FINDS, BETTER PRICES</p><h1>Find your next<br /><span>favorite thing.</span></h1><p>Thoughtful picks for your home, work, and every day.</p></div><div className="hero-art" aria-hidden="true"><span>✦</span><strong>MINI<br />FINDS</strong><small>BIG JOY</small></div></section>
      <div className="shop-toolbar"><label className="search-box"><span>⌕</span><input style={{outline:"none"}} aria-label="Search products" placeholder="Search products…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><div className="category-filters" aria-label="Filter by category">{categories.map((value) => <button type="button" className={category === value ? "filter-chip active" : "filter-chip"} key={value} onClick={() => setCategory(value)}>{value}</button>)}</div></div>
      {loading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && items.length === 0 && <p>No products yet. Admin can add products.</p>}
      {!loading && items.length > 0 && filteredItems.length === 0 && <p>No products match your search.</p>}
      {!loading && filteredItems.length > 0 && <div className="collection-heading"><div><p className="eyebrow">MADE FOR EVERYDAY</p><h2>Shop the collection</h2></div><span>{filteredItems.length} products</span></div>}
      <div className="product-grid">
        {filteredItems.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </main>
  );
}
