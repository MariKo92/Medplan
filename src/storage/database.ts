/**
 * IndexedDB database layer using Dexie.
 * Schema version 1 - initial structure.
 *
 * NO PATIENT DATA - only pharmacokinetic facts and calculation templates.
 */

import Dexie, { type Table } from 'dexie';
import type {
  Drug,
  TaperingProtocol,
  ConversionFactor,
  TaperingSchedule,
} from '../models/types';

export class BeslutningsstotteDB extends Dexie {
  drugs!: Table<Drug, number>;
  taperingProtocols!: Table<TaperingProtocol, number>;
  conversionFactors!: Table<ConversionFactor, number>;
  taperingSchedules!: Table<TaperingSchedule, number>;

  constructor() {
    super('BeslutningsstotteDB');

    this.version(1).stores({
      drugs:
        '++id, name, activeSubstance, halfLifeHours, createdAt, updatedAt',
      taperingProtocols:
        '++id, drugId, drugName, reductionMg, intervalDays, createdAt, updatedAt',
      conversionFactors:
        '++id, fromDrugId, toDrugId, fromDrugName, toDrugName, createdAt, updatedAt',
      taperingSchedules:
        '++id, drugName, startingDoseMg, targetDoseMg, createdAt',
    });
  }
}

export const db = new BeslutningsstotteDB();

/**
 * Database operations with error handling.
 */

export async function addDrug(drug: Omit<Drug, 'id'>): Promise<number> {
  try {
    const id = await db.drugs.add({
      ...drug,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return id;
  } catch (error) {
    console.error('Failed to add drug:', error);
    throw new Error('Database error: kunne ikke lagre legemiddel');
  }
}

export async function updateDrug(
  id: number,
  updates: Partial<Omit<Drug, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    await db.drugs.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to update drug:', error);
    throw new Error('Database error: kunne ikke oppdatere legemiddel');
  }
}

export async function deleteDrug(id: number): Promise<void> {
  try {
    await db.transaction('rw', [db.drugs, db.taperingProtocols], async () => {
      await db.drugs.delete(id);
      await db.taperingProtocols.where('drugId').equals(id).delete();
    });
  } catch (error) {
    console.error('Failed to delete drug:', error);
    throw new Error('Database error: kunne ikke slette legemiddel');
  }
}

export async function getAllDrugs(): Promise<Drug[]> {
  try {
    return await db.drugs.orderBy('name').toArray();
  } catch (error) {
    console.error('Failed to fetch drugs:', error);
    return [];
  }
}

export async function getDrugById(id: number): Promise<Drug | undefined> {
  try {
    return await db.drugs.get(id);
  } catch (error) {
    console.error('Failed to fetch drug:', error);
    return undefined;
  }
}

export async function addTaperingProtocol(
  protocol: Omit<TaperingProtocol, 'id'>
): Promise<number> {
  try {
    const id = await db.taperingProtocols.add({
      ...protocol,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return id;
  } catch (error) {
    console.error('Failed to add tapering protocol:', error);
    throw new Error('Database error: kunne ikke lagre nedtrappingsprotokoll');
  }
}

export async function getTaperingProtocolsByDrugId(
  drugId: number
): Promise<TaperingProtocol[]> {
  try {
    return await db.taperingProtocols.where('drugId').equals(drugId).toArray();
  } catch (error) {
    console.error('Failed to fetch tapering protocols:', error);
    return [];
  }
}

export async function saveTaperingSchedule(
  schedule: Omit<TaperingSchedule, 'id'>
): Promise<number> {
  try {
    const id = await db.taperingSchedules.add({
      ...schedule,
      createdAt: new Date(),
    });
    return id;
  } catch (error) {
    console.error('Failed to save tapering schedule:', error);
    throw new Error('Database error: kunne ikke lagre nedtrappingsplan');
  }
}

export async function getTaperingSchedules(): Promise<TaperingSchedule[]> {
  try {
    return await db.taperingSchedules.orderBy('createdAt').reverse().toArray();
  } catch (error) {
    console.error('Failed to fetch tapering schedules:', error);
    return [];
  }
}
