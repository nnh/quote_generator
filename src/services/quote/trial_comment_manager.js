/**
 * trialシートのコメント欄を管理するクラス。
 * コメントの取得、追加、削除を行う。
 */
class TrialCommentManager {
  constructor() {
    this.trialSheet = get_sheets().trial;
    this.commentRange = this.trialSheet.getRange(TRIAL_SHEET.RANGES.COMMENT);
  }
  clearComments() {
    this.commentRange.clearContent();
  }
  setRangeValues(array_comment) {
    const start_row = this.commentRange.getCell(1, 1).getRow();
    const start_col = this.commentRange.getCell(1, 1).getColumn();
    const comment_length = array_comment.length;
    this.clearComments();
    if (comment_length <= 0) {
      return;
    }
    this.trialSheet
      .getRange(start_row, start_col, comment_length, 1)
      .setValues(array_comment);
  }
  /**
   * trialシートのコメント欄から、指定したコメントを除外した一覧を取得する。
   *
   * - セルに数式が入っている場合は数式を優先して取得する
   * - 数式が空の場合は表示値を使用する
   * - 空文字のコメントは除外する
   * - target と一致するコメントは除外する
   *
   * ※ このメソッドはシートの値を変更しない（参照専用）
   *
   * @param {string} target
   *   除外対象となるコメント文字列
   *
   * @return {Array.<Array.<string>>}
   *   フィルタ後のコメント配列
   *   例: [["コメント1"], ["コメント2"]]
   */
  getFilteredComments(target) {
    const comment_formulas = this.trialSheet
      .getRange(this.commentRange.getA1Notation())
      .getFormulas();
    const comment_values = this.trialSheet
      .getRange(this.commentRange.getA1Notation())
      .getValues();
    let beforeDeleteComments = [];
    for (let i = 0; i < comment_formulas.length; i++) {
      const formula = comment_formulas[i][0];
      const value = comment_values[i][0];
      beforeDeleteComments[i] = formula !== "" ? [formula] : [value];
    }
    const delComment = beforeDeleteComments.filter(
      ([value]) => value && value !== target,
    );

    return delComment;
  }
}
/**
 * trialシートのコメントを追加する。
 * @param {string} str_comment コメント文字列
 * @return {void}
 */
function set_trial_comment_(str_comment) {
  const trialCommentManager = new TrialCommentManager();
  // 既存の同一コメントを除外したうえで追加
  const comments = trialCommentManager.getFilteredComments(str_comment);
  comments.push([str_comment]);
  trialCommentManager.setRangeValues(comments);
}
/**
 * trialシートのコメントを削除する。
 * @param {string} str_comment コメント文字列
 * @return {void}
 */
function delete_trial_comment_(str_comment) {
  const trialCommentManager = new TrialCommentManager();
  const comments = trialCommentManager.getFilteredComments(str_comment);
  trialCommentManager.setRangeValues(comments);
}
