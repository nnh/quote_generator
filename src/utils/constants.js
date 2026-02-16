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
// ===== Setup / outsource existence labels =====
const SETUP_OR_OUTSOURCE_EXISTENCE_LABELS = {
  YES: "設置・委託する",
  NO: "設置しない・または委託しない",
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
    DRUG_MANAGEMENT_CENTRAL: "治験薬管理",
    RESEARCH_RESULT_REPORT_SUPPORT: "研究結果報告書作成支援",
    PMDA_CONSULTATION_SUPPORT: "PMDA相談資料作成支援",
    AMED_APPLICATION_SUPPORT: "AMED申請資料作成支援",
    FINAL_ANALYSIS_REQUIRED_TABLE_FIGURE_COUNT: "統計解析に必要な図表数",
    FUNDING_SOURCE: ITEM_LABELS.FUNDING_SOURCE_LABEL,
    CASE_REVIEW_MEETING: "症例検討会",
    KICKOFF_MEETING: "キックオフミーティング",
    CDISC_SUPPORT: "CDISC対応",
    FACILITIES: ITEM_LABELS.FACILITIES,
    NUMBER_OF_CASES: ITEM_LABELS.NUMBER_OF_CASES,
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
    PROTOCOL_REVIEW_AND_CREATION_SUPPORT: "プロトコルレビュー・作成支援",
    REVIEW_MEETING_EXECUTION_REMOTE: "検討会実施（TV会議等）",
    KICKOFF_MEETING_PREPARATION_AND_EXECUTION:
      "キックオフミーティング準備・実行",
    SOP_AND_CTR_REGISTRATION_AND_TMF_MANAGEMENT: "SOP一式、CTR登録案、TMF管理",
    PREPARE_FEE: "試験開始準備費用",
    REGISTRATION_FEE: "症例登録",
    REPORT_FEE: "症例報告",
    INSURANCE_FEE: "保険料",
    MONITORING_PREPARATION: "モニタリング準備業務（関連資料作成）",
    ESSENTIAL_DOCUMENTS_MONITORING: "開始前モニタリング・必須文書確認",
    MONITORING_COUNT_PER_CASE: "症例モニタリング・SAE対応",
    EXTERNAL_AUDIT_FEE: "外部監査費用",
    AUDIT_TARGET_FACILITIES: "施設監査費用",
    CENTRAL_MONITORING: "ロジカルチェック、マニュアルチェック、クエリ対応",
    CLINICAL_TRIALS_OFFICE_SETUP: "事務局運営（試験開始前）",
    CLINICAL_TRIALS_OFFICE_REGISTRATION:
      "事務局運営（試験開始後から試験終了まで）",
    CLINICAL_TRIALS_OFFICE_CLOSING: "事務局運営（試験終了時）",
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
    FINAL_ANALYSIS_PROGRAM_SINGLE:
      "最終解析プログラム作成、解析実施（シングル）",
    FINAL_ANALYSIS_PROGRAM_DOUBLE: "最終解析プログラム作成、解析実施（ダブル）",
    FINAL_ANALYSIS_REPORT: "最終解析報告書作成（出力結果＋表紙）",
    PMDA_CONSULTATION_SUPPORT: "PMDA相談資料作成支援",
    AMED_APPLICATION_SUPPORT: "AMED申請資料作成支援",
    CASE_REVIEW_MEETING_PREPARATION_AND_EXECUTION: "症例検討会準備・実行",
    AUDIT_SUPPORT: "監査対応",
    CASE_REVIEW_MEETING_MATERIALS: "症例検討会資料作成",
    PMDA_RESPONSE_AND_INQUIRY: "PMDA対応、照会事項対応",
    DATABASE_FIXING_AND_CLOSING: "データベース固定作業、クロージング",
    RESEARCH_RESULT_REPORT_SUPPORT: "研究結果報告書の作成",
    CSR_SUPPORT: "CSRの作成支援",
    IRB_PREPARATION_AND_APPROVAL_CONFIRMATION: "IRB準備・承認確認",
    IRB_APPROVAL_CONFIRMATION_AND_FACILITY_MANAGEMENT: "IRB承認確認、施設管理",
    INITIAL_ACCOUNT_SETUP_AND_IRB_APPROVAL_CONFIRMATION:
      "初期アカウント設定（施設・ユーザー）、IRB承認確認",
    INITIAL_ACCOUNT_SETUP: "初期アカウント設定（施設・ユーザー）",
    SPECIFIED_CLINICAL_RESEARCH_APPLICATION_SUPPORT:
      "特定臨床研究法申請資料作成支援",
    DRUG_SUPPORT: "薬剤対応",
    EDC_LICENSE_AND_DATABASE_SETUP: "EDCライセンス・データベースセットアップ",
    BUSINESS_ANALYSIS_DM_PLAN_AND_CTR_REGISTRATION_PLAN:
      "業務分析・DM計画書の作成・CTR登録案の作成",
    DB_CREATION_ECRF_CREATION_AND_VALIDATION:
      "DB作成・eCRF作成・バリデーション",
    VALIDATION_REPORT: "バリデーション報告書",
    INPUT_GUIDE_CREATION: "入力の手引作成",
    DRUG_MANAGEMENT_CENTRAL: "治験薬管理（中央）",
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
    SHEET_NAME: 1,
    TRIAL_YEARS: 3,
    TRIAL_START: 4,
    TRIAL_END: 5,
    TRIAL_MONTHS: 6,
  },
  COLIDX: {
    DUMMY: -1,
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
// 列インデックスの生成
Object.keys(TRIAL_SHEET.COLUMNS).forEach((key) => {
  TRIAL_SHEET.COLIDX[key] = TRIAL_SHEET.COLUMNS[key] - 1;
});

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
// ===== Script property keys =====
const SCRIPT_PROPERTY_KEYS = {
  TRIAL_TYPE_VALUE: "trial_type_value",
  NUMBER_OF_CASES: "number_of_cases",
  FACILITIES_VALUE: "facilities_value",
  SETUP_TERM: "setup_term",
  CLOSING_TERM: "closing_term",
  REG1_SETUP_DATABASE_MANAGEMENT: "reg1_setup_database_management",
  TRIAL_START_DATE: "trial_start_date",
  TRIAL_END_DATE: "trial_end_date",
  REGISTRATION_YEARS: "registration_years",
  REG1_SETUP_CLINICAL_TRIALS_OFFICE: "reg1_setup_clinical_trials_office",
};
