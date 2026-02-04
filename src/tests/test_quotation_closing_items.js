function test_createClosingItemsList() {
  test_trialTypeConfigCommon_(
    "症例検討会準備・実行",
    test_createClosingItemsList_trialType_caseReviewMeeting_,
    test_expectedValue_closing_case_review_meeting_,
    {},
    {},
  );
  // 事務局運営
  const targetQuotationRequestValueAndExpectedValues_clinical_trials_office =
    getClinicalTrialsOfficeTestArray_();
  targetQuotationRequestValueAndExpectedValues_clinical_trials_office.forEach(
    (obj) => {
      test_trialTypeConfigCommon_(
        "事務局運営",
        test_createClosingItemsList_trialType_clinical_trials_office_,
        test_expectedValue_closing_clinical_trials_office_,
        obj,
        obj,
      );
    },
  );
  // 監査対応
  // 医師主導治験なら1, それ以外は空欄
  test_trialTypeConfigCommon_(
    "監査対応",
    test_createClosingItemsList_trialType_audit_,
    test_expectedValue_closing_audit_support_,
    {},
    {},
  );
  // 症例検討会資料作成
  test_trialTypeConfigCommon_(
    "症例検討会資料作成",
    test_createClosingItemsList_trialType_caseReviewMaterials_,
    test_expectedValue_closing_case_review_materials_,
    {},
    {},
  );
  // "統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成"
  const targetQuotationRequestValueAndExpectedValues_statisticalAnalysisDocs = [
    [100, 1],
    [50, 1],
    [49, 1],
    [0, ""],
    ["", ""],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_statisticalAnalysisDocs,
    "統計解析に必要な図表数",
    "統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成",
    "AF",
    createClosingItemsList_,
  );
  // "最終解析プログラム作成、解析実施"
  [100, 50, 49, 1, 0, ""].forEach((array_quotation_request_value) => {
    test_trialTypeConfigCommon_(
      "最終解析プログラム作成、解析実施",
      test_createClosingItemsList_trialType_final_analysis_,
      test_expectedValue_closing_final_analysis_,
      { value: array_quotation_request_value },
      { value: array_quotation_request_value },
    );
  });
  // 最終解析報告書作成（出力結果＋表紙）
  const targetQuotationRequestValueAndExpectedValues_finalAnalysisReport = [
    ...targetQuotationRequestValueAndExpectedValues_statisticalAnalysisDocs,
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_finalAnalysisReport,
    "統計解析に必要な図表数",
    "最終解析報告書作成（出力結果＋表紙）",
    "AF",
    createClosingItemsList_,
  );
  // CSR作成支援 / 研究結果報告書作成
  ["あり", "なし", ""].forEach((array_quotation_request_value) => {
    test_trialTypeConfigCommon_(
      "CSRの作成支援 / 研究結果報告書作成",
      test_createClosingItemsList_trialType_csr_,
      test_expectedValue_closing_csr_,
      { value: array_quotation_request_value },
      { value: array_quotation_request_value },
    );
  });
  // 症例最終報告書提出毎の支払
  const targetQuotationRequestValueAndExpectedValues_caseFinalReportSubmissionPayment =
    [
      ["あり", "=trial!B28"],
      ["なし", ""],
      ["", ""],
    ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_caseFinalReportSubmissionPayment,
    "症例最終報告書提出毎の支払",
    "症例報告",
    "AK",
    createClosingItemsList_,
  );
  // 外部監査費用
  const targetQuotationRequestValueAndExpectedValues_externalAuditCost = [
    [5, 1],
    [0, ""],
    ["", ""],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_externalAuditCost,
    "監査対象施設数",
    "外部監査費用",
    "Q",
    createClosingItemsList_,
  );
  // 固定値
  const fixedValueTestArray = [
    ["データクリーニング", 1],
    ["PMDA対応、照会事項対応", ""],
    ["データベース固定作業、クロージング", 1],
  ];
  test_fixedValueItems_(
    "createClosingItemsList_",
    fixedValueTestArray,
    createClosingItemsList_,
  );
}

// 監査対応
function test_createClosingItemsList_trialType_audit_(_) {
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "A",
    "タイムスタンプ",
    "2000/01/01",
  );
  const clinical_trials_office = 0;
  const items = createClosingItemsList_(
    array_quotation_request,
    clinical_trials_office,
  );
  const actualAuditSupport = items.get("監査対応");
  return actualAuditSupport;
}
function test_expectedValue_closing_audit_support_(trialType, _) {
  return trialType === "医師主導治験" ? 1 : "";
}
// 最終解析プログラム作成、解析実施
function test_createClosingItemsList_trialType_final_analysis_(obj) {
  const array_quotation_request_value = obj.value;
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "AF",
    "統計解析に必要な図表数",
    array_quotation_request_value,
  );
  const items = createClosingItemsList_(array_quotation_request, 0);
  const trialType =
    PropertiesService.getScriptProperties().getProperty("trial_type_value");
  const fy_label =
    trialType === "医師主導治験"
      ? "最終解析プログラム作成、解析実施（ダブル）"
      : "最終解析プログラム作成、解析実施（シングル）";
  const actualFinalAnalysisCount = items.get(fy_label);
  return actualFinalAnalysisCount;
}
function test_expectedValue_closing_final_analysis_(trialType, obj) {
  const array_quotation_request_value = obj.value;
  if (trialType === "医師主導治験") {
    if (array_quotation_request_value >= 50) {
      return array_quotation_request_value;
    } else if (array_quotation_request_value > 0) {
      return 50;
    } else {
      return "";
    }
  } else {
    if (array_quotation_request_value > 0) {
      return array_quotation_request_value;
    } else {
      return "";
    }
  }
}
// CSR作成支援 / 研究結果報告書作成
function test_createClosingItemsList_trialType_csr_(obj) {
  const array_quotation_request_value = obj.value;
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "M",
    "研究結果報告書作成支援",
    array_quotation_request_value,
  );
  const items = createClosingItemsList_(array_quotation_request, 0);
  const trialType =
    PropertiesService.getScriptProperties().getProperty("trial_type_value");
  const fy_label =
    trialType === "医師主導治験" ? "CSRの作成支援" : "研究結果報告書の作成";
  const actualCsrCount = items.get(fy_label);
  return actualCsrCount;
}
// 事務局運営
// 試験種別が医師主導治験の場合は期待値1
// 調整事務局設置の有無「あり」の場合は期待値1
// 原資が企業原資の場合は期待値1
// それ以外は期待値""
function test_createClosingItemsList_trialType_clinical_trials_office_(obj) {
  const office_value = obj.office_value;
  const cofficient_value = obj.funding_source;
  const temp_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      null,
      "AQ",
      "調整事務局設置の有無",
      office_value,
    );
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    temp_array_quotation_request,
    "AN",
    "原資",
    cofficient_value,
  );
  const officeFlag = test_get_clinical_trials_office_flg_(obj);
  const items = createClosingItemsList_(array_quotation_request, officeFlag);
  const actualClinicalTrialsOffice = items.get("事務局運営（試験終了時）");
  return actualClinicalTrialsOffice;
}
function test_expectedValue_closing_clinical_trials_office_(trialType, obj) {
  const office_value = obj.office_value;
  const cofficient_value = obj.funding_source;
  if (trialType === "医師主導治験") {
    return 1;
  } else if (office_value === "あり") {
    return 1;
  } else if (cofficient_value === "営利企業原資（製薬企業等）") {
    return 1;
  } else {
    return "";
  }
}

function test_expectedValue_closing_csr_(trialType, obj) {
  const array_quotation_request_value = obj.value;
  if (trialType === "医師主導治験") {
    return 1;
  } else {
    return array_quotation_request_value === "あり" ? 1 : "";
  }
}
function getExpectedClosingTrialTypeConfigForTest_(trialType) {
  if (trialType === "医師主導治験") {
    return {
      csrLabel: "CSRの作成支援",
      csrCount: 1,
      finalAnalysisLabel: "最終解析プログラム作成、解析実施（ダブル）",
      auditSupport: 1,
      enableClinicalConference: true,
    };
  }

  return {
    csrLabel: "研究結果報告書の作成",
    csrCount: "",
    finalAnalysisLabel: "最終解析プログラム作成、解析実施（シングル）",
    auditSupport: "",
    enableClinicalConference: false,
  };
}
// 症例検討会準備・実行
function test_createClosingItemsList_trialType_caseReviewMeeting_(obj) {
  const array_quotation_request_value = obj.value;
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "I",
    "症例検討会",
    array_quotation_request_value,
  );
  const items = createClosingItemsList_(array_quotation_request, 0);
  const actualCaseReviewMeeting = items.get("症例検討会準備・実行");
  return actualCaseReviewMeeting;
}
function test_expectedValue_closing_case_review_meeting_(trialType, obj) {
  if (trialType !== "医師主導治験") {
    return "";
  }
  const array_quotation_request_value = obj.value;
  return array_quotation_request_value === "あり" ? 1 : "";
}
// 症例検討会資料作成
function test_createClosingItemsList_trialType_caseReviewMaterials_(obj) {
  const array_quotation_request_value = obj.value;
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "I",
    "症例検討会",
    array_quotation_request_value,
  );
  const items = createClosingItemsList_(array_quotation_request, 0);
  const actualCaseReviewMeeting = items.get("症例検討会資料作成");
  return actualCaseReviewMeeting;
}
function test_expectedValue_closing_case_review_materials_(trialType, obj) {
  if (trialType !== "医師主導治験") {
    return "";
  }
  const array_quotation_request_value = obj.value;
  return array_quotation_request_value === "あり" ? 1 : "";
}
function test_getClosingTrialTypeConfig() {
  test_trialTypeConfigCommon_(
    "getClosingTrialTypeConfig_",
    getClosingTrialTypeConfig_,
    getExpectedClosingTrialTypeConfigForTest_,
  );
}
