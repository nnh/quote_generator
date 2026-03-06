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

/** 指定列の値を1次元配列で取得 */
function getColumnValues_(sheet, col) {
  return sheet.getRange(1, col, sheet.getLastRow(), 1).getValues().flat();
}

/**
 * totalCheckItems を Items シートの並び順に揃える
 *
 * - 不足・余分チェックも行う
 * - 並び順を Items シートと同じにして返す
 *
 * @param {Array<{itemname:string,value:number}>} totalCheckItems
 * @returns {Array<{itemname:string,value:number}>} 並び順を修正した配列
 */
function alignTotalCheckItemsToSheet_(totalCheckItems) {
  const itemsSheetValues = _cachedSheets.items
    .getRange(1, 2, _cachedSheets.items.getLastRow(), 1)
    .getValues()
    .flat();

  // Itemsシート項目（税抜/税込を除去してトリム）
  const sheetItems = itemsSheetValues
    .map((item) => item.replace(/（税抜）|（税込）/g, "").trim())
    .filter((item) => item !== "");

  // コード側を Map にして itemname で高速検索
  const codeItemMap = new Map();
  totalCheckItems.forEach((item) => codeItemMap.set(item.itemname, item));

  // 不足・余分チェック
  const missingItems = sheetItems.filter((name) => !codeItemMap.has(name));
  const extraItems = totalCheckItems
    .map((item) => item.itemname)
    .filter((name) => !sheetItems.includes(name));

  if (missingItems.length > 0 || extraItems.length > 0) {
    const messages = [];
    if (missingItems.length > 0) {
      messages.push(
        "Itemsシートに存在するがチェック対象に含まれていない項目:\n" +
          missingItems.join("\n"),
      );
    }
    if (extraItems.length > 0) {
      messages.push(
        "コード側に存在するがItemsシートに存在しない項目:\n" +
          extraItems.join("\n"),
      );
    }
    console.error(messages.join("\n\n"));
  }

  // Itemsシート順に並び替え
  const alignedItems = sheetItems
    .map((name) => codeItemMap.get(name))
    .filter(Boolean); // 不足分は除外

  return alignedItems;
}
/**
 * バリデーション用に数値を正規化する。
 *
 * - 空文字（""）は 0 として扱う
 * - 数値は四捨五入して整数に変換する
 *
 * @param {*} value 正規化対象の値
 * @returns {number} 正規化された数値
 */
function validationNormalizeValue_(value) {
  return value === "" ? 0 : Math.round(value);
}

/**
 * 配列内のすべての値が同一かどうかを判定する。
 *
 * @param {number[]} values 比較対象の数値配列
 * @returns {boolean} すべて同じ値であれば true、それ以外は false
 */
function validationAreAllValuesEqual_(values) {
  return values.every((v) => v === values[0]);
}

/**
 * 年度シートから「合計」と「特別値引後合計」の値を取得する。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 対象のシート
 * @returns {{sumValue:number, discountValue:number}}
 *   - sumValue: 合計値
 *   - discountValue: 特別値引後合計
 */
function validationGetYearSheetTotals_(sheet) {
  const getRowCol = new GetTargetRowCol();

  const sumRow = getRowCol.getTargetRow(sheet, 2, ITEM_LABELS.SUM);
  const sumCol = getRowCol.getTargetCol(sheet, 4, ITEM_LABELS.AMOUNT);

  const sumValue = sheet.getRange(sumRow, sumCol).getValue();
  const discountValue = sheet.getRange(sumRow + 1, sumCol).getValue();

  return { sumValue, discountValue };
}
