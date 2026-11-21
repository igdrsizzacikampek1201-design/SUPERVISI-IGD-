/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import { Nurse, SupervisiIndicator, SupervisiLog, ToastMessage } from './types';
import {
  INITIAL_NURSES_DATA,
  INITIAL_SUPERVISI_LOGS,
  DEFAULT_SUPERVISI_INDICATORS,
  DEFAULT_TRAININGS
} from './initialData';
import { exportNursesToCSV } from './utils/exportCsv';
import { downloadSelfTrainingWord, printSelfTrainingPDF } from './utils/exportDoc';
import { BackupPayload, downloadBackupJson } from './utils/backupJson';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  clearCachedAccessToken
} from './utils/googleAuth';
import {
  createSupervisiSpreadsheet,
  getSpreadsheetMetadata,
  syncAllDataToGoogleSheets,
  uploadJsonBackupToDrive,
  sendToGoogleSheets,
  sendFullSnapshotToWebhook
} from './utils/googleSheets';

import { Header, ActiveTab } from './components/Header';
import { TabDatabase } from './components/TabDatabase';
import { TabSupervisi } from './components/TabSupervisi';
import { TabPelatihan } from './components/TabPelatihan';
import { ToastContainer } from './components/ToastContainer';

import { GoogleSheetsModal } from './components/modals/GoogleSheetsModal';
import { BackupRestoreModal } from './components/modals/BackupRestoreModal';
import { CustomIndicatorsModal } from './components/modals/CustomIndicatorsModal';
import { ManageTrainingsModal } from './components/modals/ManageTrainingsModal';
import { NurseModal } from './components/modals/NurseModal';
import { SupervisiDetailModal } from './components/modals/SupervisiDetailModal';
import { ConfirmModal } from './components/modals/ConfirmModal';

const STORAGE_KEY_NURSES = 'sim_sdm_igd_nurses_v3';
const STORAGE_KEY_SUPERVISI = 'sim_sdm_igd_supervisi_v3';
const STORAGE_KEY_INDICATORS = 'sim_sdm_igd_indicators_v3';
const STORAGE_KEY_TRAININGS = 'sim_sdm_igd_trainings_v3';
const STORAGE_KEY_WEBHOOK = 'sim_sdm_igd_webhook_v3';
const STORAGE_KEY_AUTO_WEBHOOK = 'supervisi_igd_auto_webhook_v1';
const STORAGE_KEY_SHEET_ID = 'supervisi_igd_sheet_id_v1';
const STORAGE_KEY_SHEET_TITLE = 'supervisi_igd_sheet_title_v1';
const STORAGE_KEY_SHEET_URL = 'supervisi_igd_sheet_url_v1';
const STORAGE_KEY_DRIVE_FILE_ID = 'supervisi_igd_drive_file_id_v1';
const STORAGE_KEY_AUTO_GOOGLE = 'supervisi_igd_auto_google_v1';
const STORAGE_KEY_AUTO_DRIVE = 'supervisi_igd_auto_drive_v1';

export default function App() {
  // Primary States
  const [nurses, setNurses] = useState<Nurse[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NURSES);
      return saved ? JSON.parse(saved) : INITIAL_NURSES_DATA;
    } catch {
      return INITIAL_NURSES_DATA;
    }
  });

  const [supervisiLogs, setSupervisiLogs] = useState<SupervisiLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUPERVISI);
      return saved ? JSON.parse(saved) : INITIAL_SUPERVISI_LOGS;
    } catch {
      return INITIAL_SUPERVISI_LOGS;
    }
  });

  const [indicators, setIndicators] = useState<SupervisiIndicator[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INDICATORS);
      return saved ? JSON.parse(saved) : DEFAULT_SUPERVISI_INDICATORS;
    } catch {
      return DEFAULT_SUPERVISI_INDICATORS;
    }
  });

  const [trainings, setTrainings] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRAININGS);
      return saved ? JSON.parse(saved) : DEFAULT_TRAININGS;
    } catch {
      return DEFAULT_TRAININGS;
    }
  });

  // Google Sheets & Webhook Config States (NO tokens in localStorage!)
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_WEBHOOK) || '';
    } catch {
      return '';
    }
  });

  const [autoSyncWebhook, setAutoSyncWebhook] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AUTO_WEBHOOK) === 'true';
    } catch {
      return false;
    }
  });

  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_SHEET_ID) || '';
    } catch {
      return '';
    }
  });

  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_SHEET_TITLE) || '';
    } catch {
      return '';
    }
  });

  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_SHEET_URL) || '';
    } catch {
      return '';
    }
  });

  const [driveBackupFileId, setDriveBackupFileId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_DRIVE_FILE_ID) || '';
    } catch {
      return '';
    }
  });

  const [autoSyncGoogle, setAutoSyncGoogle] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AUTO_GOOGLE) === 'true';
    } catch {
      return false;
    }
  });

  const [autoBackupDrive, setAutoBackupDrive] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AUTO_DRIVE) === 'true';
    } catch {
      return false;
    }
  });

  // Google OAuth in-memory states
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [sessionMutationConfirmed, setSessionMutationConfirmed] = useState<boolean>(false);

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('database');
  const [preselectedNurseId, setPreselectedNurseId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal states
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCustomIndicatorsOpen, setIsCustomIndicatorsOpen] = useState(false);
  const [isManageTrainingsOpen, setIsManageTrainingsOpen] = useState(false);
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false);
  const [nurseToEdit, setNurseToEdit] = useState<Nurse | null>(null);
  const [isSupervisiDetailOpen, setIsSupervisiDetailOpen] = useState(false);
  const [supervisiDetail, setSupervisiDetail] = useState<SupervisiLog | null>(null);

  // Confirm modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'danger' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3400);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Init Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      user => {
        setGoogleUser(user);
        setNeedsAuth(false);
      },
      user => {
        setGoogleUser(user);
        setNeedsAuth(true);
        setSessionMutationConfirmed(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NURSES, JSON.stringify(nurses));
    } catch (e) {
      console.error(e);
    }
  }, [nurses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUPERVISI, JSON.stringify(supervisiLogs));
    } catch (e) {
      console.error(e);
    }
  }, [supervisiLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INDICATORS, JSON.stringify(indicators));
    } catch (e) {
      console.error(e);
    }
  }, [indicators]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRAININGS, JSON.stringify(trainings));
    } catch (e) {
      console.error(e);
    }
  }, [trainings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WEBHOOK, webhookUrl);
      localStorage.setItem(STORAGE_KEY_AUTO_WEBHOOK, String(autoSyncWebhook));
    } catch (e) {
      console.error(e);
    }
  }, [webhookUrl, autoSyncWebhook]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SHEET_ID, spreadsheetId);
      localStorage.setItem(STORAGE_KEY_SHEET_TITLE, spreadsheetTitle);
      localStorage.setItem(STORAGE_KEY_SHEET_URL, spreadsheetUrl);
      localStorage.setItem(STORAGE_KEY_DRIVE_FILE_ID, driveBackupFileId);
      localStorage.setItem(STORAGE_KEY_AUTO_GOOGLE, String(autoSyncGoogle));
      localStorage.setItem(STORAGE_KEY_AUTO_DRIVE, String(autoBackupDrive));
    } catch (e) {
      console.error(e);
    }
  }, [
    spreadsheetId,
    spreadsheetTitle,
    spreadsheetUrl,
    driveBackupFileId,
    autoSyncGoogle,
    autoBackupDrive
  ]);

  // Execute Google Sheets + optional Drive JSON sync
  const executeGoogleSync = useCallback(
    async (
      targetSheetId: string,
      includeDriveBackup: boolean,
      silent = false
    ) => {
      const token = getAccessToken();
      if (!token || !targetSheetId) {
        if (!silent) {
          showToast('Silakan masuk dengan akun Google terlebih dahulu.', 'danger');
        }
        return;
      }

      setIsSyncing(true);
      try {
        const result = await syncAllDataToGoogleSheets(token, targetSheetId, {
          nurses,
          supervisiLogs,
          trainings,
          indicators
        });
        setSpreadsheetTitle(result.title);
        setSpreadsheetUrl(result.spreadsheetUrl);
        setLastSyncedAt(result.syncedAt);

        if (includeDriveBackup) {
          const driveRes = await uploadJsonBackupToDrive(
            token,
            { nurses, supervisiLogs, indicators, trainings },
            driveBackupFileId || undefined
          );
          setDriveBackupFileId(driveRes.fileId);
        }

        if (!silent) {
          showToast(
            includeDriveBackup
              ? 'Data terkirim ke Google Sheets & file Backup JSON tersimpan di Google Drive.'
              : 'Data berhasil dikirim ke Google Sheets.'
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal mengirim data ke Google Sheets.';
        if (msg.includes('401')) {
          clearCachedAccessToken();
          setNeedsAuth(true);
          setSessionMutationConfirmed(false);
          showToast('Sesi Google berakhir. Silakan Sign in with Google kembali.', 'danger');
        } else {
          showToast(msg, 'danger');
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [nurses, supervisiLogs, trainings, indicators, driveBackupFileId, showToast]
  );

  // Auto-sync effect when data changes (only when explicitly confirmed in this session)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (autoSyncGoogle && sessionMutationConfirmed && spreadsheetId && !needsAuth) {
        executeGoogleSync(spreadsheetId, autoBackupDrive, true);
      }
      if (autoSyncWebhook && webhookUrl.trim()) {
        sendFullSnapshotToWebhook(webhookUrl, {
          nurses,
          supervisiLogs,
          indicators,
          trainings
        });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    nurses,
    supervisiLogs,
    indicators,
    trainings,
    autoSyncGoogle,
    autoBackupDrive,
    sessionMutationConfirmed,
    spreadsheetId,
    needsAuth,
    autoSyncWebhook,
    webhookUrl,
    executeGoogleSync
  ]);

  // Google Auth handlers
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setNeedsAuth(false);
        showToast(`Terhubung ke Google: ${result.user.email}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal masuk dengan Google.';
      showToast(msg, 'danger');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setNeedsAuth(true);
    setSessionMutationConfirmed(false);
    showToast('Akun Google telah keluar.');
  };

  const handleCreateSpreadsheet = () => {
    const token = getAccessToken();
    if (!token) {
      showToast('Silakan masuk dengan Google terlebih dahulu.', 'danger');
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: 'Buat Google Spreadsheet Baru?',
      message:
        'Aplikasi akan membuat file baru berjudul "Supervisi IGD - Data & Laporan" di Google Drive Anda serta mengisi tab Data Perawat, Riwayat Supervisi, dan Matriks Pelatihan.',
      actionText: 'Ya, Buat & Kirim',
      isDestructive: false,
      onConfirm: async () => {
        setConfirmConfig(c => ({ ...c, isOpen: false }));
        setIsSyncing(true);
        try {
          const created = await createSupervisiSpreadsheet(token);
          setSpreadsheetId(created.spreadsheetId);
          setSpreadsheetTitle(created.title);
          setSpreadsheetUrl(created.spreadsheetUrl);
          setSessionMutationConfirmed(true);
          setAutoSyncGoogle(true);
          await executeGoogleSync(created.spreadsheetId, autoBackupDrive, false);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Gagal membuat spreadsheet.';
          showToast(msg, 'danger');
          setIsSyncing(false);
        }
      }
    });
  };

  const handleConnectSpreadsheetId = async (id: string) => {
    const token = getAccessToken();
    if (!token || !id) return;

    setIsSyncing(true);
    try {
      const meta = await getSpreadsheetMetadata(token, id);
      setIsSyncing(false);

      setConfirmConfig({
        isOpen: true,
        title: `Hubungkan & Perbarui "${meta.title}"?`,
        message: `Apakah Anda yakin ingin menghubungkan spreadsheet "${meta.title}"? Tab "Data Perawat", "Riwayat Supervisi", dan "Matriks Pelatihan" pada spreadsheet tersebut akan diperbarui dengan data Supervisi IGD saat ini.`,
        actionText: 'Ya, Hubungkan & Kirim',
        isDestructive: false,
        onConfirm: async () => {
          setConfirmConfig(c => ({ ...c, isOpen: false }));
          setSpreadsheetId(id);
          setSpreadsheetTitle(meta.title);
          setSpreadsheetUrl(meta.spreadsheetUrl);
          setSessionMutationConfirmed(true);
          await executeGoogleSync(id, autoBackupDrive, false);
        }
      });
    } catch (err) {
      setIsSyncing(false);
      const msg = err instanceof Error ? err.message : 'Gagal menemukan Google Spreadsheet.';
      showToast(msg, 'danger');
    }
  };

  const handleSyncNowGoogle = () => {
    if (!spreadsheetId) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Kirim Data ke Google Sheets?',
      message: `Tab "Data Perawat", "Riwayat Supervisi", dan "Matriks Pelatihan" pada spreadsheet "${
        spreadsheetTitle || spreadsheetId
      }" akan diperbarui sesuai data terbaru${
        autoBackupDrive ? ' dan file Backup_Supervisi_IGD.json akan diunggah ke Google Drive' : ''
      }.`,
      actionText: 'Ya, Kirim Sekarang',
      isDestructive: false,
      onConfirm: async () => {
        setConfirmConfig(c => ({ ...c, isOpen: false }));
        setSessionMutationConfirmed(true);
        await executeGoogleSync(spreadsheetId, autoBackupDrive, false);
      }
    });
  };

  const handleToggleAutoSyncGoogle = (enabled: boolean) => {
    if (!enabled) {
      setAutoSyncGoogle(false);
      showToast('Kirim otomatis ke Google Sheets dimatikan.');
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: 'Aktifkan Kirim Otomatis ke Google Sheets?',
      message: `Setiap perubahan data (tambah/ubah perawat, supervisi, pelatihan) akan otomatis memperbarui spreadsheet "${
        spreadsheetTitle || spreadsheetId
      }"${autoBackupDrive ? ' dan Backup JSON di Google Drive' : ''}.`,
      actionText: 'Ya, Aktifkan Auto-Sync',
      isDestructive: false,
      onConfirm: async () => {
        setConfirmConfig(c => ({ ...c, isOpen: false }));
        setAutoSyncGoogle(true);
        setSessionMutationConfirmed(true);
        await executeGoogleSync(spreadsheetId, autoBackupDrive, false);
      }
    });
  };

  // Tab 1 Handlers: Nurse
  const handleOpenAddNurse = () => {
    setNurseToEdit(null);
    setIsNurseModalOpen(true);
  };

  const handleOpenEditNurse = (nurse: Nurse) => {
    setNurseToEdit(nurse);
    setIsNurseModalOpen(true);
  };

  const handleSaveNurse = (savedNurse: Nurse) => {
    setNurses(prev => {
      const exists = prev.some(n => n.id === savedNurse.id);
      if (exists) {
        return prev.map(n => (n.id === savedNurse.id ? savedNurse : n));
      } else {
        return [...prev, savedNurse];
      }
    });

    setIsNurseModalOpen(false);
    showToast(
      nurseToEdit
        ? `Data ${savedNurse.nama} berhasil diperbarui.`
        : `Perawat baru ${savedNurse.nama} berhasil ditambahkan.`
    );

    if (webhookUrl && !autoSyncWebhook) {
      sendToGoogleSheets(webhookUrl, {
        type: 'NURSE_UPDATE',
        data: savedNurse
      });
    }
  };

  const handleDeleteNurse = (nurse: Nurse) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Data Perawat?',
      message: `Anda akan menghapus data ${nurse.nama} dari database IGD.`,
      actionText: 'Ya, Hapus',
      isDestructive: true,
      onConfirm: () => {
        setNurses(prev => prev.filter(n => n.id !== nurse.id));
        setConfirmConfig(c => ({ ...c, isOpen: false }));
        showToast(`Data ${nurse.nama} telah dihapus.`, 'danger');
      }
    });
  };

  const handleQuickSupervisi = (nurseId: string) => {
    setPreselectedNurseId(nurseId);
    setActiveTab('supervisi');
    showToast('Silakan lakukan penilaian supervisi klinis.');
  };

  // Tab 2 Handlers: Supervisi
  const handleSubmitSupervisi = (data: Omit<SupervisiLog, 'id'>) => {
    const newLog: SupervisiLog = {
      ...data,
      id: `sup-${Date.now()}`
    };

    setSupervisiLogs(prev => [newLog, ...prev]);
    showToast(`Laporan supervisi klinis untuk ${newLog.nurseName} tersimpan.`);

    if (webhookUrl && !autoSyncWebhook) {
      sendToGoogleSheets(webhookUrl, {
        type: 'SUPERVISI_SUBMIT',
        data: newLog
      });
    }
  };

  const handleDeleteSupervisiLog = (log: SupervisiLog) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Laporan Supervisi?',
      message: `Laporan supervisi ${log.nurseName} tanggal ${log.date} akan dihapus secara permanen.`,
      actionText: 'Ya, Hapus',
      isDestructive: true,
      onConfirm: () => {
        setSupervisiLogs(prev => prev.filter(l => l.id !== log.id));
        setConfirmConfig(c => ({ ...c, isOpen: false }));
        showToast('Riwayat supervisi dihapus.', 'danger');
      }
    });
  };

  const handleOpenSupervisiDetail = (log: SupervisiLog) => {
    setSupervisiDetail(log);
    setIsSupervisiDetailOpen(true);
  };

  // Custom Indicators Handlers
  const handleSaveIndicator = (indicatorData: {
    id?: string;
    title: string;
    category: string;
    guide: string;
  }) => {
    if (indicatorData.id) {
      setIndicators(prev =>
        prev.map(ind =>
          ind.id === indicatorData.id
            ? {
                ...ind,
                title: indicatorData.title,
                category: indicatorData.category,
                guide: indicatorData.guide
              }
            : ind
        )
      );
      showToast('Indikator supervisi berhasil diperbarui.');
    } else {
      const newInd: SupervisiIndicator = {
        id: `ind-${Date.now()}`,
        title: indicatorData.title,
        category: indicatorData.category,
        guide: indicatorData.guide
      };
      setIndicators(prev => [...prev, newInd]);
      showToast('Indikator supervisi baru berhasil ditambahkan.');
    }
  };

  const handleDeleteIndicator = (id: string) => {
    if (indicators.length <= 1) {
      showToast('Minimal harus ada 1 indikator supervisi aktif.', 'danger');
      return;
    }
    setIndicators(prev => prev.filter(i => i.id !== id));
    showToast('Item indikator supervisi dihapus.', 'danger');
  };

  const handleMoveIndicator = (index: number, direction: number) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= indicators.length) return;
    setIndicators(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleResetIndicatorsToDefault = () => {
    setIndicators(DEFAULT_SUPERVISI_INDICATORS);
    showToast('Daftar indikator supervisi dikembalikan ke standar default IGD.');
  };

  // Tab 3 Handlers: Trainings
  const handleToggleNurseTraining = (nurseId: string, trainingName: string) => {
    setNurses(prev =>
      prev.map(n => {
        if (n.id !== nurseId) return n;
        const currentTrainings = Array.isArray(n.pelatihan) ? [...n.pelatihan] : [];
        const updatedTrainings = currentTrainings.includes(trainingName)
          ? currentTrainings.filter(t => t !== trainingName)
          : [...currentTrainings, trainingName];
        return {
          ...n,
          pelatihan: updatedTrainings
        };
      })
    );

    const nurse = nurses.find(n => n.id === nurseId);
    showToast(`Pelatihan ${trainingName} untuk ${nurse?.nama || 'perawat'} diperbarui.`);
  };

  const handleAddTraining = (name: string) => {
    if (trainings.includes(name)) {
      showToast('Jenis pelatihan tersebut sudah ada.', 'danger');
      return;
    }
    setTrainings(prev => [...prev, name]);
    showToast(`Kolom pelatihan "${name}" ditambahkan.`);
  };

  const handleRemoveTraining = (name: string) => {
    if (trainings.length <= 1) {
      showToast('Minimal harus ada 1 jenis pelatihan.', 'danger');
      return;
    }
    setTrainings(prev => prev.filter(t => t !== name));
    showToast(`Kolom pelatihan "${name}" dihapus.`, 'danger');
  };

  // Backup JSON Handlers
  const handleDownloadBackup = () => {
    const fileName = downloadBackupJson({
      nurses,
      supervisiLogs,
      indicators,
      trainings
    });
    showToast(`File backup "${fileName}" berhasil diunduh.`);
  };

  const handleRestoreBackup = (payload: BackupPayload) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Pulihkan Data dari Backup JSON?',
      message: `Data saat ini akan diganti dengan data dari file backup (${payload.data.nurses.length} perawat, ${payload.data.supervisiLogs.length} riwayat supervisi).`,
      actionText: 'Ya, Pulihkan Data',
      isDestructive: false,
      onConfirm: () => {
        setNurses(payload.data.nurses);
        setSupervisiLogs(payload.data.supervisiLogs);
        if (payload.data.indicators.length > 0) {
          setIndicators(payload.data.indicators);
        }
        if (payload.data.trainings.length > 0) {
          setTrainings(payload.data.trainings);
        }
        setConfirmConfig(c => ({ ...c, isOpen: false }));
        showToast('Seluruh data berhasil dipulihkan dari file backup JSON.');
      }
    });
  };

  // Global actions
  const handleDownloadDoc = () => {
    downloadSelfTrainingWord(indicators);
    showToast('Dokumen Latihan Mandiri (.doc) berhasil diunduh.');
  };

  const handlePrintDoc = () => {
    printSelfTrainingPDF(indicators, () => {
      showToast('Pop-up diblokir browser. Gunakan tombol Modul (.doc).', 'danger');
    });
  };

  const handleExportCSV = () => {
    exportNursesToCSV(nurses);
    showToast('File CSV Supervisi IGD berhasil diunduh.');
  };

  const handleSaveWebhook = (url: string, auto: boolean) => {
    setWebhookUrl(url);
    setAutoSyncWebhook(auto);
    setIsGoogleSheetsOpen(false);
    showToast('Pengaturan Webhook Google Sheets berhasil disimpan.');
  };

  const handleTestWebhook = async (url: string) => {
    if (!url.trim()) {
      showToast('Masukkan URL Webhook Google Apps Script terlebih dahulu.', 'danger');
      return;
    }
    showToast('Mengirim tes koneksi ke Google Sheets...');
    const ok = await sendToGoogleSheets(url, {
      type: 'TEST_CONNECTION',
      message: 'Ping tes dari Supervisi IGD'
    });
    if (ok) {
      showToast('Ping tes berhasil dikirim ke Google Sheets (Mode No-CORS).');
    } else {
      showToast('Gagal mengirim ke webhook.', 'danger');
    }
  };

  const handleSyncNowWebhook = async (url: string) => {
    if (!url.trim()) {
      showToast('Masukkan URL Webhook Google Apps Script terlebih dahulu.', 'danger');
      return;
    }
    const ok = await sendFullSnapshotToWebhook(url, {
      nurses,
      supervisiLogs,
      indicators,
      trainings
    });
    if (ok) {
      showToast('Seluruh data berhasil dikirim ke Google Sheets Webhook.');
    } else {
      showToast('Gagal mengirim data ke webhook.', 'danger');
    }
  };

  const handleResetAll = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Reset ke Data Default?',
      message:
        'Semua perubahan data perawat, indikator custom, dan riwayat supervisi akan dikembalikan ke pengaturan awal.',
      actionText: 'Ya, Reset Semua',
      isDestructive: true,
      onConfirm: () => {
        setNurses(INITIAL_NURSES_DATA);
        setSupervisiLogs(INITIAL_SUPERVISI_LOGS);
        setIndicators(DEFAULT_SUPERVISI_INDICATORS);
        setTrainings(DEFAULT_TRAININGS);
        setConfirmConfig(c => ({ ...c, isOpen: false }));
        showToast('Seluruh data berhasil dikembalikan ke pengaturan awal.');
      }
    });
  };

  const isGoogleConnected =
    (!needsAuth && Boolean(spreadsheetId) && autoSyncGoogle) ||
    (Boolean(webhookUrl) && autoSyncWebhook);

  return (
    <div className="min-h-screen text-slate-800 antialiased flex flex-col">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <Header
        activeTab={activeTab}
        totalNurses={nurses.length}
        totalSupervisi={supervisiLogs.length}
        isGoogleConnected={isGoogleConnected}
        isSyncing={isSyncing}
        onSwitchTab={tab => {
          setActiveTab(tab);
          if (tab !== 'supervisi') setPreselectedNurseId(null);
        }}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onDownloadDoc={handleDownloadDoc}
        onReset={handleResetAll}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print-full w-full">
        {activeTab === 'database' && (
          <TabDatabase
            nurses={nurses}
            onOpenAddModal={handleOpenAddNurse}
            onOpenEditModal={handleOpenEditNurse}
            onQuickSupervisi={handleQuickSupervisi}
            onDeleteNurse={handleDeleteNurse}
            onExportCSV={handleExportCSV}
          />
        )}

        {activeTab === 'supervisi' && (
          <TabSupervisi
            nurses={nurses}
            indicators={indicators}
            logs={supervisiLogs}
            preselectedNurseId={preselectedNurseId}
            onOpenIndicatorsModal={() => setIsCustomIndicatorsOpen(true)}
            onDownloadDoc={handleDownloadDoc}
            onPrintDoc={handlePrintDoc}
            onSubmitSupervisi={handleSubmitSupervisi}
            onOpenDetailModal={handleOpenSupervisiDetail}
            onDeleteLog={handleDeleteSupervisiLog}
          />
        )}

        {activeTab === 'pelatihan' && (
          <TabPelatihan
            nurses={nurses}
            trainingColumns={trainings}
            onToggleTraining={handleToggleNurseTraining}
            onOpenManageTrainings={() => setIsManageTrainingsOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        googleUser={googleUser}
        needsAuth={needsAuth}
        isLoggingIn={isLoggingIn}
        spreadsheetId={spreadsheetId}
        spreadsheetTitle={spreadsheetTitle}
        spreadsheetUrl={spreadsheetUrl}
        autoSyncGoogle={autoSyncGoogle}
        autoBackupDrive={autoBackupDrive}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
        webhookUrl={webhookUrl}
        autoSyncWebhook={autoSyncWebhook}
        onClose={() => setIsGoogleSheetsOpen(false)}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        onCreateSpreadsheet={handleCreateSpreadsheet}
        onConnectSpreadsheetId={handleConnectSpreadsheetId}
        onSyncNowGoogle={handleSyncNowGoogle}
        onToggleAutoSyncGoogle={handleToggleAutoSyncGoogle}
        onToggleAutoBackupDrive={enabled => setAutoBackupDrive(enabled)}
        onSaveWebhook={handleSaveWebhook}
        onTestWebhook={handleTestWebhook}
        onSyncNowWebhook={handleSyncNowWebhook}
      />

      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        counts={{
          nurses: nurses.length,
          supervisiLogs: supervisiLogs.length,
          indicators: indicators.length,
          trainings: trainings.length
        }}
        onClose={() => setIsBackupModalOpen(false)}
        onDownloadBackup={handleDownloadBackup}
        onRestoreBackup={handleRestoreBackup}
      />

      <CustomIndicatorsModal
        isOpen={isCustomIndicatorsOpen}
        indicators={indicators}
        onClose={() => setIsCustomIndicatorsOpen(false)}
        onSaveIndicator={handleSaveIndicator}
        onDeleteIndicator={handleDeleteIndicator}
        onMoveIndicator={handleMoveIndicator}
        onResetToDefault={handleResetIndicatorsToDefault}
        onDownloadDoc={handleDownloadDoc}
      />

      <ManageTrainingsModal
        isOpen={isManageTrainingsOpen}
        trainings={trainings}
        onClose={() => setIsManageTrainingsOpen(false)}
        onAddTraining={handleAddTraining}
        onRemoveTraining={handleRemoveTraining}
      />

      <NurseModal
        isOpen={isNurseModalOpen}
        nurse={nurseToEdit}
        trainings={trainings}
        totalNurses={nurses.length}
        onClose={() => setIsNurseModalOpen(false)}
        onSave={handleSaveNurse}
      />

      <SupervisiDetailModal
        isOpen={isSupervisiDetailOpen}
        log={supervisiDetail}
        onClose={() => setIsSupervisiDetailOpen(false)}
        onPrint={() => window.print()}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        actionText={confirmConfig.actionText}
        isDestructive={confirmConfig.isDestructive}
        onClose={() => setConfirmConfig(c => ({ ...c, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
      />
    </div>
  );
}
