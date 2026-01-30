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
}

function testImbalance_monitoring_case1() {
  // 入力データの構築
  const temp = createTestQuotationRequestArrayWithColumn_(
    null,
    "O",
    "1例あたりの実地モニタリング回数",
    4,
  );
  const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
    temp,
    "V",
    "目標症例数",
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
  // 入力データの構築
  const temp = createTestQuotationRequestArrayWithColumn_(
    null,
    "O",
    "1例あたりの実地モニタリング回数",
    4,
  );
  const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
    temp,
    "V",
    "目標症例数",
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
function testImbalance_audit_case1() {
  // 入力データの構築
  const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
    null,
    "Q",
    "監査対象施設数",
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
  // 入力データの構築
  const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
    null,
    "Q",
    "監査対象施設数",
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
function testImbalance_patientRegistration_case1() {
  // 入力データの構築
  const temp = createTestQuotationRequestArrayWithColumn_(
    null,
    "AJ",
    "症例登録毎の支払",
    COMMON_EXISTENCE_LABELS.YES,
  );
  const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
    temp,
    "V",
    "目標症例数",
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
  // 入力データの構築
  const temp = createTestQuotationRequestArrayWithColumn_(
    null,
    "AJ",
    "症例登録毎の支払",
    COMMON_EXISTENCE_LABELS.YES,
  );
  const quotationRequestData = createTestQuotationRequestArrayWithColumn_(
    temp,
    "V",
    "目標症例数",
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
function runImbalanceTest_(
  quotationRequestData,
  trialYears,
  expectedValues,
  testName,
) {
  const scriptProps = PropertiesService.getScriptProperties();
  const patientRegistrationFee = "症例登録毎の支払";
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
