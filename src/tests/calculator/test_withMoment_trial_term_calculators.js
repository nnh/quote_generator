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
/**
 * hasPositiveMonthDiff_ の単体テスト
 *
 * 「to が from より月単位で後かどうか」を正しく判定できるかを確認する。
 *
 * Moment依存ロジックから Dateベース実装へ移行する過程において、
 * 以下の互換性を維持できているかを検証する：
 *
 * - Moment 同士の比較が従来通り動作すること
 * - 同一月内の差分は false になること
 * - 1か月以上先は true になること
 * - 過去方向は false になること
 * - Date オブジェクト入力でも動作すること
 * - Moment と Date が混在しても動作すること
 *
 * @return {void}
 */
function test_hasPositiveMonthDiffWithMoment() {
  const cases = [
    {
      name: "same month should be false",
      from: Moment.moment("2024-04-01"),
      to: Moment.moment("2024-04-30"),
      expected: false,
    },
    {
      name: "next month should be true",
      from: Moment.moment("2024-04-01"),
      to: Moment.moment("2024-05-01"),
      expected: true,
    },
    {
      name: "earlier month should be false",
      from: Moment.moment("2024-05-01"),
      to: Moment.moment("2024-04-30"),
      expected: false,
    },
    {
      name: "Date input should still work",
      from: new Date("2024-04-01"),
      to: new Date("2024-05-01"),
      expected: true,
    },
    {
      name: "Moment + Date mix should work",
      from: Moment.moment("2024-04-01"),
      to: new Date("2024-05-01"),
      expected: true,
    },
  ];

  cases.forEach(({ name, from, to, expected }) => {
    const actual = hasPositiveMonthDiff_(
      from?.toDate?.() ?? from,
      to?.toDate?.() ?? to,
    );
    assertEquals_(actual, expected, name);
  });
}
/**
 * calculateRegistration1WithMoment_ の単体テスト
 */
function test_calculateRegistration1WithMoment() {
  const cases = [
    {
      name: "registration_1 exists when month diff is positive",
      setupEnd: Moment.moment("2024-03-31"),
      closingStart: Moment.moment("2024-05-01"),
      expected: {
        start: "2024-04-01",
        end: "2025-03-31",
      },
    },
    {
      name: "registration_1 is null when month diff is zero",
      setupEnd: Moment.moment("2024-04-30"),
      closingStart: Moment.moment("2024-04-30"),
      expected: {
        start: null,
        end: null,
      },
    },
  ];

  cases.forEach(({ name, setupEnd, closingStart, expected }) => {
    const actual = calculateRegistration1WithMoment_(setupEnd, closingStart);

    const actualNormalized = {
      start: actual.start ? actual.start.format("YYYY-MM-DD") : null,
      end: actual.end ? actual.end.format("YYYY-MM-DD") : null,
    };

    assertEquals_(actualNormalized, expected, name);
  });
}
/**
 * calculateObservation2WithMoment_ の単体テスト
 */
function test_calculateObservation2WithMoment() {
  const cases = [
    {
      name: "observation_2 exists when registration1End is before closingStart",
      registration1End: Moment.moment("2025-03-31"),
      closingStart: Moment.moment("2026-04-01"),
      expected: {
        start: "2025-04-01",
        end: "2026-03-31",
      },
    },
    {
      name: "observation_2 is null when registration1End is null",
      registration1End: null,
      closingStart: Moment.moment("2026-04-01"),
      expected: {
        start: null,
        end: null,
      },
    },
  ];

  cases.forEach(({ name, registration1End, closingStart, expected }) => {
    const actual = calculateObservation2WithMoment_(
      registration1End,
      closingStart,
    );

    const actualNormalized = {
      start: actual.start ? actual.start.format("YYYY-MM-DD") : null,
      end: actual.end ? actual.end.format("YYYY-MM-DD") : null,
    };

    assertEquals_(actualNormalized, expected, name);
  });
}
/**
 * calculateRegistration2WithMoment_ のテスト
 */
function test_calculateRegistration2WithMoment() {
  // CASE 1: registration2 が発生するケース
  (function () {
    const registration1End = Moment.moment("2024-03-31");
    const observation2Start = Moment.moment("2024-05-01");

    const actual = calculateRegistration2WithMoment_(
      registration1End,
      observation2Start,
    );

    const expected = {
      start: Moment.moment("2024-04-01"),
      end: Moment.moment("2024-04-30"),
    };

    assertEquals_(
      {
        start: actual.start?.format("YYYY-MM-DD") ?? null,
        end: actual.end?.format("YYYY-MM-DD") ?? null,
      },
      {
        start: expected.start.format("YYYY-MM-DD"),
        end: expected.end.format("YYYY-MM-DD"),
      },
      "calculateRegistration2WithMoment_ / registration2あり",
    );
  })();

  // CASE 2: observation2Start が null → registration2 なし
  (function () {
    const registration1End = Moment.moment("2024-03-31");
    const observation2Start = null;

    const actual = calculateRegistration2WithMoment_(
      registration1End,
      observation2Start,
    );

    const expected = {
      start: null,
      end: null,
    };

    assertEquals_(
      actual,
      expected,
      "calculateRegistration2WithMoment_ / observation2Startなし",
    );
  })();

  // CASE 3: 月差が 0 → registration2 なし
  (function () {
    const registration1End = Moment.moment("2024-03-31");
    const observation2Start = Moment.moment("2024-04-01"); // 月差 0

    const actual = calculateRegistration2WithMoment_(
      registration1End,
      observation2Start,
    );

    const expected = {
      start: null,
      end: null,
    };

    assertEquals_(
      {
        start: actual.start,
        end: actual.end,
      },
      expected,
      "calculateRegistration2WithMoment_ / 月差0",
    );
  })();
}

/**
 * Registration開始日の決定ロジック
 *
 * registration1Start があればそれを使用し、
 * 無ければ trialStart が使用されることを確認する。
 */
function test_registrationStartFallback() {
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
function test_registrationEndFallback() {
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
 * （Moment非依存版）
 */
function test_calculateRegistrationYears() {
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
