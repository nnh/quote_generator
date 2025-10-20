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
      this.scriptProperties = PropertiesService.getScriptProperties();
      if (!this.scriptProperties) {
        console.error('Failed to get script properties');
        this.isValid = false;
        return;
      }
      
      // Cache all commonly used properties
      this.setupSheetName = this.scriptProperties.getProperty('setup_sheet_name');
      this.closingSheetName = this.scriptProperties.getProperty('closing_sheet_name');
      this.total2SheetName = this.scriptProperties.getProperty('total2_sheet_name');
      this.total3SheetName = this.scriptProperties.getProperty('total3_sheet_name');
      this.nameNmc = this.scriptProperties.getProperty('name_nmc');
      this.nameOscr = this.scriptProperties.getProperty('name_oscr');
      
      // PDF export specific properties
      this.quoteSheetName = this.scriptProperties.getProperty('quote_sheet_name');
      this.totalSheetName = this.scriptProperties.getProperty('total_sheet_name');
      this.quoteNmcSheetName = this.scriptProperties.getProperty('quote_nmc_sheet_name');
      this.totalNmcSheetName = this.scriptProperties.getProperty('total_nmc_sheet_name');
      this.total2NmcSheetName = this.scriptProperties.getProperty('total2_nmc_sheet_name');
      this.quoteOscrSheetName = this.scriptProperties.getProperty('quote_oscr_sheet_name');
      this.totalOscrSheetName = this.scriptProperties.getProperty('total_oscr_sheet_name');
      this.total2OscrSheetName = this.scriptProperties.getProperty('total2_oscr_sheet_name');
      
      // Quote script specific properties
      this.setupTerm = this.scriptProperties.getProperty('setup_term');
      this.closingTerm = this.scriptProperties.getProperty('closing_term');
      this.investigatorInitiatedTrial = this.scriptProperties.getProperty('investigator_initiated_trial');
      this.specifiedClinicalTrial = this.scriptProperties.getProperty('specified_clinical_trial');
      this.trialStartCol = this.scriptProperties.getProperty('trial_start_col');
      this.trialEndCol = this.scriptProperties.getProperty('trial_end_col');
      this.trialSetupRow = this.scriptProperties.getProperty('trial_setup_row');
      this.trialClosingRow = this.scriptProperties.getProperty('trial_closing_row');
      this.trialYearsCol = this.scriptProperties.getProperty('trial_years_col');
      this.fySheetCountCol = this.scriptProperties.getProperty('fy_sheet_count_col');
      this.fySheetItemsCol = this.scriptProperties.getProperty('fy_sheet_items_col');
      this.coefficient = this.scriptProperties.getProperty('coefficient');
      this.trialTypeValue = this.scriptProperties.getProperty('trial_type_value');
      this.commercialCompanyCoefficient = this.scriptProperties.getProperty('commercial_company_coefficient');
      this.facilitiesItemname = this.scriptProperties.getProperty('facilities_itemname');
      this.numberOfCasesItemname = this.scriptProperties.getProperty('number_of_cases_itemname');
      this.trialNumberOfCasesRow = this.scriptProperties.getProperty('trial_number_of_cases_row');
      this.trialConstFacilitiesRow = this.scriptProperties.getProperty('trial_const_facilities_row');
      this.registration1SheetName = this.scriptProperties.getProperty('registration_1_sheet_name');
      this.reg1SetupClinicalTrialsOffice = this.scriptProperties.getProperty('reg1_setup_clinical_trials_office');
      this.reg1SetupDatabaseManagement = this.scriptProperties.getProperty('reg1_setup_database_management');
      this.costOfPrepareQuotationRequest = this.scriptProperties.getProperty('cost_of_prepare_quotation_request');
      this.costOfPrepareItem = this.scriptProperties.getProperty('cost_of_prepare_item');
      this.costOfRegistrationQuotationRequest = this.scriptProperties.getProperty('cost_of_registration_quotation_request');
      this.costOfRegistrationItem = this.scriptProperties.getProperty('cost_of_registration_item');
      this.costOfReportQuotationRequest = this.scriptProperties.getProperty('cost_of_report_quotation_request');
      this.costOfReportItem = this.scriptProperties.getProperty('cost_of_report_item');
      this.trialCommentRange = this.scriptProperties.getProperty('trial_comment_range');
      
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
