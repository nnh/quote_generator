/**
 * Quote Script Constants Module (quote-script-constants.gs)
 * 
 * This module provides constants for quote_script.gs to eliminate hardcoded values
 * and improve maintainability. All magic numbers and strings are centralized here.
 * 
 * Classes:
 * - QuoteScriptConstants: Static constants for quote script operations
 * 
 * Dependencies: None
 */

/**
 * Quote Script Constants
 */
class QuoteScriptConstants {
  // Term durations (months)
  static SETUP_TERM_SHORT = 3;
  static SETUP_TERM_LONG = 6;
  static CLOSING_TERM_SHORT = 3;
  static CLOSING_TERM_LONG = 6;
  
  // Registration limits
  static MAX_REGISTRATION_MONTHS = 12;
  static TOTAL_MONTH_COL = 6;
  static MONTHS_COL = 5;
  static SHEETNAME_COL = 0;
  
  // Column positions
  static PRICE_COL = 'S';
  static QUOTATION_TYPE_ROW = 2;
  static ISSUE_DESTINATION_ROW = 4;
  static PRINCIPAL_INVESTIGATOR_ROW = 8;
  static TRIAL_TITLE_ROW = 9;
  static ACRONYM_ROW = 10;
  static TRIAL_TYPE_ROW = 27;
  static CRF_ITEMS_ROW = 30;
  static COEFFICIENT_ROW = 44;
  
  // Response values
  static RESPONSE_YES = 'あり';
  static RESPONSE_SETUP_DELEGATE = '設置・委託する';
  
  // Item names
  static CENTRAL_MONITORING = 'ロジカルチェック、マニュアルチェック、クエリ対応';
  static SAFETY_MANAGEMENT = '安全性管理事務局業務';
  static EFFICACY_SAFETY_COMMITTEE = '効果安全性評価委員会事務局業務';
  static CLINICAL_TRIALS_OFFICE_SETUP = '事務局運営（試験開始前）';
  static CLINICAL_TRIALS_OFFICE_REGISTRATION = '事務局運営（試験開始後から試験終了まで）';
  static COST_OF_COOPERATION = '研究協力費、負担軽減費';
  static INSURANCE_FEE = '保険料';
  
  // Quotation request field names
  static QUOTATION_TYPE = '見積種別';
  static TRIAL_TYPE = '試験種別';
  static TRIAL_START = '症例登録開始日';
  static REGISTRATION_END = '症例登録終了日';
  static TRIAL_END = '試験終了日';
  static CRF = 'CRF項目数';
  static ACRONYM = '試験実施番号';
  static SAFETY_MANAGEMENT_SETUP = '安全性管理事務局設置';
  static EFFICACY_SAFETY_SETUP = '効安事務局設置';
  static COORDINATION_OFFICE_SETUP = '調整事務局設置の有無';
  static RESEARCH_REPORT_SUPPORT = '研究結果報告書作成支援';
  
  // CDISC addition value
  static CDISC_ADDITION = 3;
}
