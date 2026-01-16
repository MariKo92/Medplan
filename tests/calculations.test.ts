/**
 * Unit tests for tapering calculation functions.
 * Tests core mathematical logic and rounding rules.
 */

import { describe, it, expect } from 'vitest';
import {
  roundDose,
  calculateNextDose,
  calculateTaperingSteps,
  calculateTotalDuration,
  convertDose,
  estimateSteadyStateHours,
  estimateEliminationHours,
} from '../src/utils/calculations';

describe('roundDose', () => {
  it('should round to 2 decimal places', () => {
    expect(roundDose(10.123)).toBe(10.12);
    expect(roundDose(10.125)).toBe(10.13);
    expect(roundDose(10.126)).toBe(10.13);
  });

  it('should handle edge cases', () => {
    expect(roundDose(0)).toBe(0);
    expect(roundDose(0.005)).toBe(0.01);
    expect(roundDose(0.004)).toBe(0);
  });
});

describe('calculateNextDose', () => {
  it('should calculate correct dose reduction', () => {
    expect(calculateNextDose(100, 10)).toBe(90);
    expect(calculateNextDose(100, 25)).toBe(75);
    expect(calculateNextDose(50, 20)).toBe(30);
  });

  it('should handle small doses with rounding', () => {
    const result = calculateNextDose(1.5, 0.25);
    expect(result).toBe(1.25);
  });

  it('should return current dose for invalid inputs', () => {
    expect(calculateNextDose(0, 10)).toBe(0);
    expect(calculateNextDose(100, 0)).toBe(100);
    expect(calculateNextDose(-10, 10)).toBe(-10);
  });
});

describe('calculateTaperingSteps', () => {
  it('should generate correct number of steps for 10 mg reduction', () => {
    const steps = calculateTaperingSteps(100, 0, 10, 7);
    expect(steps.length).toBe(11); // 100, 90, 80, ... 10, 0
    expect(steps[0]?.doseMg).toBe(100);
    expect(steps[steps.length - 1]?.doseMg).toBe(0);
  });

  it('should respect target dose', () => {
    const steps = calculateTaperingSteps(100, 10, 25, 7);
    expect(steps[steps.length - 1]?.doseMg).toBe(10);
  });

  it('should calculate correct intervals', () => {
    const steps = calculateTaperingSteps(100, 0, 20, 14);
    expect(steps.every((step) => step.durationDays === 14)).toBe(true);
  });

  it('should return empty array for invalid inputs', () => {
    expect(calculateTaperingSteps(0, 10, 10, 7)).toEqual([]);
    expect(calculateTaperingSteps(100, 100, 10, 7)).toEqual([]);
    expect(calculateTaperingSteps(100, 0, 0, 7)).toEqual([]);
    expect(calculateTaperingSteps(100, 0, 10, 0)).toEqual([]);
    expect(calculateTaperingSteps(-100, 0, 10, 7)).toEqual([]);
  });

  it('should handle small reductions correctly', () => {
    const steps = calculateTaperingSteps(10, 0, 0.5, 7);
    expect(steps.length).toBe(21); // 10, 9.5, 9, ... 0.5, 0
    expect(steps[0]?.doseMg).toBe(10);
  });
});

describe('calculateTotalDuration', () => {
  it('should sum all step durations', () => {
    const steps = [
      { stepNumber: 1, doseMg: 100, durationDays: 7 },
      { stepNumber: 2, doseMg: 75, durationDays: 7 },
      { stepNumber: 3, doseMg: 50, durationDays: 14 },
    ];
    expect(calculateTotalDuration(steps)).toBe(28);
  });

  it('should return 0 for empty array', () => {
    expect(calculateTotalDuration([])).toBe(0);
  });
});

describe('convertDose', () => {
  it('should convert dose using conversion ratio', () => {
    expect(convertDose(10, 0.5)).toBe(5);
    expect(convertDose(20, 2)).toBe(40);
    expect(convertDose(15, 1.5)).toBe(22.5);
  });

  it('should round converted doses', () => {
    expect(convertDose(10, 0.333)).toBe(3.33);
  });

  it('should return 0 for invalid inputs', () => {
    expect(convertDose(0, 0.5)).toBe(0);
    expect(convertDose(10, 0)).toBe(0);
    expect(convertDose(-10, 0.5)).toBe(0);
  });
});

describe('estimateSteadyStateHours', () => {
  it('should calculate 5 half-lives', () => {
    expect(estimateSteadyStateHours(12)).toBe(60);
    expect(estimateSteadyStateHours(24)).toBe(120);
    expect(estimateSteadyStateHours(6)).toBe(30);
  });
});

describe('estimateEliminationHours', () => {
  it('should calculate 5 half-lives', () => {
    expect(estimateEliminationHours(12)).toBe(60);
    expect(estimateEliminationHours(24)).toBe(120);
    expect(estimateEliminationHours(6)).toBe(30);
  });
});

describe('integration: complete tapering schedule', () => {
  it('should create realistic benzodiazepine taper', () => {
    const steps = calculateTaperingSteps(10, 0, 1, 14);

    expect(steps.length).toBe(11); // 10 steps down + final 0
    expect(steps[0]?.doseMg).toBe(10);
    expect(steps[steps.length - 1]?.doseMg).toBe(0);

    let previousDose = steps[0]?.doseMg ?? 0;
    for (let i = 1; i < steps.length; i++) {
      const currentDose = steps[i]?.doseMg ?? 0;
      expect(currentDose).toBeLessThan(previousDose);
      previousDose = currentDose;
    }
  });

  it('should create realistic SSRI taper to minimum dose', () => {
    const steps = calculateTaperingSteps(20, 5, 2.5, 7);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0]?.doseMg).toBe(20);
    expect(steps[steps.length - 1]?.doseMg).toBe(5);

    const totalDuration = calculateTotalDuration(steps);
    expect(totalDuration).toBeGreaterThan(0);
  });
});
