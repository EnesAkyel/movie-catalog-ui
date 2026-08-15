import {
  ChangeDetectorRef,
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
} from '@angular/core';
import { Movie } from '../movie/movie';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MovieService } from '../movie-service/movie-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomValidator } from '../custom-validator/custom-validator';

@Component({
  selector: 'app-add-movie',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './add-movie.html',
  styleUrl: './add-movie.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMovie implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly service = inject(MovieService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  badMID = false;
  errorMessage: string | null = null;
  fieldErrors: { field: string; message: string }[] = [];
  isEditMode = false;
  mid: string | null = null;
  readonly movieForm: FormGroup;

  constructor() {
    const formBuilder = this.formBuilder;

    //validation values in the add/edit movie form for each field
    //genre and rating have preselected values
    this.movieForm = formBuilder.group({
      mid: new FormControl('', [
        Validators.required,
        Validators.min(1000),
        Validators.max(9999),
        Validators.pattern('^[0-9]*$'),
      ]),
      name: new FormControl('', Validators.required),
      genre: new FormControl('Action'),
      price: new FormControl('', [
        Validators.required,
        Validators.min(0.01),
        CustomValidator.isNumber(),
      ]),
      rating: new FormControl('G'),
      studio: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(100),
        Validators.pattern('^[0-9]*$'),
      ]),
    });
  }

  ngOnInit() {
    this.mid = this.route.snapshot.paramMap.get('mid');

    if (this.mid) {
      //editing an existing movie. MID identifies the movie and can't change
      this.isEditMode = true;
      this.movieForm.get('mid')?.disable();

      this.service.getMovieByMID(this.mid).subscribe({
        next: (data) => {
          this.movieForm.patchValue(data);
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage =
            'Could not load this movie for editing. Please try again.';
          this.cdr.detectChanges();
        },
      });
    }
  }

  submit() {
    this.errorMessage = null;
    this.fieldErrors = [];
    //disabled controls are excluded from .value, so add mid back in for edit mode
    const movie: Movie = this.isEditMode
      ? { ...this.movieForm.value, mid: Number(this.mid) }
      : this.movieForm.value;

    const request = this.isEditMode
      ? this.service.updateMovie(this.mid!, movie)
      : this.service.addMovie(movie);

    request.subscribe({
      //if backend returns ok, navigate back to list page to display movies
      next: () => {
        const successMessage = this.isEditMode
          ? 'Movie updated successfully.'
          : 'Movie added successfully.';
        void this.router.navigateByUrl('/list', { state: { successMessage } });
      },
      error: (error) => {
        //if MID already exists (add only), clear the mid field. The "MID already in use" message is shown next to the field
        if (!this.isEditMode && error.status === 409) {
          this.badMID = true;
          this.movieForm.get('mid')?.reset();
        } else if (error.status === 400 && Array.isArray(error.error?.errors)) {
          //server-side validation caught something client-side validation missed. Show the field-level messages
          this.fieldErrors = error.error.errors;
        } else {
          //if there is a different error, show a generic message to the user
          this.errorMessage = this.isEditMode
            ? 'Could not save changes. Please try again.'
            : 'Something went wrong while adding the movie. Please try again.';
        }
        this.cdr.detectChanges();
      },
    });
  }
}
