import {
  ChangeDetectorRef,
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-genre-navbar',
  imports: [RouterModule],
  templateUrl: './genre-navbar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './genre-navbar.css',
})
export class GenreNavbarComponent implements OnInit {
  genre: string = '';

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit() {
    //track the currently selected genre from the route
    this.route.paramMap.subscribe((params) => {
      this.genre = params.get('genre') ?? '';
      this.cdr.detectChanges();
    });
  }
}
