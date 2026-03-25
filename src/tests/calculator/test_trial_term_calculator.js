/**
 * 全テストを一括実行するエントリーポイント
 *
 * 実行方法：
 * - GASエディタからこの関数を実行するだけ
 *
 * @return {void}
 */
function runAllTrialTermTests_trial_term_calculators() {
  const tests = [
    test_calculateSetupPeriod_,
    test_calculateClosingPeriod_,
    test_hasPositiveMonthDiff_,
    test_calculateRegistration1_,
    test_calculateObservation2_,
    test_calculateRegistration2_,
    test_registrationStartFallback_,
    test_registrationEndFallback_,
    test_calculateRegistrationDurationYears_,
    testCalculateSetupPeriod_,
    testCalculateClosingPeriod_,
    testCalculateRegistrationPeriods_,
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((testFn) => {
    try {
      testFn();
      Logger.log(`✅ PASS: ${testFn.name}`);
      passed++;
    } catch (e) {
      Logger.log(`❌ FAIL: ${testFn.name}`);
      Logger.log(e);
      failed++;
    }
  });

  Logger.log("=================================");
  Logger.log(`Total: ${tests.length}`);
  Logger.log(`PASS : ${passed}`);
  Logger.log(`FAIL : ${failed}`);
  Logger.log("=================================");
}

function test_calculateSetupPeriod_() {
  const testCases = [
    {
      name: "年度内 / 3ヶ月",
      trialStart: "2024-07-01",
      setupTermMonths: 3,
      expected: {
        setupStart: "2024-04-01",
        setupEnd: "2025-03-31",
      },
    },
    {
      name: "年度内 / 6ヶ月",
      trialStart: "2024-10-01",
      setupTermMonths: 6,
      expected: {
        setupStart: "2024-04-01",
        setupEnd: "2025-03-31",
      },
    },
    {
      name: "年度初月（4月開始）",
      trialStart: "2024-04-01",
      setupTermMonths: 3,
      expected: {
        setupStart: "2024-01-01",
        setupEnd: "2024-03-31",
      },
    },
    {
      name: "年度またぎ（1月開始）",
      trialStart: "2025-01-01",
      setupTermMonths: 3,
      expected: {
        setupStart: "2024-10-01",
        setupEnd: "2025-03-31",
      },
    },
    {
      name: "6ヶ月・前年開始",
      trialStart: "2025-06-01",
      setupTermMonths: 6,
      expected: {
        setupStart: "2024-12-01",
        setupEnd: "2025-03-31",
      },
    },
  ];

  testCases.forEach((c) => {
    const trialStart = new Date(c.trialStart);

    const actualRaw = calculateSetupPeriod_(trialStart, c.setupTermMonths);

    const actual = normalizeSetupPeriodResultForTest_(actualRaw);

    assertEquals_(actual, c.expected, `calculateSetupPeriod: ${c.name}`);
  });
}
function test_calculateClosingPeriod_() {
  const testCases = [
    {
      name: "年度内 / 3ヶ月",
      trialEnd: "2024-09-30", // 月末正規化済み
      closingTermMonths: 3,
      expected: {
        closingStart: "2024-04-01",
        closingEnd: "2024-12-31",
      },
    },
    {
      name: "年度内 / 6ヶ月",
      trialEnd: "2024-09-30",
      closingTermMonths: 6,
      expected: {
        closingStart: "2024-04-01",
        closingEnd: "2025-03-31",
      },
    },
    {
      name: "年度末終了 / 3ヶ月",
      trialEnd: "2025-03-31",
      closingTermMonths: 3,
      expected: {
        closingStart: "2025-04-01",
        closingEnd: "2025-06-30",
      },
    },
    {
      name: "年度末終了 / 6ヶ月",
      trialEnd: "2025-03-31",
      closingTermMonths: 6,
      expected: {
        closingStart: "2025-04-01",
        closingEnd: "2025-09-30",
      },
    },
    {
      name: "年度またぎ / 6ヶ月",
      trialEnd: "2024-12-31",
      closingTermMonths: 6,
      expected: {
        closingStart: "2025-04-01",
        closingEnd: "2025-06-30",
      },
    },
  ];

  testCases.forEach((c) => {
    const trialEnd = new Date(c.trialEnd);

    const actualRaw = calculateClosingPeriod_(trialEnd, c.closingTermMonths);

    const actual = normalizeClosingPeriodResultForTest_(actualRaw);

    assertEquals_(actual, c.expected, `calculateClosingPeriod_: ${c.name}`);
  });
}

/**
 * setup期間の結果を比較用に正規化する
 *
 * @param {{setupStart: Date|Object, setupEnd: Date|Object}} result
 * @return {{setupStart: string, setupEnd: string}}
 */
function normalizeSetupPeriodResultForTest_(result) {
  const start = normalizeDate_(result.setupStart);
  const end = normalizeDate_(result.setupEnd);

  return {
    setupStart: Utilities.formatDate(start, "Asia/Tokyo", "yyyy-MM-dd"),
    setupEnd: Utilities.formatDate(end, "Asia/Tokyo", "yyyy-MM-dd"),
  };
}

/**
 * closing期間の結果を比較用に正規化する
 *
 * @param {{closingStart: Date|Object, closingEnd: Date|Object}} result
 * @return {{closingStart: string, closingEnd: string}}
 */
function normalizeClosingPeriodResultForTest_(result) {
  const start = normalizeDate_(result.closingStart);
  const end = normalizeDate_(result.closingEnd);

  return {
    closingStart: Utilities.formatDate(start, "Asia/Tokyo", "yyyy-MM-dd"),
    closingEnd: Utilities.formatDate(end, "Asia/Tokyo", "yyyy-MM-dd"),
  };
}
/**
 * hasPositiveMonthDiff_ の単体テスト
 *
 * Moment の
 *   to.diff(from, "months") > 0
 * と同等の挙動を維持できているか確認する。
 *
 * 検証観点：
 * - 同一月内は false
 * - 翌月でも「日未満」は false（Moment仕様）
 * - 1ヶ月成立時のみ true
 * - 過去方向は false
 * - 月末 → 翌月初は false（重要）
 * - Date入力で動作する
 *
 * @return {void}
 */
function test_hasPositiveMonthDiff_() {
  const cases = [
    {
      name: "same month should be false",
      from: new Date("2024-04-01"),
      to: new Date("2024-04-30"),
      expected: false,
    },
    {
      name: "next month same day should be true",
      from: new Date("2024-04-01"),
      to: new Date("2024-05-01"),
      expected: true,
    },
    {
      name: "next month but day not reached should be false (Moment behavior)",
      from: new Date("2024-04-15"),
      to: new Date("2024-05-14"),
      expected: false,
    },
    {
      name: "next month and day reached should be true",
      from: new Date("2024-04-15"),
      to: new Date("2024-05-15"),
      expected: true,
    },
    {
      name: "month end to next month start should be false (Moment critical case)",
      from: new Date("2024-03-31"),
      to: new Date("2024-04-01"),
      expected: false,
    },
    {
      name: "earlier month should be false",
      from: new Date("2024-05-01"),
      to: new Date("2024-04-30"),
      expected: false,
    },
    {
      name: "year boundary should be true",
      from: new Date("2023-12-01"),
      to: new Date("2024-01-01"),
      expected: true,
    },
  ];

  cases.forEach(({ name, from, to, expected }) => {
    const actual = hasPositiveMonthDiff_(from, to);
    assertEquals_(actual, expected, name);
  });
}
/**
 * calculateRegistration1_ の単体テスト
 */
function test_calculateRegistration1_() {
  const cases = [
    {
      name: "registration_1 exists when month diff is positive",
      setupEnd: new Date("2024-03-31"),
      closingStart: new Date("2024-05-01"),
      expected: {
        start: "2024-04-01",
        end: "2025-03-31",
      },
    },
    {
      name: "registration_1 is null when month diff is zero",
      setupEnd: new Date("2024-04-30"),
      closingStart: new Date("2024-04-30"),
      expected: {
        start: null,
        end: null,
      },
    },
  ];

  cases.forEach(({ name, setupEnd, closingStart, expected }) => {
    const actual = calculateRegistration1_(setupEnd, closingStart);

    const actualNormalized = {
      start: formatDateForTest_(actual.start),
      end: formatDateForTest_(actual.end),
    };

    assertEquals_(actualNormalized, expected, name);
  });
}
/**
 * calculateObservation2_ の単体テスト
 */
function test_calculateObservation2_() {
  const cases = [
    {
      name: "observation_2 exists when registration1End is before closingStart",
      registration1End: new Date("2025-03-31"),
      closingStart: new Date("2026-04-01"),
      expected: {
        start: "2025-04-01",
        end: "2026-03-31",
      },
    },
    {
      name: "observation_2 is null when registration1End is null",
      registration1End: null,
      closingStart: new Date("2026-04-01"),
      expected: {
        start: null,
        end: null,
      },
    },
  ];

  cases.forEach(({ name, registration1End, closingStart, expected }) => {
    const actual = calculateObservation2_(registration1End, closingStart);

    const actualNormalized = {
      start: formatDateForTest_(actual.start),
      end: formatDateForTest_(actual.end),
    };

    assertEquals_(actualNormalized, expected, name);
  });
}
/**
 * calculateRegistration2_ のテスト
 */
function test_calculateRegistration2_() {
  // CASE 1: registration2 が発生するケース
  (function () {
    const registration1End = new Date("2024-03-31");
    const observation2Start = new Date("2024-05-01");

    const actual = calculateRegistration2_(registration1End, observation2Start);

    const expected = {
      start: "2024-04-01",
      end: "2024-04-30",
    };

    assertEquals_(
      {
        start: formatDateForTest_(actual.start),
        end: formatDateForTest_(actual.end),
      },
      expected,
      "calculateRegistration2_ / registration2あり",
    );
  })();

  // CASE 2: observation2Start が null → registration2 なし
  (function () {
    const registration1End = new Date("2024-03-31");
    const observation2Start = null;

    const actual = calculateRegistration2_(registration1End, observation2Start);

    assertEquals_(
      actual,
      { start: null, end: null },
      "calculateRegistration2_ / observation2Startなし",
    );
  })();

  // CASE 3: 月差が 0 → registration2 なし
  (function () {
    const registration1End = new Date("2024-03-31");
    const observation2Start = new Date("2024-04-01");

    const actual = calculateRegistration2_(registration1End, observation2Start);

    assertEquals_(
      actual,
      { start: null, end: null },
      "calculateRegistration2_ / 月差0",
    );
  })();
}
function formatDateForTest_(d) {
  if (!d) return null;
  return Utilities.formatDate(d, "Asia/Tokyo", "yyyy-MM-dd");
}
/**
 * Registration開始日の決定ロジック
 *
 * registration1Start があればそれを使用し、
 * 無ければ trialStart が使用されることを確認する。
 */
function test_registrationStartFallback_() {
  const trialStart = new Date("2024-04-01");

  const cases = [
    {
      name: "registration1Start is used when present",
      reg1: new Date("2024-03-01"),
      trial: trialStart,
      expected: "2024-03-01",
    },
    {
      name: "trialStart is used when reg1 is null",
      reg1: null,
      trial: trialStart,
      expected: "2024-04-01",
    },
  ];

  cases.forEach(({ name, reg1, trial, expected }) => {
    const start = normalizeDate_(reg1 ?? trial);
    const actual = start.toISOString().slice(0, 10);

    assertEquals_(actual, expected, name);
  });
}
/**
 * Registration終了日の優先順位ロジック
 *
 * obs2 → reg2 → reg1 → trial の順で採用されることを確認
 */
function test_registrationEndFallback_() {
  const trialEnd = new Date("2025-03-31");

  const cases = [
    {
      name: "obs2End is used first",
      obs2: new Date("2025-02-01"),
      reg2: new Date("2025-01-01"),
      reg1: new Date("2024-12-01"),
      expected: "2025-02-01",
    },
    {
      name: "reg2End is fallback",
      obs2: null,
      reg2: new Date("2025-01-01"),
      reg1: new Date("2024-12-01"),
      expected: "2025-01-01",
    },
    {
      name: "reg1End is fallback",
      obs2: null,
      reg2: null,
      reg1: new Date("2024-12-01"),
      expected: "2024-12-01",
    },
    {
      name: "trialEnd is final fallback",
      obs2: null,
      reg2: null,
      reg1: null,
      expected: "2025-03-31",
    },
  ];

  cases.forEach(({ name, obs2, reg2, reg1, expected }) => {
    const end = normalizeDate_(obs2 ?? reg2 ?? reg1 ?? trialEnd);
    const actual = end.toISOString().slice(0, 10);

    assertEquals_(actual, expected, name);
  });
}
/**
 * calculateRegistrationDurationYears_ の統合テスト
 */
function test_calculateRegistrationDurationYears_() {
  const trialStart = new Date("2021-04-01");
  const trialEnd = new Date("2025-03-31");

  const registration1Start = new Date("2022-04-01");
  const registration1End = new Date("2023-03-31");

  const registration2End = new Date("2023-03-31");
  const observation2End = new Date("2024-03-31");

  /**
   * Case 1:
   * registrationStart = registration1Start
   * registrationEnd   = observation2End
   * → 2 years
   */
  assertEquals_(
    calculateRegistrationDurationYears_(
      registration1Start,
      observation2End,
      registration2End,
      registration1End,
      trialStart,
      trialEnd,
    ),
    2,
    "reg1Start → obs2End",
  );

  /**
   * Case 2:
   * observation2End がない → registration2End
   * → 1 year
   */
  assertEquals_(
    calculateRegistrationDurationYears_(
      registration1Start,
      null,
      registration2End,
      registration1End,
      trialStart,
      trialEnd,
    ),
    1,
    "reg1Start → reg2End",
  );

  /**
   * Case 3:
   * registration1Start がない → trialStart
   * registrationEnd = registration1End
   * → 2 years
   */
  assertEquals_(
    calculateRegistrationDurationYears_(
      null,
      null,
      null,
      registration1End,
      trialStart,
      trialEnd,
    ),
    2,
    "trialStart → registration1End",
  );

  /**
   * Case 4:
   * 全部 null → trialStart ～ trialEnd
   * → 4 years
   */
  assertEquals_(
    calculateRegistrationDurationYears_(
      null,
      null,
      null,
      null,
      trialStart,
      trialEnd,
    ),
    4,
    "trialStart → trialEnd",
  );
}

/**
 * 【テスト用】
 * calculateSetupPeriod_ の結果を assertEquals_ で検証する
 * - 1件でも FAIL したら Error を throw
 * - 全件 PASS したら成功ログを出力
 */
function testCalculateSetupPeriod_() {
  const testCases = [
    {
      testName: "Setup 6 months from 2024-04",
      trialStart: "2024-04-01",
      setupTermMonths: 6,
      expected: {
        setupStart: "2023-10-01",
        setupEnd: "2024-03-31",
      },
    },
    {
      testName: "Setup 3 months from 2024-10",
      trialStart: "2024-10-01",
      setupTermMonths: 3,
      expected: {
        setupStart: "2024-07-01",
        setupEnd: "2025-03-31",
      },
    },
    {
      testName: "Setup crossing fiscal year (2025-01)",
      trialStart: "2025-01-01",
      setupTermMonths: 6,
      expected: {
        setupStart: "2024-07-01",
        setupEnd: "2025-03-31",
      },
    },
    {
      testName: "Setup 3 months from 2024-10", // 年度跨ぎ
      trialStart: "2024-05-01",
      setupTermMonths: 3,
      expected: {
        setupStart: "2024-02-01",
        setupEnd: "2024-03-31",
      },
    },
  ];

  testCases.forEach((test) => {
    const trialStart = startOfMonth_(toDate_(test.trialStart));

    const result = calculateSetupPeriod_(trialStart, test.setupTermMonths);

    const startOk = assertEquals_(
      Utilities.formatDate(result.setupStart, "Asia/Tokyo", "yyyy-MM-dd"),
      test.expected.setupStart,
      `${test.testName} - setupStart`,
    );

    if (!startOk) {
      throw new Error(`Test failed: ${test.testName} (setupStart)`);
    }

    const endOk = assertEquals_(
      Utilities.formatDate(result.setupEnd, "Asia/Tokyo", "yyyy-MM-dd"),
      test.expected.setupEnd,
      `${test.testName} - setupEnd`,
    );

    if (!endOk) {
      throw new Error(`Test failed: ${test.testName} (setupEnd)`);
    }
  });

  Logger.log("🎉 All testCalculateSetupPeriod tests passed.");
}
/**
 * 【テスト用】
 * calculateClosingPeriod_ の結果を assertEquals_ で検証する
 * - 1件でも FAIL したら Error を throw
 * - 全件 PASS したら成功ログを出力
 */
function testCalculateClosingPeriod_() {
  const testCases = [
    {
      testName: "Closing 6 months from 2024-03",
      trialEnd: "2024-03-31",
      closingTermMonths: 6,
      expected: {
        closingStart: "2024-04-01",
        closingEnd: "2024-09-30",
      },
    },
    {
      testName: "Closing 3 months from 2024-12",
      trialEnd: "2024-12-31",
      closingTermMonths: 3,
      expected: {
        closingStart: "2024-04-01",
        closingEnd: "2025-03-31",
      },
    },
    {
      testName: "Closing crossing fiscal year (2025-06)",
      trialEnd: "2025-06-30",
      closingTermMonths: 6,
      expected: {
        closingStart: "2025-04-01",
        closingEnd: "2025-12-31",
      },
    },
    {
      testName: "Closing 3 months from 2025-01", // 年度跨ぎ
      trialEnd: "2025-01-31",
      closingTermMonths: 3,
      expected: {
        closingStart: "2025-04-01",
        closingEnd: "2025-04-30",
      },
    },
  ];

  testCases.forEach((test) => {
    const trialEnd = endOfMonth_(toDate_(test.trialEnd));

    const result = calculateClosingPeriod_(trialEnd, test.closingTermMonths);

    const startOk = assertEquals_(
      Utilities.formatDate(result.closingStart, "Asia/Tokyo", "yyyy-MM-dd"),
      test.expected.closingStart,
      `${test.testName} - closingStart`,
    );

    if (!startOk) {
      throw new Error(`Test failed: ${test.testName} (closingStart)`);
    }

    const endOk = assertEquals_(
      Utilities.formatDate(result.closingEnd, "Asia/Tokyo", "yyyy-MM-dd"),
      test.expected.closingEnd,
      `${test.testName} - closingEnd`,
    );

    if (!endOk) {
      throw new Error(`Test failed: ${test.testName} (closingEnd)`);
    }
  });

  Logger.log("🎉 All testCalculateClosingPeriod tests passed.");
}
/**
 * 【テスト用】
 * calculateRegistrationPeriods_ の結果を assertEquals_ で検証する
 * - 1件でも FAIL したら Error を throw
 * - 全件 PASS したら成功ログを出力
 */
function testCalculateRegistrationPeriods_() {
  const testCases = [
    {
      testName: "Standard case: reg1 + obs2",
      setupEnd: "2024-03-31",
      closingStart: "2026-04-01",
      trialStart: "2024-04-01",
      trialEnd: "2026-03-31",
      expected: {
        registration1Start: "2024-04-01",
        registration1End: "2025-03-31",
        registration2Start: null,
        registration2End: null,
        observation2Start: "2025-04-01",
        observation2End: "2026-03-31",
      },
    },
    {
      testName: "Standard case: reg1 + reg2 +obs2",
      setupEnd: "2024-03-31",
      closingStart: "2028-04-01",
      trialStart: "2024-04-01",
      trialEnd: "2028-03-31",
      expected: {
        registration1Start: "2024-04-01",
        registration1End: "2025-03-31",
        registration2Start: "2025-04-01",
        registration2End: "2027-03-31",
        observation2Start: "2027-04-01",
        observation2End: "2028-03-31",
      },
    },
    {
      testName: "Only registration_1 exists",
      setupEnd: "2024-03-31",
      closingStart: "2025-04-01",
      trialStart: "2024-04-01",
      trialEnd: "2025-03-31",
      expected: {
        registration1Start: "2024-04-01",
        registration1End: "2025-03-31",
        registration2Start: null,
        registration2End: null,
        observation2Start: null,
        observation2End: null,
      },
    },
    {
      testName: "No registration period",
      setupEnd: "2024-03-31",
      closingStart: "2024-04-01",
      trialStart: "2024-04-01",
      trialEnd: "2024-04-30",
      expected: {
        registration1Start: null,
        registration1End: null,
        registration2Start: null,
        registration2End: null,
        observation2Start: null,
        observation2End: null,
      },
    },
  ];

  testCases.forEach((test) => {
    const setupEnd = toDate_(test.setupEnd);
    const closingStart = toDate_(test.closingStart);
    const trialStart = toDate_(test.trialStart);
    const trialEnd = toDate_(test.trialEnd);

    const result = calculateRegistrationPeriods_(
      setupEnd,
      closingStart,
      trialStart,
      trialEnd,
    );

    const dateKeys = [
      "registration1Start",
      "registration1End",
      "registration2Start",
      "registration2End",
      "observation2Start",
      "observation2End",
    ];

    dateKeys.forEach((key) => {
      const actual = result[key]
        ? Utilities.formatDate(result[key], "Asia/Tokyo", "yyyy-MM-dd")
        : null;

      const expected = test.expected[key];

      const ok = assertEquals_(actual, expected, `${test.testName} - ${key}`);

      if (!ok) {
        throw new Error(`Test failed: ${test.testName} (${key})`);
      }
    });
  });

  Logger.log("🎉 All testCalculateRegistrationPeriods tests passed.");
}
