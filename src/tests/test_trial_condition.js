/**
 * trial_condition.js のテスト
 * 医師主導治験または特定臨床研究の場合は Setup / Closing 期間が 6 ヶ月になることを確認する
 * それ以外の試験種別は基本的に Setup / Closing 期間が3 ヶ月だが、研究結果報告書作成支援が「あり」の場合は Closing 期間が 6 ヶ月になることを確認する
 */
function testDecideSetupClosingTerm() {
  const investigatorInitiatedTrialType =
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED;
  if (!investigatorInitiatedTrialType) {
    throw new Error("TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED is not defined");
  }
  const specifiedClinicalTrialType = TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL;
  if (!specifiedClinicalTrialType) {
    throw new Error("TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL is not defined");
  }
  const trialTypes = getTrialTypeListForTest_();
  const researchResultReport =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.RESEARCH_RESULT_REPORT_SUPPORT;
  if (!researchResultReport) {
    throw new Error(
      "QUOTATION_REQUEST_SHEET.ITEMNAMES.RESEARCH_RESULT_REPORT_SUPPORT is not defined",
    );
  }
  const value_yes = COMMON_EXISTENCE_LABELS.YES;
  if (!value_yes) {
    throw new Error("COMMON_EXISTENCE_LABELS.YES is not defined");
  }
  const value_no = COMMON_EXISTENCE_LABELS.NO;
  if (!value_no) {
    throw new Error("COMMON_EXISTENCE_LABELS.NO is not defined");
  }
  [value_yes, value_no].forEach((reportSupport) => {
    const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
      null,
      "M",
      researchResultReport,
      reportSupport,
    );
    trialTypes.forEach((type) => {
      const isSpecial = isSpecialTrial_(type);
      const hasReportSupport = hasReportSupport_(quotationRequestData);
      const { setupTerm, closingTerm } = decideSetupClosingTerm_(
        isSpecial,
        hasReportSupport,
      );
      if (
        type === investigatorInitiatedTrialType ||
        type === specifiedClinicalTrialType
      ) {
        const result = assertEquals_(
          setupTerm,
          6,
          `decideSetupClosingTerm_ - ${type} - ${reportSupport} - setupTerm`,
        );
        if (!result) {
          throw new Error("Test failed");
        }
        const result2 = assertEquals_(
          closingTerm,
          6,
          `decideSetupClosingTerm_ - ${type} - ${reportSupport} - closingTerm`,
        );
        if (!result2) {
          throw new Error("Test failed");
        }
      } else {
        const result = assertEquals_(
          setupTerm,
          3,
          `decideSetupClosingTerm_ - ${type} - ${reportSupport} - setupTerm`,
        );
        if (!result) {
          throw new Error("Test failed");
        }
        const expectedClosingTerm = reportSupport === value_yes ? 6 : 3;
        const result2 = assertEquals_(
          closingTerm,
          expectedClosingTerm,
          `decideSetupClosingTerm_ - ${type} - ${reportSupport} - closingTerm`,
        );
        if (!result2) {
          throw new Error("Test failed");
        }
      }
    });
  });
  console.log("testDecideSetupClosingTerm 完了");
}
