/**
 * 対象シートのカウント列Rangeを取得
 * @param {string} sheetname
 * @param {string} target_col 列記号（例："E"）
 * @return {Range}
 */
function getTargetCountRange_(sheetname, target_col) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
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
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
  const row = get_row_num_matched_value_(
    sheet,
    TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
    itemname,
  );
  return sheet.getRange(row, TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT).getValue();
}
