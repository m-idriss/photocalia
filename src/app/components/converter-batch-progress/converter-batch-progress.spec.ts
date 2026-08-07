import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BatchFile, BatchFileStatus } from '../../models';
import { ConverterBatchProgress } from './converter-batch-progress';

describe('ConverterBatchProgress', () => {
  let fixture: ComponentFixture<ConverterBatchProgress>;
  let component: ConverterBatchProgress;

  const files: BatchFile[] = [
    { file: new File(['a'], 'one.png'), status: BatchFileStatus.SUCCESS, events: [] },
    { file: new File(['b'], 'two.png'), status: BatchFileStatus.PROCESSING, progress: 45 },
    { file: new File(['c'], 'three.png'), status: BatchFileStatus.ERROR, error: 'Retryable' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ConverterBatchProgress] }).compileComponents();
    fixture = TestBed.createComponent(ConverterBatchProgress);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('files', files);
    fixture.componentRef.setInput('processing', true);
    fixture.componentRef.setInput('batchMode', true);
    fixture.detectChanges();
  });

  it('derives progress from terminal file states', () => {
    expect(component['stats']()).toEqual({ total: 3, success: 1, error: 1, processing: 1 });
    expect(component['progress']()).toBe(67);
    expect(fixture.nativeElement.textContent).toContain('Processing files: 2 / 3');
  });

  it('emits controlled collapse and retry requests', () => {
    let collapsed: boolean | undefined;
    let retryIndex: number | undefined;
    component.collapsedChanged.subscribe((value) => (collapsed = value));
    component.retryRequested.subscribe((value) => (retryIndex = value));

    component['toggleDetails']();
    component.retryRequested.emit(2);

    expect(collapsed).toBeTrue();
    expect(retryIndex).toBe(2);
  });
});
