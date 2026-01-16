/**
 * Predefined drug interaction risk table.
 * This is a simplified, local-only reference table for MVP.
 * NOT a comprehensive clinical database - for illustrative purposes.
 */

import type { InteractionRisk, RiskLevel } from '../models/types';

interface RiskEntry {
  substances: [string, string];
  level: RiskLevel;
  description: string;
}

const RISK_DATA: RiskEntry[] = [
  {
    substances: ['benzodiazepiner', 'opioider'],
    level: 'high',
    description: 'Økt risiko for respirasjonsdepresjon',
  },
  {
    substances: ['ssri', 'tramadol'],
    level: 'high',
    description: 'Økt risiko for serotonergt syndrom',
  },
  {
    substances: ['warfarin', 'nsaid'],
    level: 'high',
    description: 'Økt blødningsrisiko',
  },
  {
    substances: ['benzodiazepiner', 'alkohol'],
    level: 'high',
    description: 'Additiv CNS-depresjon',
  },
  {
    substances: ['ssri', 'nsaid'],
    level: 'medium',
    description: 'Moderat økt blødningsrisiko',
  },
  {
    substances: ['metformin', 'kontrastmiddel'],
    level: 'medium',
    description: 'Risiko for laktacidose',
  },
  {
    substances: ['statiner', 'makrolider'],
    level: 'medium',
    description: 'Økt risiko for myopati',
  },
  {
    substances: ['paracetamol', 'alkohol'],
    level: 'low',
    description: 'Moderat levertoksisitet ved kronisk alkoholbruk',
  },
];

/**
 * Find interaction risks between two substances.
 * Case-insensitive partial matching.
 */
export function findInteractionRisks(
  substance1: string,
  substance2: string
): InteractionRisk[] {
  if (!substance1 || !substance2) {
    return [];
  }

  const s1 = substance1.toLowerCase().trim();
  const s2 = substance2.toLowerCase().trim();

  return RISK_DATA.filter((entry) => {
    const [sub1, sub2] = entry.substances;
    const match1 = sub1.includes(s1) || s1.includes(sub1);
    const match2 = sub2.includes(s2) || s2.includes(sub2);
    const match3 = sub1.includes(s2) || s2.includes(sub1);
    const match4 = sub2.includes(s1) || s1.includes(sub2);

    return (match1 && match2) || (match3 && match4);
  }).map((entry) => ({
    substance1: entry.substances[0],
    substance2: entry.substances[1],
    riskLevel: entry.level,
    description: entry.description,
  }));
}

/**
 * Get all known interaction risks for a substance.
 */
export function getSubstanceRisks(substance: string): InteractionRisk[] {
  if (!substance) {
    return [];
  }

  const s = substance.toLowerCase().trim();

  return RISK_DATA.filter((entry) => {
    return (
      entry.substances[0].includes(s) ||
      s.includes(entry.substances[0]) ||
      entry.substances[1].includes(s) ||
      s.includes(entry.substances[1])
    );
  }).map((entry) => ({
    substance1: entry.substances[0],
    substance2: entry.substances[1],
    riskLevel: entry.level,
    description: entry.description,
  }));
}

/**
 * Get risk level color for UI display.
 */
export function getRiskColor(
  level: RiskLevel
): 'success' | 'warning' | 'error' {
  switch (level) {
    case 'low':
      return 'success';
    case 'medium':
      return 'warning';
    case 'high':
      return 'error';
  }
}
