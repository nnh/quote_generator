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
