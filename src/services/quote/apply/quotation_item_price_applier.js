const RESEARCH_SUPPORT_ITEM_MAPPINGS = [
  {
    requestKey: QUOTATION_REQUEST_SHEET.ITEMNAMES.PREPARE_FEE,
    itemName: ITEMS_SHEET.ITEMNAMES.PREPARE_FEE,
  },
  {
    requestKey: QUOTATION_REQUEST_SHEET.ITEMNAMES.REGISTRATION_FEE,
    itemName: ITEMS_SHEET.ITEMNAMES.REGISTRATION_FEE,
  },
  {
    requestKey: QUOTATION_REQUEST_SHEET.ITEMNAMES.REPORT_FEE,
    itemName: ITEMS_SHEET.ITEMNAMES.REPORT_FEE,
  },
];
function applyItemPrices_(itemSheet) {
  // 保険料
  processInsuranceFee_(itemSheet);

  // 研究協力費、負担軽減費
  processResearchSupportFee_(itemSheet);
}
/**
 * 保険料（Insurance Fee）を items シートに反映する
 *
 * Quotation Request シートの 2行構成データから
 * 保険料の合計金額を取得し、items シートの「保険料」行に
 * 基準単価として設定する。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} itemSheet
 *   単価を設定する items シート
 */
function processInsuranceFee_(itemSheet) {
  const totalPrice = get_quotation_request_value_(
    QUOTATION_REQUEST_SHEET.ITEMNAMES.INSURANCE_FEE,
  );
  const items_row = get_row_num_matched_value_(
    itemSheet,
    2,
    ITEMS_SHEET.ITEMNAMES.INSURANCE_FEE,
  );
  set_items_price_(itemSheet, totalPrice, items_row);
}
/**
 * 研究協力費（負担軽減費）を items シートへ配分・反映する。
 *
 * 見積依頼シート上の「研究協力費、負担軽減費」の合計金額を取得し、
 * 「試験開始準備費用」「症例登録費用」「症例報告費用」のうち
 * 「あり」となっている項目数で按分した基準金額を算出する。
 *
 * 各項目について、items シート上の単位（症例／施設／その他）に応じて
 * 金額を調整し、基準単価列へ反映する。
 * 「なし」の項目については、該当行の単価をクリアする。
 * @param {GoogleAppsScript.Spreadsheet.Sheet} itemSheet
 *   単価を設定する対象の items シート。
 *
 * @return {void}
 */
function processResearchSupportFee_(itemSheet) {
  const itemUnitColNumber = getColumnNumber_(ITEMS_SHEET.COLUMNS.UNIT);
  const itemRows = {};
  const itemUnits = {};
  const quotationValues = {};

  RESEARCH_SUPPORT_ITEM_MAPPINGS.forEach(({ requestKey, itemName }) => {
    const row = get_row_num_matched_value_(itemSheet, 2, itemName);

    itemRows[itemName] = row;

    if (row) {
      itemUnits[itemName] = itemSheet
        .getRange(row, itemUnitColNumber)
        .getValue();
    }

    quotationValues[requestKey] = get_quotation_request_value_(requestKey);
  });

  const totalPrice = get_quotation_request_value_(
    QUOTATION_REQUEST_SHEET.ITEMNAMES.RESEARCH_SUPPORT_FEE,
  );
  const get_s_p = PropertiesService.getScriptProperties();
  const numberOfCases = Number(
    get_s_p.getProperty(SCRIPT_PROPERTY_KEYS.NUMBER_OF_CASES),
  );
  const facilities = Number(
    get_s_p.getProperty(SCRIPT_PROPERTY_KEYS.FACILITIES_VALUE),
  );
  const enabledItemCount = Object.values(quotationValues).filter(
    (v) => v === COMMON_EXISTENCE_LABELS.YES,
  ).length;
  const basePrice = calculateBasePrice_(totalPrice, enabledItemCount);

  RESEARCH_SUPPORT_ITEM_MAPPINGS.forEach(({ requestKey, itemName }) => {
    const items_row = itemRows[itemName];
    if (!items_row) return;

    if (quotationValues[requestKey] === COMMON_EXISTENCE_LABELS.YES) {
      const unit = itemUnits[itemName];
      const price = calculatePriceByUnit_(
        basePrice,
        unit,
        numberOfCases,
        facilities,
      );
      set_items_price_(itemSheet, price, items_row);
    } else {
      set_items_price_(itemSheet, 0, items_row);
    }
  });
}

/**
 * 合計金額を有効項目数で按分し、各項目の基準金額を算出する。
 *
 * @param {number|string} totalPrice
 *   見積依頼シートから取得した合計金額。
 *   文字列で渡される場合があるため数値変換を行う。
 * @param {number} enabledItemCount
 *   「あり」と判定された有効項目の数。
 * @return {number|null}
 *   有効項目数が1以上の場合は、切り捨て後の基準金額を返す。
 *   有効項目が0件の場合は null を返す。
 */
function calculateBasePrice_(totalPrice, enabledItemCount) {
  if (!enabledItemCount || enabledItemCount <= 0) {
    return null;
  }

  return Math.floor(Number(totalPrice) / enabledItemCount);
}

/**
 * 基準単価と単位種別から実際の単価を計算する
 *
 * - 単位が「症例」の場合：症例数で割る
 * - 単位が「施設」の場合：施設数で割る
 * - それ以外の場合：基準単価をそのまま返す
 *
 * @param {number|null} basePrice 按分前の基準単価
 * @param {string} unit 単価の単位（ITEMS_SHEET.UNITS のいずれか）
 * @param {number} numberOfCases 症例数
 * @param {number} facilities 施設数
 * @return {number|null} 計算後の単価。基準単価が無効な場合は null
 */
function calculatePriceByUnit_(basePrice, unit, numberOfCases, facilities) {
  if (!basePrice) return null;
  if (unit === ITEMS_SHEET.UNITS.PER_CASE) return basePrice / numberOfCases;
  if (unit === ITEMS_SHEET.UNITS.PER_FACILITY) return basePrice / facilities;
  return basePrice;
}
/**
 * 単価入力用の1行分データを生成する
 * @param {number|string} price 単価
 * @return {Array} itemsシートに設定する3列分の配列
 */
function buildItemPriceRow_(price) {
  if (Number(price) > 0) {
    return [price, 1, 1];
  }
  return ["", "", ""];
}
/**
 * itemsシートに単価を設定する
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 対象シート
 * @param {number|string} price 単価
 * @param {number} target_row 設定対象の行番号
 */
function set_items_price_(sheet, price, target_row) {
  if (!target_row || target_row <= 0) return;

  const target_col = getColumnNumber_(ITEMS_SHEET.COLUMNS.BASE_UNIT_PRICE);
  const rowValues = buildItemPriceRow_(price);

  sheet
    .getRange(target_row, target_col, 1, rowValues.length)
    .setValues([rowValues]);
}
