import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import MediaGridPage from "./pages/MediaGridPage";
import GenreMediaPage from "./pages/GenreMediaPage";
import SearchPage from "./pages/SearchPage"; 
import DetailPage from "./pages/MovieDetail";
import CountryPage from "./pages/CountryPage";
import "./App.css";

export default function App() {
  return (
    <div className="app-container">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MediaGridPage title="Phim lẻ" endpoint="movie/popular" />} />
          <Route path="/tv-shows" element={<MediaGridPage title="TV Shows" endpoint="tv/top_rated" />} />
          <Route path="/genre/:mediaType/:genreId" element={<GenreMediaPage />} />
           <Route path="/country/:mediaType/:countryCode" element={<CountryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/:mediaType/:id" element={<DetailPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}