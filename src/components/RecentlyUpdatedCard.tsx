import type React from "react"
import "../styles/RecentlyUpdatedCard.css"

interface Movie {
  id: number
  title: string
  poster: string
  seriesInfo: string
  date: string
}

interface RecentlyUpdatedCardProps {
  movie: Movie
}

const RecentlyUpdatedCard: React.FC<RecentlyUpdatedCardProps> = ({ movie }) => {
  console.log(`Movie ID: ${movie.id}, Title: ${movie.title}, Poster URL: ${movie.poster}`);
  return (
    <div className="recently-updated-card">
      <div className="card-poster">
        <img src={movie.poster || "/placeholder.svg"} alt={movie.title} className="poster-image" />
      </div>
      <div className="card-info">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="series-info">{movie.seriesInfo}</p>
        <p className="update-date">{movie.date}</p>
      </div>
    </div>
  )
}

export default RecentlyUpdatedCard
