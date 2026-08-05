import "./App.css"
import MovieList from "./components/MovieList"

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Flixster</h1>
      </header>

      <main>
        <MovieList />
      </main>
    </div>
  )
}

export default App
