function evaluateCheckItems_(params) {
  const {
    totalCheckItems,
    totalAmountCheckItems,
    targetTotal,
    targetTotalAmount,
    interimCount,
    closingCount,
    targetTotalColumnValues,
    targetTotalAmountColumnValues,
  } = params;

  // データクリーニング項目追加
  const totalCheckItemsWithCleaning = [
    ...totalCheckItems,
    {
      itemname: "データクリーニング",
      value: interimCount + closingCount,
    },
  ];

  const discount_byYear = toStatusFromBooleanArray_(
    checkDiscountByYearSheet_(),
    VALIDATION_MESSAGES.VALUE_MISMATCH,
  );

  const crossSheetValidationRows = [
    [discount_byYear, "Setup〜Closingシートの特別値引後合計のチェック"],
    compareTotalSheetTotaltoVerticalTotal_(),
    compareTotal2Total3SheetVerticalTotalToHorizontalTotal_(),
    toStatusFromBooleanArray_(
      checkQuoteSum_(),
      VALIDATION_MESSAGES.VALUE_MISMATCH,
      "Quote, total, total2, total3の合計・特別値引後合計一致チェック",
    ),
    compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_(),
  ];

  const totalValidationRows = evaluateItemChecks_(
    totalCheckItemsWithCleaning,
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
