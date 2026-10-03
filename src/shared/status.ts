/**
 * Stage-2 status word semantics shared by the real DLL interop and the
 * mock. The four status digits (one nibble per test stage) come from
 * both the wDetails word and bytes 256-259 of the .dat file.
 */

/**
 * Stage names for the four test stages, supplied by Jeff
 */
export const STAGE_NAMES = [
  'input data acquisition',
  'output data generation',
  'spectral tests',
  'algorithm accuracy',
];

/**
 * Meaning of each status digit
 */
export const DIGIT_MEANINGS: Record<number, string> = {
  0: 'pass',
  1: 'board not connected',
  2: 'connexion faulty',
  3: 'board not communicating',
  4: 'no output generated',
  5: 'no input detected',
  6: 'maths error',
  7: 'output waveform faulty',
  8: 'input waveform faulty',
  9: 'spectral distortion',
  15: 'test skipped',
};

const SKIPPED = 0xf;

/**
 * Decode the four status digits into a human-readable summary of the
 * first failing stage. A failing stage skips the remaining stages, so
 * the first non-zero, non-skipped digit is the one that matters.
 * @param digits The four status digit values
 * @returns The decoded summary, or the pass message
 */
export function decodeStatus(digits: number[]): string {
  const firstFailure = digits.findIndex((digit) => digit !== 0 && digit !== SKIPPED);
  if (firstFailure === -1) {
    return 'All four tests passed';
  }
  const meaning = DIGIT_MEANINGS[digits[firstFailure]] ?? `unknown code ${digits[firstFailure]}`;
  return `Test ${firstFailure + 1} (${STAGE_NAMES[firstFailure]}): ${meaning}`;
}

/**
 * Only an all-zero status word means pass (stage-2 semantics)
 * @param digits The four status digit values
 * @returns True if the test passed
 */
export function isPassing(digits: number[]): boolean {
  return digits.every((digit) => digit === 0);
}

/**
 * Whether a failed result is retryable. Per Jeff: digits 6-9 are
 * outright failures; any other failure is a connexion-type fault that
 * may be retested.
 * @param digits The four status digit values
 * @returns True if the operator may retry the test
 */
export function isRetryable(digits: number[]): boolean {
  return !isPassing(digits) && !digits.some((digit) => digit >= 6 && digit <= 9);
}

/**
 * Format four status digits as the wDetails hex word
 * @param digits The four status digit values
 * @returns The status word, e.g. "0x2fff"
 */
export function statusWord(digits: number[]): string {
  return `0x${digits.map((digit) => digit.toString(16)).join('')}`;
}

/**
 * Parse a status word back into its digit values — the inverse of
 * statusWord. Returns an empty array for anything that is not a
 * four-hex-digit word.
 * @param word The status word, e.g. "0x2fff"
 * @returns The four status digit values
 */
export function statusDigits(word: string): number[] {
  const match = /^0x([0-9a-f]{4})$/i.exec(word.trim());
  if (!match) {
    return [];
  }
  return match[1].split('').map((char) => parseInt(char, 16));
}
