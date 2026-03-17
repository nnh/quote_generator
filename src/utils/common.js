/**
 * 項目と行番号を連想配列に格納する（例：{契約・支払手続、実施計画提出支援=24.0, バリデーション報告書=39.0, ...}）
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet シートオブジェクト
 * @param {number|string} target_col 項目名の列番号（数値または数値文字列）
 * @return {Object.<string, number>} 項目名と行番号のマップ
 * @example
 *  const array_item = get_fy_items_(target_sheet, target_col);
 */

function get_fy_items_(sheet, target_col) {
  const colNum = Number(target_col);

  if (!Number.isInteger(colNum) || colNum <= 0) {
    throw new Error("get_fy_items_: invalid column number: " + target_col);
  }

  const temp_array = sheet
    .getRange(1, colNum, sheet.getLastRow(), 1)
    .getValues();

  // 二次元配列から一次元配列に変換
  const flat_array = temp_array.flat();
  const array_fy_items = {};
  // 同名項目が複数ある場合は最後の行番号を採用する
  for (let i = 0; i < flat_array.length; i++) {
    if (flat_array[i] != "") {
      array_fy_items[flat_array[i]] = i + 1;
    }
  }
  return array_fy_items;
}
/**
 * 指定した列に値が存在したらその行番号を返す。存在しなければ0を返す。
 * @param {sheet} target_sheet 対象のシート
 * @param {number} target_col_num 対象の列番号
 * @param {string} target_value 検索対象の値
 */
function get_row_num_matched_value_(
  target_sheet,
  target_col_num,
  target_value,
) {
  const lastRow = target_sheet.getLastRow();
  const col_values = target_sheet
    .getRange(1, target_col_num, lastRow, 1)
    .getValues()
    .map((x) => x[0]);
  const rowIndex = col_values.indexOf(target_value);
  const rowNumber = rowIndex === -1 ? 0 : rowIndex + 1;
  return rowNumber;
}
/**
 * quotation_requestの1行目（項目名）からフォーム入力情報を取得する
 * @param dummy
 * @param {string} header 検索対象の項目名
 * @return {string|null} 項目名が完全一致すればその項目の値を返す。一致しなければnullを返す。
 * @example
 *   const trialStartDate = get_quotation_request_value_(const_trial_start);
 */
function get_quotation_request_value_(header) {
  if (_cachedSheets === null) {
    get_sheets();
  }
  if (_quotationRequestMap === null) {
    buildQuotationRequestMap_();
  }

  return _quotationRequestMap.get(header) ?? null;
}
