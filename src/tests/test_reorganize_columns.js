function test_findSumColumn() {
  const _ = get_sheets();
  const config = getTotalSheetConfig_("Total2");
  const total2Values = _cachedSheets.total2.getDataRange().getValues();
  const actual = findSumColumnNumber_(config, total2Values);
  const expected = 12;
  assertEquals_(actual, expected, "find sum column for Total2");
  const total3Values = _cachedSheets.total3.getDataRange().getValues();
  const config3 = getTotalSheetConfig_("Total3");
  const actual3 = findSumColumnNumber_(config3, total3Values);
  const expected3 = 12;
  assertEquals_(actual3, expected3, "find sum column for Total3");
}

function test_findSumRow() {
  const _ = get_sheets();
  const config = getTotalSheetConfig_("Total2");
  const total2Values = _cachedSheets.total2.getDataRange().getValues();
  const actual = findSumRowNumber_(config, total2Values);
  const expected = 97;
  assertEquals_(actual, expected, "find sum row for Total2");
  const total3Values = _cachedSheets.total3.getDataRange().getValues();
  const config3 = getTotalSheetConfig_("Total3");
  const actual3 = findSumRowNumber_(config3, total3Values);
  const expected3 = 25;
  assertEquals_(actual3, expected3, "find sum row for Total3");
}

function test_extractTargetSheets() {
  const actual = extractTargetSheets_();
  const actualSheetNames = actual.map((sheet) => sheet.getName());

  const expected = ["Total2", "Total3", "Total2_nmc", "Total2_oscr"];

  assertEquals_(actualSheetNames, expected, "extract total2/total3 sheets");
}
