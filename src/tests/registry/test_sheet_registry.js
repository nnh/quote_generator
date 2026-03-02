function test_get_sheets_returns_required_keys() {
  const sheets = get_sheets();

  const actualKeys = Object.keys(sheets).sort();

  const expectedKeys = [
    "trial",
    "quotation_request",
    "total",
    "total_nmc",
    "total_oscr",
    "total2",
    "total2_nmc",
    "total2_oscr",
    "total3",
    "setup",
    "registration_1",
    "registration_2",
    "interim_1",
    "observation_1",
    "interim_2",
    "observation_2",
    "closing",
    "items",
    "quote",
    "check",
  ].sort();

  assertEquals_(actualKeys, expectedKeys, "get_sheets: return keys");
}
function test_get_target_term_sheets_returns_valid_sheets() {
  if (_cachedSheets === null) {
    get_sheets();
  }
  const actual = get_target_term_sheets()
    .map((s) => s.getName())
    .sort();

  const expected = [
    "Closing",
    "Interim_1",
    "Interim_2",
    "Observation_1",
    "Observation_2",
    "Registration_1",
    "Registration_2",
    "Setup",
  ].sort();

  assertEquals_(
    actual,
    expected,
    "get_target_term_sheets: contains required sheets",
  );
}
