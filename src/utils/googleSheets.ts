import { Nurse, SupervisiIndicator, SupervisiLog } from '../types';
import { normalizePK } from '../initialData';
import { createBackupPayload } from './backupJson';

const SHEET_DATA_PERAWAT = 'Data Perawat';
const SHEET_RIWAYAT_SUPERVISI = 'Riwayat Supervisi';
const SHEET_MATRIKS_PELATIHAN = 'Matriks Pelatihan';

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  return trimmed;
}

function escapeSheetTitle(title: string): string {
  return `'${title.replace(/'/g, "''")}'`;
}

export async function getSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; sheetTitles: string[]; spreadsheetUrl: string }> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}?fields=properties.title,spreadsheetUrl,sheets.properties.title`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal mengakses Google Spreadsheet (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const sheetTitles: string[] = Array.isArray(data.sheets)
    ? data.sheets.map((s: { properties?: { title?: string } }) => s.properties?.title || '').filter(Boolean)
    : [];

  return {
    title: data.properties?.title || 'Google Spreadsheet',
    sheetTitles,
    spreadsheetUrl:
      data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
  };
}

export async function createSupervisiSpreadsheet(
  accessToken: string,
  customTitle = 'Supervisi IGD - Data & Laporan'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: customTitle
      },
      sheets: [
        { properties: { title: SHEET_DATA_PERAWAT } },
        { properties: { title: SHEET_RIWAYAT_SUPERVISI } },
        { properties: { title: SHEET_MATRIKS_PELATIHAN } }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal membuat Google Spreadsheet (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl:
      data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    title: data.properties?.title || customTitle
  };
}

async function ensureRequiredSheets(
  accessToken: string,
  spreadsheetId: string,
  existingTitles: string[]
): Promise<void> {
  const required = [SHEET_DATA_PERAWAT, SHEET_RIWAYAT_SUPERVISI, SHEET_MATRIKS_PELATIHAN];
  const missing = required.filter(name => !existingTitles.includes(name));
  if (missing.length === 0) return;

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: missing.map(title => ({
          addSheet: {
            properties: { title }
          }
        }))
      })
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal menambahkan tab sheet (${res.status}): ${errText}`);
  }
}

export async function syncAllDataToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  payload: {
    nurses: Nurse[];
    supervisiLogs: SupervisiLog[];
    trainings: string[];
    indicators: SupervisiIndicator[];
  }
): Promise<{ spreadsheetUrl: string; title: string; syncedAt: string }> {
  const meta = await getSpreadsheetMetadata(accessToken, spreadsheetId);
  await ensureRequiredSheets(accessToken, spreadsheetId, meta.sheetTitles);

  // Clear existing ranges first so deleted rows don't linger
  const clearRanges = [
    `${escapeSheetTitle(SHEET_DATA_PERAWAT)}!A1:Z1000`,
    `${escapeSheetTitle(SHEET_RIWAYAT_SUPERVISI)}!A1:Z1000`,
    `${escapeSheetTitle(SHEET_MATRIKS_PELATIHAN)}!A1:Z1000`
  ];

  const clearRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values:batchClear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ranges: clearRanges })
    }
  );

  if (!clearRes.ok) {
    const errText = await clearRes.text();
    throw new Error(`Gagal membersihkan data lama di Spreadsheet (${clearRes.status}): ${errText}`);
  }

  // 1. Sheet: Data Perawat
  const nurseRows: (string | number)[][] = [
    [
      'NO',
      'NIK',
      'NAMA PERAWAT',
      'TANGGAL MASUK',
      'PENDIDIKAN',
      'PERAWAT KLINIK',
      'STATUS',
      'NO STR',
      'MASA AKTIF STR',
      'NO SIPP',
      'MASA AKTIF SIPP',
      'NO NIRA',
      'PELATIHAN'
    ],
    ...payload.nurses.map(n => [
      n.no || '',
      n.nik || '',
      n.nama || '',
      n.tanggalMasuk || '',
      n.pendidikan || '',
      normalizePK(n.perawatKlinik),
      n.statusKaryawan || '',
      n.noStr || '',
      n.masaAktifStr || '',
      n.noSipp || '',
      n.masaAktifSipp || '',
      n.noNira || '',
      [...(n.pelatihan || []), n.pelatihanExtra].filter(Boolean).join('; ')
    ])
  ];

  // 2. Sheet: Riwayat Supervisi
  const supervisiRows: (string | number)[][] = [
    [
      'ID',
      'TANGGAL',
      'SHIFT',
      'NAMA PERAWAT',
      'JENJANG PK',
      'SUPERVISOR',
      'SKOR',
      'SKOR MAKS',
      'PERSENTASE (%)',
      'KATEGORI',
      'CATATAN & RTL',
      'RINCIAN INDIKATOR'
    ],
    ...payload.supervisiLogs.map(log => [
      log.id,
      log.date,
      log.shift,
      log.nurseName,
      log.nursePk,
      log.supervisor,
      log.totalScore,
      log.maxScore,
      log.percentage,
      log.category,
      log.notes || '',
      log.itemsSnapshot
        .map((item, idx) => `${idx + 1}. ${item.title}: ${item.score}`)
        .join(' | ')
    ])
  ];

  // 3. Sheet: Matriks Pelatihan
  const trainingRows: (string | number)[][] = [
    ['NO', 'NAMA PERAWAT', 'JENJANG PK', ...payload.trainings, 'TERPENUHI'],
    ...payload.nurses.map(n => {
      const userTrainings = n.pelatihan || [];
      const done = payload.trainings.filter(t => userTrainings.includes(t)).length;
      return [
        n.no || '',
        n.nama || '',
        normalizePK(n.perawatKlinik),
        ...payload.trainings.map(t => (userTrainings.includes(t) ? 'SUDAH' : '-')),
        `${done}/${payload.trainings.length}`
      ];
    })
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: `${escapeSheetTitle(SHEET_DATA_PERAWAT)}!A1`,
            values: nurseRows
          },
          {
            range: `${escapeSheetTitle(SHEET_RIWAYAT_SUPERVISI)}!A1`,
            values: supervisiRows
          },
          {
            range: `${escapeSheetTitle(SHEET_MATRIKS_PELATIHAN)}!A1`,
            values: trainingRows
          }
        ]
      })
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Gagal menulis data ke Google Sheets (${updateRes.status}): ${errText}`);
  }

  return {
    spreadsheetUrl: meta.spreadsheetUrl,
    title: meta.title,
    syncedAt: new Date().toISOString()
  };
}

export async function uploadJsonBackupToDrive(
  accessToken: string,
  payload: {
    nurses: Nurse[];
    supervisiLogs: SupervisiLog[];
    indicators: SupervisiIndicator[];
    trainings: string[];
  },
  existingFileId?: string
): Promise<{ fileId: string; webViewLink?: string; name: string }> {
  const backup = createBackupPayload(payload);
  const fileName = `Backup_Supervisi_IGD.json`;
  const jsonContent = JSON.stringify(backup, null, 2);

  const boundary = '-------supervisi_igd_backup_boundary';
  const metadata = {
    name: fileName,
    mimeType: 'application/json'
  };

  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${jsonContent}\r\n` +
    `--${boundary}--`;

  const isUpdate = Boolean(existingFileId && existingFileId.trim());
  const url = isUpdate
    ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
        existingFileId!.trim()
      )}?uploadType=multipart&fields=id,name,webViewLink`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';

  const res = await fetch(url, {
    method: isUpdate ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  // If update target no longer exists (404), create a fresh file
  if (!res.ok && isUpdate && res.status === 404) {
    return uploadJsonBackupToDrive(accessToken, payload);
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal mengirim file JSON ke Google Drive (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return {
    fileId: data.id,
    webViewLink: data.webViewLink,
    name: data.name || fileName
  };
}

// Apps Script Webhook Helpers
export async function sendToGoogleSheets(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.trim()) return false;

  try {
    await fetch(webhookUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString()
      })
    });
    return true;
  } catch (error) {
    console.error('Error syncing to Google Sheets webhook:', error);
    return false;
  }
}

export async function sendFullSnapshotToWebhook(
  webhookUrl: string,
  data: {
    nurses: Nurse[];
    supervisiLogs: SupervisiLog[];
    indicators: SupervisiIndicator[];
    trainings: string[];
  }
): Promise<boolean> {
  return sendToGoogleSheets(webhookUrl, {
    type: 'FULL_SYNC',
    ...data
  });
}

export const APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var body = JSON.parse(e.postData.contents);
  
  if (body.type === 'FULL_SYNC') {
    saveSheet(ss, 'Data Perawat', [
      ['NO', 'NIK', 'NAMA', 'TGL MASUK', 'PEND', 'PK', 'STATUS', 'NO STR', 'MASA STR', 'NO SIPP', 'MASA SIPP', 'NIRA', 'PELATIHAN']
    ].concat((body.nurses || []).map(function(n) {
      return [n.no, n.nik, n.nama, n.tanggalMasuk, n.pendidikan, n.perawatKlinik, n.statusKaryawan, n.noStr, n.masaAktifStr, n.noSipp, n.masaAktifSipp, n.noNira, (n.pelatihan || []).join('; ')];
    })));
    
    saveSheet(ss, 'Riwayat Supervisi', [
      ['ID', 'TANGGAL', 'SHIFT', 'PERAWAT', 'PK', 'SUPERVISOR', 'SKOR', 'MAKS', 'PERSEN', 'KATEGORI', 'CATATAN']
    ].concat((body.supervisiLogs || []).map(function(l) {
      return [l.id, l.date, l.shift, l.nurseName, l.nursePk, l.supervisor, l.totalScore, l.maxScore, l.percentage, l.category, l.notes];
    })));
  } else {
    var logSheet = ss.getSheetByName('Log Aktivitas') || ss.insertSheet('Log Aktivitas');
    logSheet.appendRow([new Date(), body.type || 'EVENT', JSON.stringify(body.data || body)]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function saveSheet(ss, name, rows) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  sheet.clearContents();
  if (rows.length > 0) {
    sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  }
}`;
