function evaluateCheckItems_(
  params,
  checkQuoteSum_message,
  validationCompareTotalSheetTotalToVerticalTotalWithMessage,
  total2Total3ValidatorVerticalTotalToHorizontalTotalWithMessage,
  total2Total3ValidatorVerticalTotalToHorizontalDiscountTotalWithMessage,
) {
  const {
    totalCheckItems,
    totalAmountCheckItems,
    targetTotal,
    targetTotalAmount,
    targetTotalColumnValues,
    targetTotalAmountColumnValues,
  } = params;

  const discount_byYear_message = validationBuildMessage_(
    checkDiscountByYearSheet_,
    "Setup〜Closingシートの特別値引後合計のチェック",
  );

  const crossSheetValidationRows = [
    discount_byYear_message,
    validationCompareTotalSheetTotalToVerticalTotalWithMessage,
    total2Total3ValidatorVerticalTotalToHorizontalTotalWithMessage,
    checkQuoteSum_message,
    total2Total3ValidatorVerticalTotalToHorizontalDiscountTotalWithMessage,
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
    validationValidateItemValue_(
      target.sheetName,
      target.array_item,
      target.footer,
      columnValues,
      item.itemname,
      item.value,
    ),
  );
}
