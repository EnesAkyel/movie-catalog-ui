import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { of } from 'rxjs';

import { MovieDetail } from './movie-detail';
import { environment } from '../../environments/environment';

const baseUrl = environment.apiUrl;

describe('MovieDetail', () => {
  let component: MovieDetail;
  let fixture: ComponentFixture<MovieDetail>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ mid: '1001' })) },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetail);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const movie = {
    mid: 1001,
    name: 'Inception',
    genre: 'Action',
    price: 3.99,
    rating: 'G',
    studio: 1,
  };

  function initWithMovie() {
    fixture.detectChanges();
    httpMock.expectOne(`${baseUrl}/movie/1001`).flush(movie);
    httpMock
      .expectOne((r) => r.url === `${baseUrl}/studios`)
      .flush({
        content: [{ sid: 1, name: 'Warner Bros' }],
        page: 0,
        size: 100,
        totalElements: 1,
        totalPages: 1,
      });
  }

  it('should create', () => {
    initWithMovie();
    expect(component).toBeTruthy();
  });

  it('loads the movie and resolves its studio name', () => {
    initWithMovie();
    expect(component.movie).toEqual(movie);
    expect(component.studioName).toBe('Warner Bros');
    expect(component.errorMessage).toBeNull();
  });

  it('falls back to a null studioName when the studio is not found', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${baseUrl}/movie/1001`).flush(movie);
    httpMock
      .expectOne((r) => r.url === `${baseUrl}/studios`)
      .flush({
        content: [],
        page: 0,
        size: 100,
        totalElements: 0,
        totalPages: 0,
      });

    expect(component.studioName).toBeNull();
  });

  it('sets a not-found message on 404', () => {
    fixture.detectChanges();
    httpMock
      .expectOne(`${baseUrl}/movie/1001`)
      .flush('not found', { status: 404, statusText: 'Not Found' });

    expect(component.errorMessage).toBe("Movie 1001 doesn't exist.");
  });

  it('sets a generic error message on other failures', () => {
    fixture.detectChanges();
    httpMock
      .expectOne(`${baseUrl}/movie/1001`)
      .flush('fail', { status: 500, statusText: 'Server Error' });

    expect(component.errorMessage).toBe(
      'Something went wrong loading this movie. Please try again.',
    );
  });

  describe('delete confirmation flow', () => {
    it('confirmDelete/cancelDelete toggle pendingDelete', () => {
      initWithMovie();
      component.confirmDelete();
      expect(component.pendingDelete).toBe(true);
      component.cancelDelete();
      expect(component.pendingDelete).toBe(false);
    });

    it('delete navigates to /list with a success message on success', () => {
      initWithMovie();
      const navigateSpy = vi.spyOn(router, 'navigateByUrl');
      component.confirmDelete();

      component.delete();
      expect(component.pendingDelete).toBe(false);

      const req = httpMock.expectOne(`${baseUrl}/movie/1001`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(navigateSpy).toHaveBeenCalledWith('/list', {
        state: { successMessage: 'Movie deleted successfully.' },
      });
    });

    it('sets an errorMessage when delete fails', () => {
      initWithMovie();
      component.delete();
      const req = httpMock.expectOne(`${baseUrl}/movie/1001`);
      req.flush('fail', { status: 500, statusText: 'Server Error' });

      expect(component.errorMessage).toBe(
        'Could not delete the movie. Please try again.',
      );
    });
  });
});
