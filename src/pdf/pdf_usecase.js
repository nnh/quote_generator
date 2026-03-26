/**
 * PDF出力のエントリポイント
 */
function exportAllPdfs() {
  runInitialProcess_();
  hideFilterVisibility();
  // Total2/Total3系シートを取得する
  const targetSheets = extractTargetSheets_();
  total2_3ShowHiddenCols_(targetSheets);

  const ss = getSpreadsheet_();
  const outputFolder = DriveApp.getRootFolder();

  const BASE_CONFIG = {
    portrait: true,
    scale: 4,
    outputFolder,
  };

  // --- 全体PDF ---
  const baseSheets = [
    ...getTargetTermSheets_(),
    getSheetByNameCached_(QUOTATION_SHEET_NAMES.QUOTE),
    getSheetByNameCached_(QUOTATION_SHEET_NAMES.TOTAL),
    getSheetByNameCached_(QUOTATION_SHEET_NAMES.TOTAL2),
    getSheetByNameCached_(QUOTATION_SHEET_NAMES.TOTAL3),
  ].filter((s) => s);

  if (baseSheets.length > 0) {
    withSheetsVisibleOnly_(baseSheets, () => {
      exportSpreadsheetPdf_({
        ...BASE_CONFIG,
        pdfName: ss.getName(),
      });
    });
  }

  // --- NMC ---
  exportGroupPdf_(
    [
      QUOTATION_SHEET_NAMES.QUOTE_NMC,
      QUOTATION_SHEET_NAMES.TOTAL_NMC,
      QUOTATION_SHEET_NAMES.TOTAL2_NMC,
    ],
    `${ss.getName()}_${ORG.NMC}`,
    BASE_CONFIG,
  );

  // --- OSCR ---
  exportGroupPdf_(
    [
      QUOTATION_SHEET_NAMES.QUOTE_OSCR,
      QUOTATION_SHEET_NAMES.TOTAL_OSCR,
      QUOTATION_SHEET_NAMES.TOTAL2_OSCR,
    ],
    `${ss.getName()}_${ORG.OSCR}`,
    BASE_CONFIG,
  );

  // --- 横PDF ---
  exportHorizontalSheets_(BASE_CONFIG);
}

/**
 * グループ単位でPDF出力
 */
function exportGroupPdf_(sheetNames, pdfName, baseConfig) {
  const sheets = sheetNames.map(getSheetByNameCached_).filter((s) => s);

  if (sheets.length === 0) return;

  withSheetsVisibleOnly_(sheets, () => {
    exportSpreadsheetPdf_({
      ...baseConfig,
      pdfName,
    });
  });
}

/**
 * 横向きPDF出力
 */
function exportHorizontalSheets_(baseConfig) {
  const sheetNames = [
    QUOTATION_SHEET_NAMES.TOTAL2,
    QUOTATION_SHEET_NAMES.TOTAL3,
    QUOTATION_SHEET_NAMES.TOTAL2_NMC,
    QUOTATION_SHEET_NAMES.TOTAL2_OSCR,
  ];

  sheetNames.forEach((name) => {
    const sheet = getSheetByNameCached_(name);
    if (!sheet || sheet.isSheetHidden()) return;

    exportSpreadsheetPdf_({
      ...baseConfig,
      sheetName: name,
      portrait: false,
      pdfName: name,
    });
  });
}
