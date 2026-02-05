/******************************************
 * 外部定数定義
 ******************************************/
// ===== Trial type / category labels =====
const TRIAL_TYPE_LABELS = {
  INVESTIGATOR_INITIATED: "医師主導治験",
  SPECIFIED_CLINICAL: "特定臨床研究",
};

const ITEM_LABELS = {
  FACILITIES: "実施施設数",
  NUMBER_OF_CASES: "目標症例数",
  FUNDING_SOURCE_LABEL: "原資",
  SUM: "合計",
  AMMOUNT: "金額",
  ACRONYM: "試験実施番号",
};
// ===== Common yes/no (existence) labels =====
const COMMON_EXISTENCE_LABELS = {
  YES: "あり",
  NO: "なし",
};

const CDISC_ADDITION = 3;
const VALIDATION_CHECK_SHEET_NAME = "Check";
const QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL = "営利企業原資（製薬企業等）";

// 日付フォーマット
const DATE_FORMAT = "YYYY/MM/DD";

// quotation request sheet
const QUOTATION_REQUEST_SHEET = {
  NAME: "Quotation Request",
  HEADER_ROW: 1,
  START_ROW: 2,
  ITEMNAMES: {
    ACRONYM: ITEM_LABELS.ACRONYM,
    INSURANCE_FEE: "保険料",
    RESEARCH_SUPPORT_FEE: "研究協力費、負担軽減費",
    PREPARE_FEE: "試験開始準備費用",
    REGISTRATION_FEE: "症例登録毎の支払",
    REPORT_FEE: "症例最終報告書提出毎の支払",
    COEFFICIENT: ITEM_LABELS.FUNDING_SOURCE_LABEL,
    MONITORING_COUNT_PER_CASE: "1例あたりの実地モニタリング回数",
    ESSENTIAL_DOCUMENTS_MONITORING_COUNT_PER_FACILITY:
      "年間1施設あたりの必須文書実地モニタリング回数",
    AUDIT_TARGET_FACILITIES: "監査対象施設数",
    ADJUSTMENT_OFFICE_EXISTENCE: "調整事務局設置の有無",
    SAFETY_MANAGEMENT_OFFICE_EXISTENCE: "安全性管理事務局設置",
    EFFICACY_SAFETY_COMMITTEE_OFFICE_EXISTENCE: "効安事務局設置",
    CRB_APPLICATION: "CRB申請",
    DRUG_TRANSPORTATION: "治験薬運搬",
    RESEARCH_RESULT_REPORT_SUPPORT: "研究結果報告書作成支援",
    PMDA_CONSULTATION_SUPPORT: "PMDA相談資料作成支援",
    AMED_APPLICATION_SUPPORT: "AMED申請資料作成支援",
  },
};

// items sheet
const ITEMS_SHEET = {
  NAME: "items",
  HEADER_ROW: 1,

  COLUMNS: {
    PRICE: "C",
    UNIT: "D",
    BASE_UNIT_PRICE: "S",
  },
  ROWS: {
    PREPARE_FEE: 64,
    REGISTRATION_FEE: 65,
    REPORT_FEE: 66,
    INSURANCE_FEE: 78,
  },
  ITEMNAMES: {
    PREPARE_FEE: "試験開始準備費用",
    REGISTRATION_FEE: "症例登録",
    REPORT_FEE: "症例報告",
    INSURANCE_FEE: "保険料",
    ESSENTIAL_DOCUMENTS_MONITORING: "開始前モニタリング・必須文書確認",
    MONITORING_COUNT_PER_CASE: "症例モニタリング・SAE対応",
    EXTERNAL_AUDIT_FEE: "外部監査費用",
    AUDIT_TARGET_FACILITIES: "施設監査費用",
    CENTRAL_MONITORING: "ロジカルチェック、マニュアルチェック、クエリ対応",
    CLINICAL_TRIALS_OFFICE_SETUP: "事務局運営（試験開始前）",
    CLINICAL_TRIALS_OFFICE_REGISTRATION:
      "事務局運営（試験開始後から試験終了まで）",
    SAFETY_MANAGEMENT_OFFICE: "安全性管理事務局業務",
    EFFICACY_SAFETY_COMMITTEE_OFFICE: "効果安全性評価委員会事務局業務",
    DRUG_TRANSPORTATION: "治験薬運搬",
    CRB_APPLICATION_FIRST_YEAR: "名古屋医療センターCRB申請費用(初年度)",
    CRB_APPLICATION_AFTER_SECOND_YEAR:
      "名古屋医療センターCRB申請費用(2年目以降)",
    DATABASE_MANAGEMENT_FEE: "データベース管理料",
    PROJECT_MANAGEMENT: "プロジェクト管理",
    DATA_CLEANING: "データクリーニング",
    STATISTICAL_ANALYSIS_PLAN:
      "統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成",
    PMDA_CONSULTATION_SUPPORT: "PMDA相談資料作成支援",
    AMED_APPLICATION_SUPPORT: "AMED申請資料作成支援",
  },
  UNITS: {
    PER_CASE: "件",
    PER_FACILITY: "施設",
    PER_CASE: "症例",
  },
};
const TRIAL_SHEET = {
  NAME: "trial",
  COLUMNS: {
    TRIAL_START: 4,
    TRIAL_END: 5,
    TRIAL_YEARS: 3,
  },
  COLNAMES: {
    VALUE: "B",
  },
  ROWS: {
    CASES: 28,
    FACILITIES: 29,
    TRIAL_SETUP: 32,
    TRIAL_CLOSING: 39,
  },
  RANGES: {
    COMMENT: "B12:B26",
  },
  ITEMNAMES: {
    QUOTATION_TYPE: "見積種別",
    TRIAL_TYPE: "試験種別",
    CRF: "CRF項目数",
  },
};

const ORG = {
  NMC: "nmc",
  OSCR: "oscr",
};

// ===== Sheet name constants =====
const QUOTATION_SHEET_NAMES = {
  QUOTE: "Quote",
  TOTAL: "Total",
  TOTAL2: "Total2",
  TOTAL3: "Total3",
  SETUP: "Setup",
  REGISTRATION_1: "Registration_1",
  REGISTRATION_2: "Registration_2",
  INTERIM_1: "Interim_1",
  INTERIM_2: "Interim_2",
  OBSERVATION_1: "Observation_1",
  OBSERVATION_2: "Observation_2",
  CLOSING: "Closing",
  TRIAL: "Trial",
  ITEMS: "Items",
  QUOTATION_REQUEST: "Quotation Request",
  PRICE: "Price",
  PRICE_LOGIC_COMPANY: "PriceLogicCompany",
  PRICE_LOGIC: "PriceLogic",
};
const SHEET_PREFIX = {
  QUOTE: `${QUOTATION_SHEET_NAMES.QUOTE}_`,
  TOTAL: `${QUOTATION_SHEET_NAMES.TOTAL}_`,
  TOTAL2: `${QUOTATION_SHEET_NAMES.TOTAL2}_`,
  TOTAL3: `${QUOTATION_SHEET_NAMES.TOTAL3}_`,
};
QUOTATION_SHEET_NAMES.TOTAL_NMC = `${QUOTATION_SHEET_NAMES.TOTAL}_nmc`;
QUOTATION_SHEET_NAMES.TOTAL2_NMC = `${QUOTATION_SHEET_NAMES.TOTAL2}_nmc`;
QUOTATION_SHEET_NAMES.TOTAL_OSCR = `${QUOTATION_SHEET_NAMES.TOTAL}_oscr`;
QUOTATION_SHEET_NAMES.TOTAL2_OSCR = `${QUOTATION_SHEET_NAMES.TOTAL2}_oscr`;
QUOTATION_SHEET_NAMES.QUOTE_NMC = `${QUOTATION_SHEET_NAMES.QUOTE}_nmc`;
QUOTATION_SHEET_NAMES.QUOTE_OSCR = `${QUOTATION_SHEET_NAMES.QUOTE}_oscr`;

const FUNCTION_FORMULAS = {
  NUMBER_OF_CASES: `=${TRIAL_SHEET.NAME}!${TRIAL_SHEET.COLNAMES.VALUE}${TRIAL_SHEET.ROWS.CASES}`,
  FACILITIES: `=${TRIAL_SHEET.NAME}!${TRIAL_SHEET.COLNAMES.VALUE}${TRIAL_SHEET.ROWS.FACILITIES}`,
};
// ===== Columns shared by Total and Setup–Closing sheets =====
const TOTAL_AND_PHASE_SHEET = {
  COLUMNS: {
    ITEM_NAME: 3,
    COUNT: 6,
  },
};
