/**
 * Settings page - application information and disclaimer.
 */

import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, Alert, Divider, Button, Stack } from '@mui/material';
import { Add, Upload } from '@mui/icons-material';
import { TEXT } from '../constants/text';
import { addDrug } from '../storage/database';
import * as XLSX from 'xlsx';

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTestData = async (): Promise<void> => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Kilde: Felleskatalogen og farmakokinetiske referanser
      
      // 1. Diazepam (benzodiazepin)
      await addDrug({
        name: 'Diazepam',
        activeSubstance: 'benzodiazepiner',
        halfLifeHours: 48,
        standardDoseMg: 5,
        notes: 'Langtidsvirkende benzodiazepin. T½ 20-100 timer.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 2. Sertralin (SSRI)
      await addDrug({
        name: 'Sertralin',
        activeSubstance: 'ssri',
        halfLifeHours: 26,
        standardDoseMg: 50,
        notes: 'SSRI antidepressivum. T½ ca 26 timer.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 3. Tramadol (opioid)
      await addDrug({
        name: 'Tramadol',
        activeSubstance: 'opioider',
        halfLifeHours: 6,
        standardDoseMg: 50,
        notes: 'Svakt opioid analgetikum. T½ 5-7 timer.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 4. Paracetamol
      await addDrug({
        name: 'Paracetamol',
        activeSubstance: 'analgetika',
        halfLifeHours: 2.5,
        standardDoseMg: 500,
        notes: 'Ikke-opioid analgetikum. T½ 2-3 timer.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 5. Ibuprofen (NSAID)
      await addDrug({
        name: 'Ibuprofen',
        activeSubstance: 'nsaid',
        halfLifeHours: 2,
        standardDoseMg: 400,
        notes: 'NSAID antiinflammatorisk middel. T½ ca 2 timer.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 6. Oxazepam (benzodiazepin)
      await addDrug({
        name: 'Oxazepam',
        activeSubstance: 'benzodiazepiner',
        halfLifeHours: 8,
        standardDoseMg: 15,
        notes: 'Mellomlang virkende benzodiazepin. T½ 4-15 timer.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 7. Zopiklon (hypnotikum)
      await addDrug({
        name: 'Zopiklon',
        activeSubstance: 'hypnotika',
        halfLifeHours: 5,
        standardDoseMg: 7.5,
        notes: 'Korttidsvirkende sovemiddel. T½ ca 5 timer.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 8. Venlafaxin (SNRI)
      await addDrug({
        name: 'Venlafaxin',
        activeSubstance: 'snri',
        halfLifeHours: 5,
        standardDoseMg: 75,
        notes: 'SNRI antidepressivum. T½ ca 5 timer (aktiv metabolitt 11 timer).',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 9. Mirtazapin (antidepressivum)
      await addDrug({
        name: 'Mirtazapin',
        activeSubstance: 'antidepressiva',
        halfLifeHours: 30,
        standardDoseMg: 15,
        notes: 'Noradrenergt og serotoninergt antidepressivum. T½ 20-40 timer.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 10. Escitalopram (SSRI)
      await addDrug({
        name: 'Escitalopram',
        activeSubstance: 'ssri',
        halfLifeHours: 30,
        standardDoseMg: 10,
        notes: 'SSRI antidepressivum. T½ 27-32 timer.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setMessage('10 testlegemidler lagt til i biblioteket!');
    } catch (err) {
      setError('Feil ved oppretting av testdata: ' + (err instanceof Error ? err.message : 'Ukjent feil'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Expected columns: Navn, Virkestoff, Halveringstid (timer), Standarddose (mg), Notater
      const jsonData = XLSX.utils.sheet_to_json<{
        Navn: string;
        Virkestoff: string;
        'Halveringstid (timer)': number;
        'Standarddose (mg)': number;
        Notater?: string;
      }>(worksheet);

      if (jsonData.length === 0) {
        setError('Excel-filen er tom');
        return;
      }

      let successCount = 0;
      const errors: string[] = [];

      for (const row of jsonData) {
        try {
          // Validate required fields
          if (!row.Navn || !row.Virkestoff || !row['Halveringstid (timer)'] || !row['Standarddose (mg)']) {
            errors.push(`Mangler påkrevde felter for rad: ${JSON.stringify(row)}`);
            continue;
          }

          await addDrug({
            name: row.Navn,
            activeSubstance: row.Virkestoff,
            halfLifeHours: Number(row['Halveringstid (timer)']),
            standardDoseMg: Number(row['Standarddose (mg)']),
            notes: row.Notater || '',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          successCount++;
        } catch (err) {
          errors.push(`Feil ved import av ${row.Navn}: ${err instanceof Error ? err.message : 'Ukjent feil'}`);
        }
      }

      if (successCount > 0) {
        setMessage(`${successCount} legemiddel(er) importert fra Excel`);
      }
      if (errors.length > 0) {
        setError(`Feil ved import:\n${errors.join('\n')}`);
      }
    } catch (err) {
      setError('Feil ved lesing av Excel-fil: ' + (err instanceof Error ? err.message : 'Ukjent feil'));
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {TEXT.navigation.settings}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Om {TEXT.app.title}
        </Typography>
        <Typography variant="body1" paragraph>
          Dette er et lokalt beslutningsstøtteverktøy for beregning av
          nedtrappingsplaner.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Versjon: 0.1.0 (MVP)
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Testdata
        </Typography>
        <Typography variant="body2" paragraph>
          Legg til 10 eksempellegemidler med farmakokinetiske data fra Felleskatalogen,
          eller last opp en Excel-fil med legemiddeldata.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Excel-format: Kolonner må hete <strong>Navn</strong>, <strong>Virkestoff</strong>,{' '}
          <strong>Halveringstid (timer)</strong>, <strong>Standarddose (mg)</strong>, <strong>Notater</strong>
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            onClick={handleAddTestData}
            variant="contained"
            disabled={loading}
            startIcon={<Add />}
          >
            {loading ? 'Legger til...' : 'Legg til testdata'}
          </Button>
          <Button
            variant="outlined"
            component="label"
            disabled={loading}
            startIcon={<Upload />}
          >
            Last opp Excel
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>
        </Stack>
        
        {message && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {TEXT.app.disclaimer}
        </Typography>
        <Typography variant="body2">{TEXT.app.disclaimerFull}</Typography>
      </Alert>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Personvern og datahåndtering
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Ingen pasientdata lagres:</strong> Dette verktøyet lagrer kun
          farmakologiske fakta (legemiddelinformasjon, halveringstider,
          nedtrappingsprotokoller) lokalt i nettleserens IndexedDB.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Lokal lagring:</strong> All data lagres kun på din egen
          enhet. Ingen data sendes til eksterne servere.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Ingen sporing:</strong> Verktøyet inneholder ingen
          analyseverktøy, cookies eller sporingsmekanismer.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Teknisk informasjon
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>Framework: React + TypeScript</li>
            <li>UI: Material-UI</li>
            <li>Database: IndexedDB (Dexie)</li>
            <li>Kjører: 100% lokalt i nettleseren</li>
            <li>Ingen backend-tilkobling</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};
