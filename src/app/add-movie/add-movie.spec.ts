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

import { AddMovie } from './add-movie';
import { environment } from '../../environments/environment';

const baseUrl = environment.apiUrl;

async function setup(mid: string | null) {
  await TestBed.configureTestingModule({
    imports: [AddMovie],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: convertToParamMap(mid ? { mid } : {}) },
        },
      },
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(AddMovie);
  const component = fixture.componentInstance;
  const httpMock = TestBed.inject(HttpTestingController);
  const router = TestBed.inject(Router);
  return { fixture, component, httpMock, router };
}

const validFormValue = {
  mid: '1001',
  name: 'Inception',
  genre: 'Action',
  price: '3.99',
  rating: 'G',
  studio: '1',
};

describe('AddMovie - add mode', () => {
  let fixture: ComponentFixture<AddMovie>;
  let component: AddMovie;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    ({ fixture, component, httpMock, router } = await setup(null));
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts in add mode with the mid control enabled', () => {
    expect(component.isEditMode).toBe(false);
    expect(component.mid).toBeNull();
    expect(component.movieForm.get('mid')?.disabled).toBe(false);
  });

  it('defaults genre to Action and rating to G', () => {
    expect(component.movieForm.get('genre')?.value).toBe('Action');
    expect(component.movieForm.get('rating')?.value).toBe('G');
  });

  it('is invalid when required fields are empty', () => {
    expect(component.movieForm.valid).toBe(false);
  });

  it('is valid once all fields have acceptable values', () => {
    component.movieForm.patchValue(validFormValue);
    expect(component.movieForm.valid).toBe(true);
  });

  describe('field error display timing', () => {
    it('does not show an error while the field is only dirty (still typing)', () => {
      const mid = component.movieForm.get('mid')!;
      mid.setValue('abcd');
      mid.markAsDirty();
      fixture.detectChanges();

      expect(mid.dirty).toBe(true);
      expect(mid.touched).toBe(false);
      expect(
        fixture.nativeElement.querySelector(
          '[data-testid="mid-error-pattern"]',
        ),
      ).toBeNull();
    });

    it('shows the error once the field is touched (blurred)', () => {
      const mid = component.movieForm.get('mid')!;
      mid.setValue('abcd');
      mid.markAsTouched();
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector(
          '[data-testid="mid-error-pattern"]',
        ),
      ).toBeTruthy();
    });
  });

  describe('mid validation', () => {
    it.each([
      { description: 'non-digit input', value: 'abcd', error: 'pattern' },
      { description: 'values below 1000', value: '999', error: 'min' },
      { description: 'values above 9999', value: '10000', error: 'max' },
    ])('rejects $description via the $error validator', ({ value, error }) => {
      const mid = component.movieForm.get('mid')!;
      mid.setValue(value);
      expect(mid.hasError(error)).toBe(true);
    });

    it('accepts a 4-digit value in range', () => {
      const mid = component.movieForm.get('mid')!;
      mid.setValue('1001');
      expect(mid.valid).toBe(true);
    });
  });

  describe('price validation', () => {
    it('rejects non-numeric input via the isNumber validator', () => {
      const price = component.movieForm.get('price')!;
      price.setValue('abc');
      expect(price.hasError('isNaN')).toBe(true);
    });

    it('rejects zero (min is 0.01)', () => {
      const price = component.movieForm.get('price')!;
      price.setValue('0');
      expect(price.hasError('min')).toBe(true);
    });

    it('accepts a positive number', () => {
      const price = component.movieForm.get('price')!;
      price.setValue('3.99');
      expect(price.valid).toBe(true);
    });
  });

  describe('studio validation', () => {
    it('rejects non-digit input', () => {
      const studio = component.movieForm.get('studio')!;
      studio.setValue('abc');
      expect(studio.hasError('pattern')).toBe(true);
    });

    it('rejects values above 100', () => {
      const studio = component.movieForm.get('studio')!;
      studio.setValue('101');
      expect(studio.hasError('max')).toBe(true);
    });

    it('accepts a value in range', () => {
      const studio = component.movieForm.get('studio')!;
      studio.setValue('50');
      expect(studio.valid).toBe(true);
    });
  });

  describe('submit', () => {
    it('posts the form and navigates to /list with a success message', () => {
      const navigateSpy = vi.spyOn(router, 'navigateByUrl');
      component.movieForm.patchValue(validFormValue);

      component.submit();

      const req = httpMock.expectOne(`${baseUrl}/movie`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        mid: '1001',
        name: 'Inception',
        genre: 'Action',
        price: '3.99',
        rating: 'G',
        studio: '1',
      });
      req.flush({});

      expect(navigateSpy).toHaveBeenCalledWith('/list', {
        state: { successMessage: 'Movie added successfully.' },
      });
    });

    it('marks badMID and clears only the mid field on a 409 conflict', () => {
      component.movieForm.patchValue(validFormValue);
      component.submit();

      const req = httpMock.expectOne(`${baseUrl}/movie`);
      req.flush('conflict', { status: 409, statusText: 'Conflict' });

      expect(component.badMID).toBe(true);
      expect(component.movieForm.get('mid')?.value).toBeFalsy();
      expect(component.movieForm.get('name')?.value).toBe('Inception');
      expect(component.movieForm.get('price')?.value).toBe('3.99');
      expect(component.movieForm.get('studio')?.value).toBe('1');
    });

    it('surfaces structured field errors on a 400 with an errors array', () => {
      component.movieForm.patchValue(validFormValue);
      component.submit();

      const fieldErrors = [
        { field: 'mid', message: 'Movie ID must be a 4 digit number' },
      ];
      const req = httpMock.expectOne(`${baseUrl}/movie`);
      req.flush(
        { message: 'Spring Validation Error', errors: fieldErrors },
        { status: 400, statusText: 'Bad Request' },
      );

      expect(component.fieldErrors).toEqual(fieldErrors);
    });

    it('sets a generic errorMessage on other failures', () => {
      component.movieForm.patchValue(validFormValue);
      component.submit();

      const req = httpMock.expectOne(`${baseUrl}/movie`);
      req.flush('fail', { status: 500, statusText: 'Server Error' });

      expect(component.errorMessage).toBe(
        'Something went wrong while adding the movie. Please try again.',
      );
    });

    it('resets errorMessage and fieldErrors on each new submit', () => {
      component.errorMessage = 'stale error';
      component.fieldErrors = [{ field: 'mid', message: 'stale' }];
      component.movieForm.patchValue(validFormValue);

      component.submit();

      expect(component.errorMessage).toBeNull();
      expect(component.fieldErrors).toEqual([]);
      httpMock.expectOne(`${baseUrl}/movie`).flush({});
    });
  });
});

describe('AddMovie - edit mode', () => {
  let fixture: ComponentFixture<AddMovie>;
  let component: AddMovie;
  let httpMock: HttpTestingController;
  let router: Router;

  const existingMovie = {
    mid: 1001,
    name: 'Inception',
    genre: 'Action',
    price: 3.99,
    rating: 'G',
    studio: 1,
  };

  beforeEach(async () => {
    ({ fixture, component, httpMock, router } = await setup('1001'));
  });

  afterEach(() => httpMock.verify());

  function initEditing() {
    fixture.detectChanges();
    httpMock.expectOne(`${baseUrl}/movie/1001`).flush(existingMovie);
  }

  it('enters edit mode and disables the mid control', () => {
    initEditing();
    expect(component.isEditMode).toBe(true);
    expect(component.mid).toBe('1001');
    expect(component.movieForm.get('mid')?.disabled).toBe(true);
  });

  it('patches the form with the fetched movie', () => {
    initEditing();
    expect(component.movieForm.get('name')?.value).toBe('Inception');
    expect(component.movieForm.get('price')?.value).toBe(3.99);
  });

  it('sets an errorMessage when the movie fails to load', () => {
    fixture.detectChanges();
    httpMock
      .expectOne(`${baseUrl}/movie/1001`)
      .flush('fail', { status: 500, statusText: 'Server Error' });

    expect(component.errorMessage).toBe(
      'Could not load this movie for editing. Please try again.',
    );
  });

  it('submits an update and navigates to /list with a success message', () => {
    initEditing();
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    component.movieForm.patchValue({ name: 'Inception 2' });

    component.submit();

    const req = httpMock.expectOne(`${baseUrl}/movie/1001`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.mid).toBe(1001);
    expect(req.request.body.name).toBe('Inception 2');
    req.flush({});

    expect(navigateSpy).toHaveBeenCalledWith('/list', {
      state: { successMessage: 'Movie updated successfully.' },
    });
  });

  it('sets a generic errorMessage when the update fails', () => {
    initEditing();
    component.submit();

    const req = httpMock.expectOne(`${baseUrl}/movie/1001`);
    req.flush('fail', { status: 500, statusText: 'Server Error' });

    expect(component.errorMessage).toBe(
      'Could not save changes. Please try again.',
    );
  });
});
