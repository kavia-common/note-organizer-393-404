import React from "react";

// PUBLIC_INTERFACE
function NotesList({
  notes,
  onNoteSelect,
  selectedNoteId,
  searchValue,
  onSearchChange,
  loading,
}) {
  /**
   * Renders notes list with search/filter.
   */
  return (
    <section className="notes-list-container">
      <input
        className="search-input"
        type="search"
        placeholder="Search notes..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {loading ? (
        <div className="notes-loading">Loading...</div>
      ) : (
        <ul className="notes-list">
          {notes.length === 0 && <li className="notes-empty">No notes found.</li>}
          {notes.map((note) => (
            <li
              key={note.id}
              className={
                "note-list-item" +
                (selectedNoteId === note.id ? " note-selected" : "")
              }
              onClick={() => onNoteSelect(note)}
              tabIndex={0}
              aria-label={`View note: ${note.title || "Untitled"}`}
            >
              <div className="note-title">{note.title || <em>Untitled</em>}</div>
              <div className="note-snippet">{note.content.slice(0, 60)}...</div>
              <div className="note-meta">
                <span className="note-category">{note.category || ""}</span>
                {note.tags && note.tags.length > 0 && (
                  <span className="note-tags">
                    {note.tags.map((t) => (
                      <span key={t} className="note-tag">{t}</span>
                    ))}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
export default NotesList;
