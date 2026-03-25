function testCalcRegistrationMonth_(testCase, caseNumber) {
  const result = calcRegistrationMonth_({
    trialTargetTerms: testCase.trialTargetTerms,
    trialStartDate: testCase.trialStartDate,
    trialEndDate: testCase.trialEndDate,
    trialTargetStartDate: testCase.trialTargetStartDate,
    trialTargetEndDate: testCase.trialTargetEndDate,
  });

  const actual = result;

  if (testCase.expected !== actual) {
    throw new Error(
      `Test${caseNumber} failed: expected ${testCase.expected}, but got ${actual}`,
    );
  }

  Logger.log(
    `✅ Test${caseNumber} passed: expected ${testCase.expected}, got ${actual}`,
  );

  return true;
}

/**
 * calcRegistrationMonth_ テストケース
 *
 * 【前提】
 * - trialTargetTerms は Number（月数）
 */

function testCalcRegistrationMonth() {
  /*
   * Case 1:
   * trialTargetTerms が 12 を超える場合
   * → 無条件で 12 を返す
   *
   * 例:
   * - trialTargetTerms: 18
   * - 他の日付条件は問わない
   * - 期待値: 12
   */
  const case1 = {
    trialTargetTerms: 18,
    trialStartDate: toDate_("2024-01-01"),
    trialEndDate: toDate_("2024-01-01"),
    trialTargetStartDate: toDate_("2024-01-01"),
    trialTargetEndDate: toDate_("2024-01-01"),
    expected: 12,
  };
  if (!testCalcRegistrationMonth_(case1, 1)) {
    throw new Error("Case 1 failed");
  }
  /*
   * Case 2:
   * trialTargetStartDate >= trialStartDate かつ
   * trialTargetEndDate <= trialEndDate
   * （target 期間が trial 期間内に完全に収まる場合）
   *
   * → trialTargetTerms をそのまま返す
   *
   * 例:
   * - trialStartDate: 2022-10-01
   * - trialEndDate: 2025-01-31
   * - trialTargetStartDate: 2022-10-01
   * - trialTargetEndDate: 2025-01-31
   * - trialTargetTerms: 12
   * - 期待値: 12
   */
  const case2 = {
    trialTargetTerms: 12,
    trialStartDate: toDate_("2022-10-01"),
    trialEndDate: toDate_("2025-01-31"),
    trialTargetStartDate: toDate_("2023-04-01"),
    trialTargetEndDate: toDate_("2024-03-31"),
    expected: 12,
  };
  if (!testCalcRegistrationMonth_(case2, 2)) {
    throw new Error("Case 2 failed");
  }
  /*
   * Case 3:
   * trialTargetStartDate < trialStartDate
   * （target 開始日が trial 開始日より前の場合）
   *
   * → trialStartDate ～ trialTargetEndDate(+1日) の月差分を返す
   *
   * 例:
   * - trialStartDate: 2022-10-01
   * - trialTargetEndDate: 2023-03-31
   * - diff 計算対象: 2022-10-01 ～ 2023-04-01
   * - 期待値: 6
   *
   */
  const case3 = {
    trialTargetTerms: 11,
    trialStartDate: toDate_("2022-11-01"),
    trialEndDate: toDate_("2025-01-31"),
    trialTargetStartDate: toDate_("2022-05-01"),
    trialTargetEndDate: toDate_("2023-03-31"),
    expected: 5,
  };
  if (!testCalcRegistrationMonth_(case3, 3)) {
    throw new Error("Case 3 failed");
  }
  /*
   * Case 4:
   * trialEndDate < trialTargetEndDate
   * （target 終了日が trial 終了日より後の場合）
   *
   * → trialTargetStartDate ～ trialEndDate(+1日) の月差分を返す
   *
   * 例:
   * - trialTargetStartDate: 2024-03-01
   * - trialEndDate: 2024-06-30
   * - diff 計算対象: 2024-03-01 ～ 2024-07-01
   * - 期待値: 4
   */
  const case4 = {
    trialTargetTerms: 12,
    trialStartDate: toDate_("2022-10-01"),
    trialEndDate: toDate_("2025-01-31"),
    trialTargetStartDate: toDate_("2024-04-01"),
    trialTargetEndDate: toDate_("2025-03-31"),
    expected: 10,
  };
  if (!testCalcRegistrationMonth_(case4, 4)) {
    throw new Error("Case 4 failed");
  }
  /* Case 5:
   * target 期間が trial 期間よりも完全に前に存在する場合
   *
   * （target 終了日 < trial 開始日）
   *
   * → 登録対象期間が存在しないため 0 を返す
   *
   * 例:
   * - trialStartDate: 2022-04-01
   * - trialEndDate: 2025-01-31
   * - trialTargetStartDate: 2021-10-01
   * - trialTargetEndDate: 2022-03-31
   * - trialTargetTerms <= 12
   * - target 終了日(+1日) と trial 開始日の diff(months) が 0
   * - 期待値: 0
   */
  const case5 = {
    trialTargetTerms: 6,
    trialStartDate: toDate_("2022-04-01"),
    trialEndDate: toDate_("2025-01-31"),
    trialTargetStartDate: toDate_("2021-10-01"),
    trialTargetEndDate: toDate_("2022-03-31"),
    expected: 0,
  };
  if (!testCalcRegistrationMonth_(case5, 5)) {
    throw new Error("Case 5 failed");
  }
  /* Case X（異常系）:
   * 登録対象期間（target）が trial 期間とまったく重ならない場合
   * （target が trial の終了後に完全に存在するケース）
   *
   * 【異常系とする理由】
   * - 登録月数は target 期間が trial 期間と重なっていることを前提に計算される
   * - 本ケースでは trial と target が一切重ならないため、
   *   業務上「登録対象外」と判断する
   *
   * 【条件】
   * - trialTargetTerms <= 12
   * - trialTargetStartDate > trialEndDate
   *
   * 【期待される挙動】
   * - 登録対象月数は算出不可
   * - 空文字 "" を返す
   *
   * 【例】
   * - trial: 2022-01-01 ～ 2022-12-31
   * - target: 2023-01-01 ～ 2023-06-30
   * - expected: ""
   */
  const case6 = {
    trialTargetTerms: 6,
    trialStartDate: toDate_("2022-01-01"),
    trialEndDate: toDate_("2022-12-31"),
    trialTargetStartDate: toDate_("2023-01-01"),
    trialTargetEndDate: toDate_("2023-06-30"),
    expected: 0,
  };

  if (!testCalcRegistrationMonth_(case6, 6)) {
    throw new Error("Case 6 failed");
  }

  /*
   * Case 7:
   * - trialTargetStartDate === trialStartDate
   * - trialTargetEndDate === trialEndDate
   * - 期待値: trialTargetTerms
   */
  const case7 = {
    trialTargetTerms: 2,
    trialStartDate: toDate_("2025-04-01"),
    trialEndDate: toDate_("2025-05-31"),
    trialTargetStartDate: toDate_("2025-04-01"),
    trialTargetEndDate: toDate_("2025-05-31"),
    expected: 2,
  };
  if (!testCalcRegistrationMonth_(case7, 7)) {
    throw new Error("Case 7 failed");
  }
  /* Case 8:
   * - trialTargetStartDate === trialStartDate
   * - trialTargetEndDate < trialEndDate
   * - 期待値: trialTargetTerms
   */
  const case8 = {
    trialTargetTerms: 6,
    trialStartDate: toDate_("2025-10-01"),
    trialEndDate: toDate_("2026-05-31"),
    trialTargetStartDate: toDate_("2025-10-01"),
    trialTargetEndDate: toDate_("2026-03-31"),
    expected: 6,
  };
  if (!testCalcRegistrationMonth_(case8, 8)) {
    throw new Error("Case 8 failed");
  }
  /* Case 9:
   * - trialTargetStartDate > trialStartDate
   * - trialTargetEndDate === trialEndDate
   * - 期待値: trialTargetTerms
   */
  const case9 = {
    trialTargetTerms: 3,
    trialStartDate: toDate_("2025-10-01"),
    trialEndDate: toDate_("2026-03-31"),
    trialTargetStartDate: toDate_("2026-01-01"),
    trialTargetEndDate: toDate_("2026-03-31"),
    expected: 3,
  };
  if (!testCalcRegistrationMonth_(case9, 9)) {
    throw new Error("Case 9 failed");
  }
}
