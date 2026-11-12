/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Nurse, SupervisiIndicator, SupervisiLog, ToastMessage } from './types';
import {
  INITIAL_NURSES_DATA,
  INITIAL_SUPERVISI_LOGS,
  DEFAULT_SUPERVISI_INDICATORS,
  DEFAULT_TRAININGS
} from './initialData';
import { exportNursesToCSV } from './utils/exportCsv';
import { downloadSelfTrainingWord, printSelfTrainingPDF } from './utils/exportDoc';
import { sendToGoogleSheets } from './utils/googleSheets';

import { Header, ActiveTab } from './components/Header';
import { TabDatabase } from './components/TabDatabase';
import { TabSupervisi } from './components/TabSupervisi';
import { TabPelatihan } from './components/TabPelatihan';
import { ToastContainer } from './components/ToastContainer';

import { GoogleSheetsModal } from './components/modals/GoogleSheetsModal';
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

  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_WEBHOOK) || '';
    } catch {
      return '';
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('database');
  const [preselectedNurseId, setPreselectedNurseId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal states
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
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
    }, 3200);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to localStorage
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
    } catch (e) {
      console.error(e);
    }
  }, [webhookUrl]);

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

    // Sync to Google Sheets
    if (webhookUrl) {
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

    // Sync to Google Sheets
    if (webhookUrl) {
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

  // Global actions
  const handleDownloadDoc = () => {
    downloadSelfTrainingWord(indicators);
    showToast('Dokumen Latihan Mandiri (.doc) berhasil diunduh.');
  };

  const handlePrintDoc = () => {
    printSelfTrainingPDF(indicators, () => {
      showToast('Pop-up diblokir browser. Gunakan tombol Unduh Dokumen (.doc).', 'danger');
    });
  };

  const handleExportCSV = () => {
    exportNursesToCSV(nurses);
    showToast('File CSV SDM Keperawatan IGD berhasil diunduh.');
  };

  const handleSaveWebhook = (url: string) => {
    setWebhookUrl(url);
    setIsGoogleSheetsOpen(false);
    showToast('URL Webhook Google Sheets berhasil disimpan.');
  };

  const handleTestWebhook = async (url: string) => {
    if (!url.trim()) {
      showToast('Masukkan URL Webhook Google Apps Script terlebih dahulu.', 'danger');
      return;
    }
    showToast('Mengirim tes koneksi ke Google Sheets...');
    const ok = await sendToGoogleSheets(url, {
      type: 'TEST_CONNECTION',
      message: 'Ping tes dari SIM-SDM Keperawatan IGD'
    });
    if (ok) {
      showToast('Ping tes berhasil dikirim ke Google Sheets (Mode No-CORS).');
    } else {
      showToast('Gagal mengirim ke webhook.', 'danger');
    }
  };

  const handleResetAll = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Reset ke Data Default?',
      message:
        'Semua perubahan data 17 perawat, indikator custom, dan riwayat supervisi akan dikembalikan ke pengaturan awal.',
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

  return (
    <div className="min-h-screen text-slate-800 antialiased flex flex-col">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <Header
        activeTab={activeTab}
        totalNurses={nurses.length}
        totalSupervisi={supervisiLogs.length}
        onSwitchTab={tab => {
          setActiveTab(tab);
          if (tab !== 'supervisi') setPreselectedNurseId(null);
        }}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
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
        webhookUrl={webhookUrl}
        onClose={() => setIsGoogleSheetsOpen(false)}
        onSave={handleSaveWebhook}
        onTest={handleTestWebhook}
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
