import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import MediaGridPage from './MediaGridPage';

const GenreMediaPage: React.FC = () => {
  const { mediaType, genreId } = useParams<{ mediaType: string; genreId: string }>();
  const [searchParams] = useSearchParams();
  const genreName = searchParams.get('name'); // Lấy tên thể loại từ query parameter 'name'

  // Xây dựng endpoint dựa trên mediaType và genreId
  let endpoint = '';
  let pageTitle = 'Thể loại'; // Tiêu đề mặc định

  if (mediaType === 'movie' && genreId) {
    endpoint = `discover/movie?with_genres=${genreId}`;
    pageTitle = genreName ? `Phim Thể loại: ${genreName}` : 'Phim theo Thể loại';
  } else if (mediaType === 'tv' && genreId) {
    endpoint = `discover/tv?with_genres=${genreId}`;
    pageTitle = genreName ? `TV Shows Thể loại: ${genreName}` : 'TV Shows theo Thể loại';
  } else {
    // Xử lý trường hợp không hợp lệ, ví dụ: hiển thị lỗi hoặc redirect
    return <p>Lỗi: Không tìm thấy thể loại hoặc loại nội dung không hợp lệ.</p>;
  }

  // Truyền endpoint và pageTitle cho MediaGridPage
  return (
    <MediaGridPage title={pageTitle} endpoint={endpoint} />
  );
};

export default GenreMediaPage;