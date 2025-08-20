"use client";

import type React from "react";
import { useState, useEffect, useContext } from "react";
import MovieCard from "./MovieCard";
import "../styles/MovieSection.css";
import { LanguageContext } from "../context/LanguageContext";

// **Đã thêm lại các interface bị thiếu**
interface Genre {
  id: number;
  name: string;
}

interface Movie {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  first_air_date?: string;
  overview: string;
  media_type: "movie" | "tv";
  genres?: Genre[];
  genre_ids?: number[];
}

interface MovieSectionProps {
  title: string;
  endpoint: string;
  showViewAll?: boolean;
  onViewAll?: (title: string, endpoint: string) => void;
  isPersonCredits?: boolean;
  limit?: number | null;
}

const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  endpoint,
  showViewAll = true,
  onViewAll,
  isPersonCredits = false,
  limit = 20,
}) => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("MovieSection must be used within a LanguageProvider");
  }
  const { selectedLanguage, t } = context;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const baseUrl = import.meta.env.VITE_TMDB_BASE_URL;

        if (!apiKey || !baseUrl) {
          throw new Error("Missing API configuration");
        }
        
        const apiLanguageCode = {
          vi: "vi-VN",
          en: "en-US",
          zh: "zh-CN",
        }[selectedLanguage] || "en-US";

        const moviesResponse = await fetch(
          `${baseUrl}/${endpoint}?api_key=${apiKey}&language=${apiLanguageCode}&page=1`
        );

        if (!moviesResponse.ok) {
          throw new Error(`HTTP error! status: ${moviesResponse.status}`);
        }

        const moviesData = await moviesResponse.json();

        let transformedMovies: Movie[] = [];
        let dataToProcess = [];

        if (isPersonCredits) {
          dataToProcess = moviesData.cast.filter((item: any) => item.media_type === "movie" || item.media_type === "tv");
        } else {
          dataToProcess = moviesData.results || [];
        }

        const slicedData = limit ? dataToProcess.slice(0, limit) : dataToProcess;
        
        transformedMovies = slicedData.map((item: any) => ({
            ...item,
            title: item.title || item.name || t("unknown_title"),
            media_type: item.media_type || (endpoint.includes("movie") ? "movie" : "tv"),
        }));

        setMovies(transformedMovies || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setError(t("error_loading_movies"));
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [endpoint, selectedLanguage, t, isPersonCredits, limit]);

  if (loading) {
    return (
      <div className="movie-section">
        <div className="section-header">
          <h2 className="section-title">{t(title)}</h2>
        </div>
        <div className="loading">{t("loading_movies")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-section">
        <div className="section-header">
          <h2 className="section-title">{t(title)}</h2>
        </div>
        <div className="error">{t("error_message")}: {error}</div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="movie-section">
      <div className="section-header">
        <h2 className="section-title">{t(title)}</h2>
        {showViewAll && onViewAll && (
          <button className="view-all-btn" onClick={() => onViewAll(title, endpoint)}>
            {t("view_all_button")} →
          </button>
        )}
      </div>

      <div className="movies-container">
        <div className="movies-scroll">
          {movies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              mediaType={movie.media_type}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieSection;