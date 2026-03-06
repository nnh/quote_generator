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
    checkAmountByYearSheet_(x, setVal.getDiscountRateValue(idx)),
  );
  if (!res.every((x) => x)) {
    console.log("checkDiscountByYearSheet NG\n" + target + "\n" + res);
  }
  return res;
}

/**
 * If the first arguments are all True, return True. Otherwise, it outputs a message and returns False.
 * @param {array} <boolean>
 * @param {string} Message to output.
 * @return {boolean}
 */
function isAllTrue_(target, message) {
  const res = target.every((x) => x);
  if (!res) {
    console.log(message);
  }
  return res;
}
