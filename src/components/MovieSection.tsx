"use client";

import type React from "react";
import { useState, useEffect } from "react";
import MovieCard from "./MovieCard";
import "../styles/MovieSection.css";

interface Movie {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  first_air_date?: string;
  overview: string;
}

interface MovieSectionProps {
  title: string;
  endpoint: string;
  showViewAll?: boolean;
  onViewAll?: () => void; 
}

const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  endpoint,
  showViewAll = true,
  onViewAll, 
}) => {
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

        const url = `${baseUrl}/${endpoint}?api_key=${apiKey}&language=en-US&page=1`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMovies(data.results?.slice(0, 20) || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [endpoint]);

  if (loading) {
    return (
      <div className="movie-section">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="loading">Loading movies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-section">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="movie-section">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="no-movies">No movies found</div>
      </div>
    );
  }

  return (
    <div className="movie-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {showViewAll && (
          <button className="view-all-btn" onClick={onViewAll}>
            {" "}
            View all →
          </button>
        )}
      </div>

      <div className="movies-container">
        <div className="movies-scroll">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieSection;