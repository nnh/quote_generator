/**
 * 指定列の縦計を計算する。
 *
 * 空白セルやラベル行は除外して数値のみ合計する。
 *
 * @param {Array<Array<*>>} rows シートの全データ
 * @param {number} columnIndex 対象列（1-based index）
 * @returns {number} 縦計
 */
function validationCalculateVerticalTotal_(rows, columnIndex) {
  const TOTAL_LABEL = "　合計金額";

  return rows
    .map((row) => row[columnIndex])
    .filter((value) => value !== "" && value !== TOTAL_LABEL)
    .map(validationNormalizeValue_)
    .reduce((sum, value) => sum + value, 0);
}
