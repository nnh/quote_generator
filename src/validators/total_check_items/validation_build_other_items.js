function validationBuildAuditItems_() {
  return [
    { itemname: "監査計画書作成", value: 0 },
    { itemname: "施設監査", value: 0 },
    { itemname: "監査報告書作成", value: 0 },
  ];
}
function validationBuildPublicationItems_() {
  return [
    { itemname: "国内学会発表", value: 0 },
    { itemname: "国際学会発表", value: 0 },
    { itemname: "論文作成", value: 0 },
  ];
}
/**
 * その他関連のチェック項目を作成する
 *
 * 以下をまとめて生成する
 * - QOL調査
 * - 治験薬関連
 * - Misc項目
 *
 * @param {Object} params
 * @param {Object} params.quotationRequestValidationContext
 * @param {number} params.facilities_value
 * @param {number} params.trial_year
 * @returns {Array<{itemname:string,value:number}>}
 */
function validationBuildOtherItems_(params) {
  const {
    quotationRequestValidationContext: ctx,
    facilities_value,
    trial_year,
  } = params;

  return [
    /** QOL */
    { itemname: "QOL調査", value: 0 },

    /** Drug Handling */
    {
      itemname: "治験薬運搬",
      value: validationGetValueIfMatch_(
        ctx.investigationalDrugTransportation,
        COMMON_EXISTENCE_LABELS.YES,
        facilities_value * trial_year,
        0,
      ),
    },
    {
      itemname: "治験薬管理（中央）",
      value: validationGetValueIfMatch_(
        ctx.investigationalDrugManagement,
        COMMON_EXISTENCE_LABELS.YES,
        1,
        0,
      ),
    },

    /** Misc */
    { itemname: "翻訳", value: 0 },
    { itemname: "CDISC対応費", value: 0 },
    { itemname: "中央診断謝金", value: 0 },
  ];
}
