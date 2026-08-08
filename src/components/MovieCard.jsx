import "./MovieCard.css"

function MovieCard({
  movie,
  onMovieSelect,
  isFavorite,
  isWatched,
  onToggleFavorite,
  onToggleWatched,
}) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://placehold.co/500x750?text=No+Poster"

  function handleFavorite(event) {
    event.stopPropagation()
    onToggleFavorite(movie)
  }

  function handleWatched(event) {
    event.stopPropagation()
    onToggleWatched(movie)
  }

  return (
    <article className="movie-card">
      <button
        className="poster-button"
        type="button"
        onClick={() => onMovieSelect(movie.id)}
        aria-label={`View details for ${movie.title}`}
      >
        <img
          className="movie-poster"
          src={posterUrl}
          alt={`${movie.title} poster`}
        />
      </button>

      <div className="movie-card-info">
        <div>
          <h2>{movie.title}</h2>

          <p>
            ⭐ {movie.vote_average?.toFixed(1) || "N/A"} / 10
          </p>
        </div>

        <div className="movie-card-actions">
          <button
            type="button"
            className={isFavorite ? "active-action" : ""}
            onClick={handleFavorite}
            aria-pressed={isFavorite}
          >
            {isFavorite ? "♥ Favorited" : "♡ Favorite"}
          </button>

          <button
            type="button"
            className={isWatched ? "active-action" : ""}
            onClick={handleWatched}
            aria-pressed={isWatched}
          >
            {isWatched ? "✓ Watched" : "Mark Watched"}
          </button>
        </div>
      </div>
    </article>
  )
}

export default MovieCard