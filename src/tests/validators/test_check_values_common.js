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
