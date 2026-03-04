/**
 * 行番号と列値から想定値との一致を判定する純粋関数
 *
 * @param {string} sheetName
 * @param {Object.<string, number>} itemRowMap - 項目名と行番号（1始まり）
 * @param {string|null} footer
 * @param {Array<*>} columnValues - 0始まり配列
 * @param {string} itemName
 * @param {*} expectedValue
 * @returns {[string, string]}
 */
function validateItemValue_(
  sheetName,
  itemRowMap,
  footer,
  columnValues,
  itemName,
  expectedValue,
) {
  const displayName = footer ? itemName + footer : itemName;

  const baseMessage = `シート名:${sheetName},項目名:${displayName},想定値:${expectedValue}`;

  const row = itemRowMap[itemName];

  if (!(row > 0)) {
    return [
      buildNgMessage_(VALIDATION_MESSAGES.NG_ITEM_NOT_FOUND),
      baseMessage,
    ];
  }

  const actualValue = columnValues[row - 1];

  if (actualValue !== expectedValue) {
    return [
      buildNgMessage_(VALIDATION_MESSAGES.VALUE_MISMATCH),
      `${baseMessage},実際の値:${actualValue}`,
    ];
  }

  return [VALIDATION_STATUS.OK, baseMessage];
}

function get_total_amount(target) {
  const items = target.sheet.getRange(target.item_cols).getValues().flat();
  const target_row = items.indexOf(target.total_row_itemname) + 1;
  const header = target.sheet
    .getRange(target.header_row, 1, 1, target.sheet.getLastColumn())
    .getValues()
    .flat();
  const target_col = header.indexOf(target.total_col_itemname) + 1;
  return target.sheet.getRange(target_row, target_col).getValue();
}
/**
 * Set, delete, and retrieve values for testing.
 */
class SetTestValues {
  constructor() {
    this.trialYearsStartRow = TRIAL_SHEET.ROWS.TRIAL_SETUP;
    this.trialYearsStartCol = TRIAL_SHEET.COLUMNS.TRIAL_START;
    this.trialYearsDiscountCol = 7;
    this.trialYearsDiscountRateCol = 8;
    this.const_itemsDiscount = 1100000;
    this.constDiscountAllPeriodRangeAddr = "B46";
    this.trialSheet = _cachedSheets.trial;
    if (!this.trialSheet) {
      throw new Error("Trial sheet not found in cache.");
    }
  }
  setTestValue(targetRange, strValue) {
    targetRange.setValue(strValue);
    SpreadsheetApp.flush();
  }
  delTestValue(targetRange) {
    targetRange.clearContent();
  }
  getTrialYearStartRange(idx) {
    this.idx = idx;
    return this.trialSheet.getRange(
      this.trialYearsStartRow + this.idx,
      this.trialYearsStartCol,
    );
  }
  setTrialYears(idx) {
    this.idx = idx;
    const yearStartRange = this.getTrialYearStartRange(this.idx);
    this.setTestValue(yearStartRange, new Date(2020 + this.idx, 3, 1));
    this.setTestValue(
      yearStartRange.offset(0, 1),
      new Date(2021 + this.idx, 2, 31),
    );
  }
  delTrialYears(idx) {
    this.idx = idx;
    const yearStartRange = this.getTrialYearStartRange(this.idx);
    this.delTestValue(yearStartRange);
    this.delTestValue(yearStartRange.offset(0, 1));
  }
  setDiscountByYear(idx, setPrice = null) {
    this.idx = idx;
    const setPrice_ = setPrice
      ? setPrice
      : (this.const_itemsDiscount / 10) * (idx + 1);
    this.setTestValue(
      this.trialSheet.getRange(
        this.trialYearsStartRow + this.idx,
        this.trialYearsDiscountCol,
      ),
      setPrice_,
    );
  }
  delDiscountByYear(idx) {
    this.idx = idx;
    this.delTestValue(
      this.trialSheet.getRange(
        this.trialYearsStartRow + this.idx,
        this.trialYearsDiscountCol,
      ),
    );
  }
  getDiscountRateValue(idx) {
    this.idx = idx;
    return this.trialSheet
      .getRange(
        this.trialYearsStartRow + this.idx,
        this.trialYearsDiscountRateCol,
      )
      .getValue();
  }
  getComputeDiscountRateByDiscountValue(idx) {
    this.idx = idx;
    return (
      1 -
      this.trialSheet
        .getRange(this.trialYearsStartRow + idx, this.trialYearsDiscountCol)
        .getValue() /
        this.const_itemsDiscount
    );
  }
  setDiscountAllPeriod(setPrice = 440000) {
    this.setTestValue(
      this.trialSheet.getRange(this.constDiscountAllPeriodRangeAddr),
      setPrice,
    );
  }
  delDiscountAllPeriod() {
    this.delTestValue(
      this.trialSheet.getRange(this.constDiscountAllPeriodRangeAddr),
    );
  }
  getDiscountRateValueAllPeriod() {
    return this.trialSheet
      .getRange(this.constDiscountAllPeriodRangeAddr)
      .offset(1, 0)
      .getValue();
  }
  getTrialYearsItemsName() {
    const trialSetupRow = TRIAL_SHEET.ROWS.TRIAL_SETUP;
    const trialClosingRow = TRIAL_SHEET.ROWS.TRIAL_CLOSING;
    return this.trialSheet
      .getRange(trialSetupRow, 1, trialClosingRow - trialSetupRow + 1, 1)
      .getValues()
      .flat();
  }
}
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
 * Get the value from "Quotation Request".
 * @param none.
 * @return {string} <array> The value of "Quotation Request".
 */
function getQuotationRequestValues_() {
  const ss = getSpreadsheet_();
  const url = ss.getSheetByName("wk_property").getRange("B2").getValue();
  const sheetname = ss.getSheetByName("wk_property").getRange("B3").getValue();
  const requestValues = SpreadsheetApp.openByUrl(url)
    .getSheetByName(sheetname)
    .getDataRange()
    .getValues();
  // Output only those records for which "Existence of Coordination Office" has been entered.
  return requestValues.filter((x, idx) => idx > 25 || idx === 0);
}
/**
 * Output the values retrieved from the "Quotation Request" spreadsheet to the "Quotation Request" sheet.
 * @param {number=} If specified in the argument, outputs the value at the specified index. Otherwise, all values are output.
 * @return none.
 */
function setQuotationRequestValuesForTest(target_idx = -1) {
  const requestValues = getQuotationRequestValues_();
  const sheetQuotationRequest =
    _cachedSheets[normalizeSheetName_(QUOTATION_REQUEST_SHEET.NAME)];
  sheetQuotationRequest.clearContents();
  const target =
    target_idx > -1
      ? requestValues.filter((x, idx) => idx === target_idx || idx === 0)
      : requestValues;
  sheetQuotationRequest
    .getRange(1, 1, target.length, target[0].length)
    .setValues(target);
}
/**
 * Get the column and row numbers.
 */
class GetTargetRowCol {
  getTargetRowIndex(targetSheet, targetIdx, targetStr) {
    const targetValues = targetSheet.getDataRange().getValues();
    const targetRowIndex = targetValues
      .map((x, idx) => (x[targetIdx] === targetStr ? idx : null))
      .filter((x) => x);
    return targetRowIndex[0];
  }
  getTargetRow(targetSheet, targetColNumber, targetStr) {
    const res = this.getTargetRowIndex(
      targetSheet,
      targetColNumber - 1,
      targetStr,
    );
    return res + 1;
  }
  getTargetColIndex(targetSheet, targetIdx, targetStr) {
    const targetValues = targetSheet.getDataRange().getValues();
    const targetColIndex = targetValues[targetIdx].indexOf(targetStr);
    return targetColIndex;
  }
  getTargetCol(targetSheet, targetRowNumber, targetStr) {
    const res = this.getTargetColIndex(
      targetSheet,
      targetRowNumber - 1,
      targetStr,
    );
    return res + 1;
  }
}
/**
 * 特定の項目が期待値と一致するか判定し、対応する値を返す
 * @param {any} actualValue 実際の値
 * @param {any} expectedValue 期待する値 (例: "あり")
 * @param {any} returnValue 一致した時に返す値 (例: 1)
 * @param {any} defaultValue 一致しない時に返す値 (デフォルトは空文字)
 */
function getValueIfMatch_(
  actualValue,
  expectedValue,
  returnValue,
  defaultValue = "",
) {
  return actualValue === expectedValue ? returnValue : defaultValue;
}
