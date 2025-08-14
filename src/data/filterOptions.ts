// src/data/filterOptions.ts

interface DropdownOption {
  label: string;
  value: string;
}

export const sortOptions: DropdownOption[] = [
  { label: 'Phổ biến nhất', value: 'popularity.desc' },
  { label: 'Đánh giá cao nhất', value: 'vote_average.desc' },
  { label: 'Ngày phát hành', value: 'primary_release_date.desc' },
];

// Tự động tạo danh sách năm
const generateYearOptions = (startYear: number, endYear: number): DropdownOption[] => {
  const years: DropdownOption[] = [{ label: 'Tất cả các năm', value: '' }];
  for (let year = startYear; year >= endYear; year--) {
  years.push({ label: String(year), value: String(year) });
  }
  return years;
};

// Tạo danh sách năm từ năm hiện tại + 1 cho đến 1980
export const yearOptions: DropdownOption[] = generateYearOptions(new Date().getFullYear() + 1, 1980);

export const genreOptions: DropdownOption[] = [
  { label: 'Tất cả thể loại', value: '' },
  { label: 'Hành động', value: '28' },
  { label: 'Phiêu lưu', value: '12' },
  { label: 'Hoạt hình', value: '16' },
  { label: 'Hài', value: '35' },
  { label: 'Tội phạm', value: '80' },
  { label: 'Tài liệu', value: '99' },
  { label: 'Chính kịch', value: '18' },
  { label: 'Gia đình', value: '10751' },
  { label: 'Giả tưởng', value: '14' },
  { label: 'Lịch sử', value: '36' },
  { label: 'Kinh dị', value: '27' },
  { label: 'Âm nhạc', value: '10402' },
  { label: 'Bí ẩn', value: '9648' },
  { label: 'Lãng mạn', value: '10749' },
  { label: 'Khoa học viễn tưởng', value: '878' },
  { label: 'Phim truyền hình', value: '10770' },
  { label: 'Phim kinh dị', value: '53' },
  { label: 'Chiến tranh', value: '10752' },
  { label: 'Miền Tây', value: '37' },
];