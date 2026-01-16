/**
 * Tapering Planner page - create tapering schedules for multiple drugs.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Button,
  Card,
  CardContent,
  IconButton,
  Divider,
  Grid,
  Chip,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useLiveQuery } from 'dexie-react-hooks';
import { TaperingCalculator } from '../components/TaperingCalculator';
import { JournalNote } from '../components/JournalNote';
import { CombinedScheduleView } from '../components/CombinedScheduleView';
import type { TaperingSchedule, MultiDrugTaperingSchedule } from '../models/types';
import { TEXT } from '../constants/text';
import { getAllDrugs, saveTaperingSchedule } from '../storage/database';
import { getSubstanceRisks, findInteractionRisks } from '../constants/riskTable';

export const TaperingPlanner: React.FC = () => {
  const drugs = useLiveQuery(getAllDrugs);
  const [selectedDrugIds, setSelectedDrugIds] = useState<number[]>([]);
  const [schedules, setSchedules] = useState<Map<number, TaperingSchedule>>(
    new Map()
  );
  const [error, setError] = useState<string | null>(null);

  const handleAddDrug = (): void => {
    setSelectedDrugIds([...selectedDrugIds, 0]);
  };

  const handleRemoveDrug = (index: number): void => {
    const newIds = selectedDrugIds.filter((_, i) => i !== index);
    setSelectedDrugIds(newIds);
    
    // Remove schedule for removed drug
    const drugId = selectedDrugIds[index];
    if (drugId) {
      const newSchedules = new Map(schedules);
      newSchedules.delete(drugId);
      setSchedules(newSchedules);
    }
  };

  const handleDrugChange = (index: number, drugId: number): void => {
    const newIds = [...selectedDrugIds];
    const oldDrugId = newIds[index];
    newIds[index] = drugId;
    setSelectedDrugIds(newIds);
    
    // Remove old schedule if drug changed
    if (oldDrugId && oldDrugId !== drugId) {
      const newSchedules = new Map(schedules);
      newSchedules.delete(oldDrugId);
      setSchedules(newSchedules);
    }
  };

  const handleScheduleCreated = async (
    drugId: number,
    newSchedule: TaperingSchedule
  ): Promise<void> => {
    const newSchedules = new Map(schedules);
    newSchedules.set(drugId, newSchedule);
    setSchedules(newSchedules);

    try {
      await saveTaperingSchedule(newSchedule);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : TEXT.errors.databaseError
      );
    }
  };

  const selectedDrugs = selectedDrugIds
    .map((id) => drugs?.find((d) => d.id === id))
    .filter((d) => d !== undefined);

  // Get all risks including interactions between selected drugs
  const allRisks = selectedDrugs.flatMap((drug) =>
    getSubstanceRisks(drug.activeSubstance)
  );

  // Check for interactions between selected drugs
  for (let i = 0; i < selectedDrugs.length; i++) {
    for (let j = i + 1; j < selectedDrugs.length; j++) {
      const drug1 = selectedDrugs[i];
      const drug2 = selectedDrugs[j];
      if (drug1 && drug2) {
        const interactions = findInteractionRisks(
          drug1.activeSubstance,
          drug2.activeSubstance
        );
        allRisks.push(...interactions);
      }
    }
  }

  // Deduplicate risks
  const uniqueRisks = allRisks.filter(
    (risk, index, self) =>
      index ===
      self.findIndex(
        (r) =>
          r.substance1 === risk.substance1 &&
          r.substance2 === risk.substance2
      )
  );

  const multiDrugSchedules: MultiDrugTaperingSchedule[] = selectedDrugs
    .map((drug) => {
      const schedule = schedules.get(drug.id ?? 0);
      if (!schedule) return null;
      return {
        drugId: drug.id ?? 0,
        drugName: drug.name,
        schedule,
      };
    })
    .filter((s): s is MultiDrugTaperingSchedule => s !== null);

  // Combined schedule for journal note (use first drug's schedule as primary)
  const primarySchedule = schedules.get(selectedDrugIds[0] ?? 0);
  const primaryDrug = selectedDrugs[0];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {TEXT.taperingPlanner.title}
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        {TEXT.app.disclaimer}
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">
              {TEXT.taperingPlanner.selectDrug}
            </Typography>
            <Button
              onClick={handleAddDrug}
              startIcon={<Add />}
              variant="outlined"
              size="small"
            >
              {TEXT.taperingPlanner.addDrug}
            </Button>
          </Box>

          {selectedDrugIds.length === 0 && (
            <Alert severity="info">
              {TEXT.taperingPlanner.noDrugsSelected}
            </Alert>
          )}

          {selectedDrugIds.map((drugId, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                      }}
                    >
                      <FormControl fullWidth>
                        <InputLabel id={`drug-select-label-${index}`}>
                          Legemiddel {index + 1}
                        </InputLabel>
                        <Select
                          labelId={`drug-select-label-${index}`}
                          value={drugId}
                          label={`Legemiddel ${index + 1}`}
                          onChange={(e) =>
                            handleDrugChange(index, e.target.value as number)
                          }
                        >
                          <MenuItem value={0}>
                            <em>Velg legemiddel</em>
                          </MenuItem>
                          {drugs?.map((drug) => (
                            <MenuItem
                              key={drug.id}
                              value={drug.id}
                              disabled={selectedDrugIds.includes(drug.id ?? 0)}
                            >
                              {drug.name} ({drug.activeSubstance})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton
                        onClick={() => handleRemoveDrug(index)}
                        color="error"
                        aria-label={TEXT.taperingPlanner.removeDrug}
                      >
                        <Delete />
                      </IconButton>
                    </Box>

                    {drugId > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <TaperingCalculator
                          drugName={
                            drugs?.find((d) => d.id === drugId)?.name ?? ''
                          }
                          onScheduleCreated={(schedule) =>
                            handleScheduleCreated(drugId, schedule)
                          }
                        />
                      </Box>
                    )}
                  </Grid>

                  {drugId > 0 && (() => {
                    const selectedDrug = drugs?.find((d) => d.id === drugId);
                    return selectedDrug ? (
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ height: '100%', bgcolor: 'grey.50' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {selectedDrug.name}
                            </Typography>
                            <Stack spacing={1.5}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Virkestoff
                                </Typography>
                                <Typography variant="body2">
                                  <Chip 
                                    label={selectedDrug.activeSubstance} 
                                    size="small" 
                                    sx={{ mt: 0.5 }}
                                  />
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Halveringstid
                                </Typography>
                                <Typography variant="body2">
                                  {selectedDrug.halfLifeHours} timer
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Standarddose
                                </Typography>
                                <Typography variant="body2">
                                  {selectedDrug.standardDoseMg} mg
                                </Typography>
                              </Box>
                              {selectedDrug.notes && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Notater
                                  </Typography>
                                  <Typography variant="body2">
                                    {selectedDrug.notes}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ) : null;
                  })()}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>

        {!drugs || drugs.length === 0 ? (
          <Alert severity="info">
            Ingen legemidler registrert. Gå til legemiddelbiblioteket for å
            legge til.
          </Alert>
        ) : null}

        {multiDrugSchedules.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {multiDrugSchedules.length === 1
                ? TEXT.taperingPlanner.schedule
                : TEXT.taperingPlanner.combinedSchedule}
            </Typography>
            <CombinedScheduleView schedules={multiDrugSchedules} />
          </>
        )}

        {uniqueRisks.length > 0 && (
          <Alert severity="warning">
            <Typography variant="subtitle2" gutterBottom>
              Interaksjonsrisiko mellom valgte legemidler:
            </Typography>
            {uniqueRisks.map((risk, idx) => (
              <Typography key={idx} variant="body2">
                • {risk.substance1} + {risk.substance2}: {risk.description}
              </Typography>
            ))}
          </Alert>
        )}

        {primarySchedule && primaryDrug && (
          <>
            <Divider />
            <JournalNote
              drugName={
                selectedDrugs.length > 1
                  ? `${selectedDrugs.map((d) => d.name).join(', ')}`
                  : primaryDrug.name
              }
              schedule={primarySchedule}
              risks={uniqueRisks}
            />
          </>
        )}
      </Stack>
    </Box>
  );
};
