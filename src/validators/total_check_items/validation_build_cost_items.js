/**
 * コスト関連作業項目を構築する。
 *
 * CRB申請費用、監査費用、保険料、
 *
 * 【含まれる項目】
 * ・名古屋医療センターCRB申請費用(初年度)
 * ・名古屋医療センターCRB申請費用(2年目以降)
 * ・外部監査費用
 * ・施設監査費用
 * ・保険料（数量）
 *
 * @param {Object} params
 * @param {Object} params.quotationRequestValidationContext
 * @param {number} params.trial_year
 *
 * @return {Object}
 * @return {Array<Object>} return.totalCheckItems
 * @return {Array<Object>} return.totalAmountCheckItems
 */
function buildCostItems_(params) {
  const { quotationRequestValidationContext, trial_year } = params;

  const totalCheckItems = [];
  const totalAmountCheckItems = [];

  /** ===== CRB ===== */
  const isCrbYes =
    quotationRequestValidationContext.crbApplication ===
      COMMON_EXISTENCE_LABELS.YES &&
    quotationRequestValidationContext.trialType ===
      TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL;

  totalCheckItems.push({
    itemname: "名古屋医療センターCRB申請費用(初年度)",
    value: isCrbYes ? 1 : 0,
  });

  totalCheckItems.push({
    itemname: "名古屋医療センターCRB申請費用(2年目以降)",
    value: isCrbYes && trial_year > 1 ? trial_year - 1 : 0,
  });

  /** ===== 監査費 ===== */
  const auditTargetCount =
    quotationRequestValidationContext.auditTargetSiteCount || 0;

  totalCheckItems.push({
    itemname: "外部監査費用",
    value: auditTargetCount > 0 ? 2 : 0,
  });

  totalCheckItems.push({
    itemname: "施設監査費用",
    value: auditTargetCount > 0 ? auditTargetCount : 0,
  });

  /** ===== 保険 ===== */
  const insuranceFee = quotationRequestValidationContext.insuranceFee || 0;

  totalCheckItems.push({
    itemname: "保険料",
    value: insuranceFee > 0 ? 1 : 0,
  });

  totalAmountCheckItems.push({
    itemname: "保険料",
    value: insuranceFee > 0 ? insuranceFee : 0,
  });

  return {
    totalCheckItems,
    totalAmountCheckItems,
  };
}
