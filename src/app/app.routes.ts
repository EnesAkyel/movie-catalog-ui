import { Routes } from '@angular/router';
import { ListComponent } from './list-component/list-component';
import { MovieDetail } from './movie-detail/movie-detail';
import { AddMovie } from './add-movie/add-movie';

//defining the routes and redirects below
export const routes: Routes = [
  { path: 'list', component: ListComponent },
  { path: 'add', component: AddMovie },
  { path: 'movie/:mid/edit', component: AddMovie },
  { path: 'movie/:mid', component: MovieDetail },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'genre/:genre', component: ListComponent },
  { path: '**', component: ListComponent },
];
