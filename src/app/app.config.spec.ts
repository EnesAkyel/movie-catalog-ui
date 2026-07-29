import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { appConfig } from './app.config';

describe('appConfig', () => {
  it('registers zone change detection, router, and http client providers', () => {
    TestBed.configureTestingModule({ providers: appConfig.providers });

    expect(TestBed.inject(HttpClient)).toBeTruthy();
    expect(TestBed.inject(Router)).toBeTruthy();
  });
});