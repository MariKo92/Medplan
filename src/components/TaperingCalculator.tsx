/**
 * Tapering calculator component.
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import type { TaperingSchedule } from '../models/types';
import { TEXT } from '../constants/text';
import {
  validatePositiveNumber,
  validateTaperingDoses,
} from '../utils/validators';
import { createTaperingSchedule } from '../utils/calculations';

interface TaperingCalculatorProps {
  drugName: string;
  onScheduleCreated: (schedule: TaperingSchedule) => void;
}

export const TaperingCalculator: React.FC<TaperingCalculatorProps> = ({
  drugName,
  onScheduleCreated,
}) => {
  const [startingDose, setStartingDose] = useState('');
  const [targetDose, setTargetDose] = useState('');
  const [reductionMg, setReductionMg] = useState('1');
  const [intervalDays, setIntervalDays] = useState('7');
  const [notes, setNotes] = useState('');
  const [schedule, setSchedule] = useState<TaperingSchedule | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const startNum = parseFloat(startingDose);
    const targetNum = parseFloat(targetDose);
    const reductionNum = parseFloat(reductionMg);
    const intervalNum = parseFloat(intervalDays);

    const doseValidation = validateTaperingDoses(startNum, targetNum);
    if (!doseValidation.isValid && doseValidation.error) {
      newErrors.doses = doseValidation.error;
    }

    const reductionValidation = validatePositiveNumber(reductionNum);
    if (!reductionValidation.isValid && reductionValidation.error) {
      newErrors.reductionMg = reductionValidation.error;
    }

    const intervalValidation = validatePositiveNumber(intervalNum);
    if (!intervalValidation.isValid && intervalValidation.error) {
      newErrors.intervalDays = intervalValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = (): void => {
    if (!validate()) {
      return;
    }

    const newSchedule = createTaperingSchedule(
      drugName,
      parseFloat(startingDose),
      parseFloat(targetDose),
      parseFloat(reductionMg),
      parseFloat(intervalDays),
      notes
    );

    setSchedule(newSchedule);
    onScheduleCreated(newSchedule);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {TEXT.taperingPlanner.title}
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          {errors.doses && (
            <Alert severity="error" role="alert">
              {errors.doses}
            </Alert>
          )}

          <TextField
            label={TEXT.taperingPlanner.startingDose}
            type="number"
            value={startingDose}
            onChange={(e) => setStartingDose(e.target.value)}
            required
            inputProps={{
              'aria-label': TEXT.taperingPlanner.startingDose,
              min: 0,
              step: 0.01,
            }}
          />

          <TextField
            label={TEXT.taperingPlanner.targetDose}
            type="number"
            value={targetDose}
            onChange={(e) => setTargetDose(e.target.value)}
            required
            inputProps={{
              'aria-label': TEXT.taperingPlanner.targetDose,
              min: 0,
              step: 0.01,
            }}
          />

          <TextField
            label={TEXT.taperingPlanner.reductionMg}
            type="number"
            value={reductionMg}
            onChange={(e) => setReductionMg(e.target.value)}
            error={Boolean(errors.reductionMg)}
            helperText={errors.reductionMg}
            required
            inputProps={{
              'aria-label': TEXT.taperingPlanner.reductionMg,
              min: 0.01,
              step: 0.25,
            }}
          />

          <TextField
            label={TEXT.taperingPlanner.intervalDays}
            type="number"
            value={intervalDays}
            onChange={(e) => setIntervalDays(e.target.value)}
            error={Boolean(errors.intervalDays)}
            helperText={errors.intervalDays}
            required
            inputProps={{
              'aria-label': TEXT.taperingPlanner.intervalDays,
              min: 1,
              step: 1,
            }}
          />

          <TextField
            label={TEXT.drugForm.notes}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={2}
            inputProps={{ 'aria-label': TEXT.drugForm.notes }}
          />

          <Button
            onClick={handleCalculate}
            variant="contained"
            size="large"
            aria-label={TEXT.taperingPlanner.calculate}
          >
            {TEXT.taperingPlanner.calculate}
          </Button>
        </Stack>

        {schedule && schedule.steps.length === 0 && (
          <Alert severity="info">{TEXT.taperingPlanner.noSchedule}</Alert>
        )}
      </CardContent>
    </Card>
  );
};
