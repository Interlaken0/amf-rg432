/**
 * Serial number format rule shared by the renderer and the main process.
 * Letters, digits and dashes; 3-32 characters; must start with a letter
 * or digit. Accepts both RG432-xxx product serials and plain numeric
 * serials from earlier test runs.
 */
export const SERIAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{2,31}$/;

/**
 * Validate a board serial number
 * @param serial The serial number to check
 * @returns True if the serial matches the expected format
 */
export function isValidSerial(serial: string): boolean {
  return SERIAL_PATTERN.test(serial.trim());
}
