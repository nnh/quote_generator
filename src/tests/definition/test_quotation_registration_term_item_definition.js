function test_setRegistrationTermItems() {
  // ==============================
  // setRegistrationTermItems_ テストケース一覧
  // ==============================
  // --- 共通前提 ---
  // ・calcRegistrationMonthFromDates_ は正しい月数を返す
  // ・returnIfEquals_ は一致時に itemName、不一致時に "" を返す
  // ・buildClinicalTrialsOfficeItems_ は仕様通りの配列を返す
  const registration1_sheetName = getRegistration1SheetNameForTest_();
  const item_central_monitoring = ITEMS_SHEET.ITEMNAMES.CENTRAL_MONITORING;
  if (!item_central_monitoring) {
    throw new Error("item_central_monitoring is not defined");
  }
  // ===============================
  // setRegistrationTermItems_ テストケース一覧
  // ===============================
  // --- 正常系 ---
  // 1. 最小構成（必須項目のみ）
  // - context に date_list が存在する
  // - date_list に必要な日付項目がすべて揃っている
  // - clinical_trials_office_flg = false
  // - 安全性管理事務局・効安事務局ともに「設置・委託する」以外
  // => 結果に CENTRAL_MONITORING のみが含まれる
  runSetRegistrationTermItemsTest_({
    testName: "最小構成（必須項目のみ）",
    context: {
      sheetname: registration1_sheetName,
      array_quotation_request: createTestQuotationRequestArrayWithColumn_(
        null,
        "A",
        "タイムスタンプ",
        "2000/01/01",
      ),
      clinical_trials_office_flg: false,
      date_list: {
        trial_target_terms: 12,
        trial_start_date: "2020/04/01",
        trial_end_date: "2026/03/31",
        trial_target_start_date: "2024/04/01",
        trial_target_end_date: "2025/03/31",
      },
    },
    expected: new Map([[item_central_monitoring, 12]]),
  });
  const value_yes = SETUP_OR_OUTSOURCE_EXISTENCE_LABELS.YES;
  if (!value_yes) {
    throw new Error("SETUP_OR_OUTSOURCE_EXISTENCE_LABELS.YES is not defined");
  }
  const value_no = SETUP_OR_OUTSOURCE_EXISTENCE_LABELS.NO;
  if (!value_no) {
    throw new Error("SETUP_OR_OUTSOURCE_EXISTENCE_LABELS.NO is not defined");
  }
  const quotation_request_efficacy_safety_committee_office_label =
    QUOTATION_REQUEST_SHEET.ITEMNAMES
      .EFFICACY_SAFETY_COMMITTEE_OFFICE_EXISTENCE;
  if (!quotation_request_efficacy_safety_committee_office_label) {
    throw new Error(
      "quotation_request_efficacy_safety_committee_office_label is not defined",
    );
  }
  const quotation_request_safety_management_office_label =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.SAFETY_MANAGEMENT_OFFICE_EXISTENCE;
  if (!quotation_request_safety_management_office_label) {
    throw new Error(
      "quotation_request_safety_management_office_label is not defined",
    );
  }
  const item_efficacy_safety_committee_office =
    ITEMS_SHEET.ITEMNAMES.EFFICACY_SAFETY_COMMITTEE_OFFICE;
  if (!item_efficacy_safety_committee_office) {
    throw new Error("item_efficacy_safety_committee_office is not defined");
  }
  const item_safety_management_office =
    ITEMS_SHEET.ITEMNAMES.SAFETY_MANAGEMENT_OFFICE;
  if (!item_safety_management_office) {
    throw new Error("item_safety_management_office is not defined");
  }
  const item_clinical_trials_office_registration =
    ITEMS_SHEET.ITEMNAMES.CLINICAL_TRIALS_OFFICE_REGISTRATION;
  if (!item_clinical_trials_office_registration) {
    throw new Error("item_clinical_trials_office_registration is not defined");
  }

  // 2. 安全性管理事務局のみ追加されるケース
  // - SAFETY_MANAGEMENT_OFFICE_EXISTENCE = "設置・委託する"
  // - EFFICACY_SAFETY_COMMITTEE_OFFICE_EXISTENCE != "設置・委託する"
  // => CENTRAL_MONITORING + SAFETY_MANAGEMENT_OFFICE
  const temp_case2_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      null,
      "S",
      quotation_request_efficacy_safety_committee_office_label,
      value_no,
    );
  const case2_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      temp_case2_array_quotation_request,
      "T",
      quotation_request_safety_management_office_label,
      value_yes,
    );
  runSetRegistrationTermItemsTest_({
    testName: "安全性管理事務局のみ追加されるケース",
    context: {
      sheetname: registration1_sheetName,
      array_quotation_request: case2_array_quotation_request,
      clinical_trials_office_flg: false,
      date_list: {
        trial_target_terms: 12,
        trial_start_date: "2020/04/01",
        trial_end_date: "2026/03/31",
        trial_target_start_date: "2024/04/01",
        trial_target_end_date: "2025/03/31",
      },
    },
    expected: new Map([
      [item_central_monitoring, 12],
      [item_safety_management_office, 12],
    ]),
  });

  // 3. 効安事務局のみ追加されるケース
  // - SAFETY_MANAGEMENT_OFFICE_EXISTENCE != "設置・委託する"
  // - EFFICACY_SAFETY_COMMITTEE_OFFICE_EXISTENCE = "設置・委託する"
  // => CENTRAL_MONITORING + EFFICACY_SAFETY_COMMITTEE_OFFICE
  const temp_case3_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      null,
      "S",
      quotation_request_efficacy_safety_committee_office_label,
      value_yes,
    );
  const case3_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      temp_case3_array_quotation_request,
      "T",
      quotation_request_safety_management_office_label,
      value_no,
    );
  runSetRegistrationTermItemsTest_({
    testName: "効安事務局のみ追加されるケース",
    context: {
      sheetname: registration1_sheetName,
      array_quotation_request: case3_array_quotation_request,
      clinical_trials_office_flg: false,
      date_list: {
        trial_target_terms: 12,
        trial_start_date: "2020/04/01",
        trial_end_date: "2026/03/31",
        trial_target_start_date: "2024/04/01",
        trial_target_end_date: "2025/03/31",
      },
    },
    expected: new Map([
      [item_central_monitoring, 12],
      [item_efficacy_safety_committee_office, 12],
    ]),
  });

  // 4. 安全性管理事務局・効安事務局の両方が追加されるケース
  // => CENTRAL_MONITORING + SAFETY_MANAGEMENT_OFFICE + EFFICACY_SAFETY_COMMITTEE_OFFICE
  const temp_case4_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      null,
      "S",
      quotation_request_efficacy_safety_committee_office_label,
      value_yes,
    );
  const case4_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      temp_case4_array_quotation_request,
      "T",
      quotation_request_safety_management_office_label,
      value_yes,
    );
  runSetRegistrationTermItemsTest_({
    testName: "安全性管理事務局・効安事務局の両方が追加されるケース",
    context: {
      sheetname: registration1_sheetName,
      array_quotation_request: case4_array_quotation_request,
      clinical_trials_office_flg: false,
      date_list: {
        trial_target_terms: 12,
        trial_start_date: "2020/04/01",
        trial_end_date: "2026/03/31",
        trial_target_start_date: "2024/04/01",
        trial_target_end_date: "2025/03/31",
      },
    },
    expected: new Map([
      [item_central_monitoring, 12],
      [item_safety_management_office, 12],
      [item_efficacy_safety_committee_office, 12],
    ]),
  });

  // 5. 複合ケース（最大構成）
  // - clinical_trials_office_flg = true
  // - 安全性管理事務局 = 設置・委託する
  // - 効安事務局 = 設置・委託する
  // - REGISTRATION_1
  // => CENTRAL_MONITORING
  //    + SAFETY_MANAGEMENT_OFFICE
  //    + EFFICACY_SAFETY_COMMITTEE_OFFICE
  //    + 事務局運営（開始後）
  const temp_case5_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      null,
      "S",
      quotation_request_efficacy_safety_committee_office_label,
      value_yes,
    );
  const case5_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      temp_case5_array_quotation_request,
      "T",
      quotation_request_safety_management_office_label,
      value_yes,
    );
  runSetRegistrationTermItemsTest_({
    testName: "複合ケース（最大構成）",
    context: {
      sheetname: registration1_sheetName,
      array_quotation_request: case5_array_quotation_request,
      clinical_trials_office_flg: false,
      date_list: {
        trial_target_terms: 12,
        trial_start_date: "2020/04/01",
        trial_end_date: "2026/03/31",
        trial_target_start_date: "2024/04/01",
        trial_target_end_date: "2025/03/31",
      },
    },
    expected: new Map([
      [item_central_monitoring, 12],
      [item_safety_management_office, 12],
      [item_efficacy_safety_committee_office, 12],
    ]),
  });

  // --- 異常系 ---

  // 6. context に date_list が存在しない
  // => Error が throw されること
  assertThrows_({
    testName: "date_list がない場合はエラー",
    fn: () =>
      setRegistrationTermItems_({
        sheetname: registration1_sheetName,
        array_quotation_request: createTestQuotationRequestArrayWithColumn_(
          null,
          "A",
          "タイムスタンプ",
          "2000/01/01",
        ),
        clinical_trials_office_flg: false,
      }),
    expectedMessage: "date_list",
  });

  // 7. date_list が null / undefined
  // => Error が throw されること
  assertThrows_({
    testName: "date_list が null / undefined",
    fn: () =>
      setRegistrationTermItems_({
        sheetname: registration1_sheetName,
        array_quotation_request: createTestQuotationRequestArrayWithColumn_(
          null,
          "A",
          "タイムスタンプ",
          "2000/01/01",
        ),
        clinical_trials_office_flg: false,
        date_list: null,
      }),
    expectedMessage: "date_list",
  });
}
/**
 * setRegistrationTermItems_ 用 共通テスト関数
 *
 * @param {Object} params
 * @param {string} params.testName テスト名
 * @param {Object} params.context setRegistrationTermItems_ に渡す context
 * @param {Object} [params.scriptProperties] 事前に設定する ScriptProperties
 * @param {Map} params.expected 期待結果
 */
function runSetRegistrationTermItemsTest_({
  testName,
  context,
  scriptProperties = {},
  expected,
}) {
  const sp = PropertiesService.getScriptProperties();

  // --- ScriptProperties 退避 ---
  const backup = {};
  Object.keys(scriptProperties).forEach((key) => {
    backup[key] = sp.getProperty(key);
    sp.setProperty(key, scriptProperties[key]);
  });

  try {
    const actual = setRegistrationTermItems_(context);
    assertEquals_(actual, expected, testName);
  } finally {
    // --- ScriptProperties 復元 ---
    Object.keys(scriptProperties).forEach((key) => {
      if (backup[key] == null) {
        sp.deleteProperty(key);
      } else {
        sp.setProperty(key, backup[key]);
      }
    });
  }
}

function test_calcClinicalTrialsOfficeValues() {
  const registration1_sheetName = getRegistration1SheetNameForTest_();
  // case1
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "3",
    {
      clinicalTrialsOfficeFlg: false,
      registrationMonth: 12,
      sheetname: registration1_sheetName,
    },
    {
      setupOffice: 0,
      registrationOffice: 0,
    },
    "事務局運営なしの場合は、Setup / Registration 共に 0 になること",
  );
  // case2
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "4",
    {
      clinicalTrialsOfficeFlg: true,
      registrationMonth: 12,
      sheetname: registration1_sheetName,
    },
    {
      setupOffice: 4,
      registrationOffice: 12,
    },
    "事務局運営ありの場合、Setupシートにregistration期間が存在する場合はその期間がsetupOfficeにセットされること",
  );
  // case3
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "0",
    {
      clinicalTrialsOfficeFlg: true,
      registrationMonth: 12,
      sheetname: registration1_sheetName,
    },
    {
      setupOffice: 0,
      registrationOffice: 12,
    },
    "事務局運営ありの場合、Setupシートのregistration期間が不明であればsetupOfficeは0になること",
  );
  // case4
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "6",
    {
      clinicalTrialsOfficeFlg: true,
      registrationMonth: 12,
      sheetname: "Registration_2",
    },
    {
      setupOffice: 0,
      registrationOffice: 12,
    },
    "事務局運営ありの場合、Setupシート以外ではsetupOfficeは0になること",
  );
  // case5
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "6",
    {
      clinicalTrialsOfficeFlg: true,
      registrationMonth: 0,
      sheetname: registration1_sheetName,
    },
    {
      setupOffice: 6,
      registrationOffice: 0,
    },
    "事務局運営ありの場合、registration期間が0であってもsetupOfficeはプロパティの値がセットされること",
  );
  // case6
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "abc",
    {
      clinicalTrialsOfficeFlg: true,
      registrationMonth: 12,
      sheetname: registration1_sheetName,
    },
    {
      setupOffice: 0,
      registrationOffice: 12,
    },
    "事務局運営ありの場合、Setupのregistration期間のプロパティの値が数値に変換できない場合はsetupOfficeは0になること",
  );
  // case7
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "0",
    {
      clinicalTrialsOfficeFlg: true,
      registrationMonth: 9,
      sheetname: registration1_sheetName,
    },
    {
      setupOffice: 0,
      registrationOffice: 9,
    },
    "registration期間が12以下の場合も正しくセットされること",
  );
}

function test_calcClinicalTrialsOfficeValues_withProperty_(
  propertySetValue = "0",
  params,
  expected,
  testname,
) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const PROPERTY_KEY = SCRIPT_PROPERTY_KEYS.REG1_SETUP_CLINICAL_TRIALS_OFFICE;

  const originalValue = scriptProperties.getProperty(PROPERTY_KEY);

  try {
    // --- テスト用プロパティをセット ---
    scriptProperties.setProperty(PROPERTY_KEY, propertySetValue);

    const clinicalTrialsOfficeFlg = params.clinicalTrialsOfficeFlg;
    const registrationMonth = params.registrationMonth;
    const sheetname = params.sheetname;

    const actual = calcClinicalTrialsOfficeValues_({
      clinicalTrialsOfficeFlg: clinicalTrialsOfficeFlg,
      registrationMonth: registrationMonth,
      sheetname: sheetname,
    });

    assertEquals_(actual, expected, testname);
  } finally {
    // --- プロパティを必ず元に戻す ---
    if (originalValue === null) {
      scriptProperties.deleteProperty(PROPERTY_KEY);
    } else {
      scriptProperties.setProperty(PROPERTY_KEY, originalValue);
    }
  }
}
/**
 * shouldSkipRegistrationTermItems_ の判定ロジックを検証するテスト
 *
 * 観点：
 * - SETUP / CLOSING シートそれぞれで、期間が閾値未満の場合に skip されるか
 * - 期間が閾値以上の場合に skip されないか
 * - 対象外シートでは常に skip されないか
 */
function test_shouldSkipRegistrationTermItems() {
  const setup_sheetName = getSetupSheetNameForTest_();
  const closing_sheetName = getClosingSheetNameForTest_();
  const REGISTRATION_SKIP_SHEET_CONFIGS = [
    { case: 1, trialTargetTerms: 3, setupTermLimit: 6, closingTermLimit: 6 },
    { case: 2, trialTargetTerms: 7, setupTermLimit: 6, closingTermLimit: 6 },
    { case: 3, trialTargetTerms: 6, setupTermLimit: 6, closingTermLimit: 6 },
  ];
  const targetSheetsName = getTargetSheetNameForTest_();
  targetSheetsName.forEach((sheetname) => {
    REGISTRATION_SKIP_SHEET_CONFIGS.forEach(
      ({
        case: caseNo,
        trialTargetTerms,
        setupTermLimit,
        closingTermLimit,
      }) => {
        let expected;
        // その年度にregistration期間が存在しない場合trueを返して処理をスキップする
        // SETUP シートの場合
        if (sheetname === setup_sheetName) {
          expected = trialTargetTerms < setupTermLimit ? true : false;
        }
        // CLOSING シートの場合
        else if (sheetname === closing_sheetName) {
          expected = trialTargetTerms < closingTermLimit ? true : false;
        }
        // その他のシートの場合
        else {
          expected = false;
        }
        const result = shouldSkipRegistrationTermItems_(
          sheetname,
          trialTargetTerms,
          setupTermLimit,
          closingTermLimit,
        );
        assertEquals_(result, expected, `Case ${caseNo}: ${sheetname}`);
      },
    );
  });
}
