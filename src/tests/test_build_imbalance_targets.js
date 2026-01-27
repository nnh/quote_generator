function execAllImbalanceTests() {
  testImbalance_monitoring_case1();
  // test_monitoring_case2(); // 他のパターンもここに追加していくだけ
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
