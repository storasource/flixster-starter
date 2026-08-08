# Flixster Project Plan

## Component Architecture

### App

Responsibility:
Controls the overall app layout and owns the main shared state

Renders:
- Header
- SearchBar
- SortControl
- MovieList
- MovieModal
- Footer

Props:
- none

State:
- movies
- searchQuery
- activeMode
- currentPage
- totalPages
- selectedMovieId
- sortOption
- loading
- error

### Header

Responsibility:
Displays the app name and main heading

Renders:
- app title
- optional tagline
- Now Playing button

Props:
- onShowNowPlaying

State:
- none

### SearchBar

Responsibility:
Allows the user to search for movies by title

Renders:
- controlled text input
- search button

Props:
- searchQuery
- onQueryChange
- onSearch

State:
- none because App owns the query

### SortControl

Responsibility:
Lets the user choose how the current movies are sorted

Renders:
- select dropdown

Props:
- sortOption
- onSortChange

State:
- none

### MovieList

Responsibility:
Displays the movie collection in a responsive grid

Renders:
- MovieCard for each movie
- empty-results message
- Load More button

Props:
- movies
- onMovieSelect
- onLoadMore
- loading
- hasMoreMovies

State:
- none

### MovieCard

Responsibility:
Displays the summary information for one movie

Renders:
- poster image
- movie title
- vote average
- favorite button
- watched control

Props:
- movie
- onSelect
- isFavorite
- isWatched
- onToggleFavorite
- onToggleWatched

State:
- none

### MovieModal

Responsibility:
Displays detailed information about the selected movie

Renders:
- backdrop image
- title
- runtime
- release date
- genres
- overview
- AI watch recommendation
- trailer if available
- close button

Props:
- movieId
- onClose

State:
- movieDetails
- loadingDetails
- detailsError
- aiInsight
- loadingInsight
- trailerKey

### Footer

Responsibility:
Displays copyright and TMDb attribution

Renders:
- copyright notice
- TMDb link
- optional GitHub link

Props:
- none

State:
- none

### Sidebar

Responsibility:
Displays favorite and watched movies and allows list filtering

Renders:
- favorite movie list
- watched movie list
- filter buttons

Props:
- favoriteMovies
- watchedMovies
- activeFilter
- onFilterChange

State:
- none

## Parent Child Hierarchy

App
- Header
- SearchBar
- SortControl
- Sidebar
- MovieList
  - MovieCard
- MovieModal
- Footer

## API Contracts

### TMDb Now Playing

Endpoint:
https://api.themoviedb.org/3/movie/now_playing

Method:
GET

Parameters:
- api_key
- page
- language optional

Response fields used:
- results
- total_pages
- id
- title
- poster_path
- vote_average
- release_date
- overview

Error cases:
- invalid API key
- network failure
- empty results
- invalid page

### TMDb Search Movies

Endpoint:
https://api.themoviedb.org/3/search/movie

Method:
GET

Parameters:
- api_key
- query
- page
- include_adult false

Response fields used:
- results
- total_pages
- id
- title
- poster_path
- vote_average
- release_date
- overview

Error cases:
- blank query
- invalid API key
- network failure
- no matching movies

### TMDb Movie Details

Endpoint:
https://api.themoviedb.org/3/movie/{movie_id}

Method:
GET

Parameters:
- api_key
- movie_id path parameter

Response fields used:
- id
- title
- runtime
- release_date
- genres
- overview
- backdrop_path
- poster_path
- vote_average

Error cases:
- movie not found
- invalid API key
- network failure

### TMDb Movie Videos

Endpoint:
https://api.themoviedb.org/3/movie/{movie_id}/videos

Method:
GET

Parameters:
- api_key
- movie_id path parameter

Response fields used:
- results
- key
- site
- type
- official

Error cases:
- no trailer available
- invalid API key
- network failure

## State Architecture

### movies

Type:
array

Initial value:
[]

Owner:
App

Updates when:
- Now Playing request succeeds
- search request succeeds
- Load More appends another page

### searchQuery

Type:
string

Initial value:
""

Owner:
App

Updates when:
- user types in SearchBar
- user clears the search
- Now Playing is selected

### activeMode

Type:
string

Initial value:
"now-playing"

Owner:
App

Updates when:
- user searches
- user returns to Now Playing
- sidebar filter changes if handled as a mode

### currentPage

Type:
number

Initial value:
1

Owner:
App

Updates when:
- Load More is clicked
- search mode changes
- user returns to Now Playing

### totalPages

Type:
number

Initial value:
1

Owner:
App

Updates when:
- a TMDb movie list response succeeds

### selectedMovieId

Type:
number or null

Initial value:
null

Owner:
App

Updates when:
- user clicks a MovieCard
- modal closes

### sortOption

Type:
string

Initial value:
"default"

Owner:
App

Updates when:
- user selects a sorting option

### loading

Type:
boolean

Initial value:
false

Owner:
App

Updates when:
- movie list request begins or finishes

### error

Type:
string

Initial value:
""

Owner:
App

Updates when:
- movie list request fails
- successful request clears the previous error

### favorites

Type:
array of movie ids

Initial value:
[]

Owner:
App

Updates when:
- user toggles a movie favorite

### watchedMovies

Type:
array of movie ids

Initial value:
[]

Owner:
App

Updates when:
- user toggles a movie watched status

### activeFilter

Type:
string

Initial value:
"all"

Owner:
App

Updates when:
- user selects all favorites or watched in Sidebar

### movieDetails

Type:
object or null

Initial value:
null

Owner:
MovieModal

Updates when:
- movie details request succeeds
- movie id changes
- modal closes

### aiInsight

Type:
string or null

Initial value:
null

Owner:
MovieModal

Updates when:
- OpenRouter request succeeds
- fallback message is used
- modal closes

### loadingInsight

Type:
boolean

Initial value:
false

Owner:
MovieModal

Updates when:
- AI request starts or finishes

## Data Flow

TMDb returns a movie list response

The response results array is stored in App state as movies

App creates a copied and sorted version of the movie list based on sortOption

App may also filter the list based on favorite or watched status

MovieList receives the final movie array through props

MovieList maps over the array and passes each movie object into MovieCard

MovieCard displays the title poster and vote average

When the user clicks a MovieCard the movie id is passed back to App

App stores the id in selectedMovieId and renders MovieModal

MovieModal uses the movie id to fetch full movie details and trailer data

After details load the title genres and overview are sent to OpenRouter for the watch recommendation

## Sorting Decisions

Sorting happens on a copied version of the movies array during rendering

The original movies state is not mutated

Sort options:
- title sorts alphabetically A to Z
- release date sorts newest first
- vote average sorts highest first

Sorting only affects movies currently loaded in state

## Responsive Layout Plan

Desktop above 1024 pixels:
- four or five movie cards per row depending on space

Tablet between 600 and 1024 pixels:
- two or three movie cards per row

Mobile below 600 pixels:
- one movie card per row
- controls stack vertically
- modal uses most of the screen width

## Visual Intent

The app will use a dark movie-theater style with light text and one bright accent color

Movie cards will use consistent spacing rounded corners shadows and a small lift effect on hover

The modal will use a dark semi-transparent backdrop and clear sections for metadata overview trailer and AI recommendation

## AI Feature Spec

### Display Location

The watch recommendation will display inside MovieModal underneath the movie overview

### Role

The AI acts as an enthusiastic but honest film critic

### Task

Write a useful 2 to 3 sentence recommendation explaining who may enjoy the movie and what kind of viewing experience it offers

### Inputs

- movie title
- genres as a comma-separated string
- movie overview

### Output Format

- plain text
- 2 to 3 sentences
- no heading inside the response
- no first-person statements

### Constraints

- no plot spoilers
- no invented facts
- no generic phrases such as this movie is a must-see
- do not repeat the full overview
- mention the likely audience or mood when useful

### Failure Behavior

Display:

We could not generate a recommendation for this movie. Check out the overview above.

### OpenRouter Contract

Endpoint:
https://openrouter.ai/api/v1/chat/completions

Method:
POST

Model:
google/gemma-3-27b-it:free

Headers:
- Authorization Bearer API key
- Content-Type application/json

State:
- aiInsight
- loadingInsight

Trigger:
The request runs after the selected movie details have loaded

### AI Feature Decisions Log

What the API returned initially:
- not tested yet

What I changed in the prompt:
- not tested yet

Fallback behavior:
- a friendly recommendation unavailable message appears

What I learned:
- to be completed after implementation