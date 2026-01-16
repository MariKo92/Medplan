/**
 * Journal note component for generating and copying clinical notes.
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Box,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import type { TaperingSchedule, InteractionRisk } from '../models/types';
import { TEXT } from '../constants/text';
import { generateJournalNote } from '../utils/formatters';
import { RiskTag } from './RiskTag';

interface JournalNoteProps {
  drugName: string;
  schedule: TaperingSchedule;
  risks: InteractionRisk[];
}

export const JournalNote: React.FC<JournalNoteProps> = ({
  drugName,
  schedule,
  risks,
}) => {
  const [indication, setIndication] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  const handleGenerate = (): void => {
    const text = generateJournalNote(
      drugName,
      indication,
      schedule,
      risks,
      additionalNotes
    );
    setNoteText(text);
  };

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(noteText);
      setShowCopied(true);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {TEXT.journalNote.title}
        </Typography>

        <Stack spacing={2}>
          <TextField
            label={TEXT.journalNote.indication}
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
            inputProps={{ 'aria-label': TEXT.journalNote.indication }}
          />

          <TextField
            label={TEXT.journalNote.additionalNotes}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            multiline
            rows={3}
            inputProps={{ 'aria-label': TEXT.journalNote.additionalNotes }}
          />

          {risks.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {TEXT.journalNote.interactions}:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {risks.map((risk, index) => (
                  <RiskTag
                    key={index}
                    level={risk.riskLevel}
                    label={`${risk.substance1} + ${risk.substance2}`}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Button
            onClick={handleGenerate}
            variant="contained"
            aria-label={TEXT.journalNote.title}
          >
            {TEXT.taperingPlanner.generateNote}
          </Button>

          {noteText && (
            <Box>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: 400,
                  overflow: 'auto',
                }}
                role="region"
                aria-label="Generert journalnotat"
              >
                {noteText}
              </Paper>

              <Button
                onClick={handleCopy}
                startIcon={<ContentCopy />}
                variant="outlined"
                sx={{ mt: 2 }}
                aria-label={TEXT.journalNote.copy}
              >
                {TEXT.journalNote.copy}
              </Button>
            </Box>
          )}
        </Stack>

        <Snackbar
          open={showCopied}
          autoHideDuration={2000}
          onClose={() => setShowCopied(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled">
            {TEXT.journalNote.copied}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};
