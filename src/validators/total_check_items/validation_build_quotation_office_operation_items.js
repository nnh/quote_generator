/**
 * 事務局運営のチェック項目を作成する
 *
 * 以下の条件のいずれかを満たす場合に試験事務局運営が発生する
 * - 医師主導試験
 * - 事務局設置あり
 * - 資金源が企業
 *
 * @param {Object} params
 * @param {number} params.setup_month 試験開始前の設置月数
 * @param {number} params.trial_months 試験期間（月）
 * @param {Object} params.quotationRequestValidationContext 見積依頼コンテキスト
 * @param {string} params.quotationRequestValidationContext.trialType 試験種別
 * @param {string} params.quotationRequestValidationContext.coordinatingOfficeSetup 事務局設置の有無
 * @param {string} params.quotationRequestValidationContext.fundingSource 資金源
 * @returns {Array<{itemname:string,value:number}>} 事務局運営チェック項目
 */
function buildQuotationOfficeOperationItems_(params) {
  const {
    setup_month,
    trial_months,
    quotationRequestValidationContext: ctx,
  } = params;

  const isOfficeApplicable =
    ctx.trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED ||
    ctx.coordinatingOfficeSetup === COMMON_EXISTENCE_LABELS.YES ||
    ctx.fundingSource === QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL;

  const trialOffice = isOfficeApplicable ? trial_months : 0;
  const preTrialOffice = isOfficeApplicable ? setup_month : 0;
  const endTrialOffice = isOfficeApplicable ? 1 : 0;

  return [
    {
      itemname: "事務局運営（試験開始後から試験終了まで）",
      value: trialOffice,
    },
    { itemname: "事務局運営（試験開始前）", value: preTrialOffice },
    { itemname: "事務局運営（試験終了時）", value: endTrialOffice },
  ];
}
