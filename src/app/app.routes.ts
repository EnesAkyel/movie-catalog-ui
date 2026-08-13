import { Routes } from '@angular/router';
import { ListComponent } from './list-component/list-component';
import { MovieDetail } from './movie-detail/movie-detail';
import { AddMovie } from './add-movie/add-movie';
import { LoginComponent } from './login/login';
import { authGuard } from './auth-guard/auth-guard';

//defining the routes and redirects below
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'list', component: ListComponent, canActivate: [authGuard] },
  { path: 'add', component: AddMovie, canActivate: [authGuard] },
  {
    path: 'movie/:mid/edit',
    component: AddMovie,
    canActivate: [authGuard],
  },
  { path: 'movie/:mid', component: MovieDetail, canActivate: [authGuard] },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'genre/:genre',
    component: ListComponent,
    canActivate: [authGuard],
  },
  { path: '**', component: ListComponent, canActivate: [authGuard] },
];
