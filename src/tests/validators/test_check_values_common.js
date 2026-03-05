/**
 * Test suite for validateItemValue_
 */
function test_validateItemValue() {
  test_validateItemValue_match_();
  test_validateItemValue_itemNotFound_();
  test_validateItemValue_valueMismatch_();
  test_validateItemValue_withFooter_();
}

/**
 * Case: value matches expected
 */
function test_validateItemValue_match_() {
  const actual = validateItemValue_(
    "TestSheet",
    { A: 1 },
    null,
    [VALIDATION_STATUS.OK],
    "A",
    VALIDATION_STATUS.OK,
  );

  const expected = [
    VALIDATION_STATUS.OK,
    "シート名:TestSheet,項目名:A,想定値:OK",
  ];

  assertEquals_(actual, expected, "match: value equals expected");
}

/**
 * Case: item not found
 */
function test_validateItemValue_itemNotFound_() {
  const actual = validateItemValue_(
    "TestSheet",
    {},
    null,
    [VALIDATION_STATUS.OK],
    "A",
    VALIDATION_STATUS.OK,
  );

  const expected = [
    VALIDATION_STATUS.NG_ITEM_NOT_FOUND,
    "シート名:TestSheet,項目名:A,想定値:OK",
  ];

  assertEquals_(actual, expected, "itemNotFound: missing item");
}

/**
 * Case: value mismatch
 */
function test_validateItemValue_valueMismatch_() {
  const actual = validateItemValue_(
    "TestSheet",
    { A: 1 },
    null,
    [VALIDATION_STATUS.NG],
    "A",
    VALIDATION_STATUS.OK,
  );

  const expected = [
    VALIDATION_STATUS.NG_WITH_MESSAGE,
    "シート名:TestSheet,項目名:A,想定値:OK,実際の値:NG",
  ];

  assertEquals_(actual, expected, "valueMismatch: different value");
}

/**
 * Case: footer applied
 */
function test_validateItemValue_withFooter_() {
  const actual = validateItemValue_(
    "TestSheet",
    { A: 1 },
    "_F",
    [VALIDATION_STATUS.OK],
    "A",
    VALIDATION_STATUS.OK,
  );

  const expected = [
    VALIDATION_STATUS.OK,
    "シート名:TestSheet,項目名:A_F,想定値:OK",
  ];

  assertEquals_(actual, expected, "withFooter: footer appended");
}
/**
 * calculateSetupAndClosingMonths の網羅テスト
 *
 * 【網羅条件】
 * ・trialType：getTrialTypeListForTest_() の全パターン
 * ・reportSupport：あり / なし
 */
function test_calculateSetupAndClosingMonths_fullCombination() {
  const trialTypes = getTrialTypeListForTest_();
  const reportSupports = [
    COMMON_EXISTENCE_LABELS.YES,
    COMMON_EXISTENCE_LABELS.NO,
  ];

  trialTypes.forEach((trialType) => {
    reportSupports.forEach((reportSupport) => {
      const context = {
        trialType: trialType,
        reportSupport: reportSupport,
      };

      const actual = calculateSetupAndClosingMonths(context);

      /** ===== expected ===== */

      const isInvestigatorTrial =
        trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED ||
        trialType === TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL;

      let expectedSetup = 3;
      let expectedClosing = 3;

      if (isInvestigatorTrial) {
        expectedSetup = 6;
        expectedClosing = 6;
      } else if (reportSupport === COMMON_EXISTENCE_LABELS.YES) {
        expectedClosing += 3;
      }

      const expected = {
        setup_month: expectedSetup,
        closing_month: expectedClosing,
        setup_closing_months: expectedSetup + expectedClosing,
      };

      assertEquals_(
        JSON.stringify(actual),
        JSON.stringify(expected),
        `trialType=${trialType}, reportSupport=${reportSupport}, setupMonth=${expectedSetup}, closingMonth=${expectedClosing}`,
      );
    });
  });
}
