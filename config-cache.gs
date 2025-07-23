/**
 * Configuration Cache Module (config-cache.gs)
 * 
 * This module provides centralized configuration management for the quote generator system.
 * It optimizes PropertiesService access by caching all script properties on initialization.
 * 
 * Classes:
 * - ConfigCache: Caches script properties to reduce PropertiesService calls
 * 
 * Dependencies: PropertiesService (Google Apps Script built-in)
 */
class ConfigCache {
  constructor() {
    try {
      const scriptProperties = PropertiesService.getScriptProperties();
      if (!scriptProperties) {
        console.error('Failed to get script properties');
        this.isValid = false;
        return;
      }
      
      this.setupSheetName = scriptProperties.getProperty('setup_sheet_name');
      this.closingSheetName = scriptProperties.getProperty('closing_sheet_name');
      this.total2SheetName = scriptProperties.getProperty('total2_sheet_name');
      this.total3SheetName = scriptProperties.getProperty('total3_sheet_name');
      this.nameNmc = scriptProperties.getProperty('name_nmc');
      this.nameOscr = scriptProperties.getProperty('name_oscr');
      
      this.quoteSheetName = scriptProperties.getProperty('quote_sheet_name');
      this.totalSheetName = scriptProperties.getProperty('total_sheet_name');
      this.quoteNmcSheetName = scriptProperties.getProperty('quote_nmc_sheet_name');
      this.totalNmcSheetName = scriptProperties.getProperty('total_nmc_sheet_name');
      this.total2NmcSheetName = scriptProperties.getProperty('total2_nmc_sheet_name');
      this.quoteOscrSheetName = scriptProperties.getProperty('quote_oscr_sheet_name');
      this.totalOscrSheetName = scriptProperties.getProperty('total_oscr_sheet_name');
      this.total2OscrSheetName = scriptProperties.getProperty('total2_oscr_sheet_name');
      
      this.isValid = true;
    } catch (error) {
      console.error('Error initializing ConfigCache:', error.toString());
      this.isValid = false;
    }
  }
  
  hasRequiredProperties() {
    return this.isValid && this.setupSheetName && this.closingSheetName && 
           this.total2SheetName && this.total3SheetName;
  }
  
  hasRequiredPdfProperties() {
    return this.isValid && this.quoteSheetName && this.totalSheetName && 
           this.total2SheetName && this.total3SheetName;
  }
}
