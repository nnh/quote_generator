/**
 * 行番号と列値から想定値との一致を判定する純粋関数
 *
 * @param {string} sheetName
 * @param {Object.<string, number>} itemRowMap - 項目名と行番号（1始まり）
 * @param {string|null} footer
 * @param {Array<*>} columnValues - 0始まり配列
 * @param {string} itemName
 * @param {*} expectedValue
 * @returns {[string, string]}
 */
function validationValidateItemValue_(
  sheetName,
  itemRowMap,
  footer,
  columnValues,
  itemName,
  expectedValue,
) {
  const displayName = footer ? itemName + footer : itemName;

  const baseMessage = `シート名:${sheetName},項目名:${displayName},想定値:${expectedValue}`;

  const row = itemRowMap[itemName];

  if (!(row > 0)) {
    return [
      validationBuildNgMessage_(VALIDATION_MESSAGES.NG_ITEM_NOT_FOUND),
      baseMessage,
    ];
  }

  const actualValue = columnValues[row - 1];

  if (actualValue !== expectedValue) {
    return [
      validationBuildNgMessage_(VALIDATION_MESSAGES.VALUE_MISMATCH),
      `${baseMessage},実際の値:${actualValue}`,
    ];
  }

  return [VALIDATION_STATUS.OK, baseMessage];
}

/**
 * 特定の項目が期待値と一致するか判定し、対応する値を返す
 * @param {any} actualValue 実際の値
 * @param {any} expectedValue 期待する値 (例: "あり")
 * @param {any} returnValue 一致した時に返す値 (例: 1)
 * @param {any} defaultValue 一致しない時に返す値 (デフォルトは空文字)
 */
function validationGetValueIfMatch_(
  actualValue,
  expectedValue,
  returnValue,
  defaultValue = "",
) {
  return actualValue === expectedValue ? returnValue : defaultValue;
}
