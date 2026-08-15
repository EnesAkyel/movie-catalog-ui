# Movie Catalog UI

[![CI](https://github.com/EnesAkyel/movie-catalog-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/EnesAkyel/movie-catalog-ui/actions/workflows/ci.yml)

An Angular front end for browsing, filtering, and managing a movie catalog. It pairs with [movie-catalog-api](https://github.com/EnesAkyel/movie-catalog-api) (Spring Boot) and is intended as the target application for a forthcoming Playwright E2E suite. The UI has been deliberately built with locator-friendly markup (`data-testid`, ARIA roles, real interactive elements) to support that.

---

## Tech Stack

| Layer        | Technology                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Framework    | Angular 22 (standalone components, native `@if`/`@for` control flow)                           |
| Language     | TypeScript 6.0                                                                                 |
| Forms        | Angular Reactive Forms                                                                         |
| HTTP         | `HttpClient`, RxJS                                                                             |
| Unit Tests   | Vitest, `@vitest/coverage-v8`                                                                  |
| Formatting   | Prettier (with the Angular HTML parser)                                                        |
| Linting      | ESLint (`angular-eslint`, `typescript-eslint`)                                                 |
| Code Quality | SonarCloud                                                                                     |
| CI           | GitHub Actions                                                                                 |
| Backend      | [movie-catalog-api](https://github.com/EnesAkyel/movie-catalog-api) (Spring Boot + PostgreSQL) |

---

## Project Structure

```
src/app/
├── add-movie/          # Add/Edit movie form - reactive forms + client & server-side validation
├── auth-guard/         # authGuard - CanActivateFn, redirects to /login when logged out
├── auth-interceptor/   # authInterceptor - attaches the stored JWT to outgoing requests
├── auth-service/       # AuthService - login/logout, JWT storage, isLoggedIn()
├── custom-validator/   # CustomValidator - shared reactive-forms validators
├── genre-navbar/       # Genre filter navbar + logout button
├── list-component/     # Movie list - search, filters, pagination, sort, delete
├── login/              # LoginComponent - username/password form
├── movie/              # Movie model
├── movie-detail/       # Single movie detail view
├── movie-service/      # MovieService - HttpClient wrapper around the backend API
└── search-pipe/        # SearchPipe - client-side search filter pipe

src/environments/       # environment.ts - backend API base URL
```

---

## Routes

All routes except `/login` are protected by `authGuard`, which redirects to `/login` when there's no stored JWT.

| Path               | Component        | Description                                                       |
|--------------------|------------------|-------------------------------------------------------------------|
| `/login`           | `LoginComponent` | Username/password login                                           |
| `/list`            | `ListComponent`  | Movie list - search, genre/rating/price filters, pagination, sort |
| `/genre/:genre`    | `ListComponent`  | Movie list filtered by genre                                      |
| `/add`             | `AddMovie`       | Add a new movie                                                   |
| `/movie/:mid/edit` | `AddMovie`       | Edit an existing movie                                            |
| `/movie/:mid`      | `MovieDetail`    | View a single movie's details                                     |
| `/`                | -                | Redirects to `/list`                                              |
| `**`               | `ListComponent`  | Wildcard fallback                                                 |

---

## Features

- JWT login (`/login`) - guarded routes, token stored in `localStorage`, attached to every API request via an HTTP interceptor, logout button
- Search by name or MID (debounced; searches the full catalog rather than just the current page)
- Filter by genre (navbar), rating, and min/max price
- Pagination and sort by MID/Name
- Add/Edit movie with client-side validation mirroring the backend's constraints, plus surfaced field-level validation errors when the server rejects something the client missed
- Delete with an inline Yes/No confirmation (list and detail views)
- Studio ID resolved to studio name on the movie detail page
- Success/error notifications use `role="alert"` / `aria-live="polite"` and are dismissible, not just timer-based

---

## Running Locally

**Prerequisites:** Node version pinned in `.nvmrc` (use `nvm use`), and [movie-catalog-api](https://github.com/EnesAkyel/movie-catalog-api) running at `http://localhost:8080` (`docker compose up` in that repo, with `AUTH_USERNAME`/`AUTH_PASSWORD`/`JWT_SECRET` set in its `.env`).

```bash
npm install
npm start
```

The app runs at `http://localhost:4200`. The API base URL is configured in `src/environments/environment.ts`. Log in at `/login` with the same `AUTH_USERNAME`/`AUTH_PASSWORD` the API was started with.

---

## Testing & Formatting

```bash
# Unit tests (Vitest)
npm test

# Unit tests with coverage (lcov + text summary)
npm run test:coverage

# Prettier
npm run format        # write
npm run format:check  # check only, used in CI

# ESLint
npm run lint
```

---

## CI Pipeline

Every push to `main` and every pull request triggers the GitHub Actions workflow (`.github/workflows/ci.yml`):

1. Check out code
2. Set up Node (version from `.nvmrc`)
3. `npm ci`
4. `npm run format:check`
5. `npm run lint`
6. `npm run build`
7. `npm run test:coverage`
8. SonarCloud scan

---

## Test-Automation Readiness

This UI is the target for a planned Playwright E2E suite, so a few things were built with that in mind:

- **`data-testid`** on interactive elements and validation/status text, following a stable, kebab-case convention (dynamic ones suffixed by entity ID, e.g. `movie-link-1001`)
- **Real `<button>` elements** for actions (sort, delete, dismiss) instead of `<a (click)>`, so role-based locators (`getByRole('button', { name })`) work per Playwright's own locator guidance
- **`role="alert"` / `aria-live="polite"`** on notifications, so assertions don't need arbitrary waits
- **A real JWT login flow** (`/login`, guarded routes, logout) - gives the planned suite auth guard redirects, happy/sad login paths, and a `storageState` login-once/reuse pattern to exercise
- **An inline delete confirmation (Yes/No)** - gives a real confirm/cancel interaction to exercise, instead of an irreversible single click
