export const CONVERSION_STATES = [
  'idle',
  'validating',
  'processing',
  'review',
  'success',
  'failure',
] as const;

export type ConversionState = (typeof CONVERSION_STATES)[number];

const ALLOWED_TRANSITIONS: Readonly<Record<ConversionState, readonly ConversionState[]>> = {
  idle: ['validating', 'review'],
  validating: ['idle', 'processing', 'failure'],
  processing: ['idle', 'review', 'failure'],
  review: ['idle', 'validating', 'processing', 'success', 'failure'],
  success: ['idle', 'validating', 'review'],
  failure: ['idle', 'validating', 'processing'],
};

export function transitionConversionState(
  current: ConversionState,
  next: ConversionState,
): ConversionState {
  if (current === next) return current;
  if (!ALLOWED_TRANSITIONS[current].includes(next)) {
    throw new Error(`Invalid conversion state transition: ${current} -> ${next}`);
  }
  return next;
}
