/**
 * プロトコル関連作業項目を構築する。
 *
 * プロトコルレビュー、PMDA/AMED対応、
 * プロジェクト管理、キックオフ等の
 * 上流業務項目を生成する。
 *
 * @param {Object} params
 * @param {Object} params.quotationRequestValidationContext Quotation Requestシートの入力値をまとめたMapオブジェクト
 * @param {string} params.facilities_value 施設数
 * @param {number} params.total_months 契約期間（月数）
 * @return {Array<Object>}
 */
function buildProtocolItems_(params) {
  const { quotationRequestValidationContext, facilities_value, total_months } =
    params;

  const items = [];

  items.push({ itemname: "プロトコルレビュー・作成支援", value: 1 });

  items.push({ itemname: "検討会実施（TV会議等）", value: 4 });

  items.push({
    itemname: "PMDA相談資料作成支援",
    value: getValueIfMatch_(
      quotationRequestValidationContext.pmdaConsultingSupport,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  items.push({
    itemname: "AMED申請資料作成支援",
    value: getValueIfMatch_(
      quotationRequestValidationContext.amedApplicationSupport,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  items.push({ itemname: "プロジェクト管理", value: total_months });

  items.push({
    itemname: "キックオフミーティング準備・実行",
    value: getValueIfMatch_(
      quotationRequestValidationContext.kickoffMeeting,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  items.push({
    itemname: "症例検討会準備・実行",
    value: getValueIfMatch_(
      quotationRequestValidationContext.caseReviewMeeting,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  items.push({
    itemname: "薬剤対応",
    value: getValueIfMatch_(
      quotationRequestValidationContext.trialType,
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED,
      facilities_value,
      0,
    ),
  });

  items.push({ itemname: "PMDA対応、照会事項対応", value: 0 });

  items.push({
    itemname: "監査対応",
    value: getValueIfMatch_(
      quotationRequestValidationContext.trialType,
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED,
      1,
      0,
    ),
  });

  items.push({
    itemname: "SOP一式、CTR登録案、TMF管理",
    value: getValueIfMatch_(
      quotationRequestValidationContext.trialType,
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED,
      1,
      0,
    ),
  });

  const [irbApprobal_name, irbApproval_value] =
    quotationRequestValidationContext.trialType ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
      ? ["IRB承認確認、施設管理", facilities_value]
      : ["IRB準備・承認確認", 0];

  items.push({
    itemname: irbApprobal_name,
    value: irbApproval_value,
  });

  items.push({
    itemname: "特定臨床研究法申請資料作成支援",
    value: getValueIfMatch_(
      quotationRequestValidationContext.trialType,
      TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL,
      facilities_value,
      0,
    ),
  });

  items.push({
    itemname: "契約・支払手続、実施計画提出支援",
    value: 0,
  });

  return items;
}
