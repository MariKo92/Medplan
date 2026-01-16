/**
 * Drug form component for adding/editing drugs.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import type { Drug } from '../models/types';
import { TEXT } from '../constants/text';
import {
  validateDrugName,
  validateRequired,
  validatePositiveNumber,
} from '../utils/validators';

interface DrugFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (drug: Omit<Drug, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  drug?: Drug;
}

export const DrugForm: React.FC<DrugFormProps> = ({
  open,
  onClose,
  onSave,
  drug,
}) => {
  const [name, setName] = useState('');
  const [activeSubstance, setActiveSubstance] = useState('');
  const [halfLifeHours, setHalfLifeHours] = useState('');
  const [standardDoseMg, setStandardDoseMg] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (drug) {
      setName(drug.name);
      setActiveSubstance(drug.activeSubstance);
      setHalfLifeHours(drug.halfLifeHours.toString());
      setStandardDoseMg(drug.standardDoseMg.toString());
      setNotes(drug.notes);
    } else {
      setName('');
      setActiveSubstance('');
      setHalfLifeHours('');
      setStandardDoseMg('');
      setNotes('');
    }
    setErrors({});
  }, [drug, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateDrugName(name);
    if (!nameValidation.isValid && nameValidation.error) {
      newErrors.name = nameValidation.error;
    }

    const substanceValidation = validateRequired(activeSubstance);
    if (!substanceValidation.isValid && substanceValidation.error) {
      newErrors.activeSubstance = substanceValidation.error;
    }

    const halfLifeNum = parseFloat(halfLifeHours);
    const halfLifeValidation = validatePositiveNumber(halfLifeNum);
    if (!halfLifeValidation.isValid && halfLifeValidation.error) {
      newErrors.halfLifeHours = halfLifeValidation.error;
    }

    const doseNum = parseFloat(standardDoseMg);
    const doseValidation = validatePositiveNumber(doseNum);
    if (!doseValidation.isValid && doseValidation.error) {
      newErrors.standardDoseMg = doseValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearchFK = (): void => {
    const searchUrl = name
      ? `https://www.felleskatalogen.no/medisin/sok?sokord=${encodeURIComponent(name)}`
      : 'https://www.felleskatalogen.no/medisin/';
    
    // Open in a popup window that can be positioned alongside the form
    const width = 800;
    const height = 600;
    const left = window.screen.width - width - 50;
    const top = 50;
    
    window.open(
      searchUrl,
      'felleskatalogen',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        activeSubstance: activeSubstance.trim(),
        halfLifeHours: parseFloat(halfLifeHours),
        standardDoseMg: parseFloat(standardDoseMg),
        notes: notes.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      onClose();
    } catch (error) {
      console.error('Failed to save drug:', error);
      setErrors({ submit: 'Kunne ikke lagre legemiddel' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="drug-form-dialog"
    >
      <DialogTitle id="drug-form-dialog">
        {drug ? TEXT.drugLibrary.editDrug : TEXT.drugLibrary.addDrug}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Button
            onClick={handleSearchFK}
            startIcon={<Search />}
            variant="outlined"
            fullWidth
          >
            {TEXT.drugForm.searchFK}
          </Button>
          <TextField
            label={TEXT.drugForm.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            autoFocus
            inputProps={{ 'aria-label': TEXT.drugForm.name }}
          />
          <TextField
            label={TEXT.drugForm.activeSubstance}
            value={activeSubstance}
            onChange={(e) => setActiveSubstance(e.target.value)}
            error={Boolean(errors.activeSubstance)}
            helperText={errors.activeSubstance}
            required
            inputProps={{ 'aria-label': TEXT.drugForm.activeSubstance }}
          />
          <TextField
            label={TEXT.drugForm.halfLife}
            type="number"
            value={halfLifeHours}
            onChange={(e) => setHalfLifeHours(e.target.value)}
            error={Boolean(errors.halfLifeHours)}
            helperText={errors.halfLifeHours}
            required
            inputProps={{
              'aria-label': TEXT.drugForm.halfLife,
              min: 0,
              step: 0.1,
            }}
          />
          <TextField
            label={TEXT.drugForm.standardDose}
            type="number"
            value={standardDoseMg}
            onChange={(e) => setStandardDoseMg(e.target.value)}
            error={Boolean(errors.standardDoseMg)}
            helperText={errors.standardDoseMg}
            required
            inputProps={{
              'aria-label': TEXT.drugForm.standardDose,
              min: 0,
              step: 0.01,
            }}
          />
          <TextField
            label={TEXT.drugForm.notes}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            inputProps={{ 'aria-label': TEXT.drugForm.notes }}
          />
          {errors.submit && (
            <div role="alert" style={{ color: 'red' }}>
              {errors.submit}
            </div>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={submitting}>
          {TEXT.drugForm.cancel}
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {TEXT.drugForm.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
