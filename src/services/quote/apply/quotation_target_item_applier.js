/**
 * targetItems の値を counts 配列に反映して新しい配列を返す
 *
 * @param {Array.<Array>} counts 既存の値配列
 * @param {Object} itemToRowMap 項目名 → 行番号のマップ
 * @param {Array.<Array>} targetItems [itemName, value] の配列
 * @return {Array.<Array>} 更新後の新しい counts 配列
 */
function applyTargetItemsToValues_(counts, itemToRowMap, targetItems) {
  const VALUE_COLUMN = 0; // 更新する列のインデックス

  // 元配列をコピー
  const updatedCounts = counts.map((row) => [...row]);

  for (const [itemName, value] of targetItems) {
    const rowIndex = itemToRowMap[itemName] - 1;

    if (rowIndex >= 0) {
      updatedCounts[rowIndex][VALUE_COLUMN] = value;
    }
  }

  return updatedCounts;
}
