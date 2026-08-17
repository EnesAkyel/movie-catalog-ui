import { TestBed } from '@angular/core/testing';
import { ErrorPopupService } from './error-popup-service';

describe('ErrorPopupService', () => {
  let service: ErrorPopupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorPopupService);
  });

  it('emits the message with refreshable defaulted to false', () => {
    const popupSpy = vi.fn();
    service.popup$.subscribe(popupSpy);

    service.show('Something broke');

    expect(popupSpy).toHaveBeenCalledWith({
      message: 'Something broke',
      refreshable: false,
    });
  });

  it('emits refreshable as true when passed', () => {
    const popupSpy = vi.fn();
    service.popup$.subscribe(popupSpy);

    service.show('Something broke', true);

    expect(popupSpy).toHaveBeenCalledWith({
      message: 'Something broke',
      refreshable: true,
    });
  });
});
