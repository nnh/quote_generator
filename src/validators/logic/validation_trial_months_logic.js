/**
 * 試験期間（月数）を計算して取得する
 *
 * Checkシートの指定セルに DATEDIF の数式を一時的に設定し、
 * 計算された試験月数を取得する。
 *
 * ※ 数式を反映させるため SpreadsheetApp.flush() を実行する。
 *
 * @param {number} row - 数式を書き込む行番号（Checkシート）
 * @param {number} col - 数式を書き込む列番号（Checkシート）
 * @returns {number} 試験月数（月）
 */
function validationCalculateTrialMonths_(row, col) {
  const formulaTrialMonths = '=DATEDIF(C2,D2,"M") + IF(DAY(C2)<=DAY(D2),1,2)';
  const checkSheet = _cachedSheets.check;
  checkSheet.getRange(row, col).setFormula(formulaTrialMonths);
  SpreadsheetApp.flush();
  // 試験月数が計算される列
  const COL_TRIAL_MONTHS = 5;
  return checkSheet.getRange(row, COL_TRIAL_MONTHS).getValue();
}
