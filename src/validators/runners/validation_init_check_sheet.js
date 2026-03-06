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
