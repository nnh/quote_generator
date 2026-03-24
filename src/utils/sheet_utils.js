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
  const row = findRowByValue_(
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
 * 指定列から値に一致する最初の行番号を返す
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 対象シート
 * @param {number} columnNumber 検索対象の列番号（1始まり）
 * @param {*} targetValue 検索する値
 * @return {number} 見つかった行番号（1始まり）。見つからなければ 0
 */
function findRowByValue_(sheet, columnNumber, targetValue) {
  if (!sheet) {
    throw new Error("Invalid sheet");
  }

  if (!Number.isInteger(columnNumber) || columnNumber <= 0) {
    throw new Error("Invalid columnNumber: " + columnNumber);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow === 0) return 0;

  const values = sheet.getRange(1, columnNumber, lastRow, 1).getValues();

  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === targetValue) {
      return i + 1;
    }
  }

  return 0;
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

/**
 * 指定した列から「項目名 → 行番号」のマップを生成する。
 *
 * シートの指定列を上から順に走査し、値をキー、行番号（1始まり）を値として
 * オブジェクトに格納する。
 * 同名の項目が複数存在する場合は、最後に出現した行番号を採用する。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 対象のシートオブジェクト
 * @param {number|string} itemColumnNumber 項目名が格納されている列番号（1始まり）
 * @returns {Object.<string, number>} 項目名と行番号の対応マップ
 *
 * @example
 * const itemRowMap = buildItemRowIndexMap_(sheet, 2);
 * // 例: { "契約・支払手続": 24, "バリデーション報告書": 39 }
 */

function buildItemRowIndexMap_(sheet, itemColumnNumber) {
  const columnNumber = Number(itemColumnNumber);

  if (!Number.isInteger(columnNumber) || columnNumber <= 0) {
    throw new Error(
      `buildItemRowIndexMap_: 列番号は1以上の整数で指定してください: ${itemColumnNumber}`,
    );
  }

  const values = sheet
    .getRange(1, columnNumber, sheet.getLastRow(), 1)
    .getValues();

  const itemRowMap = {};
  // 同名項目が複数ある場合は最後の行番号を採用する
  for (let i = 0; i < values.length; i++) {
    const value = values[i][0];
    if (value !== "" && value != null) {
      itemRowMap[value] = i + 1;
    }
  }
  return itemRowMap;
}
