/******************************************
 * 外部定数定義
 ******************************************/

// trialシート関連項目名
const TRIAL_FIELDS = {
  QUOTATION_TYPE: "見積種別",
  TRIAL_TYPE: "試験種別",
  CRF: "CRF項目数",
};

const CDISC_ADDITION = 3;

// 日付フォーマット
const DATE_FORMAT = "YYYY/MM/DD";

// quotation request sheet
const QUOTATION_REQUEST_SHEET = {
  NAME: "Quotation Request",
  HEADER_ROW: 1,
  START_ROW: 2,
  ITEMNAMES: {
    INSURANCE_FEE: "保険料",
    RESEARCH_SUPPORT_FEE: "研究協力費、負担軽減費",
    PREPARE_FEE: "試験開始準備費用",
    REGISTRATION_FEE: "症例登録毎の支払",
    REPORT_FEE: "症例最終報告書提出毎の支払",
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
  },
  UNITS: {
    PER_CASE: "件",
    PER_FACILITY: "施設",
    PER_CASE: "症例",
  },
};
