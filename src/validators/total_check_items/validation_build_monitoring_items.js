/**
 * モニタリング関連のチェック項目を作成する。
 *
 * 以下の3項目のチェックデータを作成して配列で返す。
 * - モニタリング準備業務（関連資料作成）
 * - 開始前モニタリング・必須文書確認
 * - 症例モニタリング・SAE対応
 *
 * 戻り値は `totalCheckItems.push(...items)` のように
 * そのまま展開して追加できる形式になっている。
 *
 * @param {Object} params
 * @param {number} params.facilities_value 施設数
 * @param {number} params.number_of_cases_value 症例数
 * @param {number} params.trial_ceil_year 試験年数（切り上げ）
 * @param {Object} params.quotationRequestValidationContext 見積依頼コンテキスト
 * @param {number|string} params.quotationRequestValidationContext.monitoringVisitsPerCase 症例ごとのモニタリング回数
 * @param {number|string} params.quotationRequestValidationContext.annualRequiredDocMonitoringPerSite 施設ごとの年間必須文書モニタリング回数
 *
 * @returns {{
 *   itemname: string,
 *   value: number
 * }[]} モニタリング関連チェック項目配列
 */
function buildMonitoringItems_(params) {
  const {
    facilities_value,
    number_of_cases_value,
    trial_ceil_year,
    quotationRequestValidationContext,
  } = params;

  const monitoringPreparationDocumentCreation_value =
    quotationRequestValidationContext.monitoringVisitsPerCase > 0 ? 1 : 0;

  const preStudyMonitoringAndEssentialDocumentReview_value =
    quotationRequestValidationContext.annualRequiredDocMonitoringPerSite > 0
      ? parseInt(
          quotationRequestValidationContext.annualRequiredDocMonitoringPerSite,
        ) *
        facilities_value *
        trial_ceil_year
      : 0;

  const caseMonitoringAndSAESupport_value =
    quotationRequestValidationContext.monitoringVisitsPerCase > 0
      ? parseInt(quotationRequestValidationContext.monitoringVisitsPerCase) *
        number_of_cases_value
      : 0;

  return [
    {
      itemname: "モニタリング準備業務（関連資料作成）",
      value: monitoringPreparationDocumentCreation_value,
    },
    {
      itemname: "開始前モニタリング・必須文書確認",
      value: preStudyMonitoringAndEssentialDocumentReview_value,
    },
    {
      itemname: "症例モニタリング・SAE対応",
      value: caseMonitoringAndSAESupport_value,
    },
  ];
}
