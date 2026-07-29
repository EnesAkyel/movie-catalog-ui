import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '../movie/movie';
import { Studio } from '../studio/studio';
import { PageResponse } from '../page-response/page-response';
import { environment } from '../../environments/environment';

export interface MovieQuery {
  genre?: string;
  rating?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root',
})

//defining the endpoints that we use
export class MovieService {
  baseURL: string;

  constructor(private readonly http: HttpClient) {
    this.baseURL = environment.apiUrl;
  }

  public getAllMovies(query: MovieQuery = {}): Observable<PageResponse<Movie>> {
    let params = new HttpParams();
    if (query.genre) params = params.set('genre', query.genre);
    if (query.rating) params = params.set('rating', query.rating);
    if (query.minPrice != null) params = params.set('minPrice', query.minPrice);
    if (query.maxPrice != null) params = params.set('maxPrice', query.maxPrice);
    if (query.page != null) params = params.set('page', query.page);
    if (query.size != null) params = params.set('size', query.size);
    return this.http.get<PageResponse<Movie>>(this.baseURL + '/movies', {
      params,
    });
  }

  public getMovieByMID(mid: string): Observable<Movie> {
    return this.http.get<Movie>(this.baseURL + '/movie/' + mid);
  }

  public deleteMovie(mid: string): Observable<Movie> {
    return this.http.delete<Movie>(this.baseURL + '/movie/' + mid);
  }

  public addMovie(movie: Movie): Observable<Movie> {
    return this.http.post<Movie>(this.baseURL + '/movie', movie);
  }

  public updateMovie(mid: string, movie: Movie): Observable<Movie> {
    return this.http.put<Movie>(this.baseURL + '/movie/' + mid, movie);
  }

  //size=100 covers the full valid sid range (1-100) in one call
  public getStudios(): Observable<PageResponse<Studio>> {
    const params = new HttpParams().set('size', 100);
    return this.http.get<PageResponse<Studio>>(this.baseURL + '/studios', {
      params,
    });
  }
}
