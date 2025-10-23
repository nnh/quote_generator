/**
 * trialシートのコメントを追加・削除する。
 */
class Set_trial_comments {
  constructor() {
    this.sheet = get_sheets();
    this.const_range = PropertiesService.getScriptProperties().getProperty(
      "trial_comment_range"
    );
  }
  clear_comments() {
    this.sheet.trial.getRange(this.const_range).clearContent();
  }
  set_range_values(array_comment) {
    const start_row = this.sheet.trial
      .getRange(this.const_range)
      .getCell(1, 1)
      .getRow();
    const start_col = this.sheet.trial
      .getRange(this.const_range)
      .getCell(1, 1)
      .getColumn();
    const comment_length = array_comment.length;
    this.clear_comments();
    if (comment_length <= 0) {
      return;
    }
    this.sheet.trial
      .getRange(start_row, start_col, comment_length, 1)
      .setValues(array_comment);
  }
  set set_delete_comment(target) {
    this.delete_target = target;
  }
  delete_comment() {
    const comment_formulas = this.sheet.trial
      .getRange(this.const_range)
      .getFormulas();
    const comment_values = this.sheet.trial
      .getRange(this.const_range)
      .getValues();
    let before_delete_comments = [];
    for (let i = 0; i < comment_formulas.length; i++) {
      before_delete_comments[i] =
        comment_formulas[i] != "" ? comment_formulas[i] : comment_values[i];
    }
    const del_comment = before_delete_comments.filter(
      (x) => x != this.delete_target && x != ""
    );
    return del_comment;
  }
}
/**
 * trialシートのコメントを追加する。
 * @param {string} str_comment コメント文字列
 * @return none
 */
function set_trial_comment_(str_comment) {
  const setComment = new Set_trial_comments();
  setComment.set_delete_comment = str_comment;
  const comments = setComment.delete_comment();
  comments.push([str_comment]);
  setComment.set_range_values(comments);
}
/**
 * trialシートのコメントを削除する。
 * @param {string} str_comment コメント文字列
 * @return none
 */
function delete_trial_comment_(str_comment) {
  const setComment = new Set_trial_comments();
  setComment.set_delete_comment = str_comment;
  const comments = setComment.delete_comment();
  setComment.set_range_values(comments);
}
