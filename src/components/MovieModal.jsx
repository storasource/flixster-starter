import { useEffect, useState } from "react"
import "./MovieModal.css"

function MovieModal({
  movieId,
  onClose,
  onSelectMovie,
  isFavorite,
  isWatched,
  onToggleFavorite,
  onToggleWatched,
}) {
  const [movieDetails, setMovieDetails] = useState(null)
  const [cast, setCast] = useState([])
  const [trailer, setTrailer] = useState(null)
  const [providers, setProviders] = useState([])
  const [providerLink, setProviderLink] = useState("")
  const [relatedMovies, setRelatedMovies] = useState([])
  const [relatedTitle, setRelatedTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [recommendation, setRecommendation] = useState("")
  const [recommendationLoading, setRecommendationLoading] =
    useState(false)
  const [recommendationError, setRecommendationError] =
    useState("")

  const apiKey = import.meta.env.VITE_API_KEY
  const openRouterKey =
    import.meta.env.VITE_OPENROUTER_API_KEY

  useEffect(() => {
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  useEffect(() => {
    async function fetchEverything() {
      try {
        setLoading(true)
        setError("")
        setRecommendation("")
        setRecommendationError("")
        setCast([])
        setTrailer(null)
        setProviders([])
        setProviderLink("")
        setRelatedMovies([])
        setRelatedTitle("")

        const [
          detailsResponse,
          creditsResponse,
          videosResponse,
          providersResponse,
          similarResponse,
        ] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${apiKey}`
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${apiKey}`
          ),
        ])

        if (!detailsResponse.ok) {
          throw new Error("Could not load movie details")
        }

        const detailsData = await detailsResponse.json()

        const creditsData = creditsResponse.ok
          ? await creditsResponse.json()
          : { cast: [] }

        const videosData = videosResponse.ok
          ? await videosResponse.json()
          : { results: [] }

        const providersData = providersResponse.ok
          ? await providersResponse.json()
          : { results: {} }

        const similarData = similarResponse.ok
          ? await similarResponse.json()
          : { results: [] }

        setMovieDetails(detailsData)

        setCast(
          (creditsData.cast || [])
            .filter((actor) => actor.profile_path)
            .slice(0, 5)
        )

        const youtubeVideos = (videosData.results || []).filter(
          (video) => video.site === "YouTube"
        )

        const officialTrailer =
          youtubeVideos.find(
            (video) =>
              video.type === "Trailer" &&
              video.official
          ) ||
          youtubeVideos.find(
            (video) => video.type === "Trailer"
          ) ||
          youtubeVideos[0]

        setTrailer(officialTrailer || null)

        const usProviders =
          providersData.results?.US

        if (usProviders) {
          const providerOptions = [
            ...(usProviders.flatrate || []),
            ...(usProviders.free || []),
            ...(usProviders.ads || []),
            ...(usProviders.rent || []),
          ]

          const uniqueProviders = providerOptions.filter(
            (provider, index, array) =>
              array.findIndex(
                (item) =>
                  item.provider_id === provider.provider_id
              ) === index
          )

          setProviders(uniqueProviders.slice(0, 6))
          setProviderLink(usProviders.link || "")
        }

        if (detailsData.belongs_to_collection?.id) {
          const collectionResponse = await fetch(
            `https://api.themoviedb.org/3/collection/${detailsData.belongs_to_collection.id}?api_key=${apiKey}`
          )

          if (collectionResponse.ok) {
            const collectionData =
              await collectionResponse.json()

            const otherMovies = (
              collectionData.parts || []
            )
              .filter((movie) => movie.id !== movieId)
              .sort((a, b) =>
                (a.release_date || "").localeCompare(
                  b.release_date || ""
                )
              )

            setRelatedMovies(otherMovies.slice(0, 8))
            setRelatedTitle(
              collectionData.name ||
                "More From This Collection"
            )
          }
        } else {
          setRelatedMovies(
            (similarData.results || []).slice(0, 6)
          )
          setRelatedTitle("Similar Movies")
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEverything()
  }, [apiKey, movieId])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      )
    }
  }, [onClose])

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  async function handleGetRecommendation() {
    if (!movieDetails) {
      return
    }

    if (!openRouterKey) {
      setRecommendationError(
        "OpenRouter API key is missing."
      )
      return
    }

    try {
      setRecommendationLoading(true)
      setRecommendationError("")
      setRecommendation("")

      const genres =
        movieDetails.genres
          ?.map((genre) => genre.name)
          .join(", ") || "Unknown"

      const prompt = `
Decide whether someone should watch this movie.

Movie: ${movieDetails.title}
Genres: ${genres}
Rating: ${movieDetails.vote_average?.toFixed(1)} out of 10
Release date: ${movieDetails.release_date || "Unknown"}
Runtime: ${movieDetails.runtime || "Unknown"} minutes
Overview: ${movieDetails.overview || "No overview available"}

Give a clear recommendation in 2 to 3 sentences.
Start with either "Watch it" or "Skip it".
Mention what type of viewer would probably enjoy it.
      `.trim()

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openrouter/free",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            "Could not generate a recommendation"
        )
      }

      const answer =
        data.choices?.[0]?.message?.content

      if (!answer) {
        throw new Error(
          "The AI did not return a recommendation"
        )
      }

      setRecommendation(answer)
    } catch (error) {
      setRecommendationError(error.message)
    } finally {
      setRecommendationLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="modal-backdrop">
        <div className="movie-modal modal-loading">
          <p>Loading movie details...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
    >
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

        {error && (
          <p className="modal-error">{error}</p>
        )}

        {!error && movieDetails && (
          <>
            <div className="modal-hero">
              {movieDetails.poster_path && (
                <img
                  className="modal-poster"
                  src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`}
                  alt={`${movieDetails.title} poster`}
                />
              )}

              <div className="modal-info">
                <h2 id="movie-modal-title">
                  {movieDetails.title}
                </h2>

                {movieDetails.tagline && (
                  <p className="movie-tagline">
                    {movieDetails.tagline}
                  </p>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className={
                      isFavorite ? "modal-action-active" : ""
                    }
                    onClick={() =>
                      onToggleFavorite(movieDetails)
                    }
                  >
                    {isFavorite
                      ? "♥ Favorited"
                      : "♡ Favorite"}
                  </button>

                  <button
                    type="button"
                    className={
                      isWatched ? "modal-action-active" : ""
                    }
                    onClick={() =>
                      onToggleWatched(movieDetails)
                    }
                  >
                    {isWatched
                      ? "✓ Watched"
                      : "Mark Watched"}
                  </button>
                </div>

                <p>{movieDetails.overview}</p>

                <div className="movie-facts">
                  <p>
                    <strong>Release:</strong>{" "}
                    {movieDetails.release_date || "Unknown"}
                  </p>

                  <p>
                    <strong>Rating:</strong>{" "}
                    {movieDetails.vote_average?.toFixed(1)} / 10
                  </p>

                  <p>
                    <strong>Runtime:</strong>{" "}
                    {movieDetails.runtime
                      ? `${movieDetails.runtime} min`
                      : "Unknown"}
                  </p>

                  <p>
                    <strong>Genres:</strong>{" "}
                    {movieDetails.genres
                      ?.map((genre) => genre.name)
                      .join(", ") || "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {providers.length > 0 && (
              <section className="modal-section">
                <h3>Where to Watch</h3>

                <div className="provider-list">
                  {providers.map((provider) => (
                    <div
                      className="provider"
                      key={provider.provider_id}
                    >
                      {provider.logo_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                        />
                      )}

                      <span>
                        {provider.provider_name}
                      </span>
                    </div>
                  ))}
                </div>

                {providerLink && (
                  <a
                    className="streaming-link"
                    href={providerLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Streaming Options ↗
                  </a>
                )}

                <p className="attribution">
                  Streaming availability data provided by
                  JustWatch
                </p>
              </section>
            )}

            {trailer && (
              <section className="modal-section">
                <h3>Trailer</h3>

                <div className="trailer-wrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title={`${movieDetails.title} trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            {cast.length > 0 && (
              <section className="modal-section">
                <h3>Top Cast</h3>

                <div className="cast-list">
                  {cast.map((actor) => (
                    <div
                      className="cast-member"
                      key={actor.credit_id}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                      />

                      <strong>{actor.name}</strong>

                      <span>
                        {actor.character}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {relatedMovies.length > 0 && (
              <section className="modal-section">
                <h3>{relatedTitle}</h3>

                <div className="related-list">
                  {relatedMovies.map((movie) => (
                    <button
                      className="related-movie"
                      type="button"
                      key={movie.id}
                      onClick={() =>
                        onSelectMovie(movie.id)
                      }
                    >
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                          alt={`${movie.title} poster`}
                        />
                      ) : (
                        <div className="related-placeholder">
                          No Poster
                        </div>
                      )}

                      <span>{movie.title}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="modal-section ai-recommendation">
              <h3>AI Watch Recommendation</h3>

              <button
                className="recommendation-button"
                type="button"
                onClick={handleGetRecommendation}
                disabled={recommendationLoading}
              >
                {recommendationLoading
                  ? "Thinking..."
                  : "Should I Watch This?"}
              </button>

              {recommendationError && (
                <p className="recommendation-error">
                  {recommendationError}
                </p>
              )}

              {recommendation && (
                <p
                  className="recommendation-result"
                  aria-live="polite"
                >
                  {recommendation}
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default MovieModal