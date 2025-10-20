/**
 * PDF Specialized Exports Module (pdf-specialized-exports.gs)
 * 
 * This module provides specialized PDF export functions for different document types
 * including NMC-specific, OSCR-specific, and horizontal orientation PDFs.
 * 
 * Functions:
 * - createNmcPdf_: Creates NMC-specific PDF exports
 * - createOscrPdf_: Creates OSCR-specific PDF exports  
 * - createHorizontalPdfs_: Creates horizontal orientation PDFs for specific sheets
 * 
 * Dependencies:
 * - ConfigCache (from config-cache.gs)
 * - PdfExportConfig (from pdf-config.gs)
 * - create_pdf_total_book_, convertSpreadsheetToPdf_ (from pdf-core-operations.gs)
 */

/**
 * Create NMC specific PDF
 */
function createNmcPdf_(ss, cache, pdfConfig, basePdfSettings) {
  try {
    if (!cache.nameNmc) {
      console.warn('NMC name not configured, skipping NMC PDF');
      return;
    }
    
    const target_sheet_nmc = [];
    if (cache.quoteNmcSheetName) {
      const sheet = ss.getSheetByName(cache.quoteNmcSheetName);
      if (sheet) target_sheet_nmc.push(sheet);
    }
    if (cache.totalNmcSheetName) {
      const sheet = ss.getSheetByName(cache.totalNmcSheetName);
      if (sheet) target_sheet_nmc.push(sheet);
    }
    if (cache.total2NmcSheetName) {
      const sheet = ss.getSheetByName(cache.total2NmcSheetName);
      if (sheet) target_sheet_nmc.push(sheet);
    }
    
    if (target_sheet_nmc.length === 0) {
      console.warn('No NMC sheets found');
      return;
    }
    
    const pdfSettings = { ...basePdfSettings };
    pdfSettings.pdf_name = ss.getName() + '_' + cache.nameNmc;
    create_pdf_total_book_(target_sheet_nmc, pdfSettings);
  } catch (error) {
    console.error('Error in createNmcPdf_:', error.toString());
  }
}

/**
 * Create OSCR specific PDF
 */
function createOscrPdf_(ss, cache, pdfConfig, basePdfSettings) {
  try {
    if (!cache.nameOscr) {
      console.warn('OSCR name not configured, skipping OSCR PDF');
      return;
    }
    
    const target_sheet_oscr = [];
    if (cache.quoteOscrSheetName) {
      const sheet = ss.getSheetByName(cache.quoteOscrSheetName);
      if (sheet) target_sheet_oscr.push(sheet);
    }
    if (cache.totalOscrSheetName) {
      const sheet = ss.getSheetByName(cache.totalOscrSheetName);
      if (sheet) target_sheet_oscr.push(sheet);
    }
    if (cache.total2OscrSheetName) {
      const sheet = ss.getSheetByName(cache.total2OscrSheetName);
      if (sheet) target_sheet_oscr.push(sheet);
    }
    
    if (target_sheet_oscr.length === 0) {
      console.warn('No OSCR sheets found');
      return;
    }
    
    const pdfSettings = { ...basePdfSettings };
    pdfSettings.pdf_name = ss.getName() + '_' + cache.nameOscr;
    create_pdf_total_book_(target_sheet_oscr, pdfSettings);
  } catch (error) {
    console.error('Error in createOscrPdf_:', error.toString());
  }
}

/**
 * Create horizontal orientation PDFs
 */
function createHorizontalPdfs_(ss, cache, pdfConfig) {
  try {
    const target_sheets_name_horizontal = [
      cache.total2SheetName,
      cache.total3SheetName,
      cache.total2NmcSheetName,
      cache.total2OscrSheetName
    ].filter(name => name !== null && name !== undefined);
    
    target_sheets_name_horizontal.forEach(sheetName => {
      try {
        const sheet = ss.getSheetByName(sheetName);
        if (sheet && !sheet.isSheetHidden()) {
          convertSpreadsheetToPdf_(sheetName, pdfConfig.HORIZONTAL, pdfConfig.PAGE_FIT, sheetName, pdfConfig.OUTPUT_FOLDER);
        }
      } catch (error) {
        console.error(`Error creating horizontal PDF for sheet "${sheetName}":`, error.toString());
      }
    });
  } catch (error) {
    console.error('Error in createHorizontalPdfs_:', error.toString());
  }
}
