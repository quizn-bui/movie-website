import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import MediaGridPage from "./components/MediaGridPage";
import GenreMediaPage from "./components/GenreMediaPage";
import "./App.css";

export default function App() {
  return (
    <div className="app-container">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/series" element={<MediaGridPage title="Phim bộ" endpoint="tv/popular" />} />
          <Route path="/movies" element={<MediaGridPage title="Phim lẻ" endpoint="movie/popular" />} />
          <Route path="/tv-shows" element={<MediaGridPage title="TV Shows" endpoint="tv/top_rated" />} />
          <Route path="/genre/:mediaType/:genreId" element={<GenreMediaPage />} />
        </Routes>
      </main>
    </div>
  );
}