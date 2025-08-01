import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import HeroSlider from "../components/HeroSlider";
import MovieSection from "../components/MovieSection";
import "../App.css";
import RecentlyUpdatedSection from "../components/RecentlyUpdatedSection";

export default function HomePage() {
  const navigate = useNavigate();

  const goToSeries = () => {
    navigate("/series");
  };

  return (
    <div className="app-container">
      <Header />
      <HeroSlider />
      <div className="content">
        <RecentlyUpdatedSection title="Recently Updated" endpoint="movie/now_playing" />
        <MovieSection title="Trending" endpoint="trending/movie/week" />
        <MovieSection title="New Release - Movies" endpoint="movie/popular" />
        <MovieSection title="New Release - Series" endpoint="tv/popular" />
        <MovieSection title="Recommended" endpoint="movie/top_rated" />
      </div>
    </div>
  );
}