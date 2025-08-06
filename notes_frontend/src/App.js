import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import NotesList from "./components/NotesList";
import NoteDialog from "./components/NoteDialog";
import AuthDialog from "./components/AuthDialog";

/**
 * App integrates authentication, note CRUD, theme, filtering, and responsive modern minimalist UI.
 */
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000"; // adjust if needed

// Helpers
function getAuthHeaders(jwt) {
  return jwt
    ? {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
      }
    : { "Content-Type": "application/json" };
}

// PUBLIC_INTERFACE
function App() {
  // App State
  const [theme, setTheme] = useState(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);

  // Notes State
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);

  // UI Dialogs
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [editNoteObj, setEditNoteObj] = useState(null);
  const [noteDialogMode, setNoteDialogMode] = useState("create"); //'edit'|'create'
  const [savingNote, setSavingNote] = useState(false);

  const [showCategoryDialog, setShowCategoryDialog] = useState(false); // future: custom modal
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // or 'signup'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Moved selectedNote to hook top-level
  const [selectedNote, setSelectedNote] = useState(null);

  // Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // On mount restore auth (optional: implement persistent login)
  useEffect(() => {
    // Try to get from localStorage, otherwise skip
    const token = localStorage.getItem("jwt");
    if (token) {
      setJwt(token);
      fetchWhoAmI(token);
    }
    // Fetch categories and tags (empty state is ok)
    if (!user) return;
    fetchCategories(token || jwt);
    fetchTags(token || jwt);
    // eslint-disable-next-line
  }, [user]);

  // Notes load (category/tag/search)
  useEffect(() => {
    if (!jwt) return;
    fetchNotes();
    // eslint-disable-next-line
  }, [selectedCategory, selectedTag, searchVal, jwt]);

  // ---- API Integration ----

  // User WhoAmI
  function fetchWhoAmI(token) {
    fetch(API_BASE + "/auth/whoami", {
      method: "GET",
      headers: getAuthHeaders(token)
    })
      .then((res) => res.ok ? res.json() : null)
      .then((res) => { if (res && res.email) setUser(res); })
      .catch(() => setUser(null));
  }

  // Login/signup handler
  function handleAuth(email, password) {
    setAuthError(null);
    setAuthLoading(true);
    fetch(API_BASE + `/auth/${authMode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
      .then((res) => {
        if (res.token) {
          setJwt(res.token);
          localStorage.setItem("jwt", res.token);
          setUser({ email }); // will revalidate via whoami next render
          setShowAuthDialog(false);
        } else {
          setAuthError("Login/Signup failed");
        }
      })
      .catch((err) => setAuthError((err && err.message) || "Authentication failed"))
      .finally(() => setAuthLoading(false));
  }

  // Logout (clear user/jwt)
  function handleLogout() {
    setUser(null);
    setJwt(null);
    localStorage.removeItem("jwt");
  }

  // Notes fetch (category, tag, search as query)
  function fetchNotes() {
    if (!jwt) return;
    setLoadingNotes(true);
    const params = [];
    if (selectedCategory) params.push(`category=${encodeURIComponent(selectedCategory)}`);
    if (selectedTag) params.push(`tag=${encodeURIComponent(selectedTag)}`);
    if (searchVal) params.push(`search=${encodeURIComponent(searchVal)}`);
    const qs = params.length ? "?" + params.join("&") : "";
    fetch(API_BASE + "/notes" + qs, {
      headers: getAuthHeaders(jwt),
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setNotes(Array.isArray(data) ? data : []))
      .finally(() => setLoadingNotes(false));
  }

  // Get all categories (current user)
  function fetchCategories(token) {
    fetch(API_BASE + "/notes/categories", {
      headers: getAuthHeaders(token),
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setCategories(Array.isArray(data) ? data : []));
  }

  // Get all tags (current user)
  function fetchTags(token) {
    fetch(API_BASE + "/notes/tags", {
      headers: getAuthHeaders(token),
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setTags(Array.isArray(data) ? data : []));
  }

  // Note Save (create or edit)
  function handleSaveNote(noteObj) {
    setSavingNote(true);
    const method = noteObj.id ? "PUT" : "POST";
    const url = noteObj.id ? `/notes/${noteObj.id}` : "/notes";
    fetch(API_BASE + url, {
      method,
      headers: getAuthHeaders(jwt),
      body: JSON.stringify(noteObj),
    })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then(() => {
        setShowNoteDialog(false);
        setEditNoteObj(null);
        fetchNotes();
      })
      .catch(() => alert("Failed to save note"))
      .finally(() => setSavingNote(false));
  }

  // Delete note
  function handleDeleteNote(noteId) {
    if (!window.confirm("Delete note?")) return;
    fetch(API_BASE + `/notes/${noteId}`, {
      method: "DELETE",
      headers: getAuthHeaders(jwt),
    })
      .then((res) => res.ok ? fetchNotes() : Promise.reject())
      .catch(() => alert("Failed to delete note"));
  }

  // Add new category
  function handleCreateCategory(catName) {
    if (!jwt || !catName) return;
    fetch(API_BASE + "/notes/categories", {
      method: "POST",
      headers: getAuthHeaders(jwt),
      body: JSON.stringify({ name: catName }),
    })
      .then((res) => res.ok ? fetchCategories(jwt) : Promise.reject())
      .catch(() => alert("Failed to create category"));
    setShowCategoryDialog(false);
  }

  // Main render
  if (!user) {
    return (
      <div className="App">
        <Navbar user={null} onThemeToggle={() => setTheme(theme === "light" ? "dark" : "light")} theme={theme} />
        <main className="unauth-main">
          <h1>Welcome to Notes App</h1>
          <p className="description">Modern minimalist note-taking. Please log in or sign up to continue.</p>
          <button className="btn btn-large" onClick={() => { setShowAuthDialog(true); setAuthMode("login"); }}>
            Sign In
          </button>
          <button className="btn btn-secondary btn-large" onClick={() => { setShowAuthDialog(true); setAuthMode("signup"); }}>
            Sign Up
          </button>
        </main>
        <AuthDialog
          open={showAuthDialog}
          mode={authMode}
          onSubmit={handleAuth}
          onCancel={() => setShowAuthDialog(false)}
          loading={authLoading}
          error={authError}
        />
      </div>
    );
  }

  // All tags in all notes, for tag recommendations/etc
  const allNoteTags = Array.from(new Set([].concat(...notes.map(n => n.tags || []), tags)));

  // Panel State moved to the top-level, not inside render
  // (Previously, this was conditionally called inside render, which is incorrect)
  
  // (inserted above)
  // const [selectedNote, setSelectedNote] = useState(null);

  return (
    <div className="App app-flex">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onThemeToggle={() => setTheme(theme === "light" ? "dark" : "light")}
        theme={theme}
      />
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        tags={tags}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        onNewNote={() => { setShowNoteDialog(true); setNoteDialogMode("create"); setEditNoteObj(null); }}
        onNewCategory={() => setShowCategoryDialog(true)}
      />
      <main className="notes-main">
        <NotesList
          notes={notes}
          onNoteSelect={(note) => setSelectedNote(note)}
          selectedNoteId={selectedNote?.id}
          searchValue={searchVal}
          onSearchChange={setSearchVal}
          loading={loadingNotes}
        />
        <section className="note-details-panel">
          {selectedNote ? (
            <div className="note-details">
              <h2>{selectedNote.title || "Untitled"}</h2>
              <div className="note-meta">
                <span className="note-category">{selectedNote.category}</span>
                <span className="note-tags">{(selectedNote.tags || []).map(t => <span key={t} className="note-tag">{t}</span>)}</span>
              </div>
              <pre className="note-content" style={{ whiteSpace: "pre-wrap" }}>{selectedNote.content}</pre>
              <div className="note-actions">
                <button
                  className="btn btn-small"
                  onClick={() => { setEditNoteObj(selectedNote); setNoteDialogMode("edit"); setShowNoteDialog(true); }}>
                  Edit
                </button>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => handleDeleteNote(selectedNote.id)}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="note-placeholder">
              <em>Select a note to view.</em>
            </div>
          )}
        </section>
        <NoteDialog
          open={showNoteDialog}
          mode={noteDialogMode}
          note={editNoteObj}
          categories={categories}
          allTags={allNoteTags}
          onSave={handleSaveNote}
          onCancel={() => setShowNoteDialog(false)}
          saving={savingNote}
        />
        {/* Minimalist category add dialog; can refactor to standalone modal if desired */}
        {showCategoryDialog && (
          <div className="modal-overlay" onClick={() => setShowCategoryDialog(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Add Category</h2>
              <input
                className="category-input"
                type="text"
                placeholder="Category name"
                onKeyDown={e => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    handleCreateCategory(e.target.value.trim());
                  }
                  if (e.key === "Escape") setShowCategoryDialog(false);
                }}
                autoFocus
              />
              <div className="modal-actions">
                <button
                  className="btn"
                  onClick={() => {
                    const input = document.querySelector('.category-input');
                    if (input && input.value.trim()) handleCreateCategory(input.value.trim());
                  }}
                  >Add</button>
                <button className="btn btn-secondary" onClick={() => setShowCategoryDialog(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
