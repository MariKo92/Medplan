/**
 * Drug Library page - manage drugs and their properties.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useLiveQuery } from 'dexie-react-hooks';
import { DrugForm } from '../components/DrugForm';
import type { Drug } from '../models/types';
import { TEXT } from '../constants/text';
import {
  addDrug,
  updateDrug,
  deleteDrug,
  getAllDrugs,
} from '../storage/database';
import { formatNumber } from '../utils/formatters';

export const DrugLibrary: React.FC = () => {
  const drugs = useLiveQuery(getAllDrugs);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [drugToDelete, setDrugToDelete] = useState<Drug | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddClick = (): void => {
    setSelectedDrug(undefined);
    setFormOpen(true);
  };

  const handleEditClick = (drug: Drug): void => {
    setSelectedDrug(drug);
    setFormOpen(true);
  };

  const handleDeleteClick = (drug: Drug): void => {
    setDrugToDelete(drug);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (
    drugData: Omit<Drug, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    try {
      if (selectedDrug?.id) {
        await updateDrug(selectedDrug.id, drugData);
      } else {
        await addDrug({
          ...drugData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : TEXT.errors.databaseError
      );
      throw err;
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!drugToDelete?.id) {
      return;
    }

    try {
      await deleteDrug(drugToDelete.id);
      setDeleteDialogOpen(false);
      setDrugToDelete(null);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : TEXT.errors.databaseError
      );
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          {TEXT.drugLibrary.title}
        </Typography>
        <Button
          onClick={handleAddClick}
          startIcon={<Add />}
          aria-label={TEXT.drugLibrary.addDrug}
        >
          {TEXT.drugLibrary.addDrug}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {drugs && drugs.length === 0 && (
        <Alert severity="info">{TEXT.drugLibrary.noDrugs}</Alert>
      )}

      <Grid container spacing={2}>
        {drugs?.map((drug) => (
          <Grid item xs={12} sm={6} md={4} key={drug.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {drug.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {drug.activeSubstance}
                </Typography>
                <Typography variant="body2">
                  {TEXT.drugForm.halfLife}: {formatNumber(drug.halfLifeHours)} t
                </Typography>
                <Typography variant="body2">
                  {TEXT.drugForm.standardDose}:{' '}
                  {formatNumber(drug.standardDoseMg)} mg
                </Typography>
                {drug.notes && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {drug.notes}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <IconButton
                  onClick={() => handleEditClick(drug)}
                  aria-label={`${TEXT.drugLibrary.editDrug} ${drug.name}`}
                  size="small"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteClick(drug)}
                  aria-label={`${TEXT.drugLibrary.deleteDrug} ${drug.name}`}
                  size="small"
                  color="error"
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <DrugForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        drug={selectedDrug}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          {TEXT.drugLibrary.deleteDrug}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {TEXT.drugLibrary.confirmDelete}
            <br />
            <strong>{drugToDelete?.name}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
          >
            {TEXT.common.cancel}
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            {TEXT.common.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
