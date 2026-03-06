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
  const total_total_ammount = getValidationTotalAmount_({
    sheet: _cachedSheets.total,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 4,
    total_col_itemname: ITEM_LABELS.AMMOUNT,
  });
  const total2_total_ammount = getValidationTotalAmount_({
    sheet: _cachedSheets.total2,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 4,
    total_col_itemname: ITEM_LABELS.SUM,
  });
  const total3_total_ammount = getValidationTotalAmount_({
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
