function test_calculateSetupPeriodWithMoment() {
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
    const trialStart = Moment.moment(c.trialStart, "YYYY-MM-DD");

    const actualRaw = calculateSetupPeriodWithMoment_(
      trialStart,
      c.setupTermMonths,
    );

    const actual = normalizeSetupPeriodResultForTest_(actualRaw);

    assertEquals_(
      actual,
      c.expected,
      `calculateSetupPeriodWithMoment: ${c.name}`,
    );
  });
}
function test_calculateClosingPeriodWithMoment() {
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
    const trialEnd = Moment.moment(c.trialEnd, "YYYY-MM-DD");

    const actualRaw = calculateClosingPeriodWithMoment_(
      trialEnd,
      c.closingTermMonths,
    );

    const actual = normalizeClosingPeriodResultForTest_(actualRaw);

    assertEquals_(
      actual,
      c.expected,
      `calculateClosingPeriodWithMoment_: ${c.name}`,
    );
  });
}

/**
 * setup期間の結果を比較用に正規化する
 *
 * @param {{setupStart: Moment, setupEnd: Moment}} result
 * @return {{setupStart: string, setupEnd: string}}
 */
function normalizeSetupPeriodResultForTest_(result) {
  return {
    setupStart: result.setupStart.format("YYYY-MM-DD"),
    setupEnd: result.setupEnd.format("YYYY-MM-DD"),
  };
}
/**
 * closing期間の結果を比較用に正規化する
 *
 * @param {{closingStart: Moment, closingEnd: Moment}} result
 * @return {{closingStart: string, closingEnd: string}}
 */
function normalizeClosingPeriodResultForTest_(result) {
  return {
    closingStart: result.closingStart.format("YYYY-MM-DD"),
    closingEnd: result.closingEnd.format("YYYY-MM-DD"),
  };
}
