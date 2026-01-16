/**
 * Pure calculation functions for tapering schedules.
 * Deterministic rounding rules documented here.
 *
 * ROUNDING RULE: All doses rounded to 2 decimal places (0.01 mg precision)
 * using standard "round half up" (banker's rounding avoided for simplicity).
 */

import type { TaperingStep, TaperingSchedule } from '../models/types';

/**
 * Round a dose to 2 decimal places using standard rounding.
 */
export function roundDose(dose: number): number {
  return Math.round(dose * 100) / 100;
}

/**
 * Calculate a single tapering step reduction.
 */
export function calculateNextDose(
  currentDose: number,
  reductionMg: number
): number {
  if (currentDose <= 0 || reductionMg <= 0) {
    return currentDose;
  }

  const nextDose = currentDose - reductionMg;
  return roundDose(nextDose);
}

/**
 * Generate a complete tapering schedule from starting dose to target dose.
 *
 * @param startingDoseMg - Initial dose in mg (must be > 0)
 * @param targetDoseMg - Target dose in mg (must be >= 0 and < startingDose)
 * @param reductionMg - Absolute reduction in mg per step (must be > 0)
 * @param intervalDays - Days between each dose reduction (must be > 0)
 * @returns Array of tapering steps
 */
export function calculateTaperingSteps(
  startingDoseMg: number,
  targetDoseMg: number,
  reductionMg: number,
  intervalDays: number
): TaperingStep[] {
  if (
    startingDoseMg <= 0 ||
    targetDoseMg < 0 ||
    targetDoseMg >= startingDoseMg ||
    reductionMg <= 0 ||
    intervalDays <= 0
  ) {
    return [];
  }

  const steps: TaperingStep[] = [];
  let currentDose = startingDoseMg;
  let stepNumber = 1;

  steps.push({
    stepNumber,
    doseMg: roundDose(currentDose),
    durationDays: intervalDays,
  });

  const maxSteps = 1000;

  while (currentDose > targetDoseMg && stepNumber < maxSteps) {
    currentDose = calculateNextDose(currentDose, reductionMg);

    if (currentDose <= targetDoseMg) {
      if (targetDoseMg > 0) {
        stepNumber++;
        steps.push({
          stepNumber,
          doseMg: roundDose(targetDoseMg),
          durationDays: intervalDays,
        });
      }
      break;
    }

    stepNumber++;
    steps.push({
      stepNumber,
      doseMg: roundDose(currentDose),
      durationDays: intervalDays,
    });
  }

  return steps;
}

/**
 * Calculate total duration of a tapering schedule.
 */
export function calculateTotalDuration(steps: TaperingStep[]): number {
  return steps.reduce((total, step) => total + step.durationDays, 0);
}

/**
 * Add dates to tapering steps based on a start date.
 */
export function addDatesToSteps(
  steps: TaperingStep[],
  startDate: Date
): TaperingStep[] {
  let currentDate = new Date(startDate);

  return steps.map((step) => {
    const stepStartDate = new Date(currentDate);
    currentDate = new Date(
      currentDate.getTime() + step.durationDays * 24 * 60 * 60 * 1000
    );
    const stepEndDate = new Date(currentDate);

    return {
      ...step,
      startDate: stepStartDate,
      endDate: stepEndDate,
    };
  });
}

/**
 * Create a complete tapering schedule object.
 */
export function createTaperingSchedule(
  drugName: string,
  startingDoseMg: number,
  targetDoseMg: number,
  reductionMg: number,
  intervalDays: number,
  notes: string
): TaperingSchedule {
  const steps = calculateTaperingSteps(
    startingDoseMg,
    targetDoseMg,
    reductionMg,
    intervalDays
  );

  return {
    drugName,
    startingDoseMg: roundDose(startingDoseMg),
    targetDoseMg: roundDose(targetDoseMg),
    steps,
    totalDurationDays: calculateTotalDuration(steps),
    notes,
    createdAt: new Date(),
  };
}

/**
 * Calculate equivalent dose using conversion factor.
 */
export function convertDose(
  doseMg: number,
  conversionRatio: number
): number {
  if (doseMg <= 0 || conversionRatio <= 0) {
    return 0;
  }
  return roundDose(doseMg * conversionRatio);
}

/**
 * Estimate time to steady state (5 half-lives rule).
 */
export function estimateSteadyStateHours(halfLifeHours: number): number {
  return halfLifeHours * 5;
}

/**
 * Estimate time to elimination (5 half-lives rule).
 */
export function estimateEliminationHours(halfLifeHours: number): number {
  return halfLifeHours * 5;
}
