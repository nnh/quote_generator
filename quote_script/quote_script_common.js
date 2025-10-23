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
