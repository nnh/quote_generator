/**
 * 不均等配分対象の設定
 * @typedef {Object} ImbalanceConfig
 * @property {string} requestItemName リクエストシートの項目名
 * @property {string[]} exclusionSheets 除外対象のシート名
 * @property {string} targetItemName 書き込み先シートの項目名
 * @property {string|null} multiplierItemName 掛け算対象の項目名（なければnull）
 * @property {(function(any): number)|null} normalize 値変換用関数
 */
/**
 * 不均等配分の設定を取得する
 * @return {ImbalanceConfig[]}
 */
function getImbalanceConfigs_() {
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
      normalize: null,
    },
    {
      requestItemName:
        QUOTATION_REQUEST_SHEET.ITEMNAMES.AUDIT_TARGET_FACILITIES,
      exclusionSheets: setupAndClosingExclusion,
      targetItemName: ITEMS_SHEET.ITEMNAMES.AUDIT_TARGET_FACILITIES,
      multiplierItemName: null,
      normalize: null,
    },
    {
      requestItemName: QUOTATION_REQUEST_SHEET.ITEMNAMES.REGISTRATION_FEE,
      exclusionSheets: setupAndClosingExclusion,
      targetItemName: ITEMS_SHEET.ITEMNAMES.REGISTRATION_FEE,
      multiplierItemName: ITEM_LABELS.NUMBER_OF_CASES,
      normalize: (val) => (val === COMMON_EXISTENCE_LABELS.YES ? 1 : 0),
    },
  ];
  return targetImbalance;
}
function applyImbalanceValues_() {
  // 年毎に設定する値が不均等である項目への対応
  const scriptProperties = PropertiesService.getScriptProperties();
  const targetImbalance = getImbalanceConfigs_();
  const target = buildImbalanceTargets_(targetImbalance);
  writeImbalanceValues_(target, targetImbalance, scriptProperties);
}
function buildImbalanceTargets_(targetImbalance) {
  const DividedItemsCount = new GetArrayDividedItemsCountAdd();

  return targetImbalance.map((config) => {
    const raw = getQuotationRequestValue_(config.requestItemName);

    const tempCount = config.normalize ? config.normalize(raw) : raw;

    const tempMultiplier = config.multiplierItemName
      ? getQuotationRequestValue_(config.multiplierItemName)
      : 1;

    const countNum = toSafeNumber_(tempCount);
    const multNum = toSafeNumber_(tempMultiplier);

    if (countNum === null || multNum === null) {
      return [];
    }

    const targetNumber = countNum * multNum;

    return DividedItemsCount.getArrayDividedItemsCount_(
      targetNumber,
      config.exclusionSheets,
    );
  });
}
function writeImbalanceValues_(target, targetImbalance, scriptProperties) {
  const SHEET_IDX = 0;
  const VALUE_IDX = 1;

  target.forEach((targetSheetAndValues, idx) => {
    if (targetSheetAndValues.length > 0) {
      targetSheetAndValues.forEach((targetSheetAndValue) => {
        const targetSheet = getSheetByNameCached_(
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
