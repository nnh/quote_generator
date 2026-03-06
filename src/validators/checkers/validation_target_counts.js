/** targetTotalから中間解析・クロージング数を取得 */
function getTargetCounts_(targetTotal) {
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
