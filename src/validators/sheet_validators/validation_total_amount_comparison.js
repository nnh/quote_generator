/**
 * Total / Total2 / Total3 の合計金額チェック
 *
 * @param {number} totalTotalAmountValue Totalの合計金額
 * @param {number} total2TotalAmountValue Total2の合計金額
 * @param {number} total3TotalAmountValue Total3の合計金額
 * @returns {ValidationRow}
 */
function validationCompareTotalAmounts_(
  totalTotalAmountValue,
  total2TotalAmountValue,
  total3TotalAmountValue,
) {
  const amount_check = [null, "Total, Total2, Total3の合計金額チェック"];

  if (
    totalTotalAmountValue === total2TotalAmountValue &&
    totalTotalAmountValue === total3TotalAmountValue
  ) {
    amount_check[0] = VALIDATION_STATUS.OK;
    amount_check[1] = amount_check[1] + " ,想定値:" + totalTotalAmountValue;
  } else {
    amount_check[0] = validationBuildNgMessage_(
      VALIDATION_MESSAGES.TOTAL_MISMATCH,
    );
  }

  return amount_check;
}
