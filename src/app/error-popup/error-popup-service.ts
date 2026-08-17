import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ErrorPopup {
  message: string;
  refreshable: boolean;
}

@Injectable({
  providedIn: 'root',
})

//lets any part of the app (mainly the auth interceptor) trigger the global error popup
export class ErrorPopupService {
  private readonly popupSubject = new Subject<ErrorPopup>();
  readonly popup$ = this.popupSubject.asObservable();

  public show(message: string, refreshable = false): void {
    this.popupSubject.next({ message, refreshable });
  }
}
