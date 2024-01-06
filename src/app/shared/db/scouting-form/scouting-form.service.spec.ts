import { TestBed } from '@angular/core/testing';

import { ScoutingFormService } from './scouting-form.service';

describe('ScoutingFormService', () => {
  let service: ScoutingFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoutingFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
