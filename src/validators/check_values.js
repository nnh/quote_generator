function check_output_values() {
  const {
    facilities_value,
    number_of_cases_value,
    targetTotal,
    targetTotalAmount,
    trial_start_end,
    quotationRequestValidationContext,
  } = initCheckSheet_();

  const rowOutput = trial_start_end.length;
  const colOutput = trial_start_end[0].length + 1;

  // 試験月数を計算してシートにセット
  const trialMonthsFromSheet = calculateTrialMonths_(rowOutput, colOutput);

  // Setup・Closing情報を取得
  const { setup_month, closing_month, setup_closing_months } =
    calculateSetupAndClosingMonths(quotationRequestValidationContext);

  // 試験期間詳細を計算
  const trialInfo = calculateTrialDurationDetails_(
    trialMonthsFromSheet,
    setup_closing_months,
  );

  // 合計金額チェック
  const updatedRow = compareTotalAmounts_(rowOutput);

  // 個別項目の中間解析・クロージング数取得
  const { interimCount, closingCount } = getTargetCounts_(targetTotal);

  // 総チェック項目の生成
  const { totalCheckItems, totalAmountCheckItems } = buildAllCheckItems_({
    quotationRequestValidationContext,
    facilities_value,
    number_of_cases_value,
    trial_months: trialMonthsFromSheet,
    total_months: trialInfo.totalMonths,
    trial_year: trialInfo.fullYears,
    trial_ceil_year: trialInfo.ceilYears,
    setup_month,
    closing_month,
    interimCount,
    closingCount,
  });

  // Itemsシートの並びに合わせてソート
  const sortedTotalCheckItems = alignTotalCheckItemsToSheet_(totalCheckItems);

  // シート列値取得
  const targetTotalColumnValues = getColumnValues_(
    targetTotal.sheet,
    targetTotal.col,
  );
  const targetTotalAmountColumnValues = getColumnValues_(
    targetTotalAmount.sheet,
    targetTotalAmount.col,
  );

  // 評価結果を計算
  const outputValues = evaluateCheckItems_({
    totalCheckItems: sortedTotalCheckItems,
    totalAmountCheckItems,
    targetTotal,
    targetTotalAmount,
    targetTotalColumnValues,
    targetTotalAmountColumnValues,
  });

  // シートに書き込み
  writeOutputValues_(updatedRow + 1, outputValues);
}

/** ====================================
 * サブ関数群
 * ==================================== */

/** 試験月数をシートから取得 */
function calculateTrialMonths_(row, col) {
  const formulaTrialMonths = '=DATEDIF(C2,D2,"M") + IF(DAY(C2)<=DAY(D2),1,2)';
  const checkSheet = _cachedSheets.check;
  checkSheet.getRange(row, col).setFormula(formulaTrialMonths);
  SpreadsheetApp.flush();
  const COL_TRIAL_MONTHS = 5;
  return checkSheet.getRange(row, COL_TRIAL_MONTHS).getValue();
}

/** targetTotalから中間解析・クロージング数を取得 */
function getTargetCounts_(targetTotal) {
  const interimCount = targetTotal.sheet
    .getRange(
      targetTotal.array_item["中間解析報告書作成（出力結果＋表紙）"],
      targetTotal.col,
    )
    .getValue();
  const closingCount = targetTotal.sheet
    .getRange(
      targetTotal.array_item["データベース固定作業、クロージング"],
      targetTotal.col,
    )
    .getValue();
  return { interimCount, closingCount };
}

/** 指定列の値を1次元配列で取得 */
function getColumnValues_(sheet, col) {
  return sheet.getRange(1, col, sheet.getLastRow(), 1).getValues().flat();
}

/** 出力値をシートに書き込む */
function writeOutputValues_(startRow, outputValues) {
  _cachedSheets.check
    .getRange(startRow, 1, outputValues.length, outputValues[0].length)
    .setValues(outputValues);
}

/** 総チェック項目生成のラッパー */
function buildAllCheckItems_(params) {
  const totalCheckItems = buildTotalCheckItems_(params).totalCheckItems;
  const totalAmountCheckItems =
    buildTotalCheckItems_(params).totalAmountCheckItems;
  return { totalCheckItems, totalAmountCheckItems };
}
