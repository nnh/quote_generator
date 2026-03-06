function evaluateCheckItems_(params) {
  const {
    totalCheckItems,
    totalAmountCheckItems,
    targetTotal,
    targetTotalAmount,
    targetTotalColumnValues,
    targetTotalAmountColumnValues,
  } = params;

  const discount_byYear = toStatusFromBooleanArray_(
    checkDiscountByYearSheet_(),
    VALIDATION_MESSAGES.VALUE_MISMATCH,
  );
  const discount_byYear_message = [
    discount_byYear,
    "Setup〜Closingシートの特別値引後合計のチェック",
  ];
  const checkQuoteSum_message = toStatusFromBooleanArray_(
    checkQuoteSum_(),
    VALIDATION_MESSAGES.VALUE_MISMATCH,
    "Quote, total, total2, total3の合計・特別値引後合計一致チェック",
  );

  const crossSheetValidationRows = [
    discount_byYear_message,
    compareTotalSheetTotaltoVerticalTotal_(),
    compareTotal2Total3SheetVerticalTotalToHorizontalTotal_(),
    checkQuoteSum_message,
    compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_(),
  ];

  const totalValidationRows = evaluateItemChecks_(
    totalCheckItems,
    targetTotal,
    targetTotalColumnValues,
  );

  const totalAmountValidationRows = evaluateItemChecks_(
    totalAmountCheckItems,
    targetTotalAmount,
    targetTotalAmountColumnValues,
  );

  return [
    ...totalValidationRows,
    ...totalAmountValidationRows,
    ...crossSheetValidationRows,
  ];
}
function evaluateItemChecks_(checkItems, target, columnValues) {
  return checkItems.map((item) =>
    checkItemNameAndValue_(
      target.sheetName,
      target.array_item,
      target.footer,
      columnValues,
      item.itemname,
      item.value,
    ),
  );
}
