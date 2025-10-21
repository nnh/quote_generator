/**
 * PDF Configuration Module (pdf-config.gs)
 *
 * This module provides configuration constants and settings for PDF export operations.
 * It centralizes all hardcoded values related to PDF generation settings.
 *
 * Classes:
 * - PdfExportConfig: Manages PDF export constants and options
 *
 * Dependencies: DriveApp (Google Apps Script built-in)
 */

/**
 * PDF Export Configuration Constants
 */
class PdfExportConfig {
  constructor() {
    this.PAGE_FIT = 4;
    this.VERTICAL = true;
    this.HORIZONTAL = false;
    this.OUTPUT_FOLDER = DriveApp.getRootFolder();
    this.PDF_SIZE = "letter";
    this.PDF_OPTIONS = {
      fitw: true,
      sheetnames: false,
      printtitle: false,
      pagenumbers: false,
      gridlines: false,
      fzr: false,
    };
  }
}
