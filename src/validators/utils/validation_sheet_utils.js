/**
 * 2次元配列から指定したラベルの位置を検索する。
 *
 * @param {Array<Array<*>>} values シートの全データ
 * @param {"row"|"col"} direction 検索方向
 * @param {number} index 対象行または列インデックス（0-based）
 * @param {string} targetStr 検索する文字列
 * @returns {number} 見つかったインデックス（0-based）。見つからない場合は -1
 */
function validationFindIndex_(values, direction, index, targetStr) {
  if (direction === "row") {
    return values[index].indexOf(targetStr);
  }

  if (direction === "col") {
    return values.findIndex((row) => row[index] === targetStr);
  }

  return -1;
}
/**
 * 指定列から一致する文字列の行インデックスを取得する（0-based）
 *
 * @param {Array<Array<*>>} values シートの全データ
 * @param {number} columnIndex 検索対象列インデックス（0-based）
 * @param {string} targetStr 検索する文字列
 * @returns {number} 行インデックス（0-based）。見つからない場合は -1
 */
function validationFindRowIndex_(values, columnIndex, targetStr) {
  return validationFindIndex_(values, "col", columnIndex, targetStr);
}

/**
 * 指定行から一致する文字列の列インデックスを取得する（0-based）
 *
 * @param {Array<Array<*>>} values シートの全データ
 * @param {number} rowIndex 検索対象行インデックス（0-based）
 * @param {string} targetStr 検索する文字列
 * @returns {number} 列インデックス（0-based）。見つからない場合は -1
 */
function validationFindColIndex_(values, rowIndex, targetStr) {
  return validationFindIndex_(values, "row", rowIndex, targetStr);
}

/**
 * 配列内から指定した文字列のインデックスを取得する。
 *
 * 指定した文字列が配列内に存在する場合は、その最初の位置（0-based）を返す。
 * 存在しない場合は -1 を返す。
 *
 * @param {Array<*>} values 検索対象の配列
 * @param {string} targetStr 検索する文字列
 * @returns {number} 該当する要素のインデックス（0-based）。見つからない場合は -1
 */
function validationGetTargetColIndex_(values, targetStr) {
  return values.indexOf(targetStr);
}

/**
 * 配列内から指定した文字列の列番号（1-based）を取得する。
 *
 * 指定した文字列が配列内に存在する場合は、その列番号（1から始まる）を返す。
 * 見つからない場合は -1 を返す。
 *
 * @param {string[]} values 検索対象の文字列配列
 * @param {string} targetStr 検索する文字列
 * @returns {number} 列番号（1-based）。見つからない場合は -1
 */
function validationGetTargetColNumber_(values, targetStr) {
  const colIndex = validationGetTargetColIndex_(values, targetStr);
  if (colIndex !== -1) {
    return colIndex + 1;
  }
  return -1;
}

/**
 * 指定したシートの1行分の値を文字列配列として取得する。
 *
 * rowNumber は 1 行のみを対象とし、シートの最終列までの値を取得する。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 対象シート
 * @param {number} rowNumber 取得する行番号（1-based）
 * @returns {string[]} 指定行のセル値を文字列に変換した配列
 */
function validationGetRowValuesAsStrings_(sheet, rowNumber) {
  return sheet
    .getRange(rowNumber, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map((v) => String(v));
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
  const targetValues = validationGetSheetValues_(sheet, sheet.getLastColumn());
  const targetColIndex = 1;
  const sumRowIndex = validationFindRowIndex_(
    targetValues,
    targetColIndex,
    ITEM_LABELS.SUM,
  );
  const targetRowIndex = 3;
  const sumColIndex = validationFindColIndex_(
    targetValues,
    targetRowIndex,
    ITEM_LABELS.AMOUNT,
  );
  const sumValue = targetValues[sumRowIndex][sumColIndex];
  const discountValue = targetValues[sumRowIndex + 1][sumColIndex];

  return { sumValue, discountValue };
}

function validationGetSheetValues_(sheet, lastColumnNumber) {
  const lastRowNumber = sheet.getLastRow();
  return sheet.getRange(1, 1, lastRowNumber, lastColumnNumber).getValues();
}
