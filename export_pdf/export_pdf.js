/**
 * PDF Export Module (export_pdf.gs) - Compatibility Layer
 *
 * This file serves as a compatibility layer for the modular PDF export system.
 * The actual implementation has been split into focused modules for better maintainability:
 *
 * Modular Files:
 * - pdf-config.gs: PDF configuration constants and settings
 * - pdf-core-operations.gs: Core PDF generation operations
 * - pdf-specialized-exports.gs: Specialized PDF export functions (NMC, OSCR, horizontal)
 * - pdf-workflow-controller.gs: Main workflow orchestration
 *
 * Available Classes:
 * - PdfExportConfig: PDF export configuration constants
 *
 * Available Functions:
 * - ssToPdf(): Main PDF export function (public API)
 * - create_pdf_total_book_(): Creates PDF from multiple sheets
 * - convertSpreadsheetToPdf_(): Low-level PDF generation
 * - initializePdfExport_(): Initializes PDF export process
 * - getMainSheets_(): Collects main sheets for export
 * - createNmcPdf_(): Creates NMC-specific PDFs
 * - createOscrPdf_(): Creates OSCR-specific PDFs
 * - createHorizontalPdfs_(): Creates horizontal orientation PDFs
 *
 * Dependencies:
 * - config-cache.gs: ConfigCache class for configuration management
 * - External functions: initial_process, filterhidden, total2_3_show_hidden_cols, get_target_term_sheets
 *
 * Usage:
 * All existing code will continue to work without changes. The modular structure
 * improves maintainability while preserving backward compatibility.
 *
 * Note: In Google Apps Script, all .gs files are automatically included in the global scope,
 * so no explicit imports are needed. The functions and classes from the modular files
 * are automatically available.
 */
