/**
 * 対象シートのカウント列Rangeを取得
 * @param {string} sheetname
 * @param {string} target_col 列記号（例："E"）
 * @return {Range}
 */
function getTargetCountRange_(sheetname, target_col) {
  const sheet = getSheetByNameCached_(sheetname);
  return sheet.getRange(target_col + ":" + target_col);
}

/**
 * 対象シートのカウント列の値を取得
 * @param {string} sheetname
 * @param {string} target_col
 * @return {Array<Array<any>>}
 */
function getTargetCountValues_(sheetname, target_col) {
  return getTargetCountRange_(sheetname, target_col).getValues();
}

/**
 * 対象シートのカウント列に値をセット
 * @param {string} sheetname
 * @param {string} target_col
 * @param {Array<Array<any>>} values
 */
function setTargetCountValues_(sheetname, target_col, values) {
  getTargetCountRange_(sheetname, target_col).setValues(values);
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
