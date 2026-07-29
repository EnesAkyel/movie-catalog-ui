import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ListComponent } from './list-component';
import { environment } from '../../environments/environment';

const moviesUrl = `${environment.apiUrl}/movies`;

function page(content: any[], overrides: Record<string, any> = {}) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    ...overrides,
  };
}

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    history.replaceState(null, '');
    vi.useRealTimers();
  });

  function init(content: any[] = [], overrides: Record<string, any> = {}) {
    fixture.detectChanges();
    const req = httpMock.expectOne((r) => r.url === moviesUrl);
    req.flush(page(content, overrides));
  }

  it('should create', () => {
    init();
    expect(component).toBeTruthy();
  });

  describe('loadMovies', () => {
    it('populates movieList/totalElements/totalPages on success', () => {
      const movies = [
        {
          mid: 1002,
          name: 'B',
          genre: 'Action',
          price: 1,
          rating: 'G',
          studio: 1,
        },
        {
          mid: 1001,
          name: 'A',
          genre: 'Action',
          price: 1,
          rating: 'G',
          studio: 1,
        },
      ];
      init(movies, { totalElements: 2, totalPages: 1 });

      expect(component.movieList.map((m) => m.mid)).toEqual([1001, 1002]);
      expect(component.totalElements).toBe(2);
      expect(component.totalPages).toBe(1);
      expect(component.errorMessage).toBeNull();
    });

    it('sorts by mid immediately after loading', () => {
      const movies = [
        { mid: 3, name: 'C', genre: '', price: 1, rating: 'G', studio: 1 },
        { mid: 1, name: 'A', genre: '', price: 1, rating: 'G', studio: 1 },
        { mid: 2, name: 'B', genre: '', price: 1, rating: 'G', studio: 1 },
      ];
      init(movies);
      expect(component.movieList.map((m) => m.mid)).toEqual([1, 2, 3]);
    });

    it('sets an errorMessage when the request fails', () => {
      fixture.detectChanges();
      const req = httpMock.expectOne((r) => r.url === moviesUrl);
      req.flush('fail', { status: 500, statusText: 'Server Error' });

      expect(component.errorMessage).toBe(
        'Could not load movies. Please try again later.',
      );
    });
  });

  describe('sortBy', () => {
    it('sorts movieList by name alphabetically, ascending, on first click', () => {
      init([
        { mid: 1, name: 'Zeta', genre: '', price: 1, rating: 'G', studio: 1 },
        { mid: 2, name: 'Alpha', genre: '', price: 1, rating: 'G', studio: 1 },
      ]);
      component.sortBy('name');
      expect(component.movieList.map((m) => m.name)).toEqual(['Alpha', 'Zeta']);
      expect(component.sortColumn).toBe('name');
      expect(component.sortDirection).toBe('asc');
    });

    it('sorts movieList by mid numerically', () => {
      init([
        { mid: 20, name: 'A', genre: '', price: 1, rating: 'G', studio: 1 },
        { mid: 3, name: 'B', genre: '', price: 1, rating: 'G', studio: 1 },
      ]);
      component.sortBy('name'); // switch off mid first so the next call is a fresh ascending mid sort
      component.sortBy('mid');
      expect(component.movieList.map((m) => m.mid)).toEqual([3, 20]);
      expect(component.sortDirection).toBe('asc');
    });

    it('toggles direction when the same column is clicked again', () => {
      init([
        { mid: 3, name: 'B', genre: '', price: 1, rating: 'G', studio: 1 },
        { mid: 20, name: 'A', genre: '', price: 1, rating: 'G', studio: 1 },
      ]);
      // default sortColumn is already 'mid', so this first call toggles to desc
      component.sortBy('mid');
      expect(component.sortDirection).toBe('desc');
      expect(component.movieList.map((m) => m.mid)).toEqual([20, 3]);

      component.sortBy('mid');
      expect(component.sortDirection).toBe('asc');
      expect(component.movieList.map((m) => m.mid)).toEqual([3, 20]);
    });

    it('switching to a different column resets direction to ascending', () => {
      init([
        { mid: 1, name: 'Zeta', genre: '', price: 1, rating: 'G', studio: 1 },
        { mid: 2, name: 'Alpha', genre: '', price: 1, rating: 'G', studio: 1 },
      ]);
      component.sortBy('mid'); // toggle mid to desc first
      component.sortBy('name');
      expect(component.sortColumn).toBe('name');
      expect(component.sortDirection).toBe('asc');
      expect(component.movieList.map((m) => m.name)).toEqual(['Alpha', 'Zeta']);
    });

    it('re-applies the current sort (not a hardcoded mid sort) after a fresh load', () => {
      vi.useFakeTimers();
      init([
        { mid: 1, name: 'Zeta', genre: '', price: 1, rating: 'G', studio: 1 },
        { mid: 2, name: 'Alpha', genre: '', price: 1, rating: 'G', studio: 1 },
      ]);
      component.sortBy('name');

      component.filterForm.get('rating')?.setValue('PG');
      vi.advanceTimersByTime(300);
      const req = httpMock.expectOne((r) => r.url === moviesUrl);
      req.flush(
        page([
          {
            mid: 5,
            name: 'Bravo',
            genre: '',
            price: 1,
            rating: 'PG',
            studio: 1,
          },
          {
            mid: 4,
            name: 'Alpha2',
            genre: '',
            price: 1,
            rating: 'PG',
            studio: 1,
          },
        ]),
      );

      expect(component.movieList.map((m) => m.name)).toEqual([
        'Alpha2',
        'Bravo',
      ]);
    });
  });

  describe('empty search results', () => {
    it('shows a no-matches row instead of leaving the table empty', () => {
      init([
        {
          mid: 1,
          name: 'Inception',
          genre: '',
          price: 1,
          rating: 'G',
          studio: 1,
        },
      ]);
      component.searchString = 'nonexistent movie';
      fixture.detectChanges();

      const row = fixture.nativeElement.querySelector(
        '[data-testid="no-search-results"]',
      );
      expect(row).toBeTruthy();
    });

    it('does not show the no-matches row when results exist', () => {
      init([
        {
          mid: 1,
          name: 'Inception',
          genre: '',
          price: 1,
          rating: 'G',
          studio: 1,
        },
      ]);
      fixture.detectChanges();

      const row = fixture.nativeElement.querySelector(
        '[data-testid="no-search-results"]',
      );
      expect(row).toBeNull();
    });
  });

  describe('sort arrow indicator', () => {
    const oneMovie = [
      { mid: 1, name: 'A', genre: '', price: 1, rating: 'G', studio: 1 },
    ];

    function arrowFor(testid: string): HTMLElement | null {
      return fixture.nativeElement.querySelector(`[data-testid="${testid}"]`);
    }

    it('shows an ascending arrow on MID by default', () => {
      init(oneMovie);
      expect(arrowFor('sort-arrow-mid')?.textContent).toBe('▲');
      expect(arrowFor('sort-arrow-name')).toBeNull();
    });

    it('flips to a descending arrow when MID is clicked again', () => {
      init(oneMovie);
      component.sortBy('mid');
      fixture.detectChanges();
      expect(arrowFor('sort-arrow-mid')?.textContent).toBe('▼');
    });

    it('moves the arrow to Name when its header is clicked', () => {
      init(oneMovie);
      component.sortBy('name');
      fixture.detectChanges();
      expect(arrowFor('sort-arrow-mid')).toBeNull();
      expect(arrowFor('sort-arrow-name')?.textContent).toBe('▲');
    });
  });

  describe('pagination', () => {
    it('nextPage increments the page and reloads when more pages exist', () => {
      init([], { totalPages: 3 });

      component.nextPage();
      expect(component.page).toBe(1);

      const req = httpMock.expectOne(
        (r) => r.url === moviesUrl && r.params.get('page') === '1',
      );
      req.flush(page([], { page: 1, totalPages: 3 }));
    });

    it('nextPage does nothing on the last page', () => {
      init([], { totalPages: 1 });
      component.nextPage();
      expect(component.page).toBe(0);
      httpMock.expectNone(moviesUrl);
    });

    it('prevPage decrements the page and reloads', () => {
      init([], { totalPages: 3 });
      component.nextPage();
      httpMock
        .expectOne((r) => r.url === moviesUrl && r.params.get('page') === '1')
        .flush(page([], { page: 1, totalPages: 3 }));

      component.prevPage();
      expect(component.page).toBe(0);
      const req = httpMock.expectOne(
        (r) => r.url === moviesUrl && r.params.get('page') === '0',
      );
      req.flush(page([], { page: 0, totalPages: 3 }));
    });

    it('prevPage does nothing on the first page', () => {
      init([], { totalPages: 3 });
      component.prevPage();
      expect(component.page).toBe(0);
      httpMock.expectNone(moviesUrl);
    });
  });

  describe('delete confirmation flow', () => {
    it('confirmDelete sets pendingDeleteMid; cancelDelete clears it', () => {
      init([]);
      component.confirmDelete(1001);
      expect(component.pendingDeleteMid).toBe(1001);
      component.cancelDelete();
      expect(component.pendingDeleteMid).toBeNull();
    });

    it('delete removes the movie, decrements totalElements, and shows a success message', () => {
      const movies = [
        { mid: 1001, name: 'A', genre: '', price: 1, rating: 'G', studio: 1 },
      ];
      init(movies, { totalElements: 1 });
      component.confirmDelete(1001);

      component.delete(1001);
      expect(component.pendingDeleteMid).toBeNull();

      const req = httpMock.expectOne(`${environment.apiUrl}/movie/1001`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(component.movieList.length).toBe(0);
      expect(component.totalElements).toBe(0);
      expect(component.successMessage).toBe('Movie deleted successfully.');
    });

    it('sets an errorMessage when delete fails', () => {
      init([
        { mid: 1001, name: 'A', genre: '', price: 1, rating: 'G', studio: 1 },
      ]);
      component.delete(1001);
      const req = httpMock.expectOne(`${environment.apiUrl}/movie/1001`);
      req.flush('fail', { status: 500, statusText: 'Server Error' });

      expect(component.errorMessage).toBe(
        'Could not delete the movie. Please try again.',
      );
    });

    it('auto-dismisses the success message 4 seconds after a delete', () => {
      vi.useFakeTimers();
      init([
        { mid: 1001, name: 'A', genre: '', price: 1, rating: 'G', studio: 1 },
      ]);
      component.delete(1001);
      const req = httpMock.expectOne(`${environment.apiUrl}/movie/1001`);
      req.flush({});

      expect(component.successMessage).toBe('Movie deleted successfully.');
      vi.advanceTimersByTime(4000);
      expect(component.successMessage).toBeNull();
    });
  });

  describe('success message', () => {
    it('dismissSuccessMessage clears it manually', () => {
      init([]);
      component.successMessage = 'Movie deleted successfully.';
      component.dismissSuccessMessage();
      expect(component.successMessage).toBeNull();
    });

    it('reads a success message passed via navigation state on init', () => {
      history.pushState({ successMessage: 'Movie added successfully.' }, '');
      init([]);
      expect(component.successMessage).toBe('Movie added successfully.');
    });

    it('auto-dismisses the success message after 4 seconds', () => {
      vi.useFakeTimers();
      history.pushState({ successMessage: 'Movie added successfully.' }, '');
      fixture.detectChanges();
      httpMock.expectOne((r) => r.url === moviesUrl).flush(page([]));

      expect(component.successMessage).toBe('Movie added successfully.');
      vi.advanceTimersByTime(4000);
      expect(component.successMessage).toBeNull();
    });
  });

  describe('filters', () => {
    it('debounces search input and searches the full catalog from page 0', () => {
      vi.useFakeTimers();
      init([]);
      component.page = 2;

      component.filterForm.get('search')?.setValue('incep');
      vi.advanceTimersByTime(300);

      const req = httpMock.expectOne((r) => r.url === moviesUrl);
      expect(req.request.params.get('size')).toBe('500');
      expect(req.request.params.get('page')).toBe('0');
      req.flush(page([]));

      expect(component.page).toBe(0);
    });

    it('sends rating/minPrice/maxPrice as query params once debounced', () => {
      vi.useFakeTimers();
      init([]);

      component.filterForm.patchValue({
        rating: 'PG',
        minPrice: 5,
        maxPrice: 20,
      });
      vi.advanceTimersByTime(300);

      const req = httpMock.expectOne((r) => r.url === moviesUrl);
      expect(req.request.params.get('rating')).toBe('PG');
      expect(req.request.params.get('minPrice')).toBe('5');
      expect(req.request.params.get('maxPrice')).toBe('20');
      req.flush(page([]));
    });
  });

  describe('genre from route', () => {
    it('includes the route genre param as a query param', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ListComponent],
        providers: [
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useValue: { paramMap: of(convertToParamMap({ genre: 'Horror' })) },
          },
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      }).compileComponents();

      const genreFixture = TestBed.createComponent(ListComponent);
      const genreHttpMock = TestBed.inject(HttpTestingController);

      genreFixture.detectChanges();
      const req = genreHttpMock.expectOne((r) => r.url === moviesUrl);
      expect(req.request.params.get('genre')).toBe('Horror');
      req.flush(page([]));

      genreHttpMock.verify();
    });
  });
});
