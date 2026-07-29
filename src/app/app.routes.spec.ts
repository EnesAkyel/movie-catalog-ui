import { routes } from './app.routes';
import { ListComponent } from './list-component/list-component';
import { MovieDetail } from './movie-detail/movie-detail';
import { AddMovie } from './add-movie/add-movie';

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

  it('redirects the empty path to list', () => {
    const root = findByPath('');
    expect(root?.redirectTo).toBe('list');
    expect(root?.pathMatch).toBe('full');
  });
});