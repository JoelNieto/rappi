import { TestBed } from '@angular/core/testing';
import { FileUrlPipe } from './file-url.pipe';

describe('FileUrlPipe', () => {
  let pipe: FileUrlPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileUrlPipe],
    });
    pipe = TestBed.inject(FileUrlPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
