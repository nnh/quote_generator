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
