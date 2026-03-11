/**
 * 年度別シートの割引後金額を検証する
 *
 * 対象シートごとに割引率を適用した金額が正しいかをチェックする。
 * シートごとの結果（OK/NG）を配列で返す。
 *
 * @param {string[]|null} [targetSheetsName=null] - 検証対象のシート名配列。指定がない場合は試験年度シートを取得して使用する。
 * @returns {boolean[]} 各シートの検証結果。true: OK / false: NG
 */
function validationCheckDiscountByYearSheet_(targetSheetsName = null) {
  const setVal = new SetTestValues();
  const target = targetSheetsName
    ? targetSheetsName
    : setVal.getTrialYearsItemsName();
  const res = target.map((x, idx) =>
    validationCheckAmountByYearSheet_(x, setVal.getDiscountRateValue(idx)),
  );
  if (!res.every((x) => x)) {
    console.log("checkDiscountByYearSheet NG\n" + target + "\n" + res);
  }
  return res;
}
