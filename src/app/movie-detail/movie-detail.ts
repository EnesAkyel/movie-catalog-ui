import {
  ChangeDetectorRef,
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { Movie } from '../movie/movie';
import { MovieService } from '../movie-service/movie-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-movie-detail',
  imports: [RouterModule],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class MovieDetail implements OnInit {
  mid: string = '1';
  movie: Movie = {
    mid: 0,
    name: '',
    genre: '',
    price: 0,
    rating: '',
    studio: 0,
  };
  studioName: string | null = null;
  errorMessage: string | null = null;
  pendingDelete = false;

  constructor(
    private readonly movieService: MovieService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    //in the movie list, mid is clickable which navigates to movie detail page.
    //this below code calls backend to get specific movie detail
    //if response code is 404 (movie doesn't exist), show a not-found message.
    //if there is a different error, show a generic message.
    this.route.paramMap.subscribe((params) => {
      this.mid = params.get('mid')!;

      this.movieService.getMovieByMID(this.mid).subscribe({
        next: (data) => {
          this.movie = data;
          this.errorMessage = null;
          this.loadStudioName();
          this.cdr.detectChanges();
        },
        error: (error) => {
          if (error.status === 404) {
            this.errorMessage = `Movie ${this.mid} doesn't exist.`;
          } else {
            this.errorMessage =
              'Something went wrong loading this movie. Please try again.';
          }

          this.cdr.detectChanges();
        },
      });
    });
  }

  //resolves movie.studio (a studio ID) to its name for display; falls back to the raw ID if the lookup fails
  loadStudioName() {
    this.movieService.getStudios().subscribe((data) => {
      const studio = data.content.find((s) => s.sid === this.movie.studio);
      this.studioName = studio ? studio.name : null;
      this.cdr.detectChanges();
    });
  }

  confirmDelete() {
    this.pendingDelete = true;
  }

  cancelDelete() {
    this.pendingDelete = false;
  }

  //we can also delete a movie in movie detail page.
  delete() {
    this.pendingDelete = false;
    this.movieService.deleteMovie(this.mid).subscribe({
      next: () => {
        this.router.navigateByUrl('/list', {
          state: { successMessage: 'Movie deleted successfully.' },
        });
      },
      error: () => {
        this.errorMessage = 'Could not delete the movie. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }
}
