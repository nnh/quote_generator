/**
 *　合計値チェックのためのバリデーションを実行する
 * @param {Object} totals
 * @param {Object} quoteSheetInfo
 * @returns {ValidationRow[]}
 */
function validationRunCrossSheetValidations_(totals, quoteSheetInfo) {
  const validationCompareTotalSheetTotalToVerticalTotalWithMessage =
    validationCompareTotalSheetTotalToVerticalTotal_(
      totals.totalSheetValues,
      totals.totalSheetInfo,
      totals.totalTotalAmountValue,
    );

  const comparator = new ValidationTotal2Total3Validator(
    totals.total2SheetInfo,
    totals.total3SheetInfo,
    totals.total2SheetValues,
    totals.total3SheetValues,
  );

  const total2Total3ValidatorVerticalTotalToHorizontalTotalWithMessage =
    validationTotal2Total3ValidatorVerticalTotalToHorizontalTotal_(comparator);

  const total2Total3ValidatorVerticalTotalToHorizontalDiscountTotalWithMessage =
    validationTotal2Total3ValidatorVerticalTotalToHorizontalDiscountTotal_(
      comparator,
    );

  const checkQuoteSum_message = validationBuildMessage_(
    () =>
      validationCheckQuoteSum_(
        quoteSheetInfo.amountValue,
        totals.totalTotalAmountValue,
        totals.total2TotalAmountValue,
        totals.total3TotalAmountValue,
        quoteSheetInfo.discountTotalValue,
        totals.totalDiscountTotalValue,
        totals.total2DiscountTotalValue,
        totals.total3DiscountTotalValue,
      ),
    "Quote, total, total2, total3の合計・特別値引後合計一致チェック",
  );

  const discount_byYear_message = validationBuildMessage_(
    validationCheckDiscountByYearSheet_,
    "Setup〜Closingシートの特別値引後合計のチェック",
  );

  return [
    discount_byYear_message,
    validationCompareTotalSheetTotalToVerticalTotalWithMessage,
    total2Total3ValidatorVerticalTotalToHorizontalTotalWithMessage,
    checkQuoteSum_message,
    total2Total3ValidatorVerticalTotalToHorizontalDiscountTotalWithMessage,
  ];
}
