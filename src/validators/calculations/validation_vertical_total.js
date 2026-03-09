/**
 * 指定列の縦計を計算する。
 *
 * 空白セルやラベル行は除外して数値のみ合計する。
 *
 * @param {Array<Array<*>>} rows シートの全データ
 * @param {number} labelColumnIndex ラベル列のインデックス
 * @param {string} labelText ラベルのテキスト
 * @returns {number} 縦計
 */
function validationCalculateVerticalTotal_(rows, labelColumnIndex, labelText) {
  return rows
    .map((row) => row[labelColumnIndex])
    .filter((value) => value !== "" && value !== labelText)
    .map(validationNormalizeValue_)
    .reduce((sum, value) => sum + value, 0);
}
