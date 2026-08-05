import "./MovieCard.css"

function MovieCard({ movie, onMovieSelect }) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://placehold.co/500x750?text=No+Poster"

  function handleClick() {
    onMovieSelect(movie.id)
  }

  return (
    <button
      className="movie-card"
      type="button"
      onClick={handleClick}
    >
      <img
        className="movie-poster"
        src={posterUrl}
        alt={`${movie.title} poster`}
      />

      <div className="movie-card-info">
        <h2>{movie.title}</h2>
        <p>Rating: {movie.vote_average.toFixed(1)} / 10</p>
      </div>
    </button>
  )
}

export default MovieCard