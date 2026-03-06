/**
 * On the Quote, Total, Total2, and Total3 sheets, check that the totals and discounted totals are printed correctly.
 * @param none.
 * @return {boolean} <array> Return True if OK, False otherwise.
 */
function checkQuoteSum_() {
  const GetRowCol = new GetTargetRowCol();
  const quoteGoukeiRow = GetRowCol.getTargetRow(_cachedSheets.quote, 3, "小計");
  const totalGoukeiRow = GetRowCol.getTargetRow(
    _cachedSheets.total,
    2,
    ITEM_LABELS.SUM,
  );
  const total2GoukeiRow = GetRowCol.getTargetRow(
    _cachedSheets.total2,
    2,
    ITEM_LABELS.SUM,
  );
  const total3GoukeiRow = GetRowCol.getTargetRow(
    _cachedSheets.total3,
    2,
    ITEM_LABELS.SUM,
  );
  const quoteGoukeiCol = GetRowCol.getTargetCol(
    _cachedSheets.quote,
    11,
    ITEM_LABELS.AMMOUNT,
  );
  const totalGoukeiCol = GetRowCol.getTargetCol(
    _cachedSheets.total,
    4,
    ITEM_LABELS.AMMOUNT,
  );
  const total2GoukeiCol = GetRowCol.getTargetCol(
    _cachedSheets.total2,
    4,
    ITEM_LABELS.SUM,
  );
  const total3GoukeiCol = GetRowCol.getTargetCol(
    _cachedSheets.total3,
    3,
    ITEM_LABELS.SUM,
  );
  const checkAmount = [
    _cachedSheets.quote.getRange(quoteGoukeiRow, quoteGoukeiCol).getValue(),
    _cachedSheets.total.getRange(totalGoukeiRow, totalGoukeiCol).getValue(),
    _cachedSheets.total2.getRange(total2GoukeiRow, total2GoukeiCol).getValue(),
    _cachedSheets.total3.getRange(total3GoukeiRow, total3GoukeiCol).getValue(),
  ].map((x) => (x === "" ? 0 : Math.round(x)));
  const checkDiscount = [
    _cachedSheets.quote.getRange(quoteGoukeiRow + 2, quoteGoukeiCol).getValue(),
    _cachedSheets.total.getRange(totalGoukeiRow + 1, totalGoukeiCol).getValue(),
    _cachedSheets.total2
      .getRange(total2GoukeiRow + 1, total2GoukeiCol)
      .getValue(),
    _cachedSheets.total3
      .getRange(total3GoukeiRow + 1, total3GoukeiCol)
      .getValue(),
  ].map((x) => (x === "" ? 0 : Math.round(x)));
  return [
    checkAmount.every((x, _, arr) => x === arr[0]),
    checkDiscount.every((x, _, arr) => x === arr[0]),
  ];
}
/**
 * Check that the total and the discounted total on each sheet from Setup to Closing are output correctly.
 * @param {string} The sheet name.
 * @param {number} Discount rate for Trial sheets.
 * @return {boolean} Return True if OK, False otherwise.
 */
function checkAmountByYearSheet_(sheetName, discountRate) {
  const ss = getSpreadsheet_();
  const targetSheet = ss.getSheetByName(sheetName);
  const GetRowCol = new GetTargetRowCol();
  const sumRow = GetRowCol.getTargetRow(targetSheet, 2, ITEM_LABELS.SUM);
  const sumCol = GetRowCol.getTargetCol(targetSheet, 4, ITEM_LABELS.AMMOUNT);
  const sumValue = targetSheet.getRange(sumRow, sumCol).getValue();
  const discountValue = targetSheet.getRange(sumRow + 1, sumCol).getValue();
  const test1 = Math.trunc(sumValue * (1 - discountRate));
  const test2 = Math.trunc(discountValue);
  const discountCheck =
    discountRate >= 0 ||
    ss
      .getSheetByName(sheetName)
      .getSheetByName(sheetName)
      .getRange("B2")
      .getValue() === ""
      ? test1 === test2
      : discountValue === "";
  return discountCheck;
}
