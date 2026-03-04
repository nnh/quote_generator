function test_get_sheets_returns_all_required_sheets() {
  resetSheetCache_();

  const sheets = get_sheets();

  const actual = Object.values(sheets)
    .filter(Boolean)
    .map((s) => s.getName())
    .sort();

  const expected = [
    "Trial",
    "Quotation Request",
    "Total",
    "Total_nmc",
    "Total_oscr",
    "Total2",
    "Total2_nmc",
    "Total2_oscr",
    "Total3",
    "Setup",
    "Registration_1",
    "Registration_2",
    "Interim_1",
    "Observation_1",
    "Interim_2",
    "Observation_2",
    "Closing",
    "Items",
    "Quote",
    "Check",
  ].sort();

  assertEquals_(actual, expected, "get_sheets: returns all required sheets");
}
function test_get_target_term_sheets_returns_valid_sheets() {
  resetSheetCache_();

  const sheets = get_sheets();

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
function test_getSheetByNameCached_can_fetch_all_required_sheets() {
  resetSheetCache_();

  const required = [
    "Trial",
    "Quotation Request",
    "Total",
    "Total2",
    "Total3",
    "Setup",
    "Registration_1",
    "Registration_2",
    "Interim_1",
    "Observation_1",
    "Interim_2",
    "Observation_2",
    "Closing",
    "Items",
    "Quote",
  ];

  required.forEach((name) => {
    const sheet = getSheetByNameCached_(name);

    if (!sheet) {
      throw new Error(`Sheet not fetched: ${name}`);
    }

    if (sheet.getName() !== name) {
      throw new Error(
        `Fetched mismatch: expected=${name}, actual=${sheet.getName()}`,
      );
    }
  });

  console.log("✅ All sheets fetched via cache.");
}
