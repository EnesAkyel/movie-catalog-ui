import { routes } from './app.routes';
import { ListComponent } from './list-component/list-component';
import { MovieDetail } from './movie-detail/movie-detail';
import { AddMovie } from './add-movie/add-movie';
import { LoginComponent } from './login/login';
import { authGuard } from './auth-guard/auth-guard';

describe('routes', () => {
  function findByPath(path: string) {
    return routes.find((r) => r.path === path);
  }

  it('routes list/genre paths and the wildcard to ListComponent', () => {
    expect(findByPath('list')?.component).toBe(ListComponent);
    expect(findByPath('genre/:genre')?.component).toBe(ListComponent);
    expect(findByPath('**')?.component).toBe(ListComponent);
  });

  it('routes add and edit paths to AddMovie', () => {
    expect(findByPath('add')?.component).toBe(AddMovie);
    expect(findByPath('movie/:mid/edit')?.component).toBe(AddMovie);
  });

  it('routes the movie detail path to MovieDetail', () => {
    expect(findByPath('movie/:mid')?.component).toBe(MovieDetail);
  });

  it('routes the login path to LoginComponent without a guard', () => {
    const login = findByPath('login');
    expect(login?.component).toBe(LoginComponent);
    expect(login?.canActivate).toBeUndefined();
  });

  it('guards every route except login', () => {
    const guarded = routes.filter((r) => r.path !== 'login' && r.path !== '');
    for (const route of guarded) {
      expect(route.canActivate).toEqual([authGuard]);
    }
  });

  it('redirects the empty path to list', () => {
    const root = findByPath('');
    expect(root?.redirectTo).toBe('list');
    expect(root?.pathMatch).toBe('full');
  });
});
