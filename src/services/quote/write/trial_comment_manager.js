/**
 * trialシートのコメント欄を管理するクラス。
 * コメントの取得、追加、削除を行う。
 */
class TrialCommentManager {
  constructor() {
    const trialSheet = getSheetByNameCached_(TRIAL_SHEET.NAME);
    if (!trialSheet) {
      throw new Error("Trial シートが取得できません");
    }
    this.trialSheet = trialSheet;
    this.commentRange = trialSheet.getRange(TRIAL_SHEET.RANGES.COMMENT);
  }
  clearComments() {
    this.commentRange.clearContent();
  }
  setRangeValues(comment) {
    const startRow = this.commentRange.getRow();
    const startCol = this.commentRange.getColumn();
    const commentLength = comment.length;
    this.clearComments();
    if (commentLength <= 0) {
      return;
    }
    this.trialSheet
      .getRange(startRow, startCol, commentLength, 1)
      .setValues(comment);
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
    const commentFormulas = this.commentRange.getFormulas();
    const commentValues = this.commentRange.getValues();
    let allComments = [];
    for (let i = 0; i < commentFormulas.length; i++) {
      const formula = commentFormulas[i][0];
      const value = commentValues[i][0];
      allComments.push(formula !== "" ? [formula] : [value]);
    }
    const filteredComments = allComments.filter(
      ([value]) => value && value !== target,
    );

    return filteredComments;
  }
}
/**
 * trialシートのコメントを追加する。
 * @param {string} comment コメント文字列
 * @return {void}
 */
function setTrialComment_(comment) {
  const trialCommentManager = new TrialCommentManager();
  // 既存の同一コメントを除外したうえで追加
  const comments = trialCommentManager.getFilteredComments(comment);
  comments.push([comment]);
  trialCommentManager.setRangeValues(comments);
}
/**
 * trialシートのコメントを削除する。
 * @param {string} comment コメント文字列
 * @return {void}
 */
function deleteTrialComment_(comment) {
  const trialCommentManager = new TrialCommentManager();
  const comments = trialCommentManager.getFilteredComments(comment);
  trialCommentManager.setRangeValues(comments);
}
