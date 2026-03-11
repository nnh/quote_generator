/**
 * validation処理の初期コンテキストを構築する
 *
 * @returns {Object}
 */
function validationInitContext_() {
  validationInitializeCheckSheet_();

  const quotationRequestValidationContext =
    buildQuotationRequestValidationContext_();
  const facilities_value = quotationRequestValidationContext.facilities;
  const number_of_cases_value =
    quotationRequestValidationContext.number_of_cases;

  const { targetTotal, targetTotalAmount } = validationBuildTotalTargets_();
  const enrollmentStartDate =
    quotationRequestValidationContext.enrollmentStartDate;
  const studyEndDate = quotationRequestValidationContext.studyEndDate;
  const trial_start_end = validationBuildTrialStartEndRows_(
    enrollmentStartDate,
    studyEndDate,
  );

  validationWriteTrialStartEndRows_(trial_start_end);

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
 * validation処理のためにCheckシートを初期化する
 *
 * - 初期処理実行
 * - フィルタ非表示
 * - Checkシートの内容をクリア
 */
function validationInitializeCheckSheet_() {
  initial_process();
  hideFilterVisibility();
  _cachedSheets.check.clear();
}

/**
 * Totalシートの検証対象情報を作成する
 *
 * 件数列と金額列の検証対象を構築する。
 *
 * @returns {{targetTotal:Object,targetTotalAmount:Object}}
 */
function validationBuildTotalTargets_() {
  const targetTotal = {
    sheet: _cachedSheets.total,
    sheetName: _cachedSheets.total.getName(),
    array_item: get_fy_items_(
      _cachedSheets.total,
      TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
    ),
    col: TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT,
    colIndex: TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT - 1,
    footer: null,
  };

  const targetTotalAmount = {
    sheet: _cachedSheets.total,
    sheetName: _cachedSheets.total.getName(),
    array_item: get_fy_items_(_cachedSheets.total, 2),
    col: 9,
    colIndex: 8,
    footer: "（金額）",
  };

  return { targetTotal, targetTotalAmount };
}

/**
 * 試験開始〜終了日の確認行を作成する
 *
 * @param {Date} enrollmentStartDate
 * @param {Date} studyEndDate
 * @returns {string[][]}
 */
function validationBuildTrialStartEndRows_(enrollmentStartDate, studyEndDate) {
  return [
    ["OK/NG", "詳細", "", ""],
    [
      "",
      "症例登録開始〜試験終了日の月数チェック（作業用）",
      enrollmentStartDate.toLocaleDateString("ja"),
      studyEndDate.toLocaleDateString("ja"),
    ],
  ];
}

/**
 * Trial開始終了行をCheckシートへ書き込む
 *
 * @param {string[][]} trialRows
 */
function validationWriteTrialStartEndRows_(trialRows) {
  _cachedSheets.check
    .getRange(1, 1, trialRows.length, trialRows[0].length)
    .setValues(trialRows);
}
