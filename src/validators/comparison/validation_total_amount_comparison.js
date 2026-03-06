/**
 * Total / Total2 / Total3 シートの合計金額を比較する
 *
 * 各シートの「合計行」の金額を取得し、3シートの値が一致しているかを確認する。
 * - 一致している場合: VALIDATION_STATUS.OK を出力
 * - 不一致の場合: NGメッセージを出力
 *
 * チェック結果は Check シートに書き込み、
 * 次に書き込む行番号を返す。
 *
 * @function validationCompareTotalAmounts_
 * @param {number} output_row - Checkシートに書き込む現在の行番号
 * @returns {number} 次に書き込む行番号
 */
function validationCompareTotalAmounts_(output_row) {
  const total_total_amount = getValidationTotalAmount_({
    sheet: _cachedSheets.total,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 4,
    total_col_itemname: ITEM_LABELS.AMOUNT,
  });
  const total2_total_amount = getValidationTotalAmount_({
    sheet: _cachedSheets.total2,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 4,
    total_col_itemname: ITEM_LABELS.SUM,
  });
  const total3_total_amount = getValidationTotalAmount_({
    sheet: _cachedSheets.total3,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 3,
    total_col_itemname: ITEM_LABELS.SUM,
  });
  const amount_check = [null, "Total, Total2, Total3の合計金額チェック"];
  if (
    (total_total_amount === total2_total_amount) &
    (total_total_amount === total3_total_amount)
  ) {
    amount_check[0] = VALIDATION_STATUS.OK;
    amount_check[1] = amount_check[1] + " ,想定値:" + total_total_amount;
  } else {
    amount_check[0] = buildNgMessage_(VALIDATION_MESSAGES.TOTAL_MISMATCH);
  }
  output_row++;
  _cachedSheets.check
    .getRange(output_row, 1, 1, amount_check.length)
    .setValues([amount_check]);
  return output_row;
}
