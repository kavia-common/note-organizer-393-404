import React from "react";

// PUBLIC_INTERFACE
function Navbar({ user, onLogout, onThemeToggle, theme }) {
  /** 
   * App navigation bar with brand, theme toggle, and auth status.
   * @param {object|null} user - Logged-in user (null if not logged in)
   * @param {function} onLogout - Callback to logout
   * @param {function} onThemeToggle - Callback to switch theme
   * @param {string} theme - "light" or "dark"
   */
  return (
    <nav className="navbar">
      <div className="navbar-brand">Notes App</div>
      <div className="navbar-actions">
        <button className="theme-toggle" aria-label="Toggle light/dark mode" onClick={onThemeToggle}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {user ? (
          <>
            <span className="navbar-user">{user.email}</span>
            <button className="btn btn-small" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <span className="navbar-user">Not signed in</span>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
