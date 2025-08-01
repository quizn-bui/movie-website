"use client";

import { useState, useEffect } from "react";
import { Play, Plus, Star } from "lucide-react";
import "../styles/MovieCard.css";

interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  genre_ids?: number[];
  media_type?: 'movie' | 'tv';
}

interface MovieCardProps {
  movie: Media;
}

interface Genre {
  id: number;
  name: string;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [runtime, setRuntime] = useState<number | null>(null);

  useEffect(() => {
    fetchGenresAndRuntime();
  }, [movie.id, movie.media_type]);

  const fetchGenresAndRuntime = async () => {
    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
      const mediaType = movie.media_type || 'movie';

      const [genresResponse, detailsResponse] = await Promise.all([
        fetch(`${BASE_URL}/genre/${mediaType}/list?api_key=${API_KEY}&language=vi-VN`),
        fetch(`${BASE_URL}/${mediaType}/${movie.id}?api_key=${API_KEY}&language=vi-VN`),
      ]);

      const genresData = await genresResponse.json();
      setGenres(genresData.genres);

      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        setRuntime(detailsData.runtime || detailsData.episode_run_time?.[0]);
      } else {
        console.warn(`Could not fetch details for media ID: ${movie.id}. Status: ${detailsResponse.status}`);
        setRuntime(null);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setRuntime(null);
    }
  };

  const title = movie.title || movie.name || "Unknown Title";
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  const getMovieGenres = () => {
    if (!movie.genre_ids || !genres.length) return "Action, Drama";

    return (
      movie.genre_ids
        .slice(0, 2)
        .map((id) => genres.find((genre) => genre.id === id)?.name)
        .filter(Boolean)
        .join(", ") || "Action, Drama"
    );
  };

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) {
      return "N/A";
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div
      className="card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="poster-container">
        {!imageLoaded && <div className="image-placeholder" />}
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={title}
          className={`poster-image ${imageLoaded ? "image-loaded" : ""}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg?height=300&width=200&text=No+Image";
          }}
        />

        <div className={`hover-overlay ${isHovered ? "overlay-visible" : ""}`}>
          <div className="play-button-container">
            <button className="play-button">
              <Play className="play-icon" />
            </button>
          </div>
        </div>

        <div className="rating-badge">
          <i className="fa-solid fa-star"></i>
          {movie.vote_average.toFixed(1)}
        </div>

        <div className="quality-badge">HD</div>
      </div>

      <div className="movie-info">
        <h3 className="movie-title">{title}</h3>
        <div className="movie-details">
          <div className="detail-row">
            <span className="year">{year}</span>
            <span className="separator">•</span>
            <span className="duration">{formatRuntime(runtime)}</span>
          </div>
          <div className="detail-row">
            <span className="genres">{getMovieGenres()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}