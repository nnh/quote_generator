/**
 * target_items を array_count に反映する
 *
 * @param {Array.<Array>} array_count 既存の値配列
 * @param {Object} array_item 項目名 → 行番号のマップ
 * @param {Array.<Array>} target_items [itemName, value] の配列
 * @return {Array.<Array>} 更新後の array_count
 */
function applyTargetItemsToValues_(array_count, array_item, target_items) {
  target_items.forEach((target_item) => {
    const target_items_name = target_item[0];
    const month_count = target_item[1];
    const temp_row = array_item[target_items_name] - 1;

    if (!Number.isNaN(temp_row)) {
      array_count[temp_row][0] = month_count;
    }
  });

  return array_count;
}
