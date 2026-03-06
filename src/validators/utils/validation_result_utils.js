function buildNgMessage_(message) {
  return VALIDATION_STATUS.NG + "：" + message;
}

/**
 * Boolean配列の結果からバリデーションステータスを生成する。
 *
 * - すべて true の場合は VALIDATION_STATUS.OK を返す
 * - 1つでも false が含まれる場合は NGメッセージを生成する
 *
 * @param {boolean[]} booleanResults 判定結果の配列
 * @param {string} [ngReason] NG時に使用する理由メッセージ
 * @param {string} [label=""] 出力行の説明ラベル
 * @returns {[string, string]} [ステータス, ラベル] の配列
 */
function toStatusFromBooleanArray_(booleanResults, ngReason, label = "") {
  const status = booleanResults.every(Boolean)
    ? VALIDATION_STATUS.OK
    : buildNgMessage_(ngReason || VALIDATION_MESSAGES.VALUE_MISMATCH);

  return [status, label];
}
