import { DropdownOption } from "../components/FilterSelect";

export const sortOptions: DropdownOption[] = [
  { label: 'sort_by_popularity', value: 'popularity.desc' },
  { label: 'sort_by_vote_average', value: 'vote_average.desc' },
  { label: 'sort_by_release_date', value: 'primary_release_date.desc' },
];

const generateYearOptions = (startYear: number, endYear: number): DropdownOption[] => {
  const years: DropdownOption[] = [{ label: 'all_years', value: '' }];
  for (let year = startYear; year >= endYear; year--) {
    years.push({ label: String(year), value: String(year) });
  }
  return years;
};

export const yearOptions: DropdownOption[] = generateYearOptions(new Date().getFullYear() + 1, 1980);

export const genreOptions: DropdownOption[] = [
  { label: 'all_genres', value: '' },
  { label: 'genre_action', value: '28' },
  { label: 'genre_adventure', value: '12' },
  { label: 'genre_animation', value: '16' },
  { label: 'genre_comedy', value: '35' },
  { label: 'genre_crime', value: '80' },
  { label: 'genre_documentary', value: '99' },
  { label: 'genre_drama', value: '18' },
  { label: 'genre_family', value: '10751' },
  { label: 'genre_fantasy', value: '14' },
  { label: 'genre_history', value: '36' },
  { label: 'genre_horror', value: '27' },
  { label: 'genre_music', value: '10402' },
  { label: 'genre_mystery', value: '9648' },
  { label: 'genre_romance', value: '10749' },
  { label: 'genre_science_fiction', value: '878' },
  { label: 'genre_tv_movie', value: '10770' },
  { label: 'genre_thriller', value: '53' },
  { label: 'genre_war', value: '10752' },
  { label: 'genre_western', value: '37' },
];