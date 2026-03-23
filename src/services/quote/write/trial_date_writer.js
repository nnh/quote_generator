/**
 * 試験期間データをtrialシートに反映する（副作用あり）
 *
 * - 日付の書き込み
 * - 総月数の計算式設定
 * - 年月表示の設定
 *
 * @param {{trial: GoogleAppsScript.Spreadsheet.Sheet}} sheet sheetsオブジェクト
 * @param {Array.<[Date, Date]>} trialDateArray 試験期間配列
 * @param {number} trialSetupRow 開始行
 * @param {number} trialStartCol 開始列
 * @param {number} trialEndCol 終了列
 * @param {number} trialYearsCol 年数表示列
 * @param {number} totalMonthCol 総月数列
 * @return {void}
 */
function writeTrialDatesToSheet_(
  sheet,
  trialDateArray,
  trialSetupRow,
  trialStartCol,
  trialEndCol,
  trialYearsCol,
  totalMonthCol,
) {
  const lastRow = writeTrialDateValues_(
    sheet,
    trialDateArray,
    trialSetupRow,
    trialStartCol,
    trialEndCol,
    trialYearsCol,
  );

  // total（月数）
  setTotalMonthFormula_(
    sheet,
    lastRow,
    trialStartCol,
    trialEndCol,
    totalMonthCol,
  );

  // x年xヶ月 表示
  setYearMonthDisplayFormula_(sheet, lastRow, totalMonthCol, trialYearsCol);
}

/**
 * 試験期間の日付と年数計算式をシートに書き込む（副作用あり）
 *
 * @param {{trial: GoogleAppsScript.Spreadsheet.Sheet}} sheet
 * @param {Array.<[Date, Date]>} trialDateArray
 * @param {number} trialSetupRow
 * @param {number} trialStartCol
 * @param {number} trialEndCol
 * @param {number} trialYearsCol
 * @return {number} 最終行番号
 */
function writeTrialDateValues_(
  sheet,
  trialDateArray,
  trialSetupRow,
  trialStartCol,
  trialEndCol,
  trialYearsCol,
) {
  let lastRow = null;

  trialDateArray.forEach(([startDate, endDate], i) => {
    const startCell = sheet.trial.getRange(trialSetupRow + i, trialStartCol);
    const endCell = sheet.trial.getRange(trialSetupRow + i, trialEndCol);

    if (startDate) {
      startCell.setValue(startDate);
    }
    if (endDate) {
      endCell.setValue(endDate);
    }
    const startAddr = startCell.getA1Notation();
    const endAddr = endCell.getA1Notation();
    sheet.trial
      .getRange(trialSetupRow + i, trialYearsCol)
      .setFormula(buildYearFormula_(startAddr, endAddr));

    lastRow = trialSetupRow + i;
  });

  return lastRow;
}

/**
 * 総月数の計算式を設定する（副作用あり）
 *
 * @param {{trial: GoogleAppsScript.Spreadsheet.Sheet}} sheet
 * @param {number} lastRow 最終行
 * @param {number} trialStartCol
 * @param {number} trialEndCol
 * @param {number} totalMonthCol
 * @return {void}
 */
function setTotalMonthFormula_(
  sheet,
  lastRow,
  trialStartCol,
  trialEndCol,
  totalMonthCol,
) {
  const startAddr = sheet.trial
    .getRange(lastRow, trialStartCol)
    .getA1Notation();

  const endAddr = sheet.trial.getRange(lastRow, trialEndCol).getA1Notation();

  sheet.trial
    .getRange(lastRow, totalMonthCol)
    .setFormula(buildTotalMonthFormula_(startAddr, endAddr));
}

/**
 * 年月表示（x年xヶ月）の数式を設定する（副作用あり）
 *
 * @param {{trial: GoogleAppsScript.Spreadsheet.Sheet}} sheet
 * @param {number} lastRow
 * @param {number} totalMonthCol
 * @param {number} trialYearsCol
 * @return {void}
 */
function setYearMonthDisplayFormula_(
  sheet,
  lastRow,
  totalMonthCol,
  trialYearsCol,
) {
  const totalAddr = sheet.trial
    .getRange(lastRow, totalMonthCol)
    .getA1Notation();

  sheet.trial
    .getRange(lastRow, trialYearsCol)
    .setFormula(buildYearMonthDisplayFormula_(totalAddr));
}
