import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, authLoading, authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      // handled via context
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="card" style={{ maxWidth: 420, margin: "2rem auto" }}>
        <h2 style={{ marginTop: 0 }}>Login</h2>
        <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
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
            {authLoading ? "Signing in..." : "Login"}
          </button>
          {authError && <div className="error">{authError}</div>}
          <div className="muted" style={{ marginTop: 4 }}>
            <span>Don't have an account? </span>
            <Link to="/register">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
