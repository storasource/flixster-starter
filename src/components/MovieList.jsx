import "./MovieList.css"
import { useEffect, useState } from "react"
import MovieCard from "./MovieCard"

function MovieList() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const apiKey = import.meta.env.VITE_API_KEY

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(
          `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&page=1`
        )

        if (!response.ok) {
          throw new Error("Could not load movies")
        }

        const data = await response.json()
        setMovies(data.results)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [apiKey])

  function handleMovieSelect(movieId) {
    console.log("Selected movie:", movieId)
  }

  if (loading) {
    return <p>Loading movies...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <section className="movie-list">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onMovieSelect={handleMovieSelect}
        />
      ))}
    </section>
  )
}

export default MovieList