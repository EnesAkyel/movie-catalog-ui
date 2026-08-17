import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthService } from '../auth-service/auth-service';
import { ErrorPopupService } from '../error-popup/error-popup-service';

//attaches the stored JWT to every outgoing request, when one exists.
//on a 401, logs the user out and shows a popup instead of ever surfacing a screen.
//on any other 4XX/5XX, shows a "something went wrong" popup and still lets the
//request's own error handler run (field-level validation, etc.)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const errorPopup = inject(ErrorPopupService);
  const token = authService.getToken();

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          errorPopup.show('Your session has expired. Please log in again.');
          authService.logout();
          return EMPTY;
        }
        if (error.status >= 400) {
          errorPopup.show(
            'Something went wrong. Please refresh the page and try again.',
            true,
          );
        }
      }
      return throwError(() => error);
    }),
  );
};
