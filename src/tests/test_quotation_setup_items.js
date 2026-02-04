function test_createSetupItemsList() {
  // 事務局運営
  const targetQuotationRequestValueAndExpectedValues_clinical_trials_office =
    getClinicalTrialsOfficeTestArray_();
  targetQuotationRequestValueAndExpectedValues_clinical_trials_office.forEach(
    (obj) => {
      test_trialTypeConfigCommon_(
        "事務局運営",
        test_createSetupItemsList_trialType_clinical_trials_office_,
        test_expectedValue_setup_clinical_trials_office_,
        obj,
        obj,
      );
    },
  );
  // PMDA
  const targetQuotationRequestValueAndExpectedValues_pmda = [
    ["あり", 1],
    ["なし", ""],
    ["", ""],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_pmda,
    "PMDA相談資料作成支援",
    "PMDA相談資料作成支援",
    "H",
    createSetupItemsList_,
  );

  // AMED
  const targetQuotationRequestValueAndExpectedValues_amed = [
    ["あり", 1],
    ["なし", ""],
    ["", ""],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_amed,
    "AMED申請資料作成支援",
    "AMED申請資料作成支援",
    "U",
    createSetupItemsList_,
  );

  // キックオフミーティング
  const targetQuotationRequestValueAndExpectedValues_kickoff = [
    ["あり", 1],
    ["なし", ""],
    ["", ""],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_kickoff,
    "キックオフミーティング",
    "キックオフミーティング準備・実行",
    "AB",
    createSetupItemsList_,
  );

  // monitoring_prep
  const targetQuotationRequestValueAndExpectedValues_monitoring = [
    [0, ""],
    [1, 1],
    [5, 1],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_monitoring,
    "1例あたりの実地モニタリング回数",
    "モニタリング準備業務（関連資料作成）",
    "O",
    createSetupItemsList_,
  );

  // audit_fee
  const targetQuotationRequestValueAndExpectedValues_audit = [
    [0, ""],
    [1, 1],
    [3, 1],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_audit,
    "監査対象施設数",
    "外部監査費用",
    "Q",
    createSetupItemsList_,
  );

  // prepare_fee
  const targetQuotationRequestValueAndExpectedValues_prepare = [
    ["あり", "=trial!B29"],
    ["なし", ""],
    ["", ""],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_prepare,
    "試験開始準備費用",
    "試験開始準備費用",
    "AI",
    createSetupItemsList_,
  );

  // insurance_fee
  const targetQuotationRequestValueAndExpectedValues_insurance = [
    [0, ""],
    [100000, 1],
    [500000, 1],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_insurance,
    "保険料",
    "保険料",
    "R",
    createSetupItemsList_,
  );

  // drug_management
  const targetQuotationRequestValueAndExpectedValues_drug = [
    ["あり", 1],
    ["なし", ""],
    ["", ""],
  ];
  test_createItemsByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_drug,
    "治験薬管理",
    "治験薬管理（中央）",
    "J",
    createSetupItemsList_,
  );

  const fixedValueTestArray = [
    ["プロトコルレビュー・作成支援", 1],
    ["検討会実施（TV会議等）", 4],
    ["EDCライセンス・データベースセットアップ", 1],
    ["業務分析・DM計画書の作成・CTR登録案の作成", 1],
    ["DB作成・eCRF作成・バリデーション", 1],
    ["バリデーション報告書", 1],
    ["入力の手引作成", 1],
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
  const items = createSetupItemsList_(array_quotation_request, officeFlag);
  const actualClinicalTrialsOffice = items.get("事務局運営（試験開始前）");
  return actualClinicalTrialsOffice;
}
function test_expectedValue_setup_clinical_trials_office_(trialType, obj) {
  const office_value = obj.office_value;
  const cofficient_value = obj.funding_source;
  if (trialType === "医師主導治験") {
    return 1;
  } else if (office_value === "あり") {
    return 1;
  } else if (cofficient_value === "営利企業原資（製薬企業等）") {
    return 1;
  } else {
    return 0;
  }
}
/**
 * getSetupTrialTypeConfig_ の単体テスト
 */
function getExpectedSetupTrialTypeConfigForTest_(trialType) {
  if (trialType === "医師主導治験") {
    return {
      sop: 1,
      office_irb_str: "IRB承認確認、施設管理",
      office_irb: FUNCTION_FORMULAS.FACILITIES,
      set_accounts: "初期アカウント設定（施設・ユーザー）",
      drug_support: FUNCTION_FORMULAS.FACILITIES,
      specified_clinical_support: "",
    };
  } else if (trialType === "特定臨床研究") {
    return {
      sop: "",
      office_irb_str: "IRB準備・承認確認",
      office_irb: "",
      set_accounts: "初期アカウント設定（施設・ユーザー）、IRB承認確認",
      drug_support: "",
      specified_clinical_support: FUNCTION_FORMULAS.FACILITIES,
    };
  }

  return {
    sop: "",
    office_irb_str: "IRB準備・承認確認",
    office_irb: "",
    set_accounts: "初期アカウント設定（施設・ユーザー）、IRB承認確認",
    drug_support: "",
    specified_clinical_support: "",
  };
}
function test_getSetupTrialTypeConfig() {
  test_trialTypeConfigCommon_(
    "getSetupTrialTypeConfig_",
    getSetupTrialTypeConfig_,
    getExpectedSetupTrialTypeConfigForTest_,
  );
}
