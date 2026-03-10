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
  // バリデーションコンテキストをリセット（シート値のキャッシュをクリア）
  validationResetContext_();

  // Setup・Closing情報を取得
  const { setup_month, closing_month, setup_closing_months } =
    calculateSetupAndClosingMonths(quotationRequestValidationContext);

  // 試験期間詳細を計算
  const trialInfo = calculateTrialDurationDetails_(
    trialMonthsFromSheet,
    setup_closing_months,
  );
  // Quoteシートの情報を取得
  const quoteSheetInfo = validationGetQuoteSheetInfo_();

  // Totalシートの「合計金額」列とTotal2, Total3シートの「合計」列のインデックス及び値を取得
  const totalSheetValues = validationGetCachedSheetValues_(_cachedSheets.total);
  const total2SheetValues = validationGetCachedSheetValues_(
    _cachedSheets.total2,
  );
  const total3SheetValues = validationGetCachedSheetValues_(
    _cachedSheets.total3,
  );
  const TOTAL_HEADER_ROW_INDEX = 3; // Totalシートのヘッダー行（0-origin）
  const TOTAL_HEADER_COL_INDEX = 1; // Totalシートのヘッダー列（0-origin）
  const TOTAL3_HEADER_ROW_INDEX = 2; // Total3シートのヘッダー行（0-origin）
  const totalSheetInfo = validationGetTotalSheetInfo_(
    _cachedSheets.total,
    TOTAL_HEADER_ROW_INDEX,
    TOTAL_HEADER_COL_INDEX,
    VALIDATION_LABELS.SUM,
  );
  const total2SheetInfo = validationGetTotalSheetInfo_(
    _cachedSheets.total2,
    TOTAL_HEADER_ROW_INDEX,
    TOTAL_HEADER_COL_INDEX,
    VALIDATION_LABELS.SUM,
  );
  const total3SheetInfo = validationGetTotalSheetInfo_(
    _cachedSheets.total3,
    TOTAL3_HEADER_ROW_INDEX,
    TOTAL_HEADER_COL_INDEX,
    VALIDATION_LABELS.SUM,
  );

  const totalTotalAmountValue =
    totalSheetValues[totalSheetInfo.sumRowIndex][totalSheetInfo.amountColIndex];
  const totalDiscountTotalValue =
    totalSheetValues[totalSheetInfo.discountTotalRowIndex][
      totalSheetInfo.amountColIndex
    ];
  const total2TotalAmountValue =
    total2SheetValues[total2SheetInfo.sumRowIndex][total2SheetInfo.sumColIndex];
  const total2DiscountTotalValue =
    total2SheetValues[total2SheetInfo.discountTotalRowIndex][
      total2SheetInfo.sumColIndex
    ];
  const total3TotalAmountValue =
    total3SheetValues[total3SheetInfo.sumRowIndex][total3SheetInfo.sumColIndex];
  const total3DiscountTotalValue =
    total3SheetValues[total3SheetInfo.discountTotalRowIndex][
      total3SheetInfo.sumColIndex
    ];

  // 合計金額チェック
  const updatedRow = validationCompareTotalAmounts_(
    totalTotalAmountValue,
    total2TotalAmountValue,
    total3TotalAmountValue,
    rowOutput,
  );

  // 個別項目の中間解析・クロージング数取得
  const { interimCount, closingCount } = validationGetTargetCounts_(
    targetTotal,
    totalSheetValues,
  );

  // 総チェック項目の生成
  const { totalCheckItems, totalAmountCheckItems } =
    validationBuildAllCheckItems_({
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

  const res_validationCheckQuoteSum_ = validationCheckQuoteSum_(
    quoteSheetInfo.amountValue,
    totalTotalAmountValue,
    total2TotalAmountValue,
    total3TotalAmountValue,
    quoteSheetInfo.discountTotalValue,
    totalDiscountTotalValue,
    total2DiscountTotalValue,
    total3DiscountTotalValue,
  );

  // 評価結果を計算
  const outputValues = evaluateCheckItems_(
    {
      totalCheckItems: sortedTotalCheckItems,
      totalAmountCheckItems,
      targetTotal,
      targetTotalAmount,
      targetTotalColumnValues,
      targetTotalAmountColumnValues,
    },
    res_validationCheckQuoteSum_,
  );

  // シートに書き込み
  writeOutputValues_(updatedRow + 1, outputValues);
}

/** 出力値をシートに書き込む */
function writeOutputValues_(startRow, outputValues) {
  _cachedSheets.check
    .getRange(startRow, 1, outputValues.length, outputValues[0].length)
    .setValues(outputValues);
}
