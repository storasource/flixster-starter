import { useEffect, useState } from "react"
import MovieCard from "./MovieCard"
import MovieModal from "./MovieModal"
import "./MovieList.css"

function MovieList() {
  const [movies, setMovies] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedMovieId, setSelectedMovieId] = useState(null)

  const apiKey = import.meta.env.VITE_API_KEY

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true)
        setError("")

        const endpoint = submittedQuery
          ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
              submittedQuery
            )}&page=${page}`
          : `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&page=${page}`

        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error("Could not load movies")
        }

        const data = await response.json()

        if (page === 1) {
          setMovies(data.results)
        } else {
          setMovies((previousMovies) => [
            ...previousMovies,
            ...data.results,
          ])
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [apiKey, submittedQuery, page])

  function handleSearch(event) {
    event.preventDefault()
    setSubmittedQuery(searchQuery.trim())
    setPage(1)
  }

  function handleShowNowPlaying() {
    setSearchQuery("")
    setSubmittedQuery("")
    setPage(1)
  }

  function handleLoadMore() {
    setPage((previousPage) => previousPage + 1)
  }

  function handleMovieSelect(movieId) {
    setSelectedMovieId(movieId)
  }

  function handleCloseModal() {
    setSelectedMovieId(null)
  }

  return (
    <section>
      <div className="movie-controls">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for a movie"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          <button type="submit">Search</button>
        </form>

        <button type="button" onClick={handleShowNowPlaying}>
          Now Playing
        </button>
      </div>

      <h2 className="movie-list-title">
        {submittedQuery
          ? `Search results for "${submittedQuery}"`
          : "Now Playing"}
      </h2>

      {error && <p className="status-message">{error}</p>}

      {!loading && !error && movies.length === 0 && (
        <p className="status-message">No movies found.</p>
      )}

      <div className="movie-list">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onMovieSelect={handleMovieSelect}
          />
        ))}
      </div>

      {loading && (
        <p className="status-message">Loading movies...</p>
      )}

      {!loading && !error && movies.length > 0 && (
        <button
          className="load-more-button"
          type="button"
          onClick={handleLoadMore}
        >
          Load More
        </button>
      )}

      {selectedMovieId && (
        <MovieModal
          movieId={selectedMovieId}
          onClose={handleCloseModal}
        />
      )}
    </section>
  )
}

export default MovieList