import { TestBed } from '@angular/core/testing';

import { NegAuthGuard } from './neg-auth.guard';

describe('NegAuthGuard', () => {
  let guard: NegAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NegAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
