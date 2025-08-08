import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { LanguageContext } from "../context/LanguageContext";
import "../styles/HeroSlider.css";

import "swiper/css";
import "swiper/css/pagination";

interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  runtime?: number;
  genres: Genre[]; 
  certification?: string;
}

interface Genre {
  id: number;
  name: string;
}

export default function HeroSlider() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("HeroSlider must be used within a LanguageProvider");
  }
  const { selectedLanguage, t } = context;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [selectedLanguage]);

  const fetchData = async () => {
    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
      const apiLanguageCode = {
        vi: "vi-VN",
        en: "en-US",
        zh: "zh-CN",
      }[selectedLanguage] || "en-US";

      const [moviesResponse, genresResponse] = await Promise.all([
        fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1&language=${apiLanguageCode}`),
        fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=${apiLanguageCode}`), 
      ]);

      const moviesData = await moviesResponse.json();
      const genresData = await genresResponse.json();
      const popularMovies = moviesData.results.slice(0, 5);

      const moviesWithDetails = await Promise.all(
        popularMovies.map(async (movie: Movie) => {
          const movieDetailsResponse = await fetch(
            `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=${apiLanguageCode}`
          );
          const movieDetailsData = await movieDetailsResponse.json();

          const releaseDatesResponse = await fetch(
          `${BASE_URL}/movie/${movie.id}/release_dates?api_key=${API_KEY}`
        );
        const releaseDatesData = await releaseDatesResponse.json();

        const vnRating = releaseDatesData.results.find(
          (release: any) => release.iso_3166_1 === "VN"
        );
        const certification = vnRating?.release_dates[0]?.certification || "";

          

          return {
            ...movie,
            runtime: movieDetailsData.runtime,
            genres: movieDetailsData.genres, 
            certification: certification,
          };
        })
      );

      setMovies(moviesWithDetails);
      setGenres(genresData.genres);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleWatchNowClick = (movieId: number) => {
    navigate(`/movie/${movieId}`); 
  };

  const formatRuntime = (minutes: number | undefined) => {
    if (minutes === undefined) {
      return "";
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading || movies.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-overlay" />
        <p className="loading-text">{t("loading_text")}</p>
      </div>
    );
  }

  return (
    <div className="hero-container">
      <Swiper
        modules={[Pagination, Navigation, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 3,
        }}
        navigation={true}
        loop={true}
        autoplay={{
          delay: 35000,
          disableOnInteraction: false,
        }}
        className="swiper"
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <div className="slide">
              <div
                className="background-image"
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                }}
              />
              <div className="gradient-overlay" />
              <div className="side-overlay" />
              <div className="content">
                <div className="movie-info-slide">
                  <div className="title-slide">
                    <h1 className="title-top">{movie.title}</h1>
                    <p className="original-title-slide">({movie.original_title})</p>
                    <div className="metadata">
                      <i className="fa-regular fa-calendar-days"></i>
                      <span className="year">{new Date(movie.release_date).getFullYear()}</span>
                      <i className="fa-solid fa-clock-rotate-left"></i>
                      <span className="duration">{formatRuntime(movie.runtime)}</span>
                      <div className="movie-badges">
                        <i className="fa-solid fa-star"></i>
                        <span className="rating-badge-slide">{movie.vote_average.toFixed(1)}</span>
                        {movie.certification && (
                          <span className="badge age">{movie.certification}</span>
                        )}
                        <span className="badge hd">HD</span>
                      </div>
                    </div>
                    <div className="genres-slide">
                        {movie.genres?.slice(0, 3).map((genre) => (
                          <span key={genre.id} className="genre-tag-slide">
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    <p className="overview">{movie.overview}</p>
                  </div>
                  <div className="view-action">
                    <div className="actions">
                      <button className="watch-btn" onClick={() => handleWatchNowClick(movie.id)}>
                        {t("watch_now_button")}
                        <i className="fa-solid fa-circle-play"></i>
                      </button>

                      <button className="watch-later-btn">
                        {t("watch_later_button")}
                        <i className="fa-solid fa-clock"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}