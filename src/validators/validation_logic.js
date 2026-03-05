/**
 * Checkシートの初期化と基本情報の書き出し
 */
function initCheckSheet_() {
  initial_process();
  hideFilterVisibility();
  _cachedSheets.check.clear();
  const quotationRequestValidationContext =
    buildQuotationRequestValidationContext_();
  const facilities_value = quotationRequestValidationContext.facilities;
  const number_of_cases_value =
    quotationRequestValidationContext.number_of_cases;
  const targetTotal = {
    sheet: _cachedSheets.total,
    sheetName: _cachedSheets.total.getName(),
    array_item: get_fy_items_(
      _cachedSheets.total,
      TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
    ),
    col: TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT,
    footer: null,
  };
  const targetTotalAmount = {
    sheet: _cachedSheets.total,
    sheetName: _cachedSheets.total.getName(),
    array_item: get_fy_items_(_cachedSheets.total, 2),
    col: 9,
    footer: "（金額）",
  };
  const enrollmentStartDate =
    quotationRequestValidationContext.enrollmentStartDate;
  const studyEndDate = quotationRequestValidationContext.studyEndDate;
  const trial_start_end = [
    ["OK/NG", "詳細", "", ""],
    [
      "",
      "症例登録開始〜試験終了日の月数チェック（作業用）",
      enrollmentStartDate.toLocaleDateString("ja"),
      studyEndDate.toLocaleDateString("ja"),
    ],
  ];

  _cachedSheets.check
    .getRange(1, 1, trial_start_end.length, trial_start_end[0].length)
    .setValues(trial_start_end);
  const res = {
    facilities_value,
    number_of_cases_value,
    targetTotal,
    targetTotalAmount,
    trial_start_end,
    quotationRequestValidationContext,
  };
  return res;
}
/**
 * 検証に使用するセットアップ期間・クローズ期間（月数）を算出する。
 *
 * ルール:
 * - 通常: setup=3ヶ月 / closing=3ヶ月
 * - 医師主導治験または特定臨床研究: setup=6ヶ月 / closing=6ヶ月
 * - 上記以外で研究結果報告書作成支援あり: closingに+3ヶ月
 *
 * @param {Object} quotationRequestValidationContext
 * @param {string} quotationRequestValidationContext.trialType 試験種別
 * @param {string} quotationRequestValidationContext.reportSupport 研究結果報告書作成支援有無（COMMON_EXISTENCE_LABELS）
 *
 * @returns {{
 *   setup_month: number,
 *   closing_month: number,
 *   setup_closing_months: number
 * }} セットアップ・クローズ月数および合計月数
 */
function calculateSetupAndClosingMonths(quotationRequestValidationContext) {
  const trialType = quotationRequestValidationContext.trialType;
  const hasReportSupport =
    quotationRequestValidationContext.reportSupport ===
    COMMON_EXISTENCE_LABELS.YES;

  const DEFAULT_MONTH = 3;
  const INVESTIGATOR_MONTH = 6;
  const REPORT_SUPPORT_EXTRA_MONTH = 3;

  let setupMonth = DEFAULT_MONTH;
  let closingMonth = DEFAULT_MONTH;

  const isInvestigatorTrial =
    trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED ||
    trialType === TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL;

  if (isInvestigatorTrial) {
    setupMonth = INVESTIGATOR_MONTH;
    closingMonth = INVESTIGATOR_MONTH;
  } else if (hasReportSupport) {
    closingMonth += REPORT_SUPPORT_EXTRA_MONTH;
  }

  return {
    setup_month: setupMonth,
    closing_month: closingMonth,
    setup_closing_months: setupMonth + closingMonth,
  };
}
/**
 * 試験月数から、関連する期間情報（合計月数、満年数、切り上げ年数）を計算して返す
 * @param {number} trialMonths - 試験月数
 * @param {number} setupClosingMonths - SetupとClosingの合計月数
 * @return {Object} 計算結果のオブジェクト
 */
function calculateTrialDurationDetails_(trialMonths, setupClosingMonths) {
  return {
    totalMonths: trialMonths + setupClosingMonths,
    fullYears: trialMonths > 12 ? Math.trunc(trialMonths / 12) : "", // 満何年か
    ceilYears: Math.ceil(trialMonths / 12), // 切り上げ年数
  };
}
function compareTotalAmounts_(output_row) {
  const total_total_ammount = get_total_amount({
    sheet: _cachedSheets.total,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 4,
    total_col_itemname: ITEM_LABELS.AMMOUNT,
  });
  const total2_total_ammount = get_total_amount({
    sheet: _cachedSheets.total2,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 4,
    total_col_itemname: ITEM_LABELS.SUM,
  });
  const total3_total_ammount = get_total_amount({
    sheet: _cachedSheets.total3,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 3,
    total_col_itemname: ITEM_LABELS.SUM,
  });
  const ammount_check = [null, "Total, Total2, Total3の合計金額チェック"];
  if (
    (total_total_ammount === total2_total_ammount) &
    (total_total_ammount === total3_total_ammount)
  ) {
    ammount_check[0] = VALIDATION_STATUS.OK;
    ammount_check[1] = ammount_check[1] + " ,想定値:" + total_total_ammount;
  } else {
    ammount_check[0] = buildNgMessage_(VALIDATION_MESSAGES.TOTAL_MISMATCH);
  }
  output_row++;
  _cachedSheets.check
    .getRange(output_row, 1, 1, ammount_check.length)
    .setValues([ammount_check]);
  return output_row;
}
function checkQuotationOfficeOperationItems_(
  trial_months,
  setup_month,
  quotationRequestValidationContext,
) {
  let office_bef_month = 0;
  let office_count = 0;
  let temp_value = 0;
  if (
    (quotationRequestValidationContext.trialType ===
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED) |
    (quotationRequestValidationContext.coordinatingOfficeSetup ===
      COMMON_EXISTENCE_LABELS.YES) |
    (quotationRequestValidationContext.fundingSource ===
      QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL)
  ) {
    temp_value = trial_months;
    office_count = 1;
    office_bef_month = setup_month;
  } else {
    temp_value = 0;
  }
  const res = new Map();
  res.set("officeOperationFromStartToEnd", {
    itemname: "事務局運営（試験開始後から試験終了まで）",
    value: temp_value,
  });
  res.set("officeOperationBeforeStart", {
    itemname: "事務局運営（試験開始前）",
    value: office_bef_month,
  });
  res.set("officeOperationAtEnd", {
    itemname: "事務局運営（試験終了時）",
    value: office_count,
  });
  return res;
}

/**
 * モニタリング関連のチェック項目を作成する。
 *
 * 以下の3項目のチェックデータを作成して配列で返す。
 * - モニタリング準備業務（関連資料作成）
 * - 開始前モニタリング・必須文書確認
 * - 症例モニタリング・SAE対応
 *
 * 戻り値は `totalCheckItems.push(...items)` のように
 * そのまま展開して追加できる形式になっている。
 *
 * @param {Object} params
 * @param {number} params.facilities_value 施設数
 * @param {number} params.number_of_cases_value 症例数
 * @param {number} params.trial_ceil_year 試験年数（切り上げ）
 * @param {Object} params.quotationRequestValidationContext 見積依頼コンテキスト
 * @param {number|string} params.quotationRequestValidationContext.monitoringVisitsPerCase 症例ごとのモニタリング回数
 * @param {number|string} params.quotationRequestValidationContext.annualRequiredDocMonitoringPerSite 施設ごとの年間必須文書モニタリング回数
 *
 * @returns {{
 *   itemname: string,
 *   value: number
 * }[]} モニタリング関連チェック項目配列
 */
function buildMonitoringItems_(params) {
  const {
    facilities_value,
    number_of_cases_value,
    trial_ceil_year,
    quotationRequestValidationContext,
  } = params;

  const monitoringPreparationDocumentCreation_value =
    quotationRequestValidationContext.monitoringVisitsPerCase > 0 ? 1 : 0;

  const preStudyMonitoringAndEssentialDocumentReview_value =
    quotationRequestValidationContext.annualRequiredDocMonitoringPerSite > 0
      ? parseInt(
          quotationRequestValidationContext.annualRequiredDocMonitoringPerSite,
        ) *
        facilities_value *
        trial_ceil_year
      : 0;

  const caseMonitoringAndSAESupport_value =
    quotationRequestValidationContext.monitoringVisitsPerCase > 0
      ? parseInt(quotationRequestValidationContext.monitoringVisitsPerCase) *
        number_of_cases_value
      : 0;

  return [
    {
      itemname: "モニタリング準備業務（関連資料作成）",
      value: monitoringPreparationDocumentCreation_value,
    },
    {
      itemname: "開始前モニタリング・必須文書確認",
      value: preStudyMonitoringAndEssentialDocumentReview_value,
    },
    {
      itemname: "症例モニタリング・SAE対応",
      value: caseMonitoringAndSAESupport_value,
    },
  ];
}
