/**
 * Risk tag component for displaying interaction risk levels.
 */

import React from 'react';
import { Chip } from '@mui/material';
import { Warning, CheckCircle, Error } from '@mui/icons-material';
import type { RiskLevel } from '../models/types';
import { TEXT } from '../constants/text';
import { getRiskColor } from '../constants/riskTable';

interface RiskTagProps {
  level: RiskLevel;
  label?: string;
}

export const RiskTag: React.FC<RiskTagProps> = ({ level, label }) => {
  const color = getRiskColor(level);
  const text = label ?? TEXT.riskTag[level];

  const Icon = level === 'high' ? Error : level === 'medium' ? Warning : CheckCircle;

  return (
    <Chip
      icon={<Icon />}
      label={text}
      color={color}
      size="small"
      sx={{ fontWeight: 'medium' }}
    />
  );
};
