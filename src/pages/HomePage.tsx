import { useState, useContext } from "react";
import Header from "../components/Header";
import HeroSlider from "../components/HeroSlider";
import MovieSection from "../components/MovieSection";
import ViewAllPage from "./ViewAllPage";
import RecentlyUpdatedSection from "../components/RecentlyUpdatedSection";
import { LanguageContext } from "../context/LanguageContext";
import "../App.css";

export default function HomePage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("HomePage must be used within a LanguageProvider");
  }
  const { t } = context;

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
            title={t("recently_updated_title")} 
            endpoint="movie/now_playing"/>
        <MovieSection 
            title={t("trending_title")} 
            endpoint="trending/movie/week" 
            onViewAll={() => handleViewAll(t("trending_title"), "trending/movie/week")}
        />
        <MovieSection 
            title={t("new_release_movies_title")} 
            endpoint="movie/popular" 
            onViewAll={() => handleViewAll(t("new_release_movies_title"), "movie/popular")}
        /> 
        <MovieSection 
            title={t("new_release_series_title")} 
            endpoint="tv/popular" 
            onViewAll={() => handleViewAll(t("new_release_series_title"), "tv/popular")}
        />
        <MovieSection 
            title={t("recommended_title")} 
            endpoint="movie/top_rated" 
            onViewAll={() => handleViewAll(t("recommended_title"), "movie/top_rated")}
        />
      </div>
    </div>
  );
}