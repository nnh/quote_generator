/**
 * 不均等配分対象の設定
 * @typedef {Object} ImbalanceConfig
 * @property {string} requestItemName リクエストシートの項目名
 * @property {string[]} exclusionSheets 除外対象のシート名
 * @property {string} targetItemName 書き込み先シートの項目名
 * @property {string|null} multiplierItemName 掛け算対象の項目名（未使用の場合は null）
 * @property {(function(*): number)|null} normalize 値を数値に変換する関数（未使用の場合は null）
 */
/**
 * 不均等配分の設定一覧を取得する
 *
 * @return {ImbalanceConfig[]} 不均等配分設定の配列
 */
function getImbalanceConfigs_() {
  const setupAndClosingExclusion = [
    QUOTATION_SHEET_NAMES.SETUP,
    QUOTATION_SHEET_NAMES.CLOSING,
  ];
  const imbalanceConfigs = [
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
  return imbalanceConfigs;
}

/**
 * 不均等配分の計算と書き込み処理を実行するエントリーポイント
 *
 * - 設定を取得
 * - 配分対象を計算
 * - 各シートへ値を書き込む
 *
 * @return {void}
 */
function applyImbalanceValues_() {
  // 年毎に設定する値が不均等である項目への対応
  const imbalanceConfigs = getImbalanceConfigs_();
  const target = calculateImbalanceTargets_(imbalanceConfigs);
  writeImbalanceValues_(target, imbalanceConfigs);
}

/**
 * 不均等配分対象の値を計算する
 *
 * 各設定に対して以下を実施：
 * - リクエスト値を取得
 * - 必要に応じて normalize を適用
 * - multiplier を掛け合わせる
 * - 配分対象の配列へ変換
 *
 * 数値変換できない場合は null を返す
 *
 * @param {ImbalanceConfig[]} imbalanceConfigs 不均等配分設定
 * @return {(Array<Array<string|number>>|null)[]} 各設定ごとの配分結果配列または null
 */
function calculateImbalanceTargets_(imbalanceConfigs) {
  const DividedItemsCount = new ImbalanceCountDistributor();

  return imbalanceConfigs.map((config) => {
    const raw = getQuotationRequestValue_(config.requestItemName);

    const tempCount = config.normalize ? config.normalize(raw) : raw;

    const tempMultiplier = config.multiplierItemName
      ? getQuotationRequestValue_(config.multiplierItemName)
      : 1;

    const countNum = toSafeNumber_(tempCount);
    const multNum = toSafeNumber_(tempMultiplier);

    if (countNum === null || multNum === null) {
      return null;
    }

    const targetNumber = countNum * multNum;

    return DividedItemsCount.getArrayDividedItemsCount_(
      targetNumber,
      config.exclusionSheets,
    );
  });
}

/**
 * 計算された不均等配分値を各シートへ書き込む
 *
 * @param {(Array<Array<string|number>>|null)[]} target 配分結果（シート名と値の配列、または null）
 * @param {ImbalanceConfig[]} imbalanceConfigs 不均等配分設定
 * @return {void}
 */
function writeImbalanceValues_(target, imbalanceConfigs) {
  const SHEET_IDX = 0;
  const VALUE_IDX = 1;

  target.forEach((targetSheetAndValues, idx) => {
    if (!targetSheetAndValues || targetSheetAndValues.length === 0) {
      return;
    }
    targetSheetAndValues.forEach((targetSheetAndValue) => {
      const targetSheet = getSheetByNameCached_(targetSheetAndValue[SHEET_IDX]);
      if (!targetSheet) {
        console.warn(`Sheet not found: ${targetSheetAndValue[SHEET_IDX]}`);
        return;
      }

      const sheetItems = get_fy_items_(
        targetSheet,
        TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
      );

      const targetRow = sheetItems[imbalanceConfigs[idx].targetItemName];
      if (!targetRow) {
        console.warn(`Item not found: ${imbalanceConfigs[idx].targetItemName}`);
        return;
      }

      targetSheet
        .getRange(targetRow, TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT)
        .setValue(targetSheetAndValue[VALUE_IDX]);
    });
  });
}
