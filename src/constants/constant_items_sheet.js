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
    INTERIM_ANALYSIS_PROGRAM_SINGLE:
      "中間解析プログラム作成、解析実施（シングル）",
  },
  UNITS: {
    PER_FACILITY: "施設",
    PER_CASE: "症例",
  },
};
