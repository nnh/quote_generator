/**
 * 試験条件・件数判定ロジック
 * - get_setup_closing_term_
 * - get_count
 * - get_count_more_than
 */
/**
 * 試験種別からSetup、Closing期間の判定を行いスクリプトプロパティに格納する
 * @param {string} temp_str 試験種別
 * @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
 * @return none
 * @example
 *   get_setup_closing_term_(temp_str, array_quotation_request);
 */
function get_setup_closing_term_(temp_str, array_quotation_request) {
  // Setup期間は医師主導治験、特定臨床研究が6ヶ月、それ以外が3ヶ月
  // Closing期間は医師主導治験、特定臨床研究、研究結果報告書作成支援ありの試験が6ヶ月、それ以外が3ヶ月
  const get_s_p = PropertiesService.getScriptProperties();
  var setup_term = 3;
  var closing_term = 3;
  if (
    temp_str == get_s_p.getProperty("investigator_initiated_trial") ||
    temp_str == get_s_p.getProperty("specified_clinical_trial")
  ) {
    setup_term = 6;
    closing_term = 6;
  }
  if (
    get_quotation_request_value_(
      array_quotation_request,
      "研究結果報告書作成支援",
    ) == "あり"
  ) {
    closing_term = 6;
  }
  get_s_p.setProperty("setup_term", setup_term);
  get_s_p.setProperty("closing_term", closing_term);
}
/**
 * 条件が真ならば引数return_valueを返す。偽なら空白を返す。
 */
function get_count(subject_of_condition, object_of_condition, return_value) {
  var temp = "";
  if (subject_of_condition == object_of_condition) {
    temp = return_value;
  }
  return temp;
}
function get_count_more_than(
  subject_of_condition,
  object_of_condition,
  return_value,
) {
  var temp = "";
  if (subject_of_condition > object_of_condition) {
    temp = return_value;
  }
  return temp;
}
