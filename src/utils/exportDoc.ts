import { SupervisiIndicator } from '../types';

export function buildSelfTrainingDocumentHTML(indicators: SupervisiIndicator[]): string {
  const indicatorRows = indicators.map((ind, idx) => `
    <tr>
      <td style="border: 1px solid #334155; padding: 8px; text-align: center; font-weight: bold;">${idx + 1}</td>
      <td style="border: 1px solid #334155; padding: 8px;">
        <div style="font-weight: bold; color: #0f172a; margin-bottom: 4px;">${ind.title}</div>
        <div style="font-size: 11px; color: #047857; font-weight: bold; margin-bottom: 4px;">Standar: ${ind.category}</div>
        <div style="font-size: 12px; color: #334155;"><strong>Panduan Latihan Mandiri:</strong> ${ind.guide}</div>
      </td>
      <td style="border: 1px solid #334155; padding: 8px; text-align: center;">[ &nbsp; ] Ya</td>
      <td style="border: 1px solid #334155; padding: 8px; text-align: center;">[ &nbsp; ] Perlu Latihan</td>
      <td style="border: 1px solid #334155; padding: 8px;"></td>
    </tr>
  `).join('');

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8" />
      <title>Modul Latihan Mandiri & Supervisi Klinis Keperawatan IGD</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 12pt; color: #1e293b; line-height: 1.45; }
        h1 { font-size: 16pt; color: #065f46; margin-bottom: 4px; text-align: center; text-transform: uppercase; }
        h2 { font-size: 12pt; color: #475569; margin-top: 0; text-align: center; font-weight: normal; }
        .info-box { border: 1px solid #94a3b8; background-color: #f8fafc; padding: 10px 14px; margin: 14px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11pt; }
        th { background-color: #065f46; color: #ffffff; border: 1px solid #334155; padding: 8px; text-align: center; }
        .reflection-box { border: 1px solid #334155; padding: 12px; margin-top: 16px; min-height: 80px; }
      </style>
    </head>
    <body>
      <h1>MODUL LATIHAN MANDIRI (SELF-TRAINING) & SUPERVISI KLINIS</h1>
      <h2>INSTALASI GAWAT DARURAT (IGD) — PANDUAN KOMPETENSI SDM KEPERAWATAN</h2>
      <hr />

      <div class="info-box">
        <table style="margin: 0; border: none;">
          <tr>
            <td style="border: none; padding: 3px; width: 22%;"><strong>Nama Perawat</strong></td>
            <td style="border: none; padding: 3px; width: 35%;">: ....................................................</td>
            <td style="border: none; padding: 3px; width: 18%;"><strong>Jenjang PK</strong></td>
            <td style="border: none; padding: 3px; width: 25%;">: PRA PK / PK 1 / PK 2</td>
          </tr>
          <tr>
            <td style="border: none; padding: 3px;"><strong>NIK</strong></td>
            <td style="border: none; padding: 3px;">: ....................................................</td>
            <td style="border: none; padding: 3px;"><strong>Tanggal Latihan</strong></td>
            <td style="border: none; padding: 3px;">: ....... / ....... / 2026</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 11pt;">
        <strong>Petunjuk Penggunaan di Rumah:</strong><br/>
        1. Bacalah setiap indikator kompetensi dan panduan langkah prosedur di bawah ini dengan saksama.<br/>
        2. Lakukan simulasi mandiri (<em>self-practice</em>) terhadap alur tindakan klinis IGD.<br/>
        3. Beri tanda centang (&#10003;) pada kolom evaluasi diri secara jujur sebagai bahan diskusi bersama Kepala Ruangan / Katim saat jadwal supervisi klinis.
      </p>

      <table>
        <thead>
          <tr>
            <th style="width: 6%;">No</th>
            <th style="width: 54%;">Indikator Supervisi & Panduan Prosedur Mandiri</th>
            <th style="width: 12%;">Sudah Menguasai</th>
            <th style="width: 14%;">Perlu Bimbingan</th>
            <th style="width: 14%;">Catatan Diri</th>
          </tr>
        </thead>
        <tbody>
          ${indicatorRows}
        </tbody>
      </table>

      <div class="reflection-box">
        <strong>Lembar Refleksi & Kendala yang Ditemui Saat Latihan Mandiri:</strong>
        <br/><br/><br/>
      </div>

      <table style="margin-top: 24px; border: none;">
        <tr>
          <td style="border: none; text-align: center; width: 50%;">
            Perawat Pelaksana IGD,<br/><br/><br/><br/>
            ( .................................................... )
          </td>
          <td style="border: none; text-align: center; width: 50%;">
            Mengetahui, Kepala Ruangan / Supervisor IGD,<br/><br/><br/><br/>
            ( .................................................... )
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function downloadSelfTrainingWord(indicators: SupervisiIndicator[]): void {
  const htmlContent = buildSelfTrainingDocumentHTML(indicators);
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Modul_Latihan_Mandiri_Supervisi_IGD.doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printSelfTrainingPDF(indicators: SupervisiIndicator[], onPopupBlocked?: () => void): void {
  const htmlContent = buildSelfTrainingDocumentHTML(indicators);
  const printWin = window.open('', '_blank', 'width=900,height=700');
  if (!printWin) {
    if (onPopupBlocked) onPopupBlocked();
    return;
  }
  printWin.document.open();
  printWin.document.write(htmlContent);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => {
    printWin.print();
  }, 400);
}
