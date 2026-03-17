/**
 * 対象シートの値に targetItems を反映した配列を返す
 *
 * @param {string} sheetName
 * @param {Array<Array>} targetItems [itemName, value] の配列
 * @param {Array<Array>|null} inputValues
 * @return {Array<Array>}
 */
function buildSheetValuesWithTargetItems_(sheetName, targetItems, inputValues) {
  const countValues =
    inputValues ?? getTargetCountValues_(sheetName, initTargetColumn_());

  const sheet = getSheetByNameCached_(sheetName);

  const itemRowIndexMap = get_fy_items_(
    sheet,
    TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
  );

  return applyTargetItemsToValues_(countValues, itemRowIndexMap, targetItems);
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
