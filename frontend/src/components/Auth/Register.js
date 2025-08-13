import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register, authLoading, authError } = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(fullName, email, password);
      navigate("/");
    } catch (err) {
      // handled via context
    }
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#f6f8fc" }}>
      <style>{`
    .auth-shell { min-height: 100dvh; display: grid; place-items: center; padding: 24px; position: relative; overflow: hidden; }
  .auth-grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr; gap: 24px; max-width: 1040px; width: 100%; padding: 0 8px; box-sizing: border-box; }
        @media (min-width: 960px){ .auth-grid { grid-template-columns: 1.1fr 1fr; } }
        /* Light blue clouds background */
  .clouds { position:absolute; inset: -10% -5% -10% -5%; z-index: 0; pointer-events:none; filter: none; opacity: 0.18;
          background:
            /* base clouds */
            radial-gradient(ellipse 50% 32% at 12% 16%, rgba(186,218,255,0.95), rgba(186,218,255,0) 62%),
            radial-gradient(ellipse 46% 28% at 72% 14%, rgba(186,218,255,0.9), rgba(186,218,255,0) 62%),
            radial-gradient(ellipse 56% 34% at 28% 58%, rgba(186,218,255,0.9), rgba(186,218,255,0) 62%),
            radial-gradient(ellipse 48% 30% at 84% 66%, rgba(186,218,255,0.85), rgba(186,218,255,0) 62%),
            radial-gradient(ellipse 42% 28% at 56% 86%, rgba(186,218,255,0.8), rgba(186,218,255,0) 62%),
            /* more clouds */
            radial-gradient(ellipse 44% 26% at 8% 72%, rgba(186,218,255,0.9), rgba(186,218,255,0) 62%),
            radial-gradient(ellipse 40% 24% at 92% 82%, rgba(186,218,255,0.85), rgba(186,218,255,0) 62%),
            radial-gradient(ellipse 36% 24% at 44% 10%, rgba(186,218,255,0.85), rgba(186,218,255,0) 62%),
            radial-gradient(ellipse 34% 22% at 66% 44%, rgba(186,218,255,0.8), rgba(186,218,255,0) 62%);
          animation: cloudsFloat 60s ease-in-out infinite alternate;
        }
        @keyframes cloudsFloat {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(-28px) translateY(-6px); }
        }
    /* Crisp squared grid lines */
    .clouds-lines { position:absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 1; height: 100%;
          background:
      /* horizontal lines */
      repeating-linear-gradient(0deg, rgba(29,78,216,0.68) 0 2px, transparent 2px 140px),
      /* vertical lines */
      repeating-linear-gradient(90deg, rgba(29,78,216,0.58) 0 2px, transparent 2px 140px);
        }
        .hero {
          background: linear-gradient(135deg,#e0e7ff 0%, #f0fdf4 100%);
          border: 1px solid #dbeafe;
          border-radius: 20px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          min-height: 420px;
        }
        .hero::before{
          content: ""; position:absolute; inset:-10%;
          background: radial-gradient(closest-side, rgba(59,130,246,0.18), transparent 70%) -10% -10%/40% 60% no-repeat,
                      radial-gradient(closest-side, rgba(16,185,129,0.16), transparent 70%) 110% 10%/40% 60% no-repeat,
                      radial-gradient(closest-side, rgba(139,92,246,0.14), transparent 70%) 40% 120%/60% 50% no-repeat;
        }
        .hero-badge { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; background:#111827; color:#e5e7eb; font-weight:700; }
        .hero-title { margin:12px 0 8px; font-size:28px; font-weight:800; letter-spacing:-0.02em; color:#0f172a; }
        .hero-sub { color:#475569; max-width: 60ch; }
        .cta-pills { display:flex; gap:10px; margin-top:16px; flex-wrap:wrap; }
        .pill { border-radius:999px; padding:8px 12px; border:1px solid #c7d2fe; background:#fff; color:#334155; font-weight:600; }

  .card { background:#fff; border:1px solid #e5e7eb; border-radius:20px; box-shadow: 0 10px 30px rgba(2,6,23,0.06); padding: 28px; overflow:hidden; }
        .brand { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
        .brand h1 { margin:0; font-size:24px; font-weight:800; letter-spacing:-0.02em; color:#0f172a; }
  .brand-sub { color:#64748b; font-size: 13px; margin-top: 4px; margin-bottom: 12px; }
  label span { display:block; margin: 10px 0 8px; color:#334155; font-size: 12px; font-weight:600; }
  .field-wrap { position:relative; height:48px; }
  .field { width:100%; height:48px; line-height:48px; border-radius:12px; border:1px solid #e5e7eb; background:#fff; padding: 0 14px 0 62px; color:#0f172a; outline:none; transition: box-shadow .15s ease, border-color .15s ease; box-sizing: border-box; }
        .field::placeholder { color:#9ca3af; }
        .field:focus-visible { border-color:#60a5fa; box-shadow:0 0 0 3px rgba(59,130,246,0.18); }
  .icon { position:absolute; left:12px; top:calc(50% - 11px); transform: translateY(-50%); color:#94a3b8; pointer-events:none; width:34px; height:34px; display:flex; align-items:center; justify-content:center; }
  .icon svg { width:34px; height:34px; display:block; }
  .pw-toggle { position:absolute; right:8px; top:calc(50% - 2px); transform:translateY(-50%); border:0; background:transparent; padding:6px; cursor:pointer; color:#64748b; max-width:40px; }
  .group { display:block; }
  .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
  .form { display:grid; gap: 18px; }
  .row { display:flex; align-items:center; justify-content:flex-end; margin-top:4px; }
  .forgot { display:block; text-align:right; margin-top: 4px; }
        .link { color:#2563eb; text-decoration:none; font-weight:600; font-size:13px; }
        .link:hover { text-decoration: underline; }
  .submit { margin-top:12px; display:flex; gap:10px; }
        .btn-primary { flex:1; height:44px; border-radius:12px; border:0; background:linear-gradient(90deg,#2563eb,#7c3aed); color:#fff; font-weight:800; letter-spacing:.02em; cursor:pointer; box-shadow: 0 10px 22px rgba(37,99,235,.25); }
        .btn-primary:hover { filter:brightness(1.05); }
        .error { color:#dc2626; font-size:13px; margin-top:8px; }
      `}</style>

      <div className="auth-shell">
        <div className="clouds" aria-hidden />
        <div className="clouds-lines" aria-hidden />
        <div className="auth-grid">
          {/* Left hero panel */}
          <div className="hero" aria-hidden>
            <div className="hero-badge">Daily Dungeon</div>
            <h2 className="hero-title">Focus. Track. Improve.</h2>
            <p className="hero-sub">
              Stay consistent with a clean dashboard, smart timers, and friendly
              insights designed for your daily grind.
            </p>
            <div className="cta-pills">
              <div className="pill">Analytics</div>
              <div className="pill">Timer</div>
              <div className="pill">Journals</div>
              <div className="pill">Tasks</div>
            </div>
          </div>

          {/* Right sign-up card */}
          <div className="card" role="dialog" aria-labelledby="register-title">
            <div className="brand">
              <div>
                <h1 id="register-title">Create account</h1>
                <div className="brand-sub">Join and start tracking.</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <label className="group">
                <span>Name</span>
                <div className="field-wrap">
                  <span className="icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="3.5" stroke="#94a3b8" strokeWidth="1.6" />
                      <path d="M5 18.5c1.6-3 4.2-4.5 7-4.5s5.4 1.5 7 4.5" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    className="field"
                    type="text"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </label>

              <label className="group">
                <span>Email</span>
                <div className="field-wrap">
                  <span className="icon" aria-hidden>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 16V8a1.5 1.5 0 0 1 1.5-1.5Z"
                        stroke="#94a3b8"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M3.5 7.5 12 12.5l8.5-5"
                        stroke="#94a3b8"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    className="field"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="group">
                <span>Password</span>
                <div className="field-wrap">
                  <span className="icon" aria-hidden>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="4"
                        y="10.5"
                        width="16"
                        height="9"
                        rx="2"
                        stroke="#94a3b8"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M8 10.5v-2a4 4 0 1 1 8 0v2"
                        stroke="#94a3b8"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <input
                    className="field"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    title={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </label>

              <div className="submit">
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={authLoading}
                >
                  {authLoading ? "Creating account…" : "Create account"}
                </button>
              </div>
              {authError && (
                <div className="error" role="alert">
                  {authError}
                </div>
              )}
            </form>

            <div style={{ marginTop: 12, color: "#64748b", fontSize: 13 }}>
              Already have an account?{" "}
              <Link to="/login" className="link">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
