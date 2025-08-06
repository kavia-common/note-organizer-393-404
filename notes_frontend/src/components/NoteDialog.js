import React, { useState, useEffect } from "react";

// PUBLIC_INTERFACE
function NoteDialog({ open, mode, note, categories, allTags, onSave, onCancel, saving }) {
  /**
   * Dialog to create or edit a note.
   * @param {boolean} open - If the dialog/modal is open
   * @param {"create"|"edit"} mode - Mode of dialog, create or edit
   * @param {object|null} note - Note to edit, or null
   * @param {string[]} categories - All category options
   * @param {string[]} allTags - All unique tags
   * @param {function} onSave - Callback(newNoteObj)
   * @param {function} onCancel - Callback()
   * @param {boolean} saving - Whether form is saving
   */
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [category, setCategory] = useState(note?.category || "");
  const [tags, setTags] = useState(note?.tags ? note.tags.join(", ") : "");

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setCategory(note.category || "");
      setTags(note.tags ? note.tags.join(", ") : "");
    } else {
      setTitle("");
      setContent("");
      setCategory("");
      setTags("");
    }
  }, [note, open]);

  const handleSave = (e) => {
    e.preventDefault();
    // Tags as array, comma split
    const tagsArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    onSave({
      ...note,
      title,
      content,
      category,
      tags: tagsArr,
    });
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} tabIndex={-1}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{mode === "edit" ? "Edit Note" : "New Note"}</h2>
        <form className="note-form" onSubmit={handleSave}>
          <label>
            Title
            <input value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          </label>
          <label>
            Content
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} />
          </label>
          <label>
            Category
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">--None--</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Tags (comma separated)
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. work, todo" />
          </label>
          <div className="modal-actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn btn-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NoteDialog;
