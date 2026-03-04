function evaluateCheckItems_(params) {
  const {
    total_checkitems,
    total_ammount_checkitems,
    target_total,
    target_total_ammount,
    interim_count,
    closing_count,
  } = params;

  // データクリーニング項目追加
  total_checkitems.push({
    itemname: "データクリーニング",
    value: interim_count + closing_count,
  });

  const discount_byYear = checkDiscountByYearSheet_().every((x) => x)
    ? "OK"
    : "NG：値が想定と異なる";

  const temp_check_1 = [];
  temp_check_1.push([
    discount_byYear,
    "Setup〜Closingシートの特別値引後合計のチェック",
  ]);
  temp_check_1.push(compareTotalSheetTotaltoVerticalTotal_());
  temp_check_1.push(compareTotal2Total3SheetVerticalTotalToHorizontalTotal_());
  temp_check_1.push([
    checkQuoteSum_().every((x) => x) ? "OK" : "NG：値が想定と異なる",
    "Quote, total, total2, total3の合計・特別値引後合計一致チェック",
  ]);
  temp_check_1.push(
    compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_(),
  );

  const targetTotalColumnValues = target_total.sheet
    .getRange(1, target_total.col, target_total.sheet.getLastRow(), 1)
    .getValues()
    .flat();

  const res_total = total_checkitems.map((checkitems) =>
    check_itemName_and_value_(
      target_total,
      targetTotalColumnValues,
      checkitems.itemname,
      checkitems.value,
    ),
  );

  const targetTotalAmountColumnValues = target_total_ammount.sheet
    .getRange(
      1,
      target_total_ammount.col,
      target_total_ammount.sheet.getLastRow(),
      1,
    )
    .getValues()
    .flat();

  const res_total_ammount = total_ammount_checkitems.map((checkitems) =>
    check_itemName_and_value_(
      target_total_ammount,
      targetTotalAmountColumnValues,
      checkitems.itemname,
      checkitems.value,
    ),
  );

  const output_values_1 = res_total.concat(res_total_ammount);
  const output_values = output_values_1.concat(temp_check_1);

  return output_values;
}
