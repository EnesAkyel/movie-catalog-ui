import {
  ChangeDetectorRef,
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../auth-service/auth-service';

@Component({
  selector: 'app-genre-navbar',
  imports: [RouterModule],
  templateUrl: './genre-navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './genre-navbar.css',
})
export class GenreNavbarComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  genre = '';

  ngOnInit() {
    //track the currently selected genre from the route
    this.route.paramMap.subscribe((params) => {
      this.genre = params.get('genre') ?? '';
      this.cdr.detectChanges();
    });
  }

  logout() {
    this.authService.logout();
  }
}
