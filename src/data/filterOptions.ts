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

export const yearOptions: DropdownOption[] = [
  { label: 'Tất cả các năm', value: '' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
];

export const genreOptions: DropdownOption[] = [
  { label: 'Tất cả thể loại', value: '' },
  { label: 'Hành động', value: '28' },
  { label: 'Kinh dị', value: '27' },
  { label: 'Khoa học viễn tưởng', value: '878' },
  { label: 'Hài', value: '35' },
];