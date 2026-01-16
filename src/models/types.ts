/**
 * Core data models for the medical decision-support system.
 * NO PATIENT IDENTIFIABLE INFORMATION (PII) is stored in any model.
 */

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Drug {
  id?: number;
  name: string;
  activeSubstance: string;
  halfLifeHours: number;
  standardDoseMg: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaperingProtocol {
  id?: number;
  drugId: number;
  drugName: string;
  reductionMg: number;
  intervalDays: number;
  minimumDoseMg: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversionFactor {
  id?: number;
  fromDrugId: number;
  toDrugId: number;
  fromDrugName: string;
  toDrugName: string;
  conversionRatio: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaperingStep {
  stepNumber: number;
  doseMg: number;
  durationDays: number;
  startDate?: Date;
  endDate?: Date;
}

export interface TaperingSchedule {
  id?: number;
  drugName: string;
  startingDoseMg: number;
  targetDoseMg: number;
  steps: TaperingStep[];
  totalDurationDays: number;
  notes: string;
  createdAt: Date;
}

export interface InteractionRisk {
  substance1: string;
  substance2: string;
  riskLevel: RiskLevel;
  description: string;
}

export interface JournalNoteData {
  drugName: string;
  indication: string;
  taperingSchedule: TaperingSchedule;
  risks: InteractionRisk[];
  additionalNotes: string;
}

export interface MultiDrugTaperingSchedule {
  drugId: number;
  drugName: string;
  schedule: TaperingSchedule;
}
