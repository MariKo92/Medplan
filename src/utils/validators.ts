/**
 * Input validation functions.
 * Pure functions with explicit error messages.
 */

import { TEXT } from '../constants/text';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateRequired(value: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: TEXT.errors.requiredField };
  }
  return { isValid: true };
}

export function validatePositiveNumber(value: number): ValidationResult {
  if (isNaN(value) || !isFinite(value)) {
    return { isValid: false, error: TEXT.errors.invalidNumber };
  }
  if (value <= 0) {
    return { isValid: false, error: TEXT.errors.mustBePositive };
  }
  return { isValid: true };
}

export function validateNonNegativeNumber(value: number): ValidationResult {
  if (isNaN(value) || !isFinite(value)) {
    return { isValid: false, error: TEXT.errors.invalidNumber };
  }
  if (value < 0) {
    return { isValid: false, error: 'Kan ikke være negativ' };
  }
  return { isValid: true };
}

export function validatePercentage(value: number): ValidationResult {
  const numResult = validatePositiveNumber(value);
  if (!numResult.isValid) {
    return numResult;
  }
  if (value > 100) {
    return { isValid: false, error: 'Kan ikke være over 100%' };
  }
  return { isValid: true };
}

export function validateDrugName(name: string): ValidationResult {
  const reqResult = validateRequired(name);
  if (!reqResult.isValid) {
    return reqResult;
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Navn må være minst 2 tegn' };
  }
  return { isValid: true };
}

export function validateTaperingDoses(
  startingDose: number,
  targetDose: number
): ValidationResult {
  const startResult = validatePositiveNumber(startingDose);
  if (!startResult.isValid) {
    return { isValid: false, error: `Startdose: ${startResult.error}` };
  }

  const targetResult = validateNonNegativeNumber(targetDose);
  if (!targetResult.isValid) {
    return { isValid: false, error: `Måldose: ${targetResult.error}` };
  }

  if (targetDose >= startingDose) {
    return { isValid: false, error: TEXT.errors.targetMustBeLower };
  }

  return { isValid: true };
}
