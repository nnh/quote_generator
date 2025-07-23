/**
 * PDF Workflow Controller Module (pdf-workflow-controller.gs)
 * 
 * This module orchestrates the complete PDF export workflow, managing initialization,
 * sheet collection, and coordination of different PDF export types.
 * 
 * Functions:
 * - ssToPdf: Main PDF export function (public API)
 * - initializePdfExport_: Initializes the PDF export process
 * - getMainSheets_: Collects main sheets for PDF export
 * 
 * Dependencies:
 * - ConfigCache (from config-cache.gs)
 * - PdfExportConfig (from pdf-config.gs)
 * - Specialized export functions (from pdf-specialized-exports.gs)
 * - Core operations (from pdf-core-operations.gs)
 * - External functions: initial_process, filterhidden, total2_3_show_hidden_cols, get_target_term_sheets
 */

/**
 * Initialize PDF export process
 */
function initializePdfExport_() {
  try {
    initial_process();
    filterhidden();
    total2_3_show_hidden_cols();
  } catch (error) {
    console.error('Error in initializePdfExport_:', error.toString());
    throw error;
  }
}

/**
 * Get main sheets for PDF export
 */
function getMainSheets_(ss, cache) {
  try {
    const sheets = [];
    if (cache.quoteSheetName) {
      const sheet = ss.getSheetByName(cache.quoteSheetName);
      if (sheet) sheets.push(sheet);
    }
    if (cache.totalSheetName) {
      const sheet = ss.getSheetByName(cache.totalSheetName);
      if (sheet) sheets.push(sheet);
    }
    if (cache.total2SheetName) {
      const sheet = ss.getSheetByName(cache.total2SheetName);
      if (sheet) sheets.push(sheet);
    }
    if (cache.total3SheetName) {
      const sheet = ss.getSheetByName(cache.total3SheetName);
      if (sheet) sheets.push(sheet);
    }
    return sheets;
  } catch (error) {
    console.error('Error in getMainSheets_:', error.toString());
    return [];
  }
}

/**
* ブック全体のPDFとTotal2, Total3を横方向で出力したPDFをマイドライブに出力する
* @param none
* @return none
*/
function ssToPdf(){
  try {
    initializePdfExport_();
    
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.error('Failed to initialize ConfigCache for PDF export');
      return;
    }
    
    const pdfConfig = new PdfExportConfig();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      console.error('Failed to get active spreadsheet');
      return;
    }
    
    // Setup〜Closingシートを取得
    var target_sheets = get_target_term_sheets();
    if (!target_sheets || target_sheets.length === 0) {
      console.warn('No target term sheets found');
      target_sheets = [];
    }
    
    // Quote, Total, Total2, Total3を追加
    const mainSheets = getMainSheets_(ss, cache);
    target_sheets = target_sheets.concat(mainSheets);
    
    // メインPDF作成
    const basePdfSettings = {
      sheet_name: null,
      portrait: pdfConfig.VERTICAL,
      scale: pdfConfig.PAGE_FIT,
      pdf_name: ss.getName(),
      output_folder: pdfConfig.OUTPUT_FOLDER
    };
    
    if (target_sheets.length > 0) {
      create_pdf_total_book_(target_sheets, basePdfSettings);
    }
    
    // NMC PDF作成
    createNmcPdf_(ss, cache, pdfConfig, basePdfSettings);
    
    // OSCR PDF作成
    createOscrPdf_(ss, cache, pdfConfig, basePdfSettings);
    
    // 横向きPDF作成
    createHorizontalPdfs_(ss, cache, pdfConfig);
    
    console.log('PDF export process completed');
  } catch (error) {
    console.error('Error in ssToPdf:', error.toString());
  }
}
