import { useEffect, useState } from "react"
import MovieCard from "./MovieCard"
import MovieModal from "./MovieModal"
import Sidebar from "./Sidebar"
import "./MovieList.css"

function MovieList() {
  const [movies, setMovies] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedMovieId, setSelectedMovieId] = useState(null)
  const [sortOption, setSortOption] = useState("default")
  const [activeFilter, setActiveFilter] = useState("browse")

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("flixster-favorites")
      ) || []
    } catch {
      return []
    }
  })

  const [watchedMovies, setWatchedMovies] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("flixster-watched")
      ) || []
    } catch {
      return []
    }
  })

  const apiKey = import.meta.env.VITE_API_KEY

  useEffect(() => {
    localStorage.setItem(
      "flixster-favorites",
      JSON.stringify(favorites)
    )
  }, [favorites])

  useEffect(() => {
    localStorage.setItem(
      "flixster-watched",
      JSON.stringify(watchedMovies)
    )
  }, [watchedMovies])

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
    setSortOption("default")
    setActiveFilter("browse")
  }

  function handleShowNowPlaying() {
    setSearchQuery("")
    setSubmittedQuery("")
    setPage(1)
    setSortOption("default")
    setActiveFilter("browse")
  }

  function handleFilterChange(filter) {
    if (filter === "browse") {
      handleShowNowPlaying()
      return
    }

    setActiveFilter(filter)
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

  function handleToggleFavorite(movie) {
    setFavorites((previousFavorites) => {
      const exists = previousFavorites.some(
        (favorite) => favorite.id === movie.id
      )

      if (exists) {
        return previousFavorites.filter(
          (favorite) => favorite.id !== movie.id
        )
      }

      return [...previousFavorites, movie]
    })
  }

  function handleToggleWatched(movie) {
    setWatchedMovies((previousWatched) => {
      const exists = previousWatched.some(
        (watched) => watched.id === movie.id
      )

      if (exists) {
        return previousWatched.filter(
          (watched) => watched.id !== movie.id
        )
      }

      return [...previousWatched, movie]
    })
  }

  function isMovieFavorite(movieId) {
    return favorites.some((movie) => movie.id === movieId)
  }

  function isMovieWatched(movieId) {
    return watchedMovies.some((movie) => movie.id === movieId)
  }

  let displayedMovies = movies

  if (activeFilter === "favorites") {
    displayedMovies = favorites
  }

  if (activeFilter === "watched") {
    displayedMovies = watchedMovies
  }

  const sortedMovies = [...displayedMovies].sort(
    (movieA, movieB) => {
      if (sortOption === "title") {
        return movieA.title.localeCompare(movieB.title)
      }

      if (sortOption === "rating") {
        return (
          (movieB.vote_average || 0) -
          (movieA.vote_average || 0)
        )
      }

      if (sortOption === "release-date") {
        return (movieB.release_date || "").localeCompare(
          movieA.release_date || ""
        )
      }

      return 0
    }
  )

  let title = "Now Playing"

  if (submittedQuery && activeFilter === "browse") {
    title = `Search results for "${submittedQuery}"`
  }

  if (activeFilter === "favorites") {
    title = "My Favorites"
  }

  if (activeFilter === "watched") {
    title = "Watched Movies"
  }

  return (
    <div className="movie-page">
      <Sidebar
        activeFilter={activeFilter}
        onChangeFilter={handleFilterChange}
        favoriteCount={favorites.length}
        watchedCount={watchedMovies.length}
      />

      <section className="movie-content">
        <div className="movie-controls">
          <form
            className="search-form"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search for a movie"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />

            <button type="submit">
              Search
            </button>
          </form>

          <button
            type="button"
            onClick={handleShowNowPlaying}
          >
            Now Playing
          </button>

          <label className="sort-control">
            Sort by

            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value)
              }
            >
              <option value="default">Default</option>
              <option value="title">Title A-Z</option>
              <option value="rating">Highest Rating</option>
              <option value="release-date">
                Newest Release
              </option>
            </select>
          </label>
        </div>

        <h2 className="movie-list-title">
          {title}
        </h2>

        {error && activeFilter === "browse" && (
          <p className="status-message">
            {error}
          </p>
        )}

        {!loading &&
          sortedMovies.length === 0 && (
            <p className="status-message">
              No movies here yet.
            </p>
          )}

        <div className="movie-list">
          {sortedMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onMovieSelect={handleMovieSelect}
              isFavorite={isMovieFavorite(movie.id)}
              isWatched={isMovieWatched(movie.id)}
              onToggleFavorite={handleToggleFavorite}
              onToggleWatched={handleToggleWatched}
            />
          ))}
        </div>

        {loading && activeFilter === "browse" && (
          <p className="status-message">
            Loading movies...
          </p>
        )}

        {!loading &&
          !error &&
          activeFilter === "browse" &&
          movies.length > 0 && (
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
            onSelectMovie={handleMovieSelect}
            isFavorite={isMovieFavorite(selectedMovieId)}
            isWatched={isMovieWatched(selectedMovieId)}
            onToggleFavorite={handleToggleFavorite}
            onToggleWatched={handleToggleWatched}
          />
        )}
      </section>
    </div>
  )
}

export default MovieList