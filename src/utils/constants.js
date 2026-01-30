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
    AUDIT_TARGET_FACILITIES: "監査対象施設数",
    ADJUSTMENT_OFFICE_EXISTENCE: "調整事務局設置の有無",
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
    MONITORING_COUNT_PER_CASE: "症例モニタリング・SAE対応",
    AUDIT_TARGET_FACILITIES: "施設監査費用",
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
