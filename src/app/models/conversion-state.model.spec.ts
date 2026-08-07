import { transitionConversionState } from './conversion-state.model';

describe('conversion state machine', () => {
  it('supports the complete happy path', () => {
    let state = transitionConversionState('idle', 'validating');
    state = transitionConversionState(state, 'processing');
    state = transitionConversionState(state, 'review');
    state = transitionConversionState(state, 'success');

    expect(state).toBe('success');
  });

  it('supports retry after a failure', () => {
    expect(transitionConversionState('failure', 'processing')).toBe('processing');
  });

  it('rejects impossible jumps', () => {
    expect(() => transitionConversionState('idle', 'success')).toThrowError(
      'Invalid conversion state transition: idle -> success',
    );
  });
});
