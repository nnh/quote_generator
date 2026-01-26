/**
 * 列名から列番号を返す
 * @param {string} column_name 列名（'A'など）
 * @return Aなら1、のような列番号
 */
function getColumnNumber(column_name) {
  const temp_sheet = SpreadsheetApp.getActiveSheet();
  const temp_range = temp_sheet.getRange(column_name + "1").getColumn();
  return temp_range;
}
/**
 * 列番号から列名を返す
 * @param {Number} column_name 列番号
 * @return 1ならA、のような列名
 */
function getColumnString(column_number) {
  const temp_sheet = SpreadsheetApp.getActiveSheet();
  const temp_range = temp_sheet.getRange(1, parseInt(column_number));
  var temp_res = temp_range.getA1Notation();
  temp_res = temp_res.replace(/\d/, "");
  return temp_res;
}

/**
 * 項目と行番号を連想配列に格納する（例：{契約・支払手続、実施計画提出支援=24.0, バリデーション報告書=39.0, ...}）
 * @param {associative array sheet} sheet シートオブジェクト
 * @param {string} target_col 項目名の列
 * @return {associative array} array_fy_items 項目と行番号の連想配列
 * @example
 *   var array_item = get_fy_items(target_sheet, target_col);
 */
function get_fy_items(sheet, target_col) {
  const get_s_p = PropertiesService.getScriptProperties();
  var temp_array = sheet
    .getRange(1, parseInt(target_col), sheet.getDataRange().getLastRow(), 1)
    .getValues();
  // 二次元配列から一次元配列に変換
  temp_array = Array.prototype.concat.apply([], temp_array);
  var array_fy_items = {};
  for (var i = 0; i < temp_array.length; i++) {
    if (temp_array[i] != "") {
      array_fy_items[temp_array[i]] = i + 1;
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
function get_row_num_matched_value(target_sheet, target_col_num, target_value) {
  const target_col = getColumnString(target_col_num);
  const col_values = target_sheet
    .getRange(target_col + ":" + target_col)
    .getValues()
    .map(function (x) {
      return x[0];
    });
  return col_values.indexOf(target_value) + 1;
}
/**
 * quotation_requestの1行目（項目名）からフォーム入力情報を取得する
 * @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
 * @param {string} header_str 検索対象の値
 * @return 項目名が完全一致すればその項目の値を返す。一致しなければnullを返す。
 * @example
 *   var trial_start_date = get_quotation_request_value(array_quotation_request, const_trial_start);
 */
function get_quotation_request_value(array_quotation_request, header_str) {
  const temp_col = array_quotation_request[0].indexOf(header_str);
  if (temp_col > -1) {
    return array_quotation_request[1][temp_col];
  } else {
    return null;
  }
}
