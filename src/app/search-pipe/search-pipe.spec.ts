import { SearchPipe } from './search-pipe';
import { Movie } from '../movie/movie';

//builds a minimal Movie fixture; only mid/name vary per test, the rest are fixed filler
const movie = (mid: number, name: string): Movie => ({
  mid,
  name,
  genre: 'Action',
  price: 1,
  rating: 'G',
  studio: 1,
});

describe('SearchPipe', () => {
  let pipe: SearchPipe;

  const movies = [
    movie(1001, 'Inception'),
    movie(1002, 'The Matrix'),
    movie(2001, 'inceptive'),
  ];

  beforeEach(() => {
    pipe = new SearchPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns an empty array when items is falsy', () => {
    expect(pipe.transform(null as unknown as Movie[], 'anything')).toEqual([]);
    expect(pipe.transform(undefined as unknown as Movie[], 'anything')).toEqual(
      [],
    );
  });

  it('returns all items unchanged when searchText is empty', () => {
    expect(pipe.transform(movies, '')).toBe(movies);
  });

  it('filters by name, case-insensitively', () => {
    expect(pipe.transform(movies, 'inception')).toEqual([
      movie(1001, 'Inception'),
    ]);
  });

  it('filters by partial name match', () => {
    expect(pipe.transform(movies, 'ince')).toEqual([
      movie(1001, 'Inception'),
      movie(2001, 'inceptive'),
    ]);
  });

  it('filters by mid as a substring match', () => {
    expect(pipe.transform(movies, '1001')).toEqual([movie(1001, 'Inception')]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(pipe.transform(movies, 'nonexistent')).toEqual([]);
  });
});
