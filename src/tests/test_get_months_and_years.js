function test_get_months_and_years() {
  function toDate(str) {
    return str ? new Date(str) : null;
  }

  const testCases = [
    {
      start: "2024-01-01",
      end: "2024-01-31",
      expectedMonths: 1,
      expectedYears: 1,
    },
    {
      start: "2024-01-01",
      end: "2024-02-01",
      expectedMonths: 2,
      expectedYears: 1,
    },
    {
      start: "2024-01-15",
      end: "2025-01-14",
      expectedMonths: 12,
      expectedYears: 1,
    },
    {
      start: "2024-01-01",
      end: "2025-01-01",
      expectedMonths: 13,
      expectedYears: 2,
    },
    { start: "", end: "2025-01-01", expectedMonths: null, expectedYears: null },
    { start: "2024-01-01", end: "", expectedMonths: null, expectedYears: null },
  ];

  let hasError = false;

  testCases.forEach((tc, idx) => {
    const start = toDate(tc.start);
    const end = toDate(tc.end);

    let months, years;

    if (start && end) {
      // 年差と月差を計算
      months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

      // 日にちを比較して端数を加算
      if (end.getDate() >= start.getDate()) months += 1;

      years = Math.ceil(months / 12);
    } else {
      months = null;
      years = null;
    }

    console.log(`Test ${idx + 1}: Start=${tc.start}, End=${tc.end}`);
    console.log(`Expected Months=${tc.expectedMonths}, Actual=${months}`);
    console.log(`Expected Years=${tc.expectedYears}, Actual=${years}`);
    console.log("---");

    if (months !== tc.expectedMonths) {
      console.error(`❌ Months mismatch in test ${idx + 1}`);
      hasError = true;
    }
    if (years !== tc.expectedYears) {
      console.error(`❌ Years mismatch in test ${idx + 1}`);
      hasError = true;
    }
  });

  if (!hasError) {
    console.log("✅ 全てのテストが正常に完了しました。");
  }
}
