function validationEvaluateCheckItems_(
  crossSheetMessages,
  totalValidationRows,
  totalAmountValidationRows,
) {
  const crossSheetValidationRows = [
    crossSheetMessages.discountByYear,
    crossSheetMessages.totalVertical,
    crossSheetMessages.total2Total3Horizontal,
    crossSheetMessages.quoteSum,
    crossSheetMessages.total2Total3Discount,
  ];

  return [
    ...totalValidationRows,
    ...totalAmountValidationRows,
    ...crossSheetValidationRows,
  ];
}

function validationEvaluateValidationItems_(checkItems, target) {
  const columnValues = getColumnValues_(target.sheet, target.col);
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
