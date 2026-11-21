import { Nurse, SupervisiIndicator, SupervisiLog } from '../types';

export interface BackupPayload {
  app: 'SUPERVISI_IGD';
  version: number;
  exportedAt: string;
  data: {
    nurses: Nurse[];
    supervisiLogs: SupervisiLog[];
    indicators: SupervisiIndicator[];
    trainings: string[];
  };
}

export function createBackupPayload(params: {
  nurses: Nurse[];
  supervisiLogs: SupervisiLog[];
  indicators: SupervisiIndicator[];
  trainings: string[];
}): BackupPayload {
  return {
    app: 'SUPERVISI_IGD',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      nurses: params.nurses,
      supervisiLogs: params.supervisiLogs,
      indicators: params.indicators,
      trainings: params.trainings
    }
  };
}

export function downloadBackupJson(params: {
  nurses: Nurse[];
  supervisiLogs: SupervisiLog[];
  indicators: SupervisiIndicator[];
  trainings: string[];
}): string {
  const payload = createBackupPayload(params);
  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const datePart = new Date().toISOString().split('T')[0];
  const fileName = `Backup_Supervisi_IGD_${datePart}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
}

export function parseBackupJson(rawText: string): BackupPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('File tidak berformat JSON yang valid.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Struktur file backup tidak valid.');
  }

  const record = parsed as Record<string, unknown>;
  const dataBlock =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : record;

  if (!Array.isArray(dataBlock.nurses)) {
    throw new Error('File backup tidak memiliki daftar data perawat (nurses).');
  }

  const nurses = dataBlock.nurses as Nurse[];
  const supervisiLogs = Array.isArray(dataBlock.supervisiLogs)
    ? (dataBlock.supervisiLogs as SupervisiLog[])
    : [];
  const indicators = Array.isArray(dataBlock.indicators)
    ? (dataBlock.indicators as SupervisiIndicator[])
    : [];
  const trainings = Array.isArray(dataBlock.trainings)
    ? (dataBlock.trainings as string[])
    : [];

  return {
    app: 'SUPERVISI_IGD',
    version: typeof record.version === 'number' ? record.version : 1,
    exportedAt:
      typeof record.exportedAt === 'string'
        ? record.exportedAt
        : new Date().toISOString(),
    data: {
      nurses,
      supervisiLogs,
      indicators,
      trainings
    }
  };
}
