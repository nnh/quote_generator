/**
 * Total2 / Total3 シートで、合計金額に応じて列の表示状態を切り替える。
 * 合計が 0 円の列は非表示、0 円より大きい列は表示する。
 *
 * @param {Sheet} target_sheet 対象の Total2 / Total3 シート
 * @return {void}
 */
function showHiddenCols_(target_sheet) {
  const sheetName = target_sheet.getName();
  const config = getTotalSheetConfig_(sheetName);
  if (!config) return;
  const sheetValues = target_sheet.getDataRange().getValues();
  // 「合計」行の番号を取得
  const sumRowNumber = findSumRowNumber_(config, sheetValues);
  // 「合計」列の番号を取得
  const sumColumnNumber = findSumColumnNumber_(config, sheetValues);
  // 「Setup」列を取得
  const addDelColumns = new AddDelColumns(target_sheet);
  const headerTable = addDelColumns.getSetupClosingHeader();
  if (!headerTable) return;
  const setupColumnNumber =
    headerTable.indexOf(QUOTATION_SHEET_NAMES.SETUP) + 1;
  // 「Setup」〜「合計」直前までの合計行を一括取得
  const width = sumColumnNumber - setupColumnNumber;
  const values = target_sheet
    .getRange(sumRowNumber, setupColumnNumber, 1, width)
    .getValues()[0];

  // 配列を見ながら列の表示／非表示を切り替え
  for (let offset = 0; offset < width; offset++) {
    const col = setupColumnNumber + offset;
    const value = values[offset];

    const lastRow = target_sheet.getLastRow();
    const colRange = target_sheet.getRange(1, col, lastRow, 1);

    value > 0
      ? target_sheet.unhideColumn(colRange)
      : target_sheet.hideColumn(colRange);
  }
}

/**
 * 複数の Total2 / Total3 シートに対して
 * 合計金額に応じた列の表示／非表示処理を実行する。
 *
 * @param {Sheet[]} target_sheets 対象シート配列
 * @return {void}
 */
function total2_3ShowHiddenCols_(target_sheets) {
  target_sheets.forEach((x) => showHiddenCols_(x));
}

/**
 * シートの値配列から「合計」行番号を取得する。
 *
 * @param {{
 *   sumLabelColIndex: number
 * }} config Totalシート設定
 * @param {Array<Array<*>>} values getValues() の戻り値
 * @return {number|null} 「合計」行番号（1始まり）。見つからない場合は null
 */
function findSumRowNumber_(config, values) {
  if (!config) return null;

  const rowIndex = findRowIndexByValue_(
    values,
    config.sumLabelColIndex,
    ITEM_LABELS.SUM,
  );

  return rowIndex !== null ? rowIndex + 1 : null;
}

/**
 * シートの値配列から「合計」列番号を取得する。
 *
 * @param {{
 *   headerRowIndex: number
 * }} config Totalシート設定
 * @param {Array<Array<*>>} values getValues() の戻り値
 * @return {number|null} 「合計」列番号（1始まり）。見つからない場合は null
 */
function findSumColumnNumber_(config, values) {
  if (!config) return null;

  const colIndex = findColumnIndexByValue_(
    values,
    config.headerRowIndex,
    ITEM_LABELS.SUM,
  );

  return colIndex !== null ? colIndex + 1 : null;
}

/**
 * Trialシートの試験期間年数に応じて
 * Total2 / Total3 シートの列の追加・削除および表示制御を行う。
 *
 * @return {void}
 */
function total2_3_add_del_cols() {
  initial_process();
  //　フィルタを解除し全行表示する
  resetFilterVisibility();
  // Total2/Total3系シートを取得する
  const target_sheets = extractTargetSheets_();
  // 列を初期化する
  target_sheets.forEach((x) => new AddDelColumns(x).initCols());
  // Trialシートの試験期間、見出し、試験期間年数を取得する
  const trial_term_info = getTrialTermInfo_();
  // 列の追加
  const add_columns = trial_term_info.filter(
    ([_sheetName, _header, count]) => count > 1,
  );
  if (add_columns.length > 0) {
    target_sheets.forEach((sheet) => {
      const addDelColumns = new AddDelColumns(sheet);
      add_columns.forEach(([sheetName, _, count]) => {
        addDelColumns.addCols([sheetName, count], sheet);
      });
    });
  }
  // 合計0円の年度を非表示にする
  total2_3ShowHiddenCols_(target_sheets);
  //　0の行を非表示にするフィルタをセット
  hideFilterVisibility();
}

/**
 * Total2 / Total3 系シートを取得する。
 *
 * @return {Sheet[]} Total2 / Total3 系シートの配列
 */
function extractTargetSheets_() {
  const sheets = get_sheets();

  return Object.entries(sheets)
    .filter(([name]) => name.startsWith("total2") || name.startsWith("total3"))
    .map(([, sheet]) => sheet);
}

/**
 * Total2 / Total3 シートの設定情報を取得する。
 *
 * @param {string} sheetName シート名
 * @return {{
 *   headerRowIndex: number,
 *   headerRowNumber: number,
 *   sumLabelColNumber: number,
 *   sumLabelColIndex: number
 * } | null}
 */
function getTotalSheetConfig_(sheetName) {
  if (sheetName.includes(QUOTATION_SHEET_NAMES.TOTAL2)) {
    return {
      headerRowIndex: 3,
      headerRowNumber: 4,
      sumLabelColNumber: 2,
      sumLabelColIndex: 1,
    };
  }

  if (sheetName.includes(QUOTATION_SHEET_NAMES.TOTAL3)) {
    return {
      headerRowIndex: 2,
      headerRowNumber: 3,
      sumLabelColNumber: 2,
      sumLabelColIndex: 1,
    };
  }

  return null;
}
