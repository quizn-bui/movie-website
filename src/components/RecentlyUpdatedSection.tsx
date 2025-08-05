"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import RecentlyUpdatedCard from "./RecentlyUpdatedCard"
import "../styles/RecentlyUpdatedSection.css"

interface Movie {
  id: number
  title: string
  poster: string
  mediaType: "movie" | "tv"
  seriesInfo: string
  date: string
}

interface RecentlyUpdatedSectionProps {
  title: string;
  endpoint: string;
}

const RecentlyUpdatedSection: React.FC<RecentlyUpdatedSectionProps> = ({ title, endpoint }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [wasDragged, setWasDragged] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
  const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL
  const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL

  const getImageUrl = (posterPath: string): string => {
    if (!posterPath) {
      return ""
    }
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`
  }

  const getSeriesInfo = (item: any): string => {
    return item.media_type === "movie" ? "movie" : "TV series"
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
      return "N/A"
    }
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "N/A"
      }
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date)
    } catch (e) {
      console.error("Error formatting date:", dateString, e)
      return "N/A"
    }
  }

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!TMDB_API_KEY || !TMDB_BASE_URL) {
          throw new Error("Missing API configuration.")
        }

        const response = await fetch(
          `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&language=vi-VN`
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        const trendingContent: any[] = data.results || []

        const transformedMovies: Movie[] = trendingContent
          .filter(item => item.poster_path)
          .slice(0, 20)
          .map((item) => ({
            id: item.id,
            title: item.title || item.name || "Unknown Title",
            poster: getImageUrl(item.poster_path),
            mediaType: item.media_type,
            seriesInfo: getSeriesInfo(item),
            date: formatDate(item.release_date || item.first_air_date),
          }))

        setMovies(transformedMovies)
      } catch (err) {
        setError("Failed to load movies. Please try again later.")
        console.error("Error fetching movies:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [endpoint, TMDB_API_KEY, TMDB_BASE_URL])

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setWasDragged(false)
    const clientX = 'touches' in e ? e.touches[0].pageX : e.pageX
    setStartX(clientX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleDragging = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return
    const clientX = 'touches' in e ? e.touches[0].pageX : e.pageX
    const walk = (clientX - (scrollContainerRef.current.offsetLeft + startX)) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
    if (Math.abs(walk) > 5) {
      setWasDragged(true)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (wasDragged) {
      e.preventDefault()
    }
  }

  if (loading) {
    return (
      <section className="recently-updated-section">
        <div className="section-container">
          <h2 className="section-title">{title}</h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading movies...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="recently-updated-section">
        <div className="section-container">
          <h2 className="section-title">{title}</h2>
          <div className="error-container">
            <p className="error-text">{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="recently-updated-section">
      <div className="section-container">
        <h2 className="section-title">{title}</h2>
        <div
          className={`flick-swiper-container ${isDragging ? "dragging" : ""}`}
          ref={scrollContainerRef}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragging}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragging}
          onTouchEnd={handleDragEnd}
        >
          <div className="movies-list">
            {movies.map((movie) => (
              <Link
                key={movie.id}
                to={`/${movie.mediaType}/${movie.id}`}
                onClick={handleLinkClick}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <RecentlyUpdatedCard movie={movie} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RecentlyUpdatedSection