"use client";

import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import { Play, Pause, Volume2, VolumeX, Maximize, Star, Heart, Share2 } from "lucide-react";
import MovieSection from "../components/MovieSection";
import { LanguageContext } from "../context/LanguageContext";
import "../styles/MoviePlayer.css";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: { id: number; name: string }[];
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const MoviePlayer = () => {
  const params = useParams();
  const { id } = params as { id: string };

  const languageContext = useContext(LanguageContext);
  if (!languageContext) {
    throw new Error("MoviePlayer must be used within a LanguageProvider");
  }
  const { selectedLanguage, t } = languageContext;

  const apiLanguageCode = {
    vi: "vi-VN",
    en: "en-US",
    zh: "zh-CN",
  }[selectedLanguage] || "en-US";
    

  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<any>(null);

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
  const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;
  
  const fetchMovieData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id) return;

      const [movieResponse, castResponse, videosResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=${apiLanguageCode}`), 
      fetch(`${TMDB_BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}`),
      fetch(`${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}`),
  ]);
      if (!movieResponse.ok || !castResponse.ok || !videosResponse.ok) {
        throw new Error("Failed to fetch movie data.");
      }

      const movieData = await movieResponse.json();
      setMovie(movieData);

      const castData = await castResponse.json();
      setCast(castData.cast.slice(0, 8));

      const videosData = await videosResponse.json();
      const trailers = videosData.results.filter(
        (video: Video) => video.type === "Trailer" && video.site === "YouTube"
      );
      setVideos(trailers);
      if (trailers.length > 0) {
        setSelectedVideo(trailers[0]);
      }
    } catch (err) {
      console.error("Error fetching movie data:", err);
      setError(t("error_fetch_movie_data"));
    } finally {
      setLoading(false);
    }
  }, [id, TMDB_API_KEY, TMDB_BASE_URL, t]);

  useEffect(() => {
    if (id) {
      fetchMovieData();
    }
  }, [id, fetchMovieData]);

  const onPlayerReady = (event: any) => {
    setIsPlaying(false);
    setDuration(event.target.getDuration());
    setIsMuted(event.target.isMuted());

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentTime(event.target.getCurrentTime());
    }, 1000);
  };
  
  const onPlayerStateChange = (event: any) => {
    const YT_PlayerState = window.YT.PlayerState;
    if (event.data === YT_PlayerState.PLAYING) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const setupPlayer = () => {
      if (window.YT && selectedVideo) {
        if (playerRef.current) {
          playerRef.current.destroy();
        }
        
        playerRef.current = new window.YT.Player("youtube-player", {
          videoId: selectedVideo.key,
          playerVars: {
            autoplay: 0,
            controls: 0,
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
          },
        });
      }
    };

    const loadYoutubeApi = () => {
      window.onYouTubeIframeAPIReady = () => {
        setupPlayer();
      };
      
      if (window.YT && window.YT.Player) {
        setupPlayer();
      }
    };

    if (selectedVideo) {
      loadYoutubeApi();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedVideo]);

  const togglePlay = () => {
    if (playerRef.current) {
      const playerState = playerRef.current.getPlayerState();
      const YT_PlayerState = window.YT.PlayerState;

      if (playerState === YT_PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (playerRef.current.isMuted()) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(playerRef.current.isMuted());
    }
  };
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="movie-player__loading">
        <div className="movie-player__loading-text">{t("loading_text")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-player__error">
        <div className="movie-player__error-text">{error}</div>
      </div>
    );
  }

  if (!movie) {
    return null;
  }

  return (
    <div className="movie-player">
      <div className="movie-player__main">
        <div className="movie-player__main-content">
          <div className="movie-player__video-container">
            <div className="movie-player__video-aspect">
              {selectedVideo ? (
                <div id="youtube-player" className="movie-player__video-iframe"></div>
              ) : (
                <div
                  className="movie-player__video-placeholder"
                  style={{
                    backgroundImage: `url(${TMDB_IMAGE_BASE_URL}${movie.backdrop_path})`,
                  }}
                >
                  <div className="movie-player__placeholder-content">
                    <Play className="movie-player__placeholder-icon" />
                    <p className="movie-player__placeholder-text">{t("no_trailer_available")}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="movie-player__video-controls">
              <div className="movie-player__controls-row">
                <button onClick={togglePlay} className="movie-player__control-button">
                  {isPlaying ? <Pause className="movie-player__control-icon" /> : <Play className="movie-player__control-icon" />}
                </button>
                <button onClick={toggleMute} className="movie-player__control-button">
                  {isMuted ? <VolumeX className="movie-player__control-icon" /> : <Volume2 className="movie-player__control-icon" />}
                </button>
                <div className="movie-player__progress-container">
                  <div className="movie-player__progress-bar">
                    <div className="movie-player__progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }} />
                  </div>
                </div>
                <span className="movie-player__time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <button className="movie-player__control-button">
                  <Maximize className="movie-player__control-icon" />
                </button>
              </div>
            </div>
          </div>
          <div className="movie-player__info">
            <div className="movie-player__info-left-panel">
              <div className="movie-player__info-card">
                <div className="movie-player__info-header">
                  <img src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`} alt={movie.title} className="movie-player__poster" />
                  <div className="movie-player__movie-details">
                    <h2 className="movie-player__movie-title">{movie.title}</h2>
                    <div className="movie-player__movie-meta">
                      <div className="movie-player__rating">
                        <Star className="movie-player__rating-icon" />
                        <span className="movie-player__rating-text">{movie.vote_average.toFixed(1)}</span>
                      </div>
                      <span className="movie-player__year-text">{new Date(movie.release_date).getFullYear()}</span>
                    </div>
                    <div className="movie-player__quality-buttons">
                      <button className="movie-player__quality-button movie-player__quality-button--hd">HD</button>
                      <button className="movie-player__quality-button movie-player__quality-button--sub">{t("subtitle_label")}</button>
                    </div>
                    <div className="movie-player__action-buttons">
                      <button className="movie-player__action-button">
                        <Heart className="movie-player__action-icon" />
                        <span>{t("favorite_button")}</span>
                      </button>
                      <button className="movie-player__action-button">
                        <Share2 className="movie-player__action-icon" />
                        <span>{t("share_button")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="movie-player__description-panel">
              <div className="movie-player__description-card">
                <h3 className="movie-player__description-title">{t("movie_content_heading")}</h3>
                <p className="movie-player__description-text">{movie.overview || t("no_description")}</p>
                <div className="movie-player__stats">
                  <div>
                    <span className="movie-player__stat-label">{t("genres_label")}: </span>
                    <span>{movie.genres.map((g) => g.name).join(", ")}</span>
                  </div>
                  <div>
                    <span className="movie-player__stat-label">{t("runtime_label")}: </span>
                    <span>{t("runtime_minutes", { runtime: movie.runtime })}</span>
                  </div>
                  <div>
                    <span className="movie-player__stat-label">{t("release_year_label")}: </span>
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                  <div>
                    <span className="movie-player__stat-label">{t("rating_label")}: </span>
                    <span>{movie.vote_average}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="movie-player__related-sections">
        <MovieSection
          title={t("related_movies_heading")}
          endpoint={`movie/${id}/recommendations`}
          showViewAll={true}
          limit={10}
        />
        <MovieSection
          title={t("similar_movies_heading")}
          endpoint={`movie/${id}/similar`}
          showViewAll={true}
          limit={10}
        />
      </div>
    </div>
  );
};

export default MoviePlayer;