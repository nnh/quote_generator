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
