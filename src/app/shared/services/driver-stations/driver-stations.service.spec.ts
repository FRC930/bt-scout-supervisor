import { TestBed } from '@angular/core/testing';

import { DriverStationsService } from './driver-stations.service';

describe('DriverStationsService', () => {
  let service: DriverStationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DriverStationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
