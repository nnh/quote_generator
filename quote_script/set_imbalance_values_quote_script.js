function setImbalanceValues_(array_quotation_request) {
  // 年毎に設定する値が不均等である項目への対応
  const cache = new ConfigCache();
  if (!cache.isValid) {
    console.error("Failed to initialize ConfigCache in setImbalanceValues_");
    return;
  }
  const filenameIdx = 0;
  const exclusionIdx = 1;
  const itemnameIdx = 2;
  const multiplierIdx = 3;
  const sheetIdx = 0;
  const valueIdx = 1;
  const setupAndClosingExclusion = ["Setup", "Closing"];
  const patientRegistrationFee = "症例登録毎の支払";
  const targetImbalance = [
    ["監査対象施設数", setupAndClosingExclusion, "施設監査費用", null],
    [
      patientRegistrationFee,
      setupAndClosingExclusion,
      "症例登録",
      cache.numberOfCasesItemname,
    ],
  ];
  const DividedItemsCount = new GetArrayDividedItemsCountAdd();
  const target = targetImbalance.map((x) => {
    let tempCount = get_quotation_request_value(
      array_quotation_request,
      x[filenameIdx]
    );
    // 症例登録毎の支払は「あり、なし」で入力される
    tempCount =
      x[filenameIdx] == patientRegistrationFee && tempCount == "あり"
        ? 1
        : tempCount;
    const tempMultiplier = x[multiplierIdx]
      ? get_quotation_request_value(array_quotation_request, x[multiplierIdx])
      : 1;
    const targetNumber =
      Number.isInteger(tempCount) && Number.isInteger(tempMultiplier)
        ? tempCount * tempMultiplier
        : null;
    return Number.isInteger(targetNumber)
      ? DividedItemsCount.getArrayDividedItemsCount(
          targetNumber,
          x[exclusionIdx]
        )
      : null;
  });
  target.forEach((targetSheetAndValues, idx) => {
    if (targetSheetAndValues) {
      targetSheetAndValues.forEach((targetSheetAndValue) => {
        const targetSheet =
          SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
            targetSheetAndValue[sheetIdx]
          );
        const cache = new ConfigCache();
        if (!cache.isValid) {
          console.error(
            "Failed to initialize ConfigCache in targetSheetAndValues forEach"
          );
          return;
        }
        const sheetItems = get_fy_items(targetSheet, cache.fySheetItemsCol);
        const targetRow = sheetItems[targetImbalance[idx][itemnameIdx]];
        targetSheet
          .getRange(targetRow, parseInt(cache.fySheetCountCol))
          .setValue(targetSheetAndValue[valueIdx]);
      });
    }
  });
}
