function test_createSetupItemsList() {
  // 事務局運営
  const targetQuotationRequestValueAndExpectedValues_clinical_trials_office =
    getClinicalTrialsOfficeTestArray_();
  targetQuotationRequestValueAndExpectedValues_clinical_trials_office.forEach(
    (obj) => {
      test_trialTypeConfigCommon_(
        (testName = "事務局運営"),
        (getActualConfigFn =
          test_createSetupItemsList_trialType_clinical_trials_office_),
        (getExpectedConfigFn =
          test_expectedValue_setup_clinical_trials_office_),
        (expectedOptions = obj),
        (actualOptions = obj),
      );
    },
  );
  const value_yes = requireTestYesExistenceLabel_();
  const value_no = requireTestNoExistenceLabel_();
  const quatation_request_pmda =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.PMDA_CONSULTATION_SUPPORT;
  if (!quatation_request_pmda) {
    throw new Error("PMDA相談資料作成支援の項目名が定義されていません");
  }
  const item_pmda = ITEMS_SHEET.ITEMNAMES.PMDA_CONSULTATION_SUPPORT;
  if (!item_pmda) {
    throw new Error("PMDA相談資料作成支援の項目名が定義されていません");
  }
  // PMDA
  const targetQuotationRequestValueAndExpectedValues_pmda = [
    [value_yes, 1],
    [value_no, ""],
    ["", ""],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_pmda,
    quatation_request_pmda,
    item_pmda,
    "H",
    createSetupItemsList_,
  );
  const quatation_request_amed =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.AMED_APPLICATION_SUPPORT;
  if (!quatation_request_amed) {
    throw new Error("AMED申請資料作成支援の項目名が定義されていません");
  }
  const item_amed = ITEMS_SHEET.ITEMNAMES.AMED_APPLICATION_SUPPORT;
  if (!item_amed) {
    throw new Error("AMED申請資料作成支援の項目名が定義されていません");
  }
  // AMED
  const targetQuotationRequestValueAndExpectedValues_amed = [
    [value_yes, 1],
    [value_no, ""],
    ["", ""],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_amed,
    quatation_request_amed,
    item_amed,
    "U",
    createSetupItemsList_,
  );

  // キックオフミーティング
  const quatation_request_kickoff =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.KICKOFF_MEETING;
  if (!quatation_request_kickoff) {
    throw new Error("キックオフミーティングの項目名が定義されていません");
  }
  const item_kickoff =
    ITEMS_SHEET.ITEMNAMES.KICKOFF_MEETING_PREPARATION_AND_EXECUTION;
  if (!item_kickoff) {
    throw new Error("キックオフミーティングの項目名が定義されていません");
  }
  const targetQuotationRequestValueAndExpectedValues_kickoff = [
    [value_yes, 1],
    [value_no, ""],
    ["", ""],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_kickoff,
    quatation_request_kickoff,
    item_kickoff,
    "AB",
    createSetupItemsList_,
  );

  // モニタリング準備業務
  const quatation_request_monitoring =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.MONITORING_COUNT_PER_CASE;
  if (!quatation_request_monitoring) {
    throw new Error(
      "1例あたりの実地モニタリング回数の項目名が定義されていません",
    );
  }
  const item_monitoring = ITEMS_SHEET.ITEMNAMES.MONITORING_PREPARATION;
  if (!item_monitoring) {
    throw new Error(
      "モニタリング準備業務（関連資料作成）の項目名が定義されていません",
    );
  }
  const targetQuotationRequestValueAndExpectedValues_monitoring = [
    [0, ""],
    [1, 1],
    [5, 1],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_monitoring,
    quatation_request_monitoring,
    item_monitoring,
    "O",
    createSetupItemsList_,
  );

  // audit_fee
  const quatation_request_audit =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.AUDIT_TARGET_FACILITIES;
  if (!quatation_request_audit) {
    throw new Error("監査対象施設数の項目名が定義されていません");
  }
  const item_audit = ITEMS_SHEET.ITEMNAMES.EXTERNAL_AUDIT_FEE;
  if (!item_audit) {
    throw new Error("外部監査費用の項目名が定義されていません");
  }
  const targetQuotationRequestValueAndExpectedValues_audit = [
    [0, ""],
    [1, 1],
    [3, 1],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_audit,
    quatation_request_audit,
    item_audit,
    "Q",
    createSetupItemsList_,
  );

  // prepare_fee
  const quatation_request_prepare =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.PREPARE_FEE;
  if (!quatation_request_prepare) {
    throw new Error("試験開始準備費用の項目名が定義されていません");
  }
  const item_prepare = ITEMS_SHEET.ITEMNAMES.PREPARE_FEE;
  if (!item_prepare) {
    throw new Error("試験開始準備費用の項目名が定義されていません");
  }
  const targetQuotationRequestValueAndExpectedValues_prepare = [
    [value_yes, "=trial!B29"],
    [value_no, ""],
    ["", ""],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_prepare,
    quatation_request_prepare,
    item_prepare,
    "AI",
    createSetupItemsList_,
  );

  // insurance_fee
  const quatation_request_insurance =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.INSURANCE_FEE;
  if (!quatation_request_insurance) {
    throw new Error("保険料の項目名が定義されていません");
  }
  const item_insurance = ITEMS_SHEET.ITEMNAMES.INSURANCE_FEE;
  if (!item_insurance) {
    throw new Error("保険料の項目名が定義されていません");
  }
  const targetQuotationRequestValueAndExpectedValues_insurance = [
    [0, ""],
    [100000, 1],
    [500000, 1],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_insurance,
    quatation_request_insurance,
    item_insurance,
    "R",
    createSetupItemsList_,
  );

  // drug_management
  const quatation_request_drug_management =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.DRUG_MANAGEMENT_CENTRAL;
  if (!quatation_request_drug_management) {
    throw new Error("治験薬管理の項目名が定義されていません");
  }
  const item_drug_management = ITEMS_SHEET.ITEMNAMES.DRUG_MANAGEMENT_CENTRAL;
  if (!item_drug_management) {
    throw new Error("治験薬管理（中央）の項目名が定義されていません");
  }
  const targetQuotationRequestValueAndExpectedValues_drug = [
    [value_yes, 1],
    [value_no, ""],
    ["", ""],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_drug,
    quatation_request_drug_management,
    item_drug_management,
    "J",
    createSetupItemsList_,
  );
  const item_protocol_review =
    ITEMS_SHEET.ITEMNAMES.PROTOCOL_REVIEW_AND_CREATION_SUPPORT;
  if (!item_protocol_review) {
    throw new Error("プロトコルレビュー・作成支援の項目名が定義されていません");
  }
  const item_review_meeting =
    ITEMS_SHEET.ITEMNAMES.REVIEW_MEETING_EXECUTION_REMOTE;
  if (!item_review_meeting) {
    throw new Error("検討会実施（TV会議等）の項目名が定義されていません");
  }
  const item_edc_setup = ITEMS_SHEET.ITEMNAMES.EDC_LICENSE_AND_DATABASE_SETUP;
  if (!item_edc_setup) {
    throw new Error(
      "EDCライセンス・データベースセットアップの項目名が定義されていません",
    );
  }
  const item_business_analysis =
    ITEMS_SHEET.ITEMNAMES.BUSINESS_ANALYSIS_DM_PLAN_AND_CTR_REGISTRATION_PLAN;
  if (!item_business_analysis) {
    throw new Error(
      "業務分析・DM計画書の作成・CTR登録案の作成の項目名が定義されていません",
    );
  }
  const item_db_creation =
    ITEMS_SHEET.ITEMNAMES.DB_CREATION_ECRF_CREATION_AND_VALIDATION;
  if (!item_db_creation) {
    throw new Error(
      "DB作成・eCRF作成・バリデーションの項目名が定義されていません",
    );
  }
  const item_validation_report = ITEMS_SHEET.ITEMNAMES.VALIDATION_REPORT;
  if (!item_validation_report) {
    throw new Error("バリデーション報告書の項目名が定義されていません");
  }
  const item_input_guide = ITEMS_SHEET.ITEMNAMES.INPUT_GUIDE_CREATION;
  if (!item_input_guide) {
    throw new Error("入力の手引作成の項目名が定義されていません");
  }
  // 固定値項目の確認
  const fixedValueTestArray = [
    [item_protocol_review, 1],
    [item_review_meeting, 4],
    [item_edc_setup, 1],
    [item_business_analysis, 1],
    [item_db_creation, 1],
    [item_validation_report, 1],
    [item_input_guide, 1],
  ];

  test_fixedValueItems_(
    "createSetupItemsList_",
    fixedValueTestArray,
    createSetupItemsList_,
  );
}
// 事務局運営
// 試験種別が医師主導治験の場合は期待値1
// 調整事務局設置の有無「あり」の場合は期待値1
// 原資が企業原資の場合は期待値1
// それ以外は期待値""
function test_createSetupItemsList_trialType_clinical_trials_office_(obj) {
  const office_value = obj.office_value;
  const cofficient_value = obj.funding_source;
  const quotation_request_office_item =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.ADJUSTMENT_OFFICE_EXISTENCE;
  if (!quotation_request_office_item) {
    throw new Error("調整事務局設置の有無の項目名が定義されていません");
  }
  const quotation_request_cofficient_item =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.FUNDING_SOURCE;
  if (!quotation_request_cofficient_item) {
    throw new Error("原資の項目名が定義されていません");
  }
  const temp_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      null,
      "AQ",
      quotation_request_office_item,
      office_value,
    );
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    temp_array_quotation_request,
    "AN",
    quotation_request_cofficient_item,
    cofficient_value,
  );
  const quotation_request_sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
      QUOTATION_REQUEST_SHEET.NAME,
    );
  if (!quotation_request_sheet) {
    throw new Error("quotation_requestシートが見つかりません");
  }
  quotation_request_sheet
    .getRange(2, 1, 1, array_quotation_request[0].length)
    .setValues([array_quotation_request[1]]);
  SpreadsheetApp.flush();
  _quotationRequestMap = null; // キャッシュクリア
  buildQuotationRequestMap_();
  const officeFlag = test_getClinicalTrialsOfficeFlg_(obj);
  const items = createSetupItemsList_(officeFlag);
  const item_office_setup = ITEMS_SHEET.ITEMNAMES.CLINICAL_TRIALS_OFFICE_SETUP;
  if (!item_office_setup) {
    throw new Error("事務局運営（試験開始前）の項目名が定義されていません");
  }
  const actualClinicalTrialsOffice = items.get(item_office_setup);
  return actualClinicalTrialsOffice;
}
function test_expectedValue_setup_clinical_trials_office_(trialType, obj) {
  const office_value = obj.office_value;
  const cofficient_value = obj.funding_source;
  const investigator_initiated_trial_type =
    requireTestInvestigatorInitiatedTrialType_();
  const value_yes = requireTestYesExistenceLabel_();
  if (!QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL) {
    throw new Error("営利企業原資（製薬企業等）の定義が取得できません");
  }
  if (trialType === investigator_initiated_trial_type) {
    return 1;
  } else if (office_value === value_yes) {
    return 1;
  } else if (cofficient_value === QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL) {
    return 1;
  } else {
    return 0;
  }
}
/**
 * getSetupTrialTypeConfig_ の単体テスト
 */
function getExpectedSetupTrialTypeConfigForTest_(trialType) {
  const investigatorInitiatedTrialType =
    requireTestInvestigatorInitiatedTrialType_();

  const specifiedClinicalTrialType = requireTestSpecifiedClinicalTrialType_();

  const irbApprovalConfirmationAndFacilityManagement =
    ITEMS_SHEET.ITEMNAMES.IRB_APPROVAL_CONFIRMATION_AND_FACILITY_MANAGEMENT;

  if (!irbApprovalConfirmationAndFacilityManagement) {
    throw new Error("IRB承認確認、施設管理の項目名が定義されていません");
  }

  const irbPreparationAndApprovalConfirmation =
    ITEMS_SHEET.ITEMNAMES.IRB_PREPARATION_AND_APPROVAL_CONFIRMATION;

  if (!irbPreparationAndApprovalConfirmation) {
    throw new Error("IRB準備・承認確認の項目名が定義されていません");
  }

  const initialAccountSetup = ITEMS_SHEET.ITEMNAMES.INITIAL_ACCOUNT_SETUP;

  if (!initialAccountSetup) {
    throw new Error(
      "初期アカウント設定（施設・ユーザー）の項目名が定義されていません",
    );
  }

  const initialAccountSetupAndIrbApprovalConfirmation =
    ITEMS_SHEET.ITEMNAMES.INITIAL_ACCOUNT_SETUP_AND_IRB_APPROVAL_CONFIRMATION;

  if (!initialAccountSetupAndIrbApprovalConfirmation) {
    throw new Error(
      "初期アカウント設定（施設・ユーザー）、IRB承認確認の項目名が定義されていません",
    );
  }

  if (trialType === investigatorInitiatedTrialType) {
    return {
      sopValue: 1,
      officeIrbItemName: irbApprovalConfirmationAndFacilityManagement,
      officeIrbValue: FUNCTION_FORMULAS.FACILITIES,
      setAccountsItemName: initialAccountSetup,
      drugSupportValue: FUNCTION_FORMULAS.FACILITIES,
      specifiedClinicalSupportValue: 0,
    };
  }

  if (trialType === specifiedClinicalTrialType) {
    return {
      sopValue: 0,
      officeIrbItemName: irbPreparationAndApprovalConfirmation,
      officeIrbValue: 0,
      setAccountsItemName: initialAccountSetupAndIrbApprovalConfirmation,
      drugSupportValue: 0,
      specifiedClinicalSupportValue: FUNCTION_FORMULAS.FACILITIES,
    };
  }

  return {
    sopValue: 0,
    officeIrbItemName: irbPreparationAndApprovalConfirmation,
    officeIrbValue: 0,
    setAccountsItemName: initialAccountSetupAndIrbApprovalConfirmation,
    drugSupportValue: 0,
    specifiedClinicalSupportValue: 0,
  };
}
function test_getSetupTrialTypeConfig() {
  test_trialTypeConfigCommon_(
    "getSetupTrialTypeConfig_",
    getSetupTrialTypeConfig_,
    getExpectedSetupTrialTypeConfigForTest_,
  );
}
