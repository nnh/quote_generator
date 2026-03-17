/**
 * 対象シートの指定列のRangeを取得
 * @param {string} sheetName
 * @param {string} columnName 列記号（例："E"）
 * @return {GoogleAppsScript.Spreadsheet.Range}
 */
function getColumnRange_(sheetName, columnName) {
  const sheet = getSheetByNameCached_(sheetName);
  return sheet.getRange(`${columnName}:${columnName}`);
}
/**
 * 対象シートのカウント列の値を取得
 * @param {string} sheetname
 * @param {string} target_col
 * @return {Array<Array<any>>}
 */
function getTargetCountValues_(sheetName, columnName) {
  return getColumnRange_(sheetName, columnName).getValues();
}

/**
 * 対象シートの指定列に値をセット
 * @param {string} sheetName
 * @param {string} columnName
 * @param {Array<Array<any>>} values
 * @return {void}
 */
function setColumnValues_(sheetName, columnName, values) {
  getColumnRange_(sheetName, columnName).setValues(values);
}

/**
 * 対象項目の回数を取得
 * @param {string} sheetname
 * @param {string} itemname
 * @return {number}
 */
function getTargetItemCount_(sheetname, itemname) {
  const sheet = getSheetByNameCached_(sheetname);
  const row = get_row_num_matched_value_(
    sheet,
    TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
    itemname,
  );
  return sheet.getRange(row, TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT).getValue();
}

/**
 * 二次元配列から指定列の値を検索し、最初に一致した行インデックスを返す
 * @param {Array<Array<*>>} values getValues() の戻り値
 * @param {number} columnIndex 0始まりの列インデックス
 * @param {*} value 検索値
 * @return {number|null} 行インデックス（0始まり）
 */
function findRowIndexByValue_(values, columnIndex, value) {
  for (let i = 0; i < values.length; i++) {
    if (values[i][columnIndex] === value) {
      return i;
    }
  }

  return null;
}

/**
 * 指定列から値を検索し、最初に一致した行番号を返す
 * @param {Sheet} sheet
 * @param {number} column
 * @param {*} value
 * @return {number|null}
 */
function findRowByValue_(sheet, column, value) {
  const lastRow = sheet.getLastRow();

  const values = sheet.getRange(1, column, lastRow, 1).getValues();

  const rowIndex = findRowIndexByValue_(values, 0, value);
  return rowIndex !== null ? rowIndex + 1 : null;
}

/**
 * 二次元配列から指定行の値を検索し、最初に一致した列インデックスを返す
 * @param {Array<Array<*>>} values getValues() の戻り値
 * @param {number} rowIndex 0始まりの行インデックス
 * @param {*} value 検索値
 * @return {number|null} 列インデックス（0始まり）
 */
function findColumnIndexByValue_(values, rowIndex, value) {
  const row = values[rowIndex];

  if (!row) return null;

  for (let i = 0; i < row.length; i++) {
    if (row[i] === value) {
      return i;
    }
  }

  return null;
}

/**
 * 指定行から値を検索し、最初に一致した列番号を返す
 * @param {Sheet} sheet
 * @param {number} row
 * @param {*} value
 * @return {number|null}
 */
function findColumnByValue_(sheet, row, value) {
  const lastColumn = sheet.getLastColumn();

  const values = sheet.getRange(row, 1, 1, lastColumn).getValues();

  const columnIndex = findColumnIndexByValue_(values, 0, value);
  return columnIndex !== null ? columnIndex + 1 : null;
}

/**
 * シートの表示状態を制御する
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {boolean} isVisible true: 表示 / false: 非表示
 */
function setSheetVisibility_(sheet, isVisible) {
  if (isVisible) {
    sheet.showSheet();
  } else {
    sheet.hideSheet();
  }
}

/**
 * 列名から列番号を返す
 * @param {string} columnName 列名（"A", "B", "AA" など）
 * @return {number} Aなら1、AAなら27 のような列番号
 */
function getColumnNumber_(columnName) {
  if (typeof columnName !== "string" || columnName.trim() === "") {
    throw new Error(`getColumnNumber_: invalid column name: ${columnName}`);
  }

  const colStr = columnName.trim().toUpperCase();

  if (!/^[A-Z]+$/.test(colStr)) {
    throw new Error(
      `getColumnNumber_: invalid column name format: ${columnName}`,
    );
  }

  let columnNumber = 0;

  for (let i = 0; i < colStr.length; i++) {
    columnNumber = columnNumber * 26 + (colStr.charCodeAt(i) - 64);
  }

  return columnNumber;
}

/**
 * 列番号から列名を返す
 * @param {number|string} columnNumber 列番号（数値または数値文字列）
 * @return {string} 1ならA、27ならAA のような列名
 */
function getColumnString_(columnNumber) {
  const colNum = Number(columnNumber);

  if (!Number.isInteger(colNum) || colNum <= 0) {
    throw new Error(`getColumnString_: invalid column number: ${columnNumber}`);
  }

  let result = "";
  let num = colNum;

  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }

  return result;
}
