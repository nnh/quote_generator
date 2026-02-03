function test_createSetupItemsList() {
  // PMDA
  const targetQuotationRequestValueAndExpectedValues_pmda = [
    ["あり", 1],
    ["なし", ""],
    ["", ""],
  ];
  test_createSetupItemsListByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_pmda,
    "PMDA相談資料作成支援",
    "PMDA相談資料作成支援",
    "H",
  );
  // AMED
  const targetQuotationRequestValueAndExpectedValues_amed = [
    ["あり", 1],
    ["なし", ""],
    ["", ""],
  ];
  test_createSetupItemsListByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_amed,
    "AMED申請資料作成支援",
    "AMED申請資料作成支援",
    "U",
  );
  // キックオフミーティング
  const targetQuotationRequestValueAndExpectedValues_kickoff = [
    ["あり", 1],
    ["なし", ""],
    ["", ""],
  ];
  test_createSetupItemsListByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_kickoff,
    "キックオフミーティング",
    "キックオフミーティング準備・実行",
    "AB",
  );
  // monitoring_prep
  const targetQuotationRequestValueAndExpectedValues_monitoring = [
    [0, ""],
    [1, 1],
    [5, 1],
  ];
  test_createSetupItemsListByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_monitoring,
    "1例あたりの実地モニタリング回数",
    "モニタリング準備業務（関連資料作成）",
    "O",
  );
  // audit_fee
  const targetQuotationRequestValueAndExpectedValues_audit = [
    [0, ""],
    [1, 1],
    [3, 1],
  ];
  test_createSetupItemsListByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_audit,
    "監査対象施設数",
    "外部監査費用",
    "Q",
  );
  // prepare_fee
  const targetQuotationRequestValueAndExpectedValues_prepare = [
    ["あり", "=trial!B29"],
    ["なし", ""],
    ["", ""],
  ];
  test_createSetupItemsListByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_prepare,
    "試験開始準備費用",
    "試験開始準備費用",
    "AI",
  );
  // insurance_fee
  const targetQuotationRequestValueAndExpectedValues_insurance = [
    [0, ""],
    [100000, 1],
    [500000, 1],
  ];
  test_createSetupItemsListByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_insurance,
    "保険料",
    "保険料",
    "R",
  );
  // drug_management
  const targetQuotationRequestValueAndExpectedValues_drug = [
    ["あり", 1],
    ["なし", ""],
    ["", ""],
  ];
  test_createSetupItemsListByQuotationRequest_(
    targetQuotationRequestValueAndExpectedValues_drug,
    "治験薬管理",
    "治験薬管理（中央）",
    "J",
  );
}
function test_createSetupItemsListByQuotationRequest_(
  targetQuotationRequestValueAndExpectedValues,
  quotation_request_itemName,
  fy_itemName,
  colName,
  clinical_trials_office = 0,
) {
  targetQuotationRequestValueAndExpectedValues.forEach(
    ([quotation_request_item_value, expectedValue]) => {
      const array_quotation_request =
        createTestQuotationRequestArrayWithColumn_(
          null,
          colName,
          quotation_request_itemName,
          quotation_request_item_value,
        );
      const actual = createSetupItemsList_(
        array_quotation_request,
        clinical_trials_office,
      );
      if (actual.get(fy_itemName) !== expectedValue) {
        throw new Error(
          `createSetupItemsList_ ${quotation_request_itemName}:${quotation_request_item_value} expected ${expectedValue}, but got ${actual.get(fy_itemName)}`,
        );
      }
    },
  );
  console.log(`[PASS] createSetupItemsList_ for ${quotation_request_itemName}`);
}

/**
 * getSetupTrialTypeConfig_ の単体テスト
 */
function test_getSetupTrialTypeConfig() {
  const sp = PropertiesService.getScriptProperties();
  const originalTrialType = sp.getProperty("trial_type_value");

  const trialTypes = getTrialTypeListForTest_();

  try {
    trialTypes.forEach((trialType) => {
      sp.setProperty("trial_type_value", trialType);

      const actual = getSetupTrialTypeConfig_();
      if (trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED) {
        // Case: 医師主導治験
        const expected = {
          sop: 1,
          office_irb_str: "IRB承認確認、施設管理",
          office_irb: FUNCTION_FORMULAS.FACILITIES,
          set_accounts: "初期アカウント設定（施設・ユーザー）",
          drug_support: FUNCTION_FORMULAS.FACILITIES,
          specified_clinical_support: "",
        };

        assertEquals_(
          actual,
          expected,
          `getSetupTrialTypeConfig_ (${TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED})`,
        );
      } else if (trialType === TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL) {
        // Case: 特定臨床研究
        const expected = {
          sop: "",
          office_irb_str: "IRB準備・承認確認",
          office_irb: "",
          set_accounts: "初期アカウント設定（施設・ユーザー）、IRB承認確認",
          drug_support: "",
          specified_clinical_support: FUNCTION_FORMULAS.FACILITIES,
        };

        assertEquals_(
          actual,
          expected,
          `getSetupTrialTypeConfig_ (${TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL})`,
        );
      } else {
        // Case: その他の試験種別（デフォルト設定）
        const expected = {
          sop: "",
          office_irb_str: "IRB準備・承認確認",
          office_irb: "",
          set_accounts: "初期アカウント設定（施設・ユーザー）、IRB承認確認",
          drug_support: "",
          specified_clinical_support: "",
        };

        assertEquals_(
          actual,
          expected,
          `getSetupTrialTypeConfig_ (${trialType})`,
        );
      }
    });
  } finally {
    // ScriptProperties を元に戻す
    if (originalTrialType === null) {
      sp.deleteProperty("trial_type_value");
    } else {
      sp.setProperty("trial_type_value", originalTrialType);
    }
  }
}
