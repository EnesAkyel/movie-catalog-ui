import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorPopupComponent } from './error-popup';
import { ErrorPopupService } from './error-popup-service';

describe('ErrorPopupComponent', () => {
  let component: ErrorPopupComponent;
  let fixture: ComponentFixture<ErrorPopupComponent>;
  let errorPopupService: ErrorPopupService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorPopupComponent);
    component = fixture.componentInstance;
    errorPopupService = TestBed.inject(ErrorPopupService);
    fixture.detectChanges();
  });

  function popupEl(): HTMLElement | null {
    return fixture.nativeElement.querySelector('[data-testid="error-popup"]');
  }

  it('renders nothing until a popup is shown', () => {
    expect(popupEl()).toBeNull();
  });

  it('renders the message when a popup is shown', () => {
    errorPopupService.show('Something broke');
    fixture.detectChanges();

    expect(popupEl()).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-testid="error-popup-message"]')
        .textContent,
    ).toContain('Something broke');
  });

  it('does not render a refresh button when refreshable is false', () => {
    errorPopupService.show('Session expired', false);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(
        '[data-testid="error-popup-refresh"]',
      ),
    ).toBeNull();
  });

  it('renders a refresh button that reloads the page when refreshable is true', () => {
    const reloadSpy = vi.fn();
    vi.stubGlobal('location', { reload: reloadSpy });

    errorPopupService.show('Server error', true);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-testid="error-popup-refresh"]',
    );
    expect(button).toBeTruthy();
    button.click();

    expect(reloadSpy).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('dismisses the popup on dismiss button click', () => {
    errorPopupService.show('Something broke');
    fixture.detectChanges();
    expect(popupEl()).toBeTruthy();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-testid="error-popup-dismiss"]',
    );
    button.click();
    fixture.detectChanges();

    expect(popupEl()).toBeNull();
  });

  it('unsubscribes on destroy', () => {
    fixture.destroy();
    errorPopupService.show('After destroy');
    expect(component.popup).toBeNull();
  });
});
