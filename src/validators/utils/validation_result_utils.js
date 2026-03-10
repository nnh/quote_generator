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

/**
 * バリデーションチェック関数を実行し、結果ステータスとメッセージの配列を作成する。
 *
 * checkFunc の実行結果（boolean配列）を `toStatusFromBooleanArray_` に渡し、
 * ステータス文字列へ変換したうえで、指定したメッセージと組み合わせて返す。
 *
 * @param {Function} checkFunc バリデーションを実行する関数（boolean配列を返す関数）
 * @param {string} message バリデーション結果に対応する説明メッセージ
 * @return {[string, string]} [ステータス, メッセージ] の配列
 */
function validationBuildMessage_(checkFunc, message) {
  const status = toStatusFromBooleanArray_(
    checkFunc(),
    VALIDATION_MESSAGES.VALUE_MISMATCH,
  );

  return [status, message];
}
