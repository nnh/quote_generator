/**
 * Totalシートから中間解析数とクロージング数を取得する。
 *
 * targetTotal に含まれるシート情報と項目行マップを利用し、
 * 以下の件数を取得する。
 *
 * - 中間解析報告書作成（出力結果＋表紙）
 * - データベース固定作業、クロージング
 *
 * @param {Object} targetTotal Totalシート参照情報
 * @param {GoogleAppsScript.Spreadsheet.Sheet} targetTotal.sheet 対象シート
 * @param {Object.<string, number>} targetTotal.array_item 項目名 → 行番号 のマップ
 * @param {number} targetTotal.col 件数が格納されている列番号
 *
 * @returns {{
 *   interimCount: number,
 *   closingCount: number
 * }} 中間解析数とクロージング数
 */
function validationGetTargetCounts_(targetTotal) {
  const interimCount = targetTotal.sheet
    .getRange(
      targetTotal.array_item["中間解析報告書作成（出力結果＋表紙）"],
      targetTotal.col,
    )
    .getValue();
  const closingCount = targetTotal.sheet
    .getRange(
      targetTotal.array_item["データベース固定作業、クロージング"],
      targetTotal.col,
    )
    .getValue();
  return { interimCount, closingCount };
}
