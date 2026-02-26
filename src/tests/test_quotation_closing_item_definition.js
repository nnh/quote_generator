function test_createClosingItemsList() {
  const case_review_meeting_preparation_and_execution =
    ITEMS_SHEET.ITEMNAMES.CASE_REVIEW_MEETING_PREPARATION_AND_EXECUTION;
  if (!case_review_meeting_preparation_and_execution) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに症例検討会準備・実行が定義されていません。",
    );
  }
  test_trialTypeConfigCommon_(
    case_review_meeting_preparation_and_execution,
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
        (testName = "事務局運営"),
        (getActualConfigFn =
          test_createClosingItemsList_trialType_clinical_trials_office_),
        (getExpectedConfigFn =
          test_expectedValue_closing_clinical_trials_office_),
        (expectedOptions = obj),
        (actualOptions = obj),
      );
    },
  );
  const audit_support = ITEMS_SHEET.ITEMNAMES.AUDIT_SUPPORT;
  if (!audit_support) {
    throw new Error("ITEMS_SHEET.ITEMNAMESに監査対応が定義されていません。");
  }
  // 監査対応
  // 医師主導治験なら1, それ以外は空欄
  test_trialTypeConfigCommon_(
    audit_support,
    test_createClosingItemsList_trialType_audit_,
    test_expectedValue_closing_audit_support_,
    {},
    {},
  );
  const case_review_meeting_materials =
    ITEMS_SHEET.ITEMNAMES.CASE_REVIEW_MEETING_MATERIALS;
  if (!case_review_meeting_materials) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに症例検討会資料作成が定義されていません。",
    );
  }
  // 症例検討会資料作成
  test_trialTypeConfigCommon_(
    case_review_meeting_materials,
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
  const final_analysis_required_table_figure_count =
    QUOTATION_REQUEST_SHEET.ITEMNAMES
      .FINAL_ANALYSIS_REQUIRED_TABLE_FIGURE_COUNT;
  if (!final_analysis_required_table_figure_count) {
    throw new Error(
      "QUOTATION_REQUEST_SHEET.ITEMNAMESに統計解析に必要な図表数が定義されていません。",
    );
  }
  const statistical_analysis_plan =
    ITEMS_SHEET.ITEMNAMES.STATISTICAL_ANALYSIS_PLAN;
  if (!statistical_analysis_plan) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成が定義されていません。",
    );
  }
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_statisticalAnalysisDocs,
    final_analysis_required_table_figure_count,
    statistical_analysis_plan,
    "AF",
    createClosingItemsList_,
  );
  // "最終解析プログラム作成、解析実施"
  [100, 50, 49, 1, 0, ""].forEach((array_quotation_request_value) => {
    test_trialTypeConfigCommon_(
      (testName = "最終解析プログラム作成、解析実施"),
      (getActualConfigFn =
        test_createClosingItemsList_trialType_final_analysis_),
      (getExpectedConfigFn = test_expectedValue_closing_final_analysis_),
      (expectedOptions = { value: array_quotation_request_value }),
      (actualOptions = { value: array_quotation_request_value }),
    );
  });
  const final_analysis_report = ITEMS_SHEET.ITEMNAMES.FINAL_ANALYSIS_REPORT;
  if (!final_analysis_report) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに最終解析報告書作成（出力結果＋表紙）が定義されていません。",
    );
  }
  // 最終解析報告書作成（出力結果＋表紙）
  const targetQuotationRequestValueAndExpectedValues_finalAnalysisReport = [
    ...targetQuotationRequestValueAndExpectedValues_statisticalAnalysisDocs,
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_finalAnalysisReport,
    final_analysis_required_table_figure_count,
    final_analysis_report,
    "AF",
    createClosingItemsList_,
  );
  // CSR作成支援 / 研究結果報告書作成
  ["あり", "なし", ""].forEach((array_quotation_request_value) => {
    test_trialTypeConfigCommon_(
      (testName = "CSRの作成支援 / 研究結果報告書作成"),
      (getActualConfigFn = test_createClosingItemsList_trialType_csr_),
      (getExpectedConfigFn = test_expectedValue_closing_csr_),
      (expectedOptions = { value: array_quotation_request_value }),
      (actualOptions = { value: array_quotation_request_value }),
    );
  });
  // 症例最終報告書提出毎の支払
  const quotation_request_report_fee =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.REPORT_FEE;
  if (!quotation_request_report_fee) {
    throw new Error(
      "QUOTATION_REQUEST_SHEET.ITEMNAMESに症例最終報告書提出毎の支払が定義されていません。",
    );
  }
  const item_report_fee = ITEMS_SHEET.ITEMNAMES.REPORT_FEE;
  if (!item_report_fee) {
    throw new Error("ITEMS_SHEET.ITEMNAMESに症例報告が定義されていません。");
  }
  const value_yes = requireTestYesExistenceLabel_();
  const value_no = requireTestNoExistenceLabel_();
  const targetQuotationRequestValueAndExpectedValues_caseFinalReportSubmissionPayment =
    [
      [value_yes, "=trial!B28"],
      [value_no, ""],
      ["", ""],
    ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_caseFinalReportSubmissionPayment,
    quotation_request_report_fee,
    item_report_fee,
    "AK",
    createClosingItemsList_,
  );
  // 外部監査費用
  const targetQuotationRequestValueAndExpectedValues_externalAuditCost = [
    [5, 1],
    [0, ""],
    ["", ""],
  ];
  const quotation_request_audit_target_facilities =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.AUDIT_TARGET_FACILITIES;
  if (!quotation_request_audit_target_facilities) {
    throw new Error(
      "QUOTATION_REQUEST_SHEET.ITEMNAMESに監査対象施設数が定義されていません。",
    );
  }
  const item_external_audit_fee = ITEMS_SHEET.ITEMNAMES.EXTERNAL_AUDIT_FEE;
  if (!item_external_audit_fee) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに外部監査費用が定義されていません。",
    );
  }
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_externalAuditCost,
    quotation_request_audit_target_facilities,
    item_external_audit_fee,
    "Q",
    createClosingItemsList_,
  );
  const data_cleaning = ITEMS_SHEET.ITEMNAMES.DATA_CLEANING;
  if (!data_cleaning) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESにデータクリーニングが定義されていません。",
    );
  }
  const pmda_response_and_inquiry =
    ITEMS_SHEET.ITEMNAMES.PMDA_RESPONSE_AND_INQUIRY;
  if (!pmda_response_and_inquiry) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESにPMDA対応、照会事項対応が定義されていません。",
    );
  }
  const database_fixing_and_closing =
    ITEMS_SHEET.ITEMNAMES.DATABASE_FIXING_AND_CLOSING;
  if (!database_fixing_and_closing) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESにデータベース固定作業、クロージングが定義されていません。",
    );
  }
  // 固定値
  const fixedValueTestArray = [
    [data_cleaning, 1],
    [pmda_response_and_inquiry, ""],
    [database_fixing_and_closing, 1],
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
  const audit_support = ITEMS_SHEET.ITEMNAMES.AUDIT_SUPPORT;
  if (!audit_support) {
    throw new Error("ITEMS_SHEET.ITEMNAMESに監査対応が定義されていません。");
  }
  const actualAuditSupport = items.get(audit_support);
  return actualAuditSupport;
}
function test_expectedValue_closing_audit_support_(trialType, _) {
  const investigator_initiated = requireTestInvestigatorInitiatedTrialType_();
  return trialType === investigator_initiated ? 1 : "";
}
// 最終解析プログラム作成、解析実施
function test_createClosingItemsList_trialType_final_analysis_(obj) {
  const array_quotation_request_value = obj.value;
  const final_analysis_required_table_figure_count =
    QUOTATION_REQUEST_SHEET.ITEMNAMES
      .FINAL_ANALYSIS_REQUIRED_TABLE_FIGURE_COUNT;
  if (!final_analysis_required_table_figure_count) {
    throw new Error(
      "QUOTATION_REQUEST_SHEET.ITEMNAMESに統計解析に必要な図表数が定義されていません。",
    );
  }
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "AF",
    final_analysis_required_table_figure_count,
    array_quotation_request_value,
  );
  const items = createClosingItemsList_(array_quotation_request, 0);
  const trialType =
    PropertiesService.getScriptProperties().getProperty("trial_type_value");
  const investigator_initiated = requireTestInvestigatorInitiatedTrialType_();
  const final_analysis_label_single =
    ITEMS_SHEET.ITEMNAMES.FINAL_ANALYSIS_PROGRAM_SINGLE;
  if (!final_analysis_label_single) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに最終解析プログラム作成、解析実施（シングル）が定義されていません。",
    );
  }
  const final_analysis_label_double =
    ITEMS_SHEET.ITEMNAMES.FINAL_ANALYSIS_PROGRAM_DOUBLE;
  if (!final_analysis_label_double) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに最終解析プログラム作成、解析実施（ダブル）が定義されていません。",
    );
  }
  const fy_label =
    trialType === investigator_initiated
      ? final_analysis_label_double
      : final_analysis_label_single;
  const actualFinalAnalysisCount = items.get(fy_label);
  return actualFinalAnalysisCount;
}
function test_expectedValue_closing_final_analysis_(trialType, obj) {
  const array_quotation_request_value = obj.value;
  const investigator_initiated = requireTestInvestigatorInitiatedTrialType_();
  if (trialType === investigator_initiated) {
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
  const quotation_request_researchResultReportSupport =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.RESEARCH_RESULT_REPORT_SUPPORT;
  if (!quotation_request_researchResultReportSupport) {
    throw new Error(
      "QUOTATION_REQUEST_SHEET.ITEMNAMESに研究結果報告書の作成が定義されていません。",
    );
  }
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "M",
    quotation_request_researchResultReportSupport,
    array_quotation_request_value,
  );
  const items = createClosingItemsList_(array_quotation_request, 0);
  const trialType =
    PropertiesService.getScriptProperties().getProperty("trial_type_value");
  const investigator_initiated = requireTestInvestigatorInitiatedTrialType_();
  const item_researchResultReportSupport =
    ITEMS_SHEET.ITEMNAMES.RESEARCH_RESULT_REPORT_SUPPORT;
  if (!item_researchResultReportSupport) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに研究結果報告書の作成が定義されていません。",
    );
  }
  const item_csr_support = ITEMS_SHEET.ITEMNAMES.CSR_SUPPORT;
  if (!item_csr_support) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESにCSRの作成支援が定義されていません。",
    );
  }
  const fy_label =
    trialType === investigator_initiated
      ? item_csr_support
      : item_researchResultReportSupport;
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
  const adjustment_office_existence =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.ADJUSTMENT_OFFICE_EXISTENCE;
  if (!adjustment_office_existence) {
    throw new Error(
      "QUOTATION_REQUEST_SHEET.ITEMNAMESに調整事務局設置の有無が定義されていません。",
    );
  }
  const funding_source = QUOTATION_REQUEST_SHEET.ITEMNAMES.FUNDING_SOURCE;
  if (!funding_source) {
    throw new Error(
      "QUOTATION_REQUEST_SHEET.ITEMNAMESに原資が定義されていません。",
    );
  }
  const temp_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      null,
      "AQ",
      adjustment_office_existence,
      office_value,
    );
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    temp_array_quotation_request,
    "AN",
    funding_source,
    cofficient_value,
  );
  const officeFlag = test_get_clinical_trials_office_flg_(obj);
  const items = createClosingItemsList_(array_quotation_request, officeFlag);
  const clinical_trials_office =
    ITEMS_SHEET.ITEMNAMES.CLINICAL_TRIALS_OFFICE_CLOSING;
  if (!clinical_trials_office) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに事務局運営（試験終了時）が定義されていません。",
    );
  }
  const actualClinicalTrialsOffice = items.get(clinical_trials_office);
  return actualClinicalTrialsOffice;
}
function test_expectedValue_closing_clinical_trials_office_(trialType, obj) {
  const value_yes = requireTestYesExistenceLabel_();
  if (QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL === undefined) {
    throw new Error(
      "QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABELが定義されていません。",
    );
  }
  const office_value = obj.office_value;
  const cofficient_value = obj.funding_source;
  const investigator_initiated = requireTestInvestigatorInitiatedTrialType_();
  if (trialType === investigator_initiated) {
    return 1;
  } else if (office_value === value_yes) {
    return 1;
  } else if (cofficient_value === QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL) {
    return 1;
  } else {
    return "";
  }
}

function test_expectedValue_closing_csr_(trialType, obj) {
  const value_yes = requireTestYesExistenceLabel_();
  const investigator_initiated = requireTestInvestigatorInitiatedTrialType_();
  const array_quotation_request_value = obj.value;
  if (trialType === investigator_initiated) {
    return 1;
  } else {
    return array_quotation_request_value === value_yes ? 1 : "";
  }
}
function getExpectedClosingTrialTypeConfigForTest_(trialType) {
  const investigator_initiated = requireTestInvestigatorInitiatedTrialType_();
  const csr_support_label = ITEMS_SHEET.ITEMNAMES.CSR_SUPPORT;
  if (!csr_support_label) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESにCSRの作成支援が定義されていません。",
    );
  }
  const research_result_report_support_label =
    ITEMS_SHEET.ITEMNAMES.RESEARCH_RESULT_REPORT_SUPPORT;
  if (!research_result_report_support_label) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに研究結果報告書の作成が定義されていません。",
    );
  }
  const final_analysis_program_single_label =
    ITEMS_SHEET.ITEMNAMES.FINAL_ANALYSIS_PROGRAM_SINGLE;
  if (!final_analysis_program_single_label) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに最終解析プログラム作成、解析実施（シングル）が定義されていません。",
    );
  }
  const final_analysis_program_double_label =
    ITEMS_SHEET.ITEMNAMES.FINAL_ANALYSIS_PROGRAM_DOUBLE;
  if (!final_analysis_program_double_label) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに最終解析プログラム作成、解析実施（ダブル）が定義されていません。",
    );
  }
  if (trialType === investigator_initiated) {
    return {
      csrLabel: csr_support_label,
      csrCount: 1,
      finalAnalysisLabel: final_analysis_program_double_label,
      auditSupport: 1,
      enableClinicalConference: true,
    };
  }

  return {
    csrLabel: research_result_report_support_label,
    csrCount: "",
    finalAnalysisLabel: final_analysis_program_single_label,
    auditSupport: "",
    enableClinicalConference: false,
  };
}
// 症例検討会準備・実行
function test_createClosingItemsList_trialType_caseReviewMeeting_(obj) {
  const array_quotation_request_value = obj.value;
  const case_review_meeting =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.CASE_REVIEW_MEETING;
  if (!case_review_meeting) {
    throw new Error(
      "QUOTATION_REQUEST_SHEET.ITEMNAMESに症例検討会が定義されていません。",
    );
  }
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "I",
    case_review_meeting,
    array_quotation_request_value,
  );
  const case_review_meeting_preparation_and_execution =
    ITEMS_SHEET.ITEMNAMES.CASE_REVIEW_MEETING_PREPARATION_AND_EXECUTION;
  if (!case_review_meeting_preparation_and_execution) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに症例検討会準備・実行が定義されていません。",
    );
  }
  const items = createClosingItemsList_(array_quotation_request, 0);
  const actualCaseReviewMeeting = items.get(
    case_review_meeting_preparation_and_execution,
  );
  return actualCaseReviewMeeting;
}
function test_expectedValue_closing_case_review_meeting_(trialType, obj) {
  const investigator_initiated = requireTestInvestigatorInitiatedTrialType_();
  if (trialType !== investigator_initiated) {
    return "";
  }
  const value_yes = requireTestYesExistenceLabel_();
  const array_quotation_request_value = obj.value;
  return array_quotation_request_value === value_yes ? 1 : "";
}
// 症例検討会資料作成
function test_createClosingItemsList_trialType_caseReviewMaterials_(obj) {
  const quotation_request_case_review_meeting =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.CASE_REVIEW_MEETING;
  if (!quotation_request_case_review_meeting) {
    throw new Error(
      "QUOTATION_REQUEST_SHEET.ITEMNAMESに症例検討会が定義されていません。",
    );
  }
  const item_case_review_meeting =
    ITEMS_SHEET.ITEMNAMES.CASE_REVIEW_MEETING_MATERIALS;
  if (!item_case_review_meeting) {
    throw new Error(
      "ITEMS_SHEET.ITEMNAMESに症例検討会資料作成が定義されていません。",
    );
  }
  const array_quotation_request_value = obj.value;
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "I",
    quotation_request_case_review_meeting,
    array_quotation_request_value,
  );
  const items = createClosingItemsList_(array_quotation_request, 0);
  const actualCaseReviewMeeting = items.get(item_case_review_meeting);
  return actualCaseReviewMeeting;
}
function test_expectedValue_closing_case_review_materials_(trialType, obj) {
  const investigator_initiated = requireTestInvestigatorInitiatedTrialType_();
  if (trialType !== investigator_initiated) {
    return "";
  }
  const array_quotation_request_value = obj.value;
  const value_yes = requireTestYesExistenceLabel_();
  return array_quotation_request_value === value_yes ? 1 : "";
}
function test_getClosingTrialTypeConfig() {
  test_trialTypeConfigCommon_(
    "getClosingTrialTypeConfig_",
    getClosingTrialTypeConfig_,
    getExpectedClosingTrialTypeConfigForTest_,
  );
}
