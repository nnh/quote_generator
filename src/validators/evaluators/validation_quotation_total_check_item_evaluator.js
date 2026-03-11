function validationEvaluateValidationItems_(checkItems, target) {
  const columnValues = validationGetColumnValues_(target.sheet, target.col);
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
