import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import MediaGridPage from "./pages/MediaGridPage";
import GenreMediaPage from "./pages/GenreMediaPage";
import SearchPage from "./pages/SearchPage"; 
import DetailPage from "./pages/MovieDetail";
import CountryPage from "./pages/CountryPage";
import MoviePlayer from "./pages/MoviePlayer";
import PersonPage from "./pages/PersonPage";
import { LanguageContext } from "./context/LanguageContext";
import "./App.css";

export default function App() {
  const languageContext = useContext(LanguageContext);
  if (!languageContext) {
    throw new Error("App must be used within a LanguageProvider");
  }
  const { t } = languageContext;

  return (
    <div className="app-container">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MediaGridPage title={t("popular_movies_title")} endpoint="movie/popular" />} />
          <Route path="/tv-shows" element={<MediaGridPage title={t("popular_tv_shows_title")} endpoint="tv/top_rated" />} />
          <Route path="/genre/:mediaType/:genreId" element={<GenreMediaPage />} />
          <Route path="/country/:mediaType/:countryCode" element={<CountryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/:mediaType/:id" element={<DetailPage />} />
          <Route path="/watch/:mediaType/:id" element={<MoviePlayer />} />
          <Route path="/person/:id" element={<PersonPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}