import { TestBed } from '@angular/core/testing';

import { AverageStoreService } from './average-store.service';

describe('AverageStoreService', () => {
  let service: AverageStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AverageStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
