/**
 * テスト用スクリプト:
 * calculateMonthSpan_ と calculateYearSpan_ の動作確認（Date版）
 */
function test_calculateMonthSpan_and_years() {
  const testCases = [
    {
      start: "2024-01-01",
      end: "2024-01-31",
      expectedMonths: 1,
      expectedYears: 1,
    },
    {
      start: "2024-01-01",
      end: "2024-02-10",
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
      start: "",
      end: "2025-01-01",
      expectedMonths: null,
      expectedYears: null,
    },
    {
      start: "2024-01-01",
      end: "",
      expectedMonths: null,
      expectedYears: null,
    },
  ];

  let hasError = false;

  testCases.forEach((tc, idx) => {
    const start = toDate_(tc.start);
    const end = toDate_(tc.end);

    let months, years;

    if (start && end) {
      // Dateのまま渡す
      months = calculateMonthSpan_(start, end);
      years = calculateYearSpan_(start, end);
    } else {
      months = null;
      years = null;
    }

    Logger.log(`Test ${idx + 1}: Start=${tc.start}, End=${tc.end}`);
    Logger.log(`Expected Months=${tc.expectedMonths}, Actual=${months}`);
    Logger.log(`Expected Years=${tc.expectedYears}, Actual=${years}`);
    Logger.log("---");

    if (months !== tc.expectedMonths) {
      Logger.log(`❌ Months mismatch in test ${idx + 1}`);
      hasError = true;
    }
    if (years !== tc.expectedYears) {
      Logger.log(`❌ Years mismatch in test ${idx + 1}`);
      hasError = true;
    }
  });

  if (!hasError) {
    Logger.log("✅ 全てのテストが正常に完了しました。");
  } else {
    throw new Error("❌ テスト失敗があります");
  }
}
