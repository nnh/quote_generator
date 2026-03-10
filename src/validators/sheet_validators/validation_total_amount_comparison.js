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
    amount_check[0] = buildNgMessage_(VALIDATION_MESSAGES.TOTAL_MISMATCH);
  }

  return amount_check;
}
