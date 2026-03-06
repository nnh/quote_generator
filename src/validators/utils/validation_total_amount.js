/**
 * @typedef {Object} TotalAmountTarget
 * @property {GoogleAppsScript.Spreadsheet.Sheet} sheet 対象シート
 * @property {string} item_cols 項目名が格納されているRange
 * @property {number} header_row ヘッダー行番号
 * @property {string} total_row_itemname 合計行の項目名
 * @property {string} total_col_itemname 合計列のヘッダー名
 */

/**
 * 指定されたシートから対象の合計金額セルの値を取得する。
 *
 * @param {TotalAmountTarget} target
 * @returns {*} 指定セルの値
 */
function getValidationTotalAmount_(target) {
  const items = target.sheet.getRange(target.item_cols).getValues().flat();
  const target_row = items.indexOf(target.total_row_itemname) + 1;
  const header = target.sheet
    .getRange(target.header_row, 1, 1, target.sheet.getLastColumn())
    .getValues()
    .flat();
  const target_col = header.indexOf(target.total_col_itemname) + 1;
  return target.sheet.getRange(target_row, target_col).getValue();
}
