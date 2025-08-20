import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { LanguageContext } from "../context/LanguageContext";
import "../styles/HeroSlider.css";

import "swiper/css";
import "swiper/css/pagination";

interface Genre {
  id: number;
  name: string;
}

interface Movie {
  media_type: 'movie';
  id: number;
  title: string;
  original_title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genres: Genre[];
  runtime?: number;
  certification?: string;
}

interface TvShow {
  media_type: 'tv';
  id: number;
  name: string;
  original_name: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
  genres: Genre[];
}

type TrendingItem = Movie | TvShow;

export default function HeroSlider() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("HeroSlider must be used within a LanguageProvider");
  }
  const { selectedLanguage, t } = context;

  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [selectedLanguage]);

  const fetchData = async () => {
    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
      const apiLanguageCode = {
        VI: "vi-VN",
        EN: "en-US",
        ZH: "zh-CN",
      }[selectedLanguage] || "en-US";

      const trendingResponse = await fetch(
        `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=${apiLanguageCode}`
      );
      const trendingData = await trendingResponse.json();
      const trendingList = trendingData.results.filter((item: any) => item.media_type !== 'person').slice(0, 5);

      const trendingWithDetails = await Promise.all(
        trendingList.map(async (item: TrendingItem) => {
          const itemDetailsResponse = await fetch(
            `${BASE_URL}/${item.media_type}/${item.id}?api_key=${API_KEY}&language=${apiLanguageCode}`
          );
          const itemDetailsData = await itemDetailsResponse.json();

          if (item.media_type === 'movie') {
            const releaseDatesResponse = await fetch(
              `${BASE_URL}/movie/${item.id}/release_dates?api_key=${API_KEY}`
            );
            const releaseDatesData = await releaseDatesResponse.json();
            const vnRating = releaseDatesData.results.find(
              (release: any) => release.iso_3166_1 === "VN"
            );
            const certification = vnRating?.release_dates[0]?.certification || "";

            return {
              ...item,
              runtime: itemDetailsData.runtime,
              genres: itemDetailsData.genres,
              certification: certification,
            } as Movie;
          } else { 
            return {
              ...item,
              genres: itemDetailsData.genres,
            } as TvShow;
          }
        })
      );

      setTrendingItems(trendingWithDetails);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleWatchNowClick = (itemId: number, mediaType: string) => {
    navigate(`/${mediaType}/${itemId}`);
  };

  const handleWatchLaterClick = () => {
    setMessage(t("added_to_watchlist_message"));
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const formatRuntime = (minutes: number | undefined) => {
    if (minutes === undefined) {
      return "";
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading || trendingItems.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-overlay" />
        <p className="loading-text">{t("loading_text")}</p>
      </div>
    );
  }

  return (
    <div className="hero-container">
      {message && <div className="toast-message">{message}</div>}
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
        {trendingItems.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="slide">
              <div
                className="background-image"
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/original${item.backdrop_path})`,
                }}
              />
              <div className="gradient-overlay" />
              <div className="side-overlay" />
              <div className="content">
                <div className="movie-info-slide">
                  <div className="title-slide">
                    <h1 className="title-top">
                      {item.media_type === 'movie' ? (item as Movie).title : (item as TvShow).name}
                    </h1>
                    <p className="original-title-slide">
                      ({item.media_type === 'movie' ? (item as Movie).original_title : (item as TvShow).original_name})
                    </p>
                    <div className="metadata">
                      <i className="fa-regular fa-calendar-days"></i>
                      <span className="year">
                        {new Date(
                          item.media_type === 'movie' ? (item as Movie).release_date : (item as TvShow).first_air_date
                        ).getFullYear()}
                      </span>
                      {item.media_type === 'movie' && (
                        <>
                          <i className="fa-solid fa-clock-rotate-left"></i>
                          <span className="duration">
                            {formatRuntime((item as Movie).runtime)}
                          </span>
                        </>
                      )}
                      <div className="movie-badges">
                        <i className="fa-solid fa-star"></i>
                        <span className="rating-badge-slide">{item.vote_average.toFixed(1)}</span>
                        {item.media_type === 'movie' && (item as Movie).certification && (
                          <span className="badge age">{(item as Movie).certification}</span>
                        )}
                        <span className="badge hd">HD</span>
                      </div>
                    </div>
                    <div className="genres-slide">
                      {item.genres?.slice(0, 3).map((genre) => (
                        <span key={genre.id} className="genre-tag-slide">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                    <p className="overview">{item.overview}</p>
                  </div>
                  <div className="view-action">
                    <div className="actions">
                      <button
                        className="watch-btn"
                        onClick={() => handleWatchNowClick(item.id, item.media_type)}
                      >
                        {t("watch_now_button")}
                        <i className="fa-solid fa-circle-play"></i>
                      </button>
                      <button className="watch-later-btn" onClick={handleWatchLaterClick}>
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