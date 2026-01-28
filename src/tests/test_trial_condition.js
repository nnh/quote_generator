/**
 * trial_condition.js のテスト
 * 医師主導治験または特定臨床研究の場合は Setup / Closing 期間が 6 ヶ月になることを確認する
 * それ以外の試験種別は基本的に Setup / Closing 期間が3 ヶ月だが、研究結果報告書作成支援が「あり」の場合は Closing 期間が 6 ヶ月になることを確認する
 */
function testDecideSetupClosingTerm() {
  const trialTypes = getTrialTypeListForTest_();
  ["あり", "なし"].forEach((reportSupport) => {
    const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
      null,
      "M",
      "研究結果報告書作成支援",
      reportSupport,
    );
    trialTypes.forEach((type) => {
      const isSpecial = isSpecialTrial_(type);
      const hasReportSupport = hasReportSupport_(quotationRequestData);
      const { setupTerm, closingTerm } = decideSetupClosingTerm_(
        isSpecial,
        hasReportSupport,
      );
      if (type === "医師主導治験" || type === "特定臨床研究") {
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
        const expectedClosingTerm = reportSupport === "あり" ? 6 : 3;
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
