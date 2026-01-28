/**
 * 【テスト用】
 * calculateSetupPeriod_ の結果を assertEquals_ で検証する
 * - 1件でも FAIL したら Error を throw
 * - 全件 PASS したら成功ログを出力
 */
function testCalculateSetupPeriod() {
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
    const trialStart = Moment.moment(test.trialStart).startOf("month");

    const result = calculateSetupPeriod_(trialStart, test.setupTermMonths);

    const startOk = assertEquals_(
      result.setupStart.format("YYYY-MM-DD"),
      test.expected.setupStart,
      `${test.testName} - setupStart`,
    );

    if (!startOk) {
      throw new Error(`Test failed: ${test.testName} (setupStart)`);
    }

    const endOk = assertEquals_(
      result.setupEnd.format("YYYY-MM-DD"),
      test.expected.setupEnd,
      `${test.testName} - setupEnd`,
    );

    if (!endOk) {
      throw new Error(`Test failed: ${test.testName} (setupEnd)`);
    }
  });

  console.log("🎉 All TEST_calculateSetupPeriod_ tests passed.");
}
/**
 * 【テスト用】
 * calculateClosingPeriod_ の結果を assertEquals_ で検証する
 * - 1件でも FAIL したら Error を throw
 * - 全件 PASS したら成功ログを出力
 */
function testCalculateClosingPeriod() {
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
    const trialEnd = Moment.moment(test.trialEnd).endOf("month");

    const result = calculateClosingPeriod_(trialEnd, test.closingTermMonths);

    const startOk = assertEquals_(
      result.closingStart.format("YYYY-MM-DD"),
      test.expected.closingStart,
      `${test.testName} - closingStart`,
    );

    if (!startOk) {
      throw new Error(`Test failed: ${test.testName} (closingStart)`);
    }

    const endOk = assertEquals_(
      result.closingEnd.format("YYYY-MM-DD"),
      test.expected.closingEnd,
      `${test.testName} - closingEnd`,
    );

    if (!endOk) {
      throw new Error(`Test failed: ${test.testName} (closingEnd)`);
    }
  });

  console.log("🎉 All TEST_calculateClosingPeriod_ tests passed.");
}
/**
 * 【テスト用】
 * calculateRegistrationPeriods_ の結果を assertEquals_ で検証する
 * - 1件でも FAIL したら Error を throw
 * - 全件 PASS したら成功ログを出力
 */
function testCalculateRegistrationPeriods() {
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
    const setupEnd = Moment.moment(test.setupEnd);
    const closingStart = Moment.moment(test.closingStart);
    const trialStart = Moment.moment(test.trialStart);
    const trialEnd = Moment.moment(test.trialEnd);

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
      const actual = result[key] ? result[key].format("YYYY-MM-DD") : null;

      const expected = test.expected[key];

      const ok = assertEquals_(actual, expected, `${test.testName} - ${key}`);

      if (!ok) {
        throw new Error(`Test failed: ${test.testName} (${key})`);
      }
    });
  });

  console.log("🎉 All TEST_calculateRegistrationPeriods_ tests passed.");
}
