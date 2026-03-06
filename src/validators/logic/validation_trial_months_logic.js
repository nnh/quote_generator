/** 試験月数をシートから取得 */
function calculateTrialMonths_(row, col) {
  const formulaTrialMonths = '=DATEDIF(C2,D2,"M") + IF(DAY(C2)<=DAY(D2),1,2)';
  const checkSheet = _cachedSheets.check;
  checkSheet.getRange(row, col).setFormula(formulaTrialMonths);
  SpreadsheetApp.flush();
  const COL_TRIAL_MONTHS = 5;
  return checkSheet.getRange(row, COL_TRIAL_MONTHS).getValue();
}
