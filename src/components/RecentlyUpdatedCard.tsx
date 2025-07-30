"use client"

import { useState, useEffect } from "react"
import { Play, Plus, Star } from "lucide-react"
import "../styles/RecentlyUpdatedCard.css" 

interface Movie {
  id: number
  title?: string
  name?: string
  poster_path: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  overview: string
  genre_ids?: number[]
}

interface RecentlyUpdatedCardProps {
  movie: Movie
}

interface Genre {
  id: number
  name: string
}

export default function RecentlyUpdatedCard({ movie }: RecentlyUpdatedCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [genres, setGenres] = useState<Genre[]>([])

  useEffect(() => {
    fetchGenres()
  }, [])

  const fetchGenres = async () => {
    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

      const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=vi-VN`);
      const data = await response.json()
      setGenres(data.genres)
    } catch (error) {
      console.error("Error fetching genres:", error)
    }
  }

  const title = movie.title || movie.name || "Unknown Title"
  const releaseDate = movie.release_date || movie.first_air_date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A"

  const getMovieGenres = () => {
    if (!movie.genre_ids || !genres.length) return "Action, Drama"

    return (
      movie.genre_ids
        .slice(0, 2)
        .map((id) => genres.find((genre) => genre.id === id)?.name)
        .filter(Boolean)
        .join(", ") || "Action, Drama"
    )
  }

  const getRandomDuration = () => {
    const durations = ["1h 45m", "2h 15m", "1h 30m", "2h 30m", "1h 55m", "2h 05m"]
    return durations[Math.floor(Math.random() * durations.length)]
  }

  return (
    <div className="recently-updated-card" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="poster-container">
        {!imageLoaded && <div className="image-placeholder" />}
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={title}
          className={`poster-image ${imageLoaded ? "image-loaded" : ""}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=300&width=200&text=No+Image"
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
            <span className="duration">{getRandomDuration()}</span>
          </div>
          <div className="detail-row">
            <span className="genres">{getMovieGenres()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}