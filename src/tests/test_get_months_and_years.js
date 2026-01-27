/**
 * テスト用スクリプト: trial_term_service の get_months_ と get_years_ の動作確認（Moment対応）
 */
function test_get_months_and_years() {
  // 文字列 → Moment（空文字は null）
  function toMoment(str) {
    return str ? Moment.moment(str) : null;
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
    { start: "", end: "2025-01-01", expectedMonths: null, expectedYears: null },
    { start: "2024-01-01", end: "", expectedMonths: null, expectedYears: null },
  ];

  let hasError = false;

  testCases.forEach((tc, idx) => {
    const start = toMoment(tc.start);
    const end = toMoment(tc.end);

    let months, years;

    if (start && end) {
      // 本番関数をそのまま使用（Moment前提）
      months = get_months_(start, end);
      years = get_years_(start, end);
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
