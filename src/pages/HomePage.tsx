import { useState } from "react";
import Header from "../components/Header";
import HeroSlider from "../components/HeroSlider";
import MovieSection from "../components/MovieSection";
import ViewAllPage from "./ViewAllPage";
import RecentlyUpdatedSection from "../components/RecentlyUpdatedSection";
import "../App.css";

export default function HomePage() {
  const [currentView, setCurrentView] = useState<{
    type: "home" | "viewAll"
    title?: string
    endpoint?: string
  }>({ type: "home" });

  const handleBackToHome = () => {
    setCurrentView({ type: "home" });
  };

  const handleViewAll = (title: string, endpoint: string) => {
    setCurrentView({ type: "viewAll", title, endpoint });
  };

  if (currentView.type === "viewAll") {
    return (
      <div className="app-container">
        <Header />
        <ViewAllPage 
          title={currentView.title!} 
          endpoint={currentView.endpoint!} 
          onBack={handleBackToHome} 
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <HeroSlider />
      <div className="content">
        <RecentlyUpdatedSection 
            title="Recently Updated" 
            endpoint="movie/now_playing"/>
        <MovieSection 
            title="Trending" 
            endpoint="trending/movie/week" 
            onViewAll={() => handleViewAll("Trending", "trending/movie/week")}
        />
        <MovieSection 
            title="New Release - Movies" 
            endpoint="movie/popular" 
            onViewAll={() => handleViewAll("New Release - Movies", "movie/popular")}
        /> 
        <MovieSection 
            title="New Release - Series" 
            endpoint="tv/popular" 
            onViewAll={() => handleViewAll("New Release - Series", "tv/popular")}
        />
        <MovieSection 
            title="Recommended" 
            endpoint="movie/top_rated" 
            onViewAll={() => handleViewAll("Recommended", "movie/top_rated")}
        />
      </div>
    </div>
  );
}
