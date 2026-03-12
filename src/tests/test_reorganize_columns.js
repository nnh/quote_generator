function test_extractTargetSheets() {
  const actual = extractTargetSheets_();
  const actualSheetNames = actual.map((sheet) => sheet.getName());

  const expected = ["Total2", "Total3", "Total2_nmc", "Total2_oscr"];

  assertEquals_(actualSheetNames, expected, "extract total2/total3 sheets");
}
