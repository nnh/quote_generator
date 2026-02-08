/**
 * Closingシート用の項目と値のリストを生成する
 * @param {Array} array_quotation_request Quotation Requestシートの値配列
 * @param {boolean|number|string} clinical_trials_office_flg
 * @return {Array<Array>}
 */
function buildClosingSetItems_(
  array_quotation_request,
  clinical_trials_office_flg,
) {
  const closingItemsList = createClosingItemsList_(
    array_quotation_request,
    clinical_trials_office_flg,
  );
  return convertItemsMapToList_(closingItemsList);
}

/**
 * Trial種別ごとのClosing設定を取得する
 * @return {Object}
 */
function getClosingTrialTypeConfig_() {
  const properties = PropertiesService.getScriptProperties();

  const config = {
    csrLabel: "研究結果報告書の作成",
    csrCount: "",
    finalAnalysisLabel: "最終解析プログラム作成、解析実施（シングル）",
    auditSupport: "",
    enableClinicalConference: false,
  };

  if (
    properties.getProperty("trial_type_value") ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
  ) {
    config.csrLabel = "CSRの作成支援";
    config.csrCount = 1;
    config.finalAnalysisLabel = "最終解析プログラム作成、解析実施（ダブル）";
    config.auditSupport = 1;
    config.enableClinicalConference = true;
  }

  return config;
}
/**
 * Closingシート用の項目と値のMapを生成する
 * @param {Array} array_quotation_request Quotation Requestシートの値配列
 * @param {boolean} clinical_trials_office_flg 事務局運営フラグ
 * @return {Map<string, number|string>}
 */
function createClosingItemsList_(
  array_quotation_request,
  clinical_trials_office_flg,
) {
  const config = getClosingTrialTypeConfig_();

  /* ===== 入力値取得 ===== */
  let finalAnalysisTableCount = get_quotation_request_value_(
    array_quotation_request,
    "統計解析に必要な図表数",
  );

  const hasClinicalConference =
    returnIfEquals_(
      get_quotation_request_value_(array_quotation_request, "症例検討会"),
      COMMON_EXISTENCE_LABELS.YES,
      1,
    ) > 0;

  const reportFeeEnabled = returnIfEquals_(
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.REPORT_FEE,
    ),
    COMMON_EXISTENCE_LABELS.YES,
    FUNCTION_FORMULAS.NUMBER_OF_CASES,
  );

  const auditFacilityCount = get_quotation_request_value_(
    array_quotation_request,
    QUOTATION_REQUEST_SHEET.ITEMNAMES.AUDIT_TARGET_FACILITIES,
  );

  /* ===== CSR / 症例検討会関連 ===== */
  let csrCount = returnIfEquals_(
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.RESEARCH_RESULT_REPORT_SUPPORT,
    ),
    COMMON_EXISTENCE_LABELS.YES,
    1,
  );

  let clinicalConference = "";
  let closingMeeting = "";

  if (config.enableClinicalConference) {
    csrCount = config.csrCount;

    if (hasClinicalConference) {
      clinicalConference = 1;
      closingMeeting = 1;
    }

    // 図表数は最低50表
    if (finalAnalysisTableCount > 0 && finalAnalysisTableCount < 50) {
      finalAnalysisTableCount = 50;
      set_trial_comment_("統計解析に必要な帳票数を50表と想定しております。");
    }
  }

  const clinicalTrialsOffice = clinical_trials_office_flg ? 1 : "";

  /* ===== Map構築 ===== */
  return new Map([
    ["症例検討会準備・実行", closingMeeting],
    [ITEMS_SHEET.ITEMNAMES.DATA_CLEANING, 1],
    ["事務局運営（試験終了時）", clinicalTrialsOffice],
    ["PMDA対応、照会事項対応", ""],
    ["監査対応", config.auditSupport],
    ["データベース固定作業、クロージング", 1],
    ["症例検討会資料作成", clinicalConference],
    [
      ITEMS_SHEET.ITEMNAMES.STATISTICAL_ANALYSIS_PLAN,
      returnIfGreaterThan_(finalAnalysisTableCount, 0, 1),
    ],
    [
      config.finalAnalysisLabel,
      returnIfGreaterThan_(finalAnalysisTableCount, 0, finalAnalysisTableCount),
    ],
    [
      "最終解析報告書作成（出力結果＋表紙）",
      returnIfGreaterThan_(finalAnalysisTableCount, 0, 1),
    ],
    [config.csrLabel, csrCount],
    [ITEMS_SHEET.ITEMNAMES.REPORT_FEE, reportFeeEnabled],
    [
      ITEMS_SHEET.ITEMNAMES.EXTERNAL_AUDIT_FEE,
      returnIfGreaterThan_(auditFacilityCount, 0, 1),
    ],
  ]);
}
