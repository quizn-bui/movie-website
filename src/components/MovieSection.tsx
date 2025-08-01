"use client"

import { useState, useEffect } from "react"
import MovieCard from "./MovieCard"
import { ChevronRight } from "lucide-react"
import "../styles/MovieSection.css"

interface Movie {
  id: number
  title?: string
  name?: string
  poster_path: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  overview: string
  media_type?: 'movie' | 'tv'
}

interface MovieSectionProps {
  title: string
  endpoint: string
}

export default function MovieSection({ title, endpoint }: MovieSectionProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovies()
  }, [endpoint])

  const fetchMovies = async () => {
    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY
      const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL

      const response = await fetch(
        `${BASE_URL}/${endpoint}?api_key=${API_KEY}&language=vi-VN&page=1`
      )

      const data = await response.json()
      const mediaType = endpoint.includes('movie') ? 'movie' : endpoint.includes('tv') ? 'tv' : undefined;

      const resultsWithMediaType = data.results.map((item: any) => ({
        ...item,
        media_type: item.media_type || mediaType
      }));
      
      setMovies(resultsWithMediaType)
      setLoading(false)
    } catch (error) {
      console.error(`Error fetching ${title}:`, error)
      setLoading(false)
    }
  }

  const getVisibleMovies = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1280) return movies.slice(0, 6)
      if (window.innerWidth >= 1024) return movies.slice(0, 5)
      if (window.innerWidth >= 768) return movies.slice(0, 4)
      if (window.innerWidth >= 640) return movies.slice(0, 3)
      return movies.slice(0, 2)
    }
    return movies.slice(0, 6)
  }

  if (loading) {
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="title">{title}</h2>
        </div>
        <div className="movies-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="loading-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="title">{title}</h2>
        <button className="view-all-btn">
          View All
          <ChevronRight className="chevron-icon" />
        </button>
      </div>
      <div className="movies-grid">
        {getVisibleMovies().map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}