/**
 * Combined schedule view for multiple drugs.
 * Shows all tapering schedules in a unified timeline.
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
} from '@mui/material';
import type { MultiDrugTaperingSchedule } from '../models/types';
import { TEXT } from '../constants/text';
import { formatNumber } from '../utils/formatters';

interface CombinedScheduleViewProps {
  schedules: MultiDrugTaperingSchedule[];
}

export const CombinedScheduleView: React.FC<CombinedScheduleViewProps> = ({
  schedules,
}) => {
  if (schedules.length === 0) {
    return null;
  }

  // Calculate maximum number of steps across all schedules
  const maxSteps = Math.max(
    ...schedules.map((s) => s.schedule.steps.length)
  );

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {TEXT.taperingPlanner.combinedSchedule}
        </Typography>

        {/* Summary chips */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {schedules.map((item) => (
            <Chip
              key={item.drugId}
              label={`${item.drugName}: ${item.schedule.steps.length} steg`}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label="Kombinert nedtrappingsplan">
            <TableHead>
              <TableRow>
                <TableCell>{TEXT.taperingPlanner.step}</TableCell>
                {schedules.map((item) => (
                  <TableCell key={item.drugId} align="right">
                    {item.drugName}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      (mg)
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: maxSteps }, (_, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  {schedules.map((item) => {
                    const step = item.schedule.steps[index];
                    return (
                      <TableCell key={item.drugId} align="right">
                        {step ? (
                          <>
                            <strong>{formatNumber(step.doseMg)}</strong>
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              {step.durationDays} {TEXT.taperingPlanner.days}
                            </Typography>
                          </>
                        ) : (
                          <Typography
                            variant="caption"
                            color="text.disabled"
                          >
                            —
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Duration summary */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {TEXT.taperingPlanner.totalDuration}:
          </Typography>
          {schedules.map((item) => (
            <Typography
              key={item.drugId}
              variant="body2"
              color="text.secondary"
            >
              • {item.drugName}: {item.schedule.totalDurationDays}{' '}
              {TEXT.taperingPlanner.days}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
