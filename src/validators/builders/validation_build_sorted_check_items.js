/**
 * Totalシートの検証用チェック項目を生成し、シート順に並び替える
 *
 * validationBuildAllCheckItems_ によりチェック項目を生成し、
 * Totalシートの表示順に合わせて並び替えたチェック項目を返す。
 *
 * @param {Object} params
 * @param {Object} params.quotationRequestValidationContext 見積依頼の検証コンテキスト
 * @param {number} params.facilities_value 施設数
 * @param {number} params.number_of_cases_value 症例数
 * @param {Object} params.trialContext 試験期間に関する情報
 * @param {number} params.trialContext.trialMonthsFromSheet 試験月数
 * @param {number} params.trialContext.totalMonths 試験総月数
 * @param {number} params.trialContext.fullYears 試験年数（切り捨て）
 * @param {number} params.trialContext.ceilYears 試験年数（切り上げ）
 * @param {number} params.trialContext.setup_month セットアップ月数
 * @param {number} params.trialContext.closing_month クロージング月数
 * @param {number} params.interimCount Interim回数
 * @param {number} params.closingCount Closing回数
 *
 * @returns {Object}
 * @returns {Array<Object>} returns.sortedTotalCheckItems シート順に並び替えたTotalチェック項目
 * @returns {Array<Object>} returns.totalAmountCheckItems 金額チェック項目
 */
function validationBuildSortedCheckItems_(params) {
  const {
    quotationRequestValidationContext,
    facilities_value,
    number_of_cases_value,
    trialContext,
    interimCount,
    closingCount,
  } = params;

  const { totalCheckItems, totalAmountCheckItems } =
    validationBuildAllCheckItems_({
      quotationRequestValidationContext,
      facilities_value,
      number_of_cases_value,
      trial_months: trialContext.trialMonthsFromSheet,
      total_months: trialContext.totalMonths,
      trial_year: trialContext.fullYears,
      trial_ceil_year: trialContext.ceilYears,
      setup_month: trialContext.setup_month,
      closing_month: trialContext.closing_month,
      interimCount,
      closingCount,
    });

  const sortedTotalCheckItems = alignTotalCheckItemsToSheet_(totalCheckItems);

  return {
    sortedTotalCheckItems,
    totalAmountCheckItems,
  };
}
