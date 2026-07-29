import { SearchPipe } from './search-pipe';

describe('SearchPipe', () => {
  let pipe: SearchPipe;

  const movies = [
    { mid: 1001, name: 'Inception' },
    { mid: 1002, name: 'The Matrix' },
    { mid: 2001, name: 'inceptive' },
  ];

  beforeEach(() => {
    pipe = new SearchPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns an empty array when items is falsy', () => {
    expect(pipe.transform(null as any, 'anything')).toEqual([]);
    expect(pipe.transform(undefined as any, 'anything')).toEqual([]);
  });

  it('returns all items unchanged when searchText is empty', () => {
    expect(pipe.transform(movies, '')).toBe(movies);
  });

  it('filters by name, case-insensitively', () => {
    expect(pipe.transform(movies, 'inception')).toEqual([
      { mid: 1001, name: 'Inception' },
    ]);
  });

  it('filters by partial name match', () => {
    expect(pipe.transform(movies, 'ince')).toEqual([
      { mid: 1001, name: 'Inception' },
      { mid: 2001, name: 'inceptive' },
    ]);
  });

  it('filters by mid as a substring match', () => {
    expect(pipe.transform(movies, '1001')).toEqual([
      { mid: 1001, name: 'Inception' },
    ]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(pipe.transform(movies, 'nonexistent')).toEqual([]);
  });
});
