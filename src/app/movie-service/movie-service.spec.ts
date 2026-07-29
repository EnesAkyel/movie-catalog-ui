import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { MovieService } from './movie-service';
import { Movie } from '../movie/movie';
import { environment } from '../../environments/environment';

describe('MovieService', () => {
  let service: MovieService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllMovies', () => {
    it('requests /movies with no query params when called with no filters', () => {
      service.getAllMovies().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/movies`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush({
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      });
    });

    it('includes only the query params that are set', () => {
      service.getAllMovies({ genre: 'Action', page: 2, size: 25 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === `${baseUrl}/movies`);
      expect(req.request.params.get('genre')).toBe('Action');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('size')).toBe('25');
      expect(req.request.params.has('rating')).toBe(false);
      expect(req.request.params.has('minPrice')).toBe(false);
      expect(req.request.params.has('maxPrice')).toBe(false);
      req.flush({
        content: [],
        page: 2,
        size: 25,
        totalElements: 0,
        totalPages: 0,
      });
    });

    it('includes rating and price filters when set, including 0', () => {
      service
        .getAllMovies({ rating: 'PG', minPrice: 0, maxPrice: 20 })
        .subscribe();

      const req = httpMock.expectOne((r) => r.url === `${baseUrl}/movies`);
      expect(req.request.params.get('rating')).toBe('PG');
      expect(req.request.params.get('minPrice')).toBe('0');
      expect(req.request.params.get('maxPrice')).toBe('20');
      req.flush({
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      });
    });
  });

  it('getMovieByMID requests GET /movie/{mid}', () => {
    service.getMovieByMID('1001').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/movie/1001`);
    expect(req.request.method).toBe('GET');
    req.flush({ mid: 1001 });
  });

  it('deleteMovie requests DELETE /movie/{mid}', () => {
    service.deleteMovie('1001').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/movie/1001`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('addMovie posts to /movie with the movie as the body', () => {
    const movie: Movie = {
      mid: 1001,
      name: 'Inception',
      genre: 'Action',
      price: 3.99,
      rating: 'G',
      studio: 1,
    };

    service.addMovie(movie).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/movie`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(movie);
    req.flush(movie);
  });

  it('updateMovie puts to /movie/{mid} with the movie as the body', () => {
    const movie: Movie = {
      mid: 1001,
      name: 'Inception',
      genre: 'Action',
      price: 3.99,
      rating: 'G',
      studio: 1,
    };

    service.updateMovie('1001', movie).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/movie/1001`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(movie);
    req.flush(movie);
  });

  it('getStudios requests GET /studios with size=100', () => {
    service.getStudios().subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/studios`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('size')).toBe('100');
    req.flush({
      content: [],
      page: 0,
      size: 100,
      totalElements: 0,
      totalPages: 0,
    });
  });
});
