"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import "../styles/MovieCard.css"

export interface Movie {
  id: number
  title: string
  name?: string
  poster_path: string | null;
  vote_average: number
  release_date: string
  first_air_date?: string
  overview: string
  media_type?: string 
}

interface MovieCardProps {
  movie: Movie
  mediaType: string
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, mediaType }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL
  const title = movie.title || movie.name || "Unknown Title"
  const releaseDate = movie.release_date || movie.first_air_date || ""

  const posterUrl =
    movie.poster_path && imageBaseUrl
      ? `${imageBaseUrl}${movie.poster_path}`
      : "/placeholder.svg?height=392&width=256&text=No+Image"

  const formatRating = (rating: number) => {
    return rating.toFixed(1)
  }

  const getYear = (dateString: string) => {
    return dateString ? new Date(dateString).getFullYear() : ""
  }

  const getRatingColor = (rating: number) => {
    return "#ffffffff"
  }

  return (
    <Link to={`/${mediaType}/${movie.id}`} className="movie-card-link">
      <div className="movie-card">
        <div className="movie-poster-container">
          {!imageLoaded && !imageError && (
            <div className="image-placeholder">
              <div className="loading-spinner"></div>
            </div>
          )}

          <img
            src={posterUrl || "/placeholder.svg"}
            alt={title}
            className={`movie-poster ${imageLoaded ? "loaded" : ""}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setImageLoaded(true)
            }}
          />

          <div className="movie-overlay">
            <button className="play-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </button>
          </div>

          {movie.vote_average > 0 && (
            <div className="rating-badge">
              <span className="rating-text" style={{ color: getRatingColor(movie.vote_average) }}>
                ★ {formatRating(movie.vote_average)} 
              </span>
            </div>
          )}
        </div>

        <div className="movie-info">
          <h3 className="movie-title">{title}</h3>
          <div className="movie-meta">
            {releaseDate && <span className="movie-year">{getYear(releaseDate)}</span>}
             <span className="badge-hd-card">HD</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default MovieCard