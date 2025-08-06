import React from "react";

// PUBLIC_INTERFACE
function Sidebar({ categories, selectedCategory, onCategorySelect, tags, selectedTag, onTagSelect, onNewNote, onNewCategory }) {
  /**
   * Responsive sidebar for categories/tags and quick actions.
   */

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-header">
          <span>Categories</span>
          <button className="btn btn-small" onClick={onNewCategory}>+</button>
        </div>
        <ul className="sidebar-list">
          <li className={!selectedCategory ? "active" : ""} onClick={() => onCategorySelect(null)}>All</li>
          {categories.map((cat) => (
            <li
              key={cat}
              className={selectedCategory === cat ? "active" : ""}
              onClick={() => onCategorySelect(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>
      <div className="sidebar-section">
        <div className="sidebar-header">
          <span>Tags</span>
        </div>
        <ul className="sidebar-list">
          <li className={!selectedTag ? "active" : ""} onClick={() => onTagSelect(null)}>All</li>
          {tags.map((tag) => (
            <li
              key={tag}
              className={selectedTag === tag ? "active" : ""}
              onClick={() => onTagSelect(tag)}
            >{tag}</li>
          ))}
        </ul>
      </div>
      <div className="sidebar-section">
        <button className="btn btn-large" onClick={onNewNote} style={{ width: "100%" }}>
          + New Note
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
