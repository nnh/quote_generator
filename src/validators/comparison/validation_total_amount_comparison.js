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
 * @function compareTotalAmounts_
 * @param {number} output_row - Checkシートに書き込む現在の行番号
 * @returns {number} 次に書き込む行番号
 */
function compareTotalAmounts_(output_row) {
  const total_total_ammount = getValidationTotalAmount_({
    sheet: _cachedSheets.total,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 4,
    total_col_itemname: ITEM_LABELS.AMMOUNT,
  });
  const total2_total_ammount = getValidationTotalAmount_({
    sheet: _cachedSheets.total2,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 4,
    total_col_itemname: ITEM_LABELS.SUM,
  });
  const total3_total_ammount = getValidationTotalAmount_({
    sheet: _cachedSheets.total3,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 3,
    total_col_itemname: ITEM_LABELS.SUM,
  });
  const ammount_check = [null, "Total, Total2, Total3の合計金額チェック"];
  if (
    (total_total_ammount === total2_total_ammount) &
    (total_total_ammount === total3_total_ammount)
  ) {
    ammount_check[0] = VALIDATION_STATUS.OK;
    ammount_check[1] = ammount_check[1] + " ,想定値:" + total_total_ammount;
  } else {
    ammount_check[0] = buildNgMessage_(VALIDATION_MESSAGES.TOTAL_MISMATCH);
  }
  output_row++;
  _cachedSheets.check
    .getRange(output_row, 1, 1, ammount_check.length)
    .setValues([ammount_check]);
  return output_row;
}
