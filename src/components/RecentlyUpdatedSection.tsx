"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import RecentlyUpdatedCard from "./RecentlyUpdatedCard" 
import "../styles/RecentlyUpdatedSection.css" 

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

interface RecentlyUpdatedSectionProps {
  title: string
  endpoint: string
}

export default function RecentlyUpdatedSection({ title, endpoint }: RecentlyUpdatedSectionProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovies()
  }, [endpoint])

  const fetchMovies = async () => {
    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

      const response = await fetch(
        `${BASE_URL}/${endpoint}?api_key=${API_KEY}&language=vi-VN&page=1`
      );

      const data = await response.json()
      setMovies(data.results.slice(0, 4))
      setLoading(false)
    } catch (error) {
      console.error(`Error fetching ${title}:`, error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="recently-updated-section">
        <div className="section-header">
          <h2 className="title">{title}</h2>
        </div>
        <div className="recently-updated-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="loading-card-recently-updated" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="recently-updated-section">
      <div className="section-header">
        <h2 className="title">{title}</h2>
        <button className="view-all-btn">
          View All
          <ChevronRight className="chevron-icon" />
        </button>
      </div>
      <div className="recently-updated-grid"> 
        {movies.map((movie) => (
          <RecentlyUpdatedCard key={movie.id} movie={movie} /> 
        ))}
      </div>
    </div>
  )
}