import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorPopupComponent } from './error-popup/error-popup';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorPopupComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
