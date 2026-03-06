/**
 * すべてのチェック項目を生成するラッパー関数。
 *
 * {@link buildTotalCheckItems_} の結果から
 * totalCheckItems と totalAmountCheckItems を抽出して返す。
 *
 * @param {Object} params チェック項目生成に必要なパラメータ
 * @returns {{
 *   totalCheckItems: Object[],
 *   totalAmountCheckItems: Object[]
 * }} 生成されたチェック項目
 */
function validationBuildAllCheckItems_(params) {
  const { totalCheckItems, totalAmountCheckItems } =
    buildTotalCheckItems_(params);

  return { totalCheckItems, totalAmountCheckItems };
}
