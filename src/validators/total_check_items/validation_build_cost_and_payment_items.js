/**
 * 試験開始費用・症例関連費用・研究協力費をまとめて作成する
 *
 * @param {Object} params
 * @param {Object} params.quotationRequestValidationContext
 * @param {number} params.facilities_value
 * @param {number} params.number_of_cases_value
 * @param {number} params.trial_year
 * @returns {{
 *   checkItems: Array<{itemname:string,value:number}>,
 *   amountCheckItems: Array<{itemname:string,value:number}>
 * }}
 */
function validationBuildCostAndPaymentItems_(params) {
  const {
    quotationRequestValidationContext: ctx,
    facilities_value,
    number_of_cases_value,
  } = params;

  const checkItems = [
    /** Trial Start Cost */
    {
      itemname: "試験開始準備費用",
      value: validationGetValueIfMatch_(
        ctx.trialStartPreparationCost,
        COMMON_EXISTENCE_LABELS.YES,
        facilities_value,
        0,
      ),
    },

    /** Case Payment */
    {
      itemname: "症例登録",
      value: validationGetValueIfMatch_(
        ctx.paymentPerEnrollment,
        COMMON_EXISTENCE_LABELS.YES,
        number_of_cases_value,
        0,
      ),
    },
    {
      itemname: "症例報告",
      value: validationGetValueIfMatch_(
        ctx.paymentPerFinalReport,
        COMMON_EXISTENCE_LABELS.YES,
        number_of_cases_value,
        0,
      ),
    },
  ];

  const amountCheckItems = [
    /** Research Funding */
    {
      itemname: "研究協力費",
      value:
        ctx.researchFundingManagement === COMMON_EXISTENCE_LABELS.YES
          ? ctx.researchFunding
          : 0,
    },
  ];

  return { checkItems, amountCheckItems };
}
