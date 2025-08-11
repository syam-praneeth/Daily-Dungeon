import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register, authLoading, authError } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate("/");
    } catch {}
  };

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="card" style={{ maxWidth: 420, margin: "2rem auto" }}>
        <h2 style={{ marginTop: 0 }}>Register</h2>
        <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
          <label>
            <span>Name</span>
            <input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="btn" type="submit" disabled={authLoading}>
            {authLoading ? "Creating..." : "Register"}
          </button>
          {authError && <div className="error">{authError}</div>}
          <div className="muted" style={{ marginTop: 4 }}>
            <span>Already have an account? </span>
            <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
