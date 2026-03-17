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
