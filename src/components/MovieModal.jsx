import { useEffect, useState } from "react"
import "./MovieModal.css"

function MovieModal({ movieId, onClose }) {
  const [movieDetails, setMovieDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const apiKey = import.meta.env.VITE_API_KEY

  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
        )

        if (!response.ok) {
          throw new Error("Could not load movie details")
        }

        const data = await response.json()
        setMovieDetails(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMovieDetails()
  }, [apiKey, movieId])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="movie-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-modal-title"
      >
        <button
          className="modal-close-button"
          type="button"
          onClick={onClose}
          aria-label="Close movie details"
        >
          ×
        </button>

        {loading && <p>Loading movie details...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && movieDetails && (
          <>
            {movieDetails.poster_path && (
              <img
                className="modal-poster"
                src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`}
                alt={`${movieDetails.title} poster`}
              />
            )}

            <div className="modal-info">
              <h2 id="movie-modal-title">{movieDetails.title}</h2>

              {movieDetails.tagline && (
                <p className="movie-tagline">{movieDetails.tagline}</p>
              )}

              <p>{movieDetails.overview || "No overview available."}</p>

              <p>
                <strong>Release date:</strong>{" "}
                {movieDetails.release_date || "Unknown"}
              </p>

              <p>
                <strong>Rating:</strong>{" "}
                {movieDetails.vote_average?.toFixed(1)} / 10
              </p>

              <p>
                <strong>Runtime:</strong>{" "}
                {movieDetails.runtime
                  ? `${movieDetails.runtime} minutes`
                  : "Unknown"}
              </p>

              <p>
                <strong>Genres:</strong>{" "}
                {movieDetails.genres?.length
                  ? movieDetails.genres
                      .map((genre) => genre.name)
                      .join(", ")
                  : "Unknown"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MovieModal