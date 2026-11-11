import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../services/api";
import { fetchProducts } from "../../redux/slices/productSlice";

const emptyForm = { name: "", description: "", price: "", image: "", category: "General", stock: 0 };

export default function ManageProducts() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.products);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const load = () => dispatch(fetchProducts());
  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editingId) await api.put(`/products/${editingId}`, payload);
      else await api.post("/products", payload);
      setForm(emptyForm);
      setEditingId(null);
      setMessage(editingId ? "Product updated" : "Product created");
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save product");
    }
  };

  const edit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name, description: product.description || "",
      price: product.price, image: product.image || "",
      category: product.category || "General", stock: product.stock
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage("Product deleted");
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete product");
    }
  };

  return (
    <main className="container admin-products-page">
      <h1>Manage products</h1>
      <form className="form-card admin-form product-admin-form" onSubmit={submit}>
        <div className="admin-form-heading"><div><p className="eyebrow">CATALOG</p><h2>{editingId ? "Edit product" : "Add a product"}</h2><p>Fill in the product details for your shop.</p></div><span className="form-heading-icon">＋</span></div>
        <div className="product-fields">
          {[["name", "Product name", "text", "e.g. Wireless headphones"], ["category", "Category", "text", "e.g. Electronics"], ["price", "Price (₹)", "number", "0.00"], ["stock", "Available stock", "number", "Quantity"], ["image", "Image URL", "url", "https://example.com/image.jpg"], ["description", "Description", "textarea", "Describe the product for your customers"]].map(([field, label, type, placeholder]) => (
            <label className={`product-field ${["image", "description"].includes(field) ? "product-field-wide" : ""}`} key={field}>
              <span>{label}{["name", "price"].includes(field) && <b> *</b>}</span>
              {type === "textarea" ? <textarea rows="4" placeholder={placeholder} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} /> : <input required={["name", "price"].includes(field)} type={type} min={type === "number" ? "0" : undefined} step={field === "price" ? "0.01" : undefined} placeholder={placeholder} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />}
            </label>
          ))}
        </div>
        {message && <p className="form-feedback" role="status">{message}</p>}
        <div className="product-form-actions">
          <button>{editingId ? "Save changes" : "Add product"}</button>
          {editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
        </div>
      </form>

      <div className="collection-heading existing-products-heading"><div><p className="eyebrow">IN YOUR STORE</p><h2>Existing products</h2></div><span>{items.length} products</span></div>
      <div className="admin-list">
        {items.map((product) => (
          <div className="admin-manage-row product-manage-row" key={product._id}>
            <div className="manage-row-copy"><strong>{product.name}</strong><small>₹{product.price.toLocaleString("en-IN")} · {product.stock} in stock</small></div>
            <div className="manage-row-actions">
              <button className="secondary" onClick={() => edit(product)}>Edit</button>
              <button className="danger" onClick={() => remove(product._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
