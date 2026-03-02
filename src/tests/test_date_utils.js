function test_monthBoundaryFunctions() {
  // 月末月初のテスト
  // --- startOfMonth_ ---
  {
    const input = new Date(2024, 5, 15); // 2024-06-15
    const actual = startOfMonth_(input);

    assertEquals_(actual.getFullYear(), 2024, "startOfMonth_: year");
    assertEquals_(actual.getMonth(), 5, "startOfMonth_: month (0-based)");
    assertEquals_(actual.getDate(), 1, "startOfMonth_: date should be 1");
  }

  // --- endOfMonth_ (31 days) ---
  {
    const input = new Date(2024, 6, 10); // 2024-07-10
    const actual = endOfMonth_(input);

    assertEquals_(actual.getFullYear(), 2024, "endOfMonth_ 31days: year");
    assertEquals_(actual.getMonth(), 6, "endOfMonth_ 31days: month");
    assertEquals_(actual.getDate(), 31, "endOfMonth_ 31days: date");
  }

  // --- endOfMonth_ (30 days) ---
  {
    const input = new Date(2024, 8, 5); // 2024-09-05
    const actual = endOfMonth_(input);

    assertEquals_(actual.getMonth(), 8, "endOfMonth_ 30days: month");
    assertEquals_(actual.getDate(), 30, "endOfMonth_ 30days: date");
  }

  // --- endOfMonth_ (February, leap year) ---
  {
    const input = new Date(2024, 1, 10); // 2024-02-10
    const actual = endOfMonth_(input);

    assertEquals_(actual.getMonth(), 1, "endOfMonth_ Feb leap: month");
    assertEquals_(actual.getDate(), 29, "endOfMonth_ Feb leap: date");
  }

  // --- endOfMonth_ (February, non-leap year) ---
  {
    const input = new Date(2023, 1, 10); // 2023-02-10
    const actual = endOfMonth_(input);

    assertEquals_(actual.getMonth(), 1, "endOfMonth_ Feb non-leap: month");
    assertEquals_(actual.getDate(), 28, "endOfMonth_ Feb non-leap: date");
  }
}
/**
 * addMonths_ のテスト
 *
 * - 月末補正
 * - 負数対応
 * - 年跨ぎ
 * - Moment互換入力
 */
function test_addMonths() {
  const cases = [
    {
      name: "simple add",
      input: new Date("2024-01-15"),
      months: 1,
      expected: "2024-02-15",
    },
    {
      name: "month end -> leap year Feb",
      input: new Date("2024-01-31"),
      months: 1,
      expected: "2024-02-29",
    },
    {
      name: "month end -> non leap Feb",
      input: new Date("2023-01-31"),
      months: 1,
      expected: "2023-02-28",
    },
    {
      name: "subtract month",
      input: new Date("2024-03-31"),
      months: -1,
      expected: "2024-02-29",
    },
    {
      name: "year boundary forward",
      input: new Date("2024-10-31"),
      months: 5,
      expected: "2025-03-31",
    },
    {
      name: "year boundary backward",
      input: new Date("2024-03-31"),
      months: -5,
      expected: "2023-10-31",
    },
    {
      name: "Moment-like input",
      input: {
        toDate: () => new Date("2024-01-31"),
      },
      months: 1,
      expected: "2024-02-29",
    },
  ];

  cases.forEach(({ name, input, months, expected }) => {
    const result = addMonths_(input, months);

    const actualStr = Utilities.formatDate(result, "Asia/Tokyo", "yyyy-MM-dd");

    assertEquals_(actualStr, expected, name);
  });
}
/**
 * getFiscalYearEnd_ のテスト
 */
function test_getFiscalYearEnd() {
  const cases = [
    {
      name: "April -> next year end",
      input: new Date("2024-04-01"),
      expected: "2025-03-31",
    },
    {
      name: "Jan -> same year end",
      input: new Date("2024-01-01"),
      expected: "2024-03-31",
    },
    {
      name: "4/30 -> next year end",
      input: new Date("2024-04-30"),
      expected: "2025-03-31",
    },
    {
      name: "Moment-like input",
      input: { toDate: () => new Date("2024-04-01") },
      expected: "2025-03-31",
    },
  ];

  cases.forEach(({ name, input, expected }) => {
    const result = getFiscalYearEnd_(input);

    const actualStr = Utilities.formatDate(result, "Asia/Tokyo", "yyyy-MM-dd");

    assertEquals_(actualStr, expected, name);
  });
}
/**
 * getFiscalYearStart_ のテスト
 */
function test_getFiscalYearStart() {
  const cases = [
    { input: new Date("2024-03-31"), expected: new Date("2023-04-01") },
    { input: new Date("2024-04-01"), expected: new Date("2024-04-01") },
    { input: new Date("2024-12-15"), expected: new Date("2024-04-01") },
    { input: new Date("2025-01-01"), expected: new Date("2024-04-01") },
    { input: new Date("2025-04-01"), expected: new Date("2025-04-01") },
  ];

  cases.forEach(({ input, expected }, i) => {
    const actual = getFiscalYearStart_(input);

    const actualStr = `${actual.getFullYear()}-${actual.getMonth() + 1}-${actual.getDate()}`;
    const expectedStr = `${expected.getFullYear()}-${expected.getMonth() + 1}-${expected.getDate()}`;

    assertEquals_(actualStr, expectedStr, `Case ${i + 1}`);
  });
}
