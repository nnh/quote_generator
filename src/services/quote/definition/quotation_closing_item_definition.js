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
    csrLabel: ITEMS_SHEET.ITEMNAMES.RESEARCH_RESULT_REPORT_SUPPORT,
    csrCount: "",
    finalAnalysisLabel: ITEMS_SHEET.ITEMNAMES.FINAL_ANALYSIS_PROGRAM_SINGLE,
    auditSupport: "",
    enableClinicalConference: false,
  };

  if (
    properties.getProperty(SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE) ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
  ) {
    config.csrLabel = ITEMS_SHEET.ITEMNAMES.CSR_SUPPORT;
    config.csrCount = 1;
    config.finalAnalysisLabel =
      ITEMS_SHEET.ITEMNAMES.FINAL_ANALYSIS_PROGRAM_DOUBLE;
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
    QUOTATION_REQUEST_SHEET.ITEMNAMES
      .FINAL_ANALYSIS_REQUIRED_TABLE_FIGURE_COUNT,
  );

  const hasClinicalConference =
    returnIfEquals_(
      get_quotation_request_value_(
        array_quotation_request,
        QUOTATION_REQUEST_SHEET.ITEMNAMES.CASE_REVIEW_MEETING,
      ),
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
    [
      ITEMS_SHEET.ITEMNAMES.CASE_REVIEW_MEETING_PREPARATION_AND_EXECUTION,
      closingMeeting,
    ],
    [ITEMS_SHEET.ITEMNAMES.DATA_CLEANING, 1],
    [
      ITEMS_SHEET.ITEMNAMES.CLINICAL_TRIALS_OFFICE_CLOSING,
      clinicalTrialsOffice,
    ],
    [ITEMS_SHEET.ITEMNAMES.PMDA_RESPONSE_AND_INQUIRY, ""],
    [ITEMS_SHEET.ITEMNAMES.AUDIT_SUPPORT, config.auditSupport],
    [ITEMS_SHEET.ITEMNAMES.DATABASE_FIXING_AND_CLOSING, 1],
    [ITEMS_SHEET.ITEMNAMES.CASE_REVIEW_MEETING_MATERIALS, clinicalConference],
    [
      ITEMS_SHEET.ITEMNAMES.STATISTICAL_ANALYSIS_PLAN,
      returnIfGreaterThan_(finalAnalysisTableCount, 0, 1),
    ],
    [
      config.finalAnalysisLabel,
      returnIfGreaterThan_(finalAnalysisTableCount, 0, finalAnalysisTableCount),
    ],
    [
      ITEMS_SHEET.ITEMNAMES.FINAL_ANALYSIS_REPORT,
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
