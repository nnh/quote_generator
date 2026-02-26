/**
 * 対象シートの値に target_items を反映した配列を返す
 * @param {string} sheetname
 * @param {Array<Array>} target_items
 * @param {Array<Array>|null} input_values
 * @return {Array<Array>}
 */
function buildSheetValuesWithTargetItems_(
  sheetname,
  target_items,
  input_values,
) {
  const array_count = input_values
    ? input_values
    : getTargetCountValues_(sheetname, initTargetColumn_());

  const target_sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);

  const array_item = get_fy_items_(
    target_sheet,
    TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
  );

  return applyTargetItemsToValues_(array_count, array_item, target_items);
}
/**
 * Mapオブジェクト（Map的構造）を [key, value] の配列（List）に変換する
 *
 * @param {Map<any, any>}
 *   キーを項目名、値を任意の値とするオブジェクト
 *
 * @return {Array.<Array.<any, any>>}
 *   [key, value] 形式の配列
 *
 * @example
 * const itemsMap = new Map([["A", 10], ["B", 20]]);
 * convertItemsMapToList_(itemsMap);
 * // => [["A", 10], ["B", 20]]
 */
function convertItemsMapToList_(map) {
  if (map instanceof Map) {
    return Array.from(map.entries());
  }
  return Object.entries(map);
}
