/**
 * Quote Script Constants Module (quote-script-constants.gs)
 * 
 * This module provides constants for quote_script.gs to eliminate hardcoded values
 * and improve maintainability. All magic numbers and strings are centralized here.
 * 
 * Objects:
 * - QuoteScriptConstants: Object containing constants for quote script operations
 * 
 * Dependencies: None
 */

/**
 * Quote Script Constants - Google Apps Script compatible object
 */
const QuoteScriptConstants = {
  // Term durations (months)
  SETUP_TERM_SHORT: 3,
  SETUP_TERM_LONG: 6,
  CLOSING_TERM_SHORT: 3,
  CLOSING_TERM_LONG: 6,
  
  // Registration limits
  MAX_REGISTRATION_MONTHS: 12,
  TOTAL_MONTH_COL: 6,
  MONTHS_COL: 5,
  SHEETNAME_COL: 0,
  
  // Column positions
  PRICE_COL: 'S',
  QUOTATION_TYPE_ROW: 2,
  ISSUE_DESTINATION_ROW: 4,
  PRINCIPAL_INVESTIGATOR_ROW: 8,
  TRIAL_TITLE_ROW: 9,
  ACRONYM_ROW: 10,
  TRIAL_TYPE_ROW: 27,
  CRF_ITEMS_ROW: 30,
  COEFFICIENT_ROW: 44,
  
  // Response values
  RESPONSE_YES: 'あり',
  RESPONSE_SETUP_DELEGATE: '設置・委託する',
  
  // Item names
  CENTRAL_MONITORING: 'ロジカルチェック、マニュアルチェック、クエリ対応',
  SAFETY_MANAGEMENT: '安全性管理事務局業務',
  EFFICACY_SAFETY_COMMITTEE: '効果安全性評価委員会事務局業務',
  CLINICAL_TRIALS_OFFICE_SETUP: '事務局運営（試験開始前）',
  CLINICAL_TRIALS_OFFICE_REGISTRATION: '事務局運営（試験開始後から試験終了まで）',
  COST_OF_COOPERATION: '研究協力費、負担軽減費',
  INSURANCE_FEE: '保険料',
  
  // Quotation request field names
  QUOTATION_TYPE: '見積種別',
  TRIAL_TYPE: '試験種別',
  TRIAL_START: '症例登録開始日',
  REGISTRATION_END: '症例登録終了日',
  TRIAL_END: '試験終了日',
  CRF: 'CRF項目数',
  ACRONYM: '試験実施番号',
  SAFETY_MANAGEMENT_SETUP: '安全性管理事務局設置',
  EFFICACY_SAFETY_SETUP: '効安事務局設置',
  COORDINATION_OFFICE_SETUP: '調整事務局設置の有無',
  RESEARCH_REPORT_SUPPORT: '研究結果報告書作成支援',
  
  // CDISC addition value
  CDISC_ADDITION: 3,
  
  // Coefficient values
  COMMERCIAL_COEFFICIENT: 1.5,
  DEFAULT_COEFFICIENT: 1,
  
  // Analysis table constants
  MIN_ANALYSIS_TABLE_COUNT: 50
};
