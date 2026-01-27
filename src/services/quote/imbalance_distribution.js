function setTargetInblanceValues_(scriptProps, patientRegistrationFee) {
  const setupAndClosingExclusion = ["Setup", "Closing"];
  const targetImbalance = [
    {
      requestItemName: "1例あたりの実地モニタリング回数",
      exclusionSheets: setupAndClosingExclusion,
      targetItemName: "症例モニタリング・SAE対応",
      multiplierItemName: scriptProps.getProperty("number_of_cases_itemname"),
    },
    {
      requestItemName: "監査対象施設数",
      exclusionSheets: setupAndClosingExclusion,
      targetItemName: "施設監査費用",
      multiplierItemName: null,
    },
    {
      requestItemName: patientRegistrationFee,
      exclusionSheets: setupAndClosingExclusion,
      targetItemName: "症例登録",
      multiplierItemName: scriptProps.getProperty("number_of_cases_itemname"),
    },
  ];
  return targetImbalance;
}
function setImbalanceValues_(array_quotation_request) {
  // 年毎に設定する値が不均等である項目への対応
  const scriptProps = PropertiesService.getScriptProperties();
  const patientRegistrationFee = "症例登録毎の支払";
  const targetImbalance = setTargetInblanceValues_(
    scriptProps,
    patientRegistrationFee,
  );
  const target = buildImbalanceTargets_(
    array_quotation_request,
    targetImbalance,
    patientRegistrationFee,
  );
  writeImbalanceValues_(target, targetImbalance, scriptProps);
}
function buildImbalanceTargets_(
  array_quotation_request,
  targetImbalance,
  patientRegistrationFee,
) {
  const DividedItemsCount = new GetArrayDividedItemsCountAdd();

  return targetImbalance.map((config) => {
    let tempCount = get_quotation_request_value(
      array_quotation_request,
      config.requestItemName,
    );

    // 症例登録毎の支払は「あり、なし」で入力される
    if (config.requestItemName === patientRegistrationFee) {
      tempCount = tempCount === "あり" ? 1 : 0;
    }

    const tempMultiplier = config.multiplierItemName
      ? get_quotation_request_value(
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

        const sheetItems = get_fy_items(
          targetSheet,
          scriptProps.getProperty("fy_sheet_items_col"),
        );

        const targetRow = sheetItems[targetImbalance[idx].targetItemName];
        if (!targetRow) {
          console.warn(
            `Item not found: ${targetImbalance[idx].targetItemName}`,
          );
          return;
        }

        targetSheet
          .getRange(
            targetRow,
            parseInt(scriptProps.getProperty("fy_sheet_count_col"), 10),
          )
          .setValue(targetSheetAndValue[VALUE_IDX]);
      });
    }
  });
}
