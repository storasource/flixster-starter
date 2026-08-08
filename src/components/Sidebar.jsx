import "./Sidebar.css"

function Sidebar({
  activeFilter,
  onChangeFilter,
  favoriteCount,
  watchedCount,
}) {
  return (
    <aside className="sidebar">
      <h2>Browse</h2>

      <button
        type="button"
        className={activeFilter === "browse" ? "sidebar-active" : ""}
        onClick={() => onChangeFilter("browse")}
      >
        🎬 Now Playing
      </button>

      <h2>My Library</h2>

      <button
        type="button"
        className={activeFilter === "favorites" ? "sidebar-active" : ""}
        onClick={() => onChangeFilter("favorites")}
      >
        ♥ Favorites
        <span>{favoriteCount}</span>
      </button>

      <button
        type="button"
        className={activeFilter === "watched" ? "sidebar-active" : ""}
        onClick={() => onChangeFilter("watched")}
      >
        ✓ Watched
        <span>{watchedCount}</span>
      </button>
    </aside>
  )
}

export default Sidebar