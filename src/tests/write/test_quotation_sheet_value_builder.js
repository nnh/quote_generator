function test_buildSheetValuesWithTargetItems() {
  const targetSheetsName = getTargetSheetNameForTest_();

  const target_items = [["TEST_ITEM", 5]];
  const mockInputValues = [["A", 1]];
  const sheetName = targetSheetsName[0];

  // --- mock ---
  const mockArrayItem = ["TEST_ITEM"];
  const mockTargetValues = [["B", 2]];
  const expectedValue = [["RESULT"]];

  withMockedFunctions_(
    {
      getTargetCountValues_: () => mockTargetValues,
      initTargetColumn_: () => 1,
      get_fy_items_: () => mockArrayItem,
      applyTargetItemsToValues_: (count, items, targets) => {
        if (count === mockInputValues) return [["RESULT"]];
        if (count === mockTargetValues) return [["RESULT"]];
        return [["UNEXPECTED"]];
      },
    },
    () => {
      // --- CASE 1 : inputValuesあり ---
      const actualValueWithInput = buildSheetValuesWithTargetItems_(
        sheetName,
        target_items,
        mockInputValues,
      );

      assertEquals_(
        actualValueWithInput,
        expectedValue,
        `inputValuesありの場合、inputValuesが使用されること`,
      );

      // --- CASE 2 : inputValuesなし ---
      const actualValueWithoutInput = buildSheetValuesWithTargetItems_(
        sheetName,
        target_items,
        null,
      );

      assertEquals_(
        actualValueWithoutInput,
        expectedValue,
        `inputValuesなしの場合、getTargetCountValues_の結果が使用されること`,
      );
    },
  );
}
function test_convertItemsMapToList() {
  // --- CASE 1 : Map ---
  const mapInput = new Map([
    ["A", 10],
    ["B", 20],
  ]);

  const expectedFromMap = [
    ["A", 10],
    ["B", 20],
  ];

  const actualFromMap = convertItemsMapToList_(mapInput);

  assertEquals_(
    actualFromMap,
    expectedFromMap,
    "Mapの場合、[key,value]配列に変換されること",
  );

  // --- CASE 2 : Object ---
  const objectInput = {
    A: 10,
    B: 20,
  };

  const expectedFromObject = [
    ["A", 10],
    ["B", 20],
  ];

  const actualFromObject = convertItemsMapToList_(objectInput);

  assertEquals_(
    actualFromObject,
    expectedFromObject,
    "Objectの場合、[key,value]配列に変換されること",
  );

  // --- CASE 3 : 空Map ---
  const emptyMap = new Map();
  const actualEmptyMap = convertItemsMapToList_(emptyMap);

  assertEquals_(actualEmptyMap, [], "空Mapの場合、空配列が返ること");

  // --- CASE 4 : 空Object ---
  const emptyObject = {};
  const actualEmptyObject = convertItemsMapToList_(emptyObject);

  assertEquals_(actualEmptyObject, [], "空Objectの場合、空配列が返ること");
}
