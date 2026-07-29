import {
  ChangeDetectorRef,
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { Movie } from '../movie/movie';
import { MovieService } from '../movie-service/movie-service';

import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime } from 'rxjs';
import { SearchPipe } from '../search-pipe/search-pipe';
import { GenreNavbarComponent } from '../genre-navbar/genre-navbar';

//when the search box has text, fetch this many results instead of one page,
//so search covers the whole catalog rather than just the visible page
const SEARCH_BATCH_SIZE = 500;

@Component({
  selector: 'app-list-component',
  imports: [
    RouterModule,
    ReactiveFormsModule,
    SearchPipe,
    GenreNavbarComponent,
  ],
  templateUrl: './list-component.html',
  styleUrl: './list-component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ListComponent implements OnInit {
  movieList: Movie[] = [];
  searchString: string = '';
  readonly filterForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  genre: string = '';

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  pendingDeleteMid: number | null = null;
  sortColumn: 'mid' | 'name' = 'mid';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    formBuilder: FormBuilder,
    private readonly service: MovieService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
  ) {
    this.filterForm = formBuilder.group({
      search: new FormControl(''),
      rating: new FormControl(''),
      minPrice: new FormControl(''),
      maxPrice: new FormControl(''),
    });
  }

  ngOnInit() {
    //a successful add/edit/delete elsewhere navigates here with a message to show
    this.successMessage = history.state?.successMessage || null;
    if (this.successMessage) {
      setTimeout(() => {
        this.successMessage = null;
        this.cdr.detectChanges();
      }, 4000);
    }

    //search and filters share one debounced pipeline; any change re-fetches from page 0
    this.filterForm.valueChanges.pipe(debounceTime(300)).subscribe((value) => {
      this.searchString = value.search;
      this.page = 0;
      this.loadMovies();
    });

    //get movies from backend, filtered by genre when the route has one
    this.route.paramMap.subscribe((params) => {
      this.genre = params.get('genre') ?? '';
      this.page = 0;
      this.loadMovies();
    });
  }

  //fetches movieList from the backend using the current genre/rating/price/page state.
  //while searching, grabs a large batch instead of one page so search covers everything.
  loadMovies() {
    const filters = this.filterForm.value;
    const searching = !!this.searchString;

    this.service
      .getAllMovies({
        genre: this.genre || undefined,
        rating: filters.rating || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        page: searching ? 0 : this.page,
        size: searching ? SEARCH_BATCH_SIZE : this.size,
      })
      .subscribe({
        next: (data) => {
          this.movieList = data.content;
          this.totalPages = data.totalPages;
          this.totalElements = data.totalElements;
          this.errorMessage = null;
          this.applySort();
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Could not load movies. Please try again later.';
          this.cdr.detectChanges();
        },
      });
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadMovies();
    }
  }

  nextPage() {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadMovies();
    }
  }

  //clicking the active column's header toggles its direction; clicking the other column switches to it, ascending
  sortBy(column: 'mid' | 'name') {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  //(re)applies the current sortColumn/sortDirection, e.g. after a fresh page of results loads
  applySort() {
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    if (this.sortColumn === 'name') {
      this.movieList.sort((a, b) => a.name.localeCompare(b.name) * direction);
    } else {
      this.movieList.sort((a, b) => (a.mid - b.mid) * direction);
    }
  }

  confirmDelete(mid: number) {
    this.pendingDeleteMid = mid;
  }

  cancelDelete() {
    this.pendingDeleteMid = null;
  }

  dismissSuccessMessage() {
    this.successMessage = null;
  }

  //delete a movie by mid by calling the backend endpoint
  delete(mid: number) {
    this.pendingDeleteMid = null;
    this.service.deleteMovie(mid.toString()).subscribe({
      next: () => {
        this.movieList = this.movieList.filter((movie) => movie.mid != mid);
        this.totalElements--;
        this.successMessage = 'Movie deleted successfully.';
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.detectChanges();
        }, 4000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Could not delete the movie. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }
}
