import { useState, useEffect } from "react"
import { Play, Clock } from 'lucide-react'
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Navigation } from "swiper/modules"
import "../styles/HeroSlider.css"

import "swiper/css"
import "swiper/css/pagination"

interface Movie {
  id: number
  title: string
  overview: string
  backdrop_path: string
  poster_path: string
  vote_average: number
  release_date: string
  genre_ids: number[]
}

interface Genre {
  id: number
  name: string
}

export default function HeroSlider() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

      const [moviesResponse, genresResponse] = await Promise.all([
        fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=vi-VN&page=1`),
        fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=vi-VN`),
      ]);


      const moviesData = await moviesResponse.json()
      const genresData = await genresResponse.json()

      setMovies(moviesData.results.slice(0, 5))
      setGenres(genresData.genres)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setLoading(false)
    }
  }

  const getMovieGenres = (genreIds: number[]) => {
    return genreIds
      .slice(0, 3)
      .map((id) => genres.find((genre) => genre.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }

  if (loading || movies.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-overlay" />
      </div>
    )
  }

  return (
    <div className="hero-container">
      <Swiper
        modules={[ Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 3,
        }}
        navigation={true}
        loop={true}
        className="swiper">
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <div className="slide">
              <div
                className="background-image"
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                }}/>
              <div className="gradient-overlay" />
              <div className="side-overlay" />
              <div className="content">
                <div className="movie-info-slide">
                  <div className="view-action">
                <div className="actions">
                    <button className="watch-btn">
                      Watch Now
                      <i className="fa-solid fa-circle-play"></i>
                    </button>
                    <button className="watch-later-btn">
                      Watch Later
                      <i className="fa-solid fa-clock"></i>
                    </button>
                  </div>
                </div>
                  <div className="title-slide">
                  <h1 className="title-top">{movie.title}</h1>
                  <div className="metadata">
                    <i className="fa-regular fa-calendar-days"></i>
                    <span className="year">{new Date(movie.release_date).getFullYear()}</span>
                    <i className="fa-solid fa-clock-rotate-left"></i>
                    <span className="duration">2h 30m</span>
                    <span className="separator">•</span>
                    <span className="genres">{getMovieGenres(movie.genre_ids)}</span>
                    <div className="movie-badges">
                    <i className="fa-solid fa-star"></i>
                    <span className="rating-badge-slide">{movie.vote_average.toFixed(1)}</span>
                  </div>
                  </div>

                  <p className="overview">{movie.overview}</p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
