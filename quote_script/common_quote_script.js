/**
 * 条件が真ならば引数return_valueを返す。偽なら空白を返す。
 */
function get_count(subject_of_condition, object_of_condition, return_value) {
  return subject_of_condition == object_of_condition ? return_value : "";
}
function get_count_more_than(
  subject_of_condition,
  object_of_condition,
  return_value
) {
  return subject_of_condition > object_of_condition ? return_value : "";
}
/**
 * Retrieve the trial period, heading, and number of years of trial period on the Trial sheet.
 * @param none.
 * @return {Array.<string>} the trial period, heading, and number of years of trial period on the Trial sheet.
 */
function getTrialTermInfo_() {
  const cache = new ConfigCache();
  if (!cache.isValid) {
    console.error("Failed to initialize ConfigCache in getTrialTermInfo_");
    return [];
  }

  const sheet = get_sheets();
  const row_count =
    parseInt(cache.trialClosingRow) - parseInt(cache.trialSetupRow) + 1;
  const trial_term_info = sheet.trial
    .getRange(parseInt(cache.trialSetupRow), 1, row_count, 3)
    .getValues();
  return trial_term_info;
}
/**
 * 試験フェーズ（Setup〜Closing）のシートを表示／非表示に切り替える関数。
 *
 * この関数は、`get_target_term_sheets()` によって取得した
 * 試験フェーズに対応するスプレッドシート群を走査し、
 * 各シートのセル「B2」に値が存在するかどうかを確認します。
 *
 * - 「B2」が空欄の場合：そのシートを非表示にします。
 * - 「B2」に値がある場合：そのシートを表示します。
 *
 * この処理により、対象外のフェーズシートを自動的に非表示化できます。
 *
 * @function quote_toggle_trial_phase_sheets_
 * @returns {void} 返り値はありません。シートの表示状態を直接変更します。
 *
 * @example
 * // 試験フェーズシート（Setup～Closing）の表示状態を自動調整
 * quote_toggle_trial_phase_sheets_();
 *
 * @see get_target_term_sheets
 *   試験フェーズに対応するシート一覧を返す補助関数。
 */
function quote_toggle_trial_phase_sheets_() {
  const setupToClosing = get_target_term_sheets();
  setupToClosing.forEach((x) =>
    x.getRange("B2").getValue() == "" ? x.hideSheet() : x.showSheet()
  );
}
