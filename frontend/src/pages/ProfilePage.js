import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const save = (e) => {
    e.preventDefault();
    // TODO: implement profile save endpoint
    alert("Profile saved (mock).");
  };

  return (
    <div className="container">
      <h2>Profile & Settings</h2>
      <div className="card">
        <form onSubmit={save} className="grid">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
