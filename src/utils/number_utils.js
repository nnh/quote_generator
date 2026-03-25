/**
 * 値を安全に数値へ変換する。
 *
 * 以下の場合は null を返す：
 * - null / undefined / 空文字
 * - 数値に変換できない値（NaN, Infinity など）
 *
 * @param {*} value 変換対象の値
 * @return {number|null} 変換後の数値、または変換不可の場合は null
 */
function toSafeNumber_(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
