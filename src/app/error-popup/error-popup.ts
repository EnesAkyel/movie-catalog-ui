import {
  ChangeDetectorRef,
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorPopup, ErrorPopupService } from './error-popup-service';

@Component({
  selector: 'app-error-popup',
  templateUrl: './error-popup.html',
  styleUrl: './error-popup.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

//global popup shown on top of every page for HTTP errors (401 session-expired, and any other 4XX/5XX)
export class ErrorPopupComponent implements OnInit, OnDestroy {
  private readonly errorPopupService = inject(ErrorPopupService);
  private readonly cdr = inject(ChangeDetectorRef);
  private subscription?: Subscription;

  popup: ErrorPopup | null = null;

  ngOnInit() {
    this.subscription = this.errorPopupService.popup$.subscribe((popup) => {
      this.popup = popup;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  dismiss() {
    this.popup = null;
    this.cdr.detectChanges();
  }

  refresh() {
    window.location.reload();
  }
}
