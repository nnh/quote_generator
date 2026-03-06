function check_output_values() {
  const trial_months_col = 5;
  let output_row = 1;
  let output_col = 1;
  const {
    facilities_value,
    number_of_cases_value,
    targetTotal,
    targetTotalAmount,
    trial_start_end,
    quotationRequestValidationContext,
  } = initCheckSheet_();
  output_row = trial_start_end.length;
  output_col = output_col + trial_start_end[0].length;
  _cachedSheets.check
    .getRange(output_row, output_col)
    .setFormula('=datedif(C2, D2, "M") + if(day(C2) <= day(D2), 1, 2)');
  output_col++;
  const { setup_month, closing_month, setup_closing_months } =
    calculateSetupAndClosingMonths(quotationRequestValidationContext);
  SpreadsheetApp.flush();
  // 試験月数, setup~closing月数を取得
  const trial_months = _cachedSheets.check
    .getRange(output_row, trial_months_col)
    .getValue();
  // 試験月数出力
  const tempDateList = calculateTrialDurationDetails_(
    trial_months,
    setup_closing_months,
  );
  const total_months = tempDateList.totalMonths;
  const trial_year = tempDateList.fullYears;
  const trial_ceil_year = tempDateList.ceilYears;
  _cachedSheets.check.getRange(output_row, output_col).setValue(total_months);
  // 合計金額チェック
  output_row = compareTotalAmounts_(output_row);
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
  // 個別項目チェック
  const { totalCheckItems, totalAmountCheckItems } = buildTotalCheckItems_({
    quotationRequestValidationContext,
    facilities_value,
    number_of_cases_value,
    trial_months,
    total_months,
    trial_year,
    trial_ceil_year,
    setup_month,
    closing_month,
    interimCount,
    closingCount,
  });
  // Itemsシートの項目が全てチェック対象になっているかを確認し、ソートして返す
  const sortedTotalCheckItems = alignTotalCheckItemsToSheet_(totalCheckItems);

  const targetTotalColumnValues = targetTotal.sheet
    .getRange(1, targetTotal.col, targetTotal.sheet.getLastRow(), 1)
    .getValues()
    .flat();

  const targetTotalAmountColumnValues = targetTotalAmount.sheet
    .getRange(1, targetTotalAmount.col, targetTotalAmount.sheet.getLastRow(), 1)
    .getValues()
    .flat();

  const output_values = evaluateCheckItems_({
    totalCheckItems: sortedTotalCheckItems,
    totalAmountCheckItems,
    targetTotal,
    targetTotalAmount,
    targetTotalColumnValues,
    targetTotalAmountColumnValues,
  });

  output_row++;
  _cachedSheets.check
    .getRange(output_row, 1, output_values.length, output_values[0].length)
    .setValues(output_values);
}
