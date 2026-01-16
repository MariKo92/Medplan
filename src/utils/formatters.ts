/**
 * Formatting utilities for displaying data.
 */

import type { TaperingSchedule, InteractionRisk } from '../models/types';
import { TEXT } from '../constants/text';

/**
 * Format a number with specified decimal places.
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format a date to Norwegian format (dd.mm.yyyy).
 */
export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Format a date to ISO format (yyyy-mm-dd) for input fields.
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate a formatted journal note from tapering schedule.
 */
export function generateJournalNote(
  drugName: string,
  indication: string,
  schedule: TaperingSchedule,
  risks: InteractionRisk[],
  additionalNotes: string
): string {
  const sections: string[] = [];

  sections.push('=== NEDTRAPPINGSPLAN ===\n');
  sections.push(`Legemiddel: ${drugName}`);
  sections.push(`Indikasjon: ${indication || 'Ikke spesifisert'}`);
  sections.push(`Dato: ${formatDate(new Date())}\n`);

  sections.push('--- Plan ---');
  sections.push(`Startdose: ${formatNumber(schedule.startingDoseMg)} mg`);
  sections.push(`Måldose: ${formatNumber(schedule.targetDoseMg)} mg`);
  sections.push(`Antall steg: ${schedule.steps.length}`);
  sections.push(`Total varighet: ${schedule.totalDurationDays} dager\n`);

  sections.push('--- Doseringsplan ---');
  schedule.steps.forEach((step) => {
    const dateInfo = step.startDate
      ? ` (${formatDate(step.startDate)})`
      : '';
    sections.push(
      `Steg ${step.stepNumber}: ${formatNumber(step.doseMg)} mg i ${step.durationDays} ${TEXT.taperingPlanner.days}${dateInfo}`
    );
  });

  if (risks.length > 0) {
    sections.push('\n--- Interaksjonsrisiko ---');
    risks.forEach((risk) => {
      const levelText =
        TEXT.riskTag[risk.riskLevel as keyof typeof TEXT.riskTag];
      sections.push(
        `• ${risk.substance1} + ${risk.substance2}: ${levelText} - ${risk.description}`
      );
    });
  }

  if (additionalNotes) {
    sections.push('\n--- Tilleggsnotater ---');
    sections.push(additionalNotes);
  }

  sections.push('\n--- Ansvarsfraskrivelse ---');
  sections.push(TEXT.app.disclaimerFull);

  return sections.join('\n');
}

/**
 * Format duration in days to human-readable format.
 */
export function formatDuration(days: number): string {
  if (days < 7) {
    return `${days} ${TEXT.taperingPlanner.days}`;
  }

  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;

  if (remainingDays === 0) {
    return `${weeks} ${weeks === 1 ? 'uke' : 'uker'}`;
  }

  return `${weeks} ${weeks === 1 ? 'uke' : 'uker'} og ${remainingDays} ${TEXT.taperingPlanner.days}`;
}
