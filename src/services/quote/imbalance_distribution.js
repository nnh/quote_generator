function setTargetInblanceValues_() {
  const setupAndClosingExclusion = [
    QUOTATION_SHEET_NAMES.SETUP,
    QUOTATION_SHEET_NAMES.CLOSING,
  ];
  const targetImbalance = [
    {
      requestItemName:
        QUOTATION_REQUEST_SHEET.ITEMNAMES.MONITORING_COUNT_PER_CASE,
      exclusionSheets: setupAndClosingExclusion,
      targetItemName: ITEMS_SHEET.ITEMNAMES.MONITORING_COUNT_PER_CASE,
      multiplierItemName: ITEM_LABELS.NUMBER_OF_CASES,
    },
    {
      requestItemName:
        QUOTATION_REQUEST_SHEET.ITEMNAMES.AUDIT_TARGET_FACILITIES,
      exclusionSheets: setupAndClosingExclusion,
      targetItemName: ITEMS_SHEET.ITEMNAMES.AUDIT_TARGET_FACILITIES,
      multiplierItemName: null,
    },
    {
      requestItemName: QUOTATION_REQUEST_SHEET.ITEMNAMES.REGISTRATION_FEE,
      exclusionSheets: setupAndClosingExclusion,
      targetItemName: ITEMS_SHEET.ITEMNAMES.REGISTRATION_FEE,
      multiplierItemName: ITEM_LABELS.NUMBER_OF_CASES,
    },
  ];
  return targetImbalance;
}
function setImbalanceValues_(array_quotation_request) {
  // 年毎に設定する値が不均等である項目への対応
  const scriptProps = PropertiesService.getScriptProperties();
  const targetImbalance = setTargetInblanceValues_();
  const target = buildImbalanceTargets_(
    array_quotation_request,
    targetImbalance,
  );
  writeImbalanceValues_(target, targetImbalance, scriptProps);
}
function buildImbalanceTargets_(array_quotation_request, targetImbalance) {
  const DividedItemsCount = new GetArrayDividedItemsCountAdd();

  return targetImbalance.map((config) => {
    let tempCount = get_quotation_request_value_(
      array_quotation_request,
      config.requestItemName,
    );

    // 症例登録毎の支払は「あり、なし」で入力される
    if (
      config.requestItemName ===
      QUOTATION_REQUEST_SHEET.ITEMNAMES.REGISTRATION_FEE
    ) {
      tempCount = tempCount === COMMON_EXISTENCE_LABELS.YES ? 1 : 0;
    }

    const tempMultiplier = config.multiplierItemName
      ? get_quotation_request_value_(
          array_quotation_request,
          config.multiplierItemName,
        )
      : 1;

    const countNum = Number(tempCount);
    const multNum = Number(tempMultiplier);

    const targetNumber =
      Number.isFinite(countNum) && Number.isFinite(multNum)
        ? countNum * multNum
        : null;

    if (!Number.isFinite(targetNumber)) {
      return [];
    }

    return DividedItemsCount.getArrayDividedItemsCount_(
      targetNumber,
      config.exclusionSheets,
    );
  });
}
function writeImbalanceValues_(target, targetImbalance, scriptProps) {
  const SHEET_IDX = 0;
  const VALUE_IDX = 1;

  target.forEach((targetSheetAndValues, idx) => {
    if (targetSheetAndValues.length > 0) {
      targetSheetAndValues.forEach((targetSheetAndValue) => {
        const targetSheet =
          SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
            targetSheetAndValue[SHEET_IDX],
          );
        if (!targetSheet) {
          console.warn(`Sheet not found: ${targetSheetAndValue[SHEET_IDX]}`);
          return;
        }

        const sheetItems = get_fy_items_(
          targetSheet,
          TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
        );

        const targetRow = sheetItems[targetImbalance[idx].targetItemName];
        if (!targetRow) {
          console.warn(
            `Item not found: ${targetImbalance[idx].targetItemName}`,
          );
          return;
        }

        targetSheet
          .getRange(targetRow, TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT)
          .setValue(targetSheetAndValue[VALUE_IDX]);
      });
    }
  });
}
