import React from "react";
import { useEffect, useState } from "react";
import api from "../../services/api";


export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data.users);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load users");
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      setMessage("Role updated");
      loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update role");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      setMessage("User deleted");
      loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete user");
    }
  };

  return (
    <main className="container admin-users-page">
      <h1>Manage users</h1>
      {message && <p>{message}</p>}
      {users.map((user) => (
        <div className="admin-manage-row user-manage-row" key={user._id}>
          <div className="manage-row-copy"><strong>{user.name}</strong><small>{user.email}</small></div>
          <div className="manage-row-actions user-manage-actions">
            <select value={user.role} onChange={(e) => changeRole(user._id, e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button className="danger" aria-label={`Delete ${user.name}`} onClick={() => deleteUser(user._id)}>Delete</button>
          </div>
        </div>
      ))}
    </main>
  );
}
