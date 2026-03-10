/**
 * Check the price after discount.
 * @param {string} <array> The sheet name.
 * @return {boolean} <array> Return True if OK, False otherwise.
 */
function checkDiscountByYearSheet_(targetSheetsName = null) {
  const setVal = new SetTestValues();
  const target = targetSheetsName
    ? targetSheetsName
    : setVal.getTrialYearsItemsName();
  const res = target.map((x, idx) =>
    validationCheckAmountByYearSheet_(x, setVal.getDiscountRateValue(idx)),
  );
  if (!res.every((x) => x)) {
    console.log("checkDiscountByYearSheet NG\n" + target + "\n" + res);
  }
  return res;
}
