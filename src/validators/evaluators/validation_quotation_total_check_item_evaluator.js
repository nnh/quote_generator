function evaluateCheckItems_(
  discount_byYear_message,
  checkQuoteSum_message,
  validationCompareTotalSheetTotalToVerticalTotalWithMessage,
  total2Total3ValidatorVerticalTotalToHorizontalTotalWithMessage,
  total2Total3ValidatorVerticalTotalToHorizontalDiscountTotalWithMessage,
  totalValidationRows,
  totalAmountValidationRows,
) {
  const crossSheetValidationRows = [
    discount_byYear_message,
    validationCompareTotalSheetTotalToVerticalTotalWithMessage,
    total2Total3ValidatorVerticalTotalToHorizontalTotalWithMessage,
    checkQuoteSum_message,
    total2Total3ValidatorVerticalTotalToHorizontalDiscountTotalWithMessage,
  ];
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
