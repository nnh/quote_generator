function check_output_values() {
  const params = initCheckSheet_();

  const { outputValues, updatedRow } =
    validationRunOutputValidationPipeline_(params);

  writeOutputValues_(updatedRow, outputValues);
}

/** 出力値をシートに書き込む */
function writeOutputValues_(startRow, outputValues) {
  _cachedSheets.check
    .getRange(startRow, 1, outputValues.length, outputValues[0].length)
    .setValues(outputValues);
}
function validationCollectTotalSheetValues_() {
  const TOTAL_HEADER_ROW_INDEX = 3;
  const TOTAL_HEADER_COL_INDEX = 1;
  const TOTAL3_HEADER_ROW_INDEX = 2;

  const totalSheetValues = validationGetCachedSheetValues_(_cachedSheets.total);
  const total2SheetValues = validationGetCachedSheetValues_(
    _cachedSheets.total2,
  );
  const total3SheetValues = validationGetCachedSheetValues_(
    _cachedSheets.total3,
  );

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

  return {
    totalSheetValues,
    total2SheetValues,
    total3SheetValues,
    totalSheetInfo,
    total2SheetInfo,
    total3SheetInfo,
    totalTotalAmountValue,
    totalDiscountTotalValue,
    total2TotalAmountValue,
    total2DiscountTotalValue,
    total3TotalAmountValue,
    total3DiscountTotalValue,
  };
}
function validationBuildTrialContext_(
  rowOutput,
  colOutput,
  quotationRequestValidationContext,
) {
  const trialMonthsFromSheet = calculateTrialMonths_(rowOutput, colOutput);

  // バリデーションコンテキストをリセット（シート値のキャッシュをクリア）
  validationResetContext_();

  const { setup_month, closing_month, setup_closing_months } =
    calculateSetupAndClosingMonths(quotationRequestValidationContext);

  const trialInfo = calculateTrialDurationDetails_(
    trialMonthsFromSheet,
    setup_closing_months,
  );

  return {
    trialMonthsFromSheet,
    setup_month,
    closing_month,
    setup_closing_months,
    ...trialInfo,
  };
}
function validationBuildSortedCheckItems_(params) {
  const {
    quotationRequestValidationContext,
    facilities_value,
    number_of_cases_value,
    trialContext,
    interimCount,
    closingCount,
  } = params;

  const { totalCheckItems, totalAmountCheckItems } =
    validationBuildAllCheckItems_({
      quotationRequestValidationContext,
      facilities_value,
      number_of_cases_value,
      trial_months: trialContext.trialMonthsFromSheet,
      total_months: trialContext.totalMonths,
      trial_year: trialContext.fullYears,
      trial_ceil_year: trialContext.ceilYears,
      setup_month: trialContext.setup_month,
      closing_month: trialContext.closing_month,
      interimCount,
      closingCount,
    });

  const sortedTotalCheckItems = alignTotalCheckItemsToSheet_(totalCheckItems);

  return {
    sortedTotalCheckItems,
    totalAmountCheckItems,
  };
}

function validationRunCrossSheetValidations_(totals, quoteSheetInfo) {
  const validationCompareTotalSheetTotalToVerticalTotalWithMessage =
    validationCompareTotalSheetTotalToVerticalTotal_(
      totals.totalSheetValues,
      totals.totalSheetInfo,
      totals.totalTotalAmountValue,
    );

  const comparator = new Total2Total3Validator(
    totals.total2SheetInfo,
    totals.total3SheetInfo,
    totals.total2SheetValues,
    totals.total3SheetValues,
  );

  const total2Total3ValidatorVerticalTotalToHorizontalTotalWithMessage =
    total2Total3ValidatorVerticalTotalToHorizontalTotal_(comparator);

  const total2Total3ValidatorVerticalTotalToHorizontalDiscountTotalWithMessage =
    total2Total3ValidatorVerticalTotalToHorizontalDiscountTotal_(comparator);

  const checkQuoteSum_message = validationBuildMessage_(
    () =>
      validationCheckQuoteSum_(
        quoteSheetInfo.amountValue,
        totals.totalTotalAmountValue,
        totals.total2TotalAmountValue,
        totals.total3TotalAmountValue,
        quoteSheetInfo.discountTotalValue,
        totals.totalDiscountTotalValue,
        totals.total2DiscountTotalValue,
        totals.total3DiscountTotalValue,
      ),
    "Quote, total, total2, total3の合計・特別値引後合計一致チェック",
  );

  const discount_byYear_message = validationBuildMessage_(
    checkDiscountByYearSheet_,
    "Setup〜Closingシートの特別値引後合計のチェック",
  );

  return {
    discountByYear: discount_byYear_message,
    totalVertical: validationCompareTotalSheetTotalToVerticalTotalWithMessage,
    total2Total3Horizontal:
      total2Total3ValidatorVerticalTotalToHorizontalTotalWithMessage,
    quoteSum: checkQuoteSum_message,
    total2Total3Discount:
      total2Total3ValidatorVerticalTotalToHorizontalDiscountTotalWithMessage,
  };
}

function validationRunOutputValidationPipeline_(params) {
  const {
    facilities_value,
    number_of_cases_value,
    targetTotal,
    targetTotalAmount,
    trial_start_end,
    quotationRequestValidationContext,
  } = params;
  const rowOutput = trial_start_end.length;
  const colOutput = trial_start_end[0].length + 1;

  const trialContext = validationBuildTrialContext_(
    rowOutput,
    colOutput,
    quotationRequestValidationContext,
  );

  const quoteSheetInfo = validationGetQuoteSheetInfo_();
  const totals = validationCollectTotalSheetValues_();

  const crossSheetMessages = validationRunCrossSheetValidations_(
    totals,
    quoteSheetInfo,
  );

  const totalAmountRow = validationCompareTotalAmounts_(
    totals.totalTotalAmountValue,
    totals.total2TotalAmountValue,
    totals.total3TotalAmountValue,
  );

  const { interimCount, closingCount } = validationGetTargetCounts_(
    targetTotal,
    totals.totalSheetValues,
  );

  const { sortedTotalCheckItems, totalAmountCheckItems } =
    validationBuildSortedCheckItems_({
      quotationRequestValidationContext,
      facilities_value,
      number_of_cases_value,
      trialContext,
      interimCount,
      closingCount,
    });

  const totalValidationRows = validationEvaluateValidationItems_(
    sortedTotalCheckItems,
    targetTotal,
  );

  const totalAmountValidationRows = validationEvaluateValidationItems_(
    totalAmountCheckItems,
    targetTotalAmount,
  );

  const outputValues = [
    totalAmountRow,
    ...validationEvaluateCheckItems_(
      crossSheetMessages,
      totalValidationRows,
      totalAmountValidationRows,
    ),
  ];
  const updatedRow = rowOutput + 1;

  return {
    outputValues,
    updatedRow,
  };
}
