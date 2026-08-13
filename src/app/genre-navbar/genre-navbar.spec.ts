import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { GenreNavbarComponent } from './genre-navbar';
import { AuthService } from '../auth-service/auth-service';

describe('GenreNavbarComponent', () => {
  let component: GenreNavbarComponent;
  let fixture: ComponentFixture<GenreNavbarComponent>;
  let authService: AuthService;

  async function setup(genre: string | null) {
    await TestBed.configureTestingModule({
      imports: [GenreNavbarComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap(genre ? { genre } : {})) },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GenreNavbarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup(null);
    expect(component).toBeTruthy();
  });

  it('defaults genre to an empty string when the route has none', async () => {
    await setup(null);
    expect(component.genre).toBe('');
  });

  it('reads the genre from the route param map', async () => {
    await setup('Horror');
    expect(component.genre).toBe('Horror');
  });

  it('renders a genre link for each genre with a stable data-testid', async () => {
    await setup(null);
    const link: HTMLAnchorElement | null = fixture.nativeElement.querySelector(
      '[data-testid="genre-link-Horror"]',
    );
    expect(link).toBeTruthy();
    expect(link!.textContent).toContain('Horror');
  });

  function linkFor(testid: string): HTMLAnchorElement {
    return fixture.nativeElement.querySelector(`[data-testid="${testid}"]`)!;
  }

  it('renders an All link that clears the genre filter', async () => {
    await setup(null);
    const link = linkFor('genre-link-All');
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('All');
  });

  it('marks the All link active when no genre is selected', async () => {
    await setup(null);
    expect(linkFor('genre-link-All').classList).toContain('active');
    expect(linkFor('genre-link-Horror').classList).not.toContain('active');
  });

  it('marks the matching genre link active and the rest inactive', async () => {
    await setup('Horror');
    expect(linkFor('genre-link-Horror').classList).toContain('active');
    expect(linkFor('genre-link-All').classList).not.toContain('active');
    expect(linkFor('genre-link-Action').classList).not.toContain('active');
  });

  it('renders a logout button that logs out on click', async () => {
    await setup(null);
    const logoutSpy = vi.spyOn(authService, 'logout');

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('[data-testid="logout-button"]');
    button.click();

    expect(logoutSpy).toHaveBeenCalled();
  });
});
