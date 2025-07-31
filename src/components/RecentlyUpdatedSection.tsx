"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import RecentlyUpdatedCard from "./RecentlyUpdatedCard"
import "../styles/RecentlyUpdatedSection.css"

interface Movie {
  id: number
  title: string
  poster: string
  seriesInfo: string
  date: string
}

const RecentlyUpdatedSection: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
  const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL
  const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL

  const getImageUrl = (posterPath: string): string => {
    console.log("Poster Path received:", posterPath);
    if (!posterPath) {
      return "/placeholder-image.jpg" 
    }
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`
  }

  const generateSeriesInfo = (item: any): string => {
    return item.media_type === "movie" ? "Movie" : "TV Series"
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
      return "N/A"
    }
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date)
    } catch (e) {
      console.error("Error formatting date:", dateString, e)
      return dateString 
    }
  }

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=vi-VN`
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const trendingContent: any[] = data.results 

        const transformedMovies: Movie[] = trendingContent
          .slice(0, 20)
          .map((item) => ({
            id: item.id,
            title: item.title || item.name || "Unknown Title",
            poster: getImageUrl(item.poster_path),
            seriesInfo: generateSeriesInfo(item), 
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
  }, []) 

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX - (scrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    const x = e.touches[0].pageX - (scrollContainerRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  if (loading) {
    return (
      <section className="recently-updated-section">
        <div className="section-container">
          <h2 className="section-title">Recently Updated</h2>
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
          <h2 className="section-title">Recently Updated</h2>
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
        <h2 className="section-title">Recently Updated</h2>
        <div
          className={`flick-swiper-container ${isDragging ? "dragging" : ""}`}
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="movies-list">
            {movies.map((movie) => (
              <RecentlyUpdatedCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RecentlyUpdatedSection