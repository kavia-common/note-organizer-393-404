import React, { useState } from "react";

// PUBLIC_INTERFACE
function AuthDialog({ open, onSubmit, onCancel, mode, loading, error }) {
  /**
   * Auth dialog for login/signup
   * @param {boolean} open - Show/hide dialog
   * @param {function} onSubmit - (email, password) => void
   * @param {function} onCancel
   * @param {string} mode - 'login' or 'signup'
   * @param {boolean} loading
   * @param {string|null} error
   */
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, pw);
  };

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{mode === "signup" ? "Sign Up" : "Sign In"}</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} required onChange={e => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={pw} required onChange={e => setPw(e.target.value)} />
          </label>
          <div className="modal-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Working..." : mode === "signup" ? "Sign Up" : "Sign In"}
            </button>
            <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
          </div>
          {error && <div className="auth-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default AuthDialog;
