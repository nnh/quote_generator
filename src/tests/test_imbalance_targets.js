/**
 * build_imbalance_targets.js のテスト
 * 各種不均衡ターゲットの計算ロジックが正しいことを確認する
 * パターン1、パターン2それぞれについて、実地モニタリング、監査、症例登録毎の支払のケースを網羅する
 */
function execAllImbalanceTests() {
  testImbalance_monitoring_case1();
  testImbalance_monitoring_case2();
  testImbalance_audit_case1();
  testImbalance_audit_case2();
  testImbalance_patientRegistration_case1();
  testImbalance_patientRegistration_case2();
  console.log("[PASS] execAllImbalanceTests");
}
function testImbalance_monitoring_get_constant_() {
  const quotation_request_monitoring_per_case_item_name =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.MONITORING_COUNT_PER_CASE;
  if (!quotation_request_monitoring_per_case_item_name) {
    throw new Error(
      "定数QUOTATION_REQUEST_SHEET.ITEMNAMES.MONITORING_COUNT_PER_CASEが未定義です",
    );
  }
  const quotation_request_target_number_of_cases_item_name =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.NUMBER_OF_CASES;
  if (!quotation_request_target_number_of_cases_item_name) {
    throw new Error(
      "定数QUOTATION_REQUEST_SHEET.ITEMNAMES.NUMBER_OF_CASESが未定義です",
    );
  }
  return {
    quotation_request_monitoring_per_case_item_name:
      quotation_request_monitoring_per_case_item_name,
    quotation_request_target_number_of_cases_item_name:
      quotation_request_target_number_of_cases_item_name,
  };
}

function testImbalance_monitoring_case1() {
  const {
    quotation_request_monitoring_per_case_item_name,
    quotation_request_target_number_of_cases_item_name,
  } = testImbalance_monitoring_get_constant_();
  // 入力データの構築
  const temp = createTestQuotationRequestArrayWithColumn_(
    null,
    "O",
    quotation_request_monitoring_per_case_item_name,
    4,
  );
  const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
    temp,
    "V",
    quotation_request_target_number_of_cases_item_name,
    10,
  );

  // 日付データ
  const trialYears = [
    ["2000/4/1", "2001/3/31"],
    ["2021/4/1", "2023/3/31"],
    ["", ""],
    ["2023/4/1", "2024/3/31"],
    ["", ""],
    ["", ""],
    ["", ""],
    ["2024/4/1", "2024/9/30"],
    ["2020/4/1", "2024/9/30"],
  ];

  // 期待値
  const expectedValues = [
    [
      ["Registration_1", 13],
      ["Interim_1", 13],
    ],
    [
      ["Registration_1", 0],
      ["Interim_1", 0],
    ],
    [
      ["Registration_1", 0],
      ["Interim_1", 0],
    ],
  ];

  runImbalanceTest_(
    quotationRequestData,
    trialYears,
    expectedValues,
    "Monitoring Pattern 1",
  );
}
function testImbalance_monitoring_case2() {
  const {
    quotation_request_monitoring_per_case_item_name,
    quotation_request_target_number_of_cases_item_name,
  } = testImbalance_monitoring_get_constant_();
  // 入力データの構築
  const temp = createTestQuotationRequestArrayWithColumn_(
    null,
    "O",
    quotation_request_monitoring_per_case_item_name,
    4,
  );
  const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
    temp,
    "V",
    quotation_request_target_number_of_cases_item_name,
    7,
  );

  // 日付データ
  const trialYears = [
    ["2000/4/1", "2001/3/31"],
    ["2021/4/1", "2022/3/31"],
    ["", ""],
    ["2022/4/1", "2023/3/31"],
    ["2023/4/1", "2024/3/31"],
    ["", ""],
    ["", ""],
    ["2024/4/1", "2024/9/30"],
    ["2020/4/1", "2024/9/30"],
  ];

  // 期待値
  const expectedValues = [
    [
      ["Registration_1", 10],
      ["Interim_1", 9],
      ["Observation_1", 9],
    ],
    [
      ["Registration_1", 0],
      ["Interim_1", 0],
      ["Observation_1", 0],
    ],
    [
      ["Registration_1", 0],
      ["Interim_1", 0],
      ["Observation_1", 0],
    ],
  ];

  runImbalanceTest_(
    quotationRequestData,
    trialYears,
    expectedValues,
    "Monitoring Pattern 2",
  );
}
function testImbalance_audit_get_constant_() {
  const quotation_request_audit_item_name =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.AUDIT_TARGET_FACILITIES;
  if (!quotation_request_audit_item_name) {
    throw new Error(
      "定数QUOTATION_REQUEST_SHEET.ITEMNAMES.AUDIT_TARGET_FACILITIESが未定義です",
    );
  }
  return {
    quotation_request_audit_item_name: quotation_request_audit_item_name,
  };
}
function testImbalance_audit_case1() {
  const { quotation_request_audit_item_name } =
    testImbalance_audit_get_constant_();
  // 入力データの構築
  const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
    null,
    "Q",
    quotation_request_audit_item_name,
    7,
  );

  // 日付データ
  const trialYears = [
    ["2000/4/1", "2001/3/31"],
    ["2021/4/1", "2023/3/31"],
    ["", ""],
    ["2023/4/1", "2024/3/31"],
    ["", ""],
    ["", ""],
    ["", ""],
    ["2024/4/1", "2024/9/30"],
    ["2020/4/1", "2024/9/30"],
  ];

  // 期待値
  const expectedValues = [
    [
      ["Registration_1", 0],
      ["Interim_1", 0],
    ],
    [
      ["Registration_1", 2],
      ["Interim_1", 2],
    ],
    [
      ["Registration_1", 0],
      ["Interim_1", 0],
    ],
  ];

  runImbalanceTest_(
    quotationRequestData,
    trialYears,
    expectedValues,
    "audit Pattern 1",
  );
}
function testImbalance_audit_case2() {
  const { quotation_request_audit_item_name } =
    testImbalance_audit_get_constant_();
  // 入力データの構築
  const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
    null,
    "Q",
    quotation_request_audit_item_name,
    7,
  );

  // 日付データ
  const trialYears = [
    ["2000/4/1", "2001/3/31"],
    ["2021/4/1", "2022/3/31"],
    ["", ""],
    ["2022/4/1", "2023/3/31"],
    ["2023/4/1", "2024/3/31"],
    ["", ""],
    ["", ""],
    ["2024/4/1", "2024/9/30"],
    ["2020/4/1", "2024/9/30"],
  ];

  // 期待値
  const expectedValues = [
    [
      ["Registration_1", 0],
      ["Interim_1", 0],
      ["Observation_1", 0],
    ],
    [
      ["Registration_1", 3],
      ["Interim_1", 2],
      ["Observation_1", 2],
    ],
    [
      ["Registration_1", 0],
      ["Interim_1", 0],
      ["Observation_1", 0],
    ],
  ];

  runImbalanceTest_(
    quotationRequestData,
    trialYears,
    expectedValues,
    "audit Pattern 2",
  );
}
function testImbalance_patientRegistration_get_constant_() {
  const quotation_request_patient_registration_per_case_item_name =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.REGISTRATION_FEE;
  if (!quotation_request_patient_registration_per_case_item_name) {
    throw new Error(
      "定数QUOTATION_REQUEST_SHEET.ITEMNAMES.PATIENT_REGISTRATION_FEE_PER_CASEが未定義です",
    );
  }
  const quotation_request_number_of_cases_item_name =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.NUMBER_OF_CASES;
  if (!quotation_request_number_of_cases_item_name) {
    throw new Error(
      "定数QUOTATION_REQUEST_SHEET.ITEMNAMES.NUMBER_OF_CASESが未定義です",
    );
  }
  return {
    quotation_request_patient_registration_per_case_item_name:
      quotation_request_patient_registration_per_case_item_name,
    quotation_request_number_of_cases_item_name:
      quotation_request_number_of_cases_item_name,
  };
}
function testImbalance_patientRegistration_case1() {
  const {
    quotation_request_patient_registration_per_case_item_name,
    quotation_request_number_of_cases_item_name,
  } = testImbalance_patientRegistration_get_constant_();
  // 入力データの構築
  const temp = createTestQuotationRequestArrayWithColumn_(
    null,
    "AJ",
    quotation_request_patient_registration_per_case_item_name,
    COMMON_EXISTENCE_LABELS.YES,
  );
  const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
    temp,
    "V",
    quotation_request_number_of_cases_item_name,
    10,
  );

  // 日付データ
  const trialYears = [
    ["2000/4/1", "2001/3/31"],
    ["2021/4/1", "2023/3/31"],
    ["", ""],
    ["2023/4/1", "2024/3/31"],
    ["", ""],
    ["", ""],
    ["", ""],
    ["2024/4/1", "2024/9/30"],
    ["2020/4/1", "2024/9/30"],
  ];

  // 期待値
  const expectedValues = [
    [
      ["Registration_1", 0],
      ["Interim_1", 0],
    ],
    [
      ["Registration_1", 0],
      ["Interim_1", 0],
    ],
    [
      ["Registration_1", 3],
      ["Interim_1", 3],
    ],
  ];

  runImbalanceTest_(
    quotationRequestData,
    trialYears,
    expectedValues,
    "patientRegistration Pattern 1",
  );
}
function testImbalance_patientRegistration_case2() {
  const {
    quotation_request_patient_registration_per_case_item_name,
    quotation_request_number_of_cases_item_name,
  } = testImbalance_patientRegistration_get_constant_();
  // 入力データの構築
  const temp = createTestQuotationRequestArrayWithColumn_(
    null,
    "AJ",
    quotation_request_patient_registration_per_case_item_name,
    COMMON_EXISTENCE_LABELS.YES,
  );
  const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
    temp,
    "V",
    quotation_request_number_of_cases_item_name,
    7,
  );

  // 日付データ
  const trialYears = [
    ["2000/4/1", "2001/3/31"],
    ["2021/4/1", "2022/3/31"],
    ["", ""],
    ["2022/4/1", "2023/3/31"],
    ["2023/4/1", "2024/3/31"],
    ["", ""],
    ["", ""],
    ["2024/4/1", "2024/9/30"],
    ["2020/4/1", "2024/9/30"],
  ];

  // 期待値
  const expectedValues = [
    [
      ["Registration_1", 0],
      ["Interim_1", 0],
      ["Observation_1", 0],
    ],
    [
      ["Registration_1", 0],
      ["Interim_1", 0],
      ["Observation_1", 0],
    ],
    [
      ["Registration_1", 3],
      ["Interim_1", 2],
      ["Observation_1", 2],
    ],
  ];

  runImbalanceTest_(
    quotationRequestData,
    trialYears,
    expectedValues,
    "patientRegistration Pattern 2",
  );
}
function test_runImbalanceTest_get_constant_() {
  const quotation_request_patient_registration_per_case_item_name =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.REGISTRATION_FEE;
  if (!quotation_request_patient_registration_per_case_item_name) {
    throw new Error(
      "定数QUOTATION_REQUEST_SHEET.ITEMNAMES.PATIENT_REGISTRATION_FEE_PER_CASEが未定義です",
    );
  }
  return quotation_request_patient_registration_per_case_item_name;
}
function runImbalanceTest_(
  quotationRequestData,
  trialYears,
  expectedValues,
  testName,
) {
  const scriptProps = PropertiesService.getScriptProperties();
  const patientRegistrationFee = test_runImbalanceTest_get_constant_();
  const backup = new TrialDatesBackupForTest_();

  backup.save();

  try {
    // 1. セットアップ
    const trialSheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Trial");
    trialSheet.getRange("D32:E40").clearContent();
    trialSheet.getRange("D32:E40").setValues(trialYears);
    SpreadsheetApp.flush();

    // 2. 実行
    const targetImbalance = setTargetInblanceValues_(
      scriptProps,
      patientRegistrationFee,
    );
    const actualValues = buildImbalanceTargets_(
      quotationRequestData,
      targetImbalance,
      patientRegistrationFee,
    );

    // 3. 検証（共通関数を呼び出し）
    assertEquals_(actualValues, expectedValues, testName);
  } catch (e) {
    console.error(`[ERROR] ${testName} failed with error: ${e.message}`);
  } finally {
    backup.restore();
    backup.clear();
  }
}
