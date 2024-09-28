import { TestBed } from '@angular/core/testing';

import { DocGeneratorsService } from './doc-generators.service';

describe('DocGeneratorsService', () => {
  let service: DocGeneratorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocGeneratorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
