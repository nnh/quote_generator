/**
 * Total2, Total3シート
 * 合計0円の列を非表示に、0円以上の列を表示にする
 * @param {sheet} target_sheet シート名
 * @return none
 */
function showHiddenCols_(target_sheet) {
  // 「合計」行を取得
  const goukei_row = getGoukeiRow_(target_sheet);
  // 「合計」列を取得
  const goukei_col = getYearsTargetCol_(target_sheet, ITEM_LABELS.SUM);
  // 「Setup」列を取得
  const add_del = new AddDelColumns(target_sheet);
  const header_t = add_del.getSetupClosingHeader();
  if (!header_t) return;
  const setup_col = header_t.indexOf(QUOTATION_SHEET_NAMES.SETUP) + 1;
  // 「Setup」〜「合計」直前までの合計行を一括取得
  const width = goukei_col - setup_col;
  const values = target_sheet
    .getRange(goukei_row, setup_col, 1, width)
    .getValues()[0];

  // 配列を見ながら列の表示／非表示を切り替え
  for (let offset = 0; offset < width; offset++) {
    const col = setup_col + offset;
    const value = values[offset];

    const lastRow = target_sheet.getLastRow();
    const colRange = target_sheet.getRange(1, col, lastRow, 1);

    value > 0
      ? target_sheet.unhideColumn(colRange)
      : target_sheet.hideColumn(colRange);
  }
}
function total2_3ShowHiddenCols_(target_sheets) {
  target_sheets.forEach((x) => showHiddenCols_(x));
}
/**
 * 引数に与えた文字列があるセルの列番号を返す。
 * @param {sheet} sheet Total2/Total3を指定
 * @param {string} target_str 検索する文字列
 * @return {number}
 */
function getYearsTargetCol_(sheet, target_str) {
  const config = getTotalSheetConfig_(sheet.getName());
  if (!config) return null;

  const lastCol = sheet.getLastColumn();

  const rowValues = sheet
    .getRange(config.headerRow, 1, 1, lastCol)
    .getValues()[0];

  const idx = rowValues.indexOf(target_str);

  return idx >= 0 ? idx + 1 : null;
}

/**
 * 「合計」の行番号を返す。
 * @param {sheet} sheet Total2/Total3を指定
 * @return {number}
 */
function getGoukeiRow_(sheet) {
  const config = getTotalSheetConfig_(sheet.getName());
  if (!config) return null;

  const lastRow = sheet.getLastRow();

  const values = sheet.getRange(1, config.sumLabelCol, lastRow, 1).getValues();

  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === ITEM_LABELS.SUM) {
      return i + 1;
    }
  }

  return null;
}

/**
 * Trialシートの試験期間年数から列の追加削除を行う
 * @param none
 * @return none
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
      const add_del = new AddDelColumns(sheet);
      add_columns.forEach(([sheetName, _, count]) => {
        add_del.addCols([sheetName, count], sheet);
      });
    });
  }
  // 合計0円の年度を非表示にする
  total2_3ShowHiddenCols_(target_sheets);
  //　0の行を非表示にするフィルタをセット
  hideFilterVisibility();
}
/**
 * Total2 / Total3 系シートを取得
 * @return {Sheet[]}
 */
function extractTargetSheets_() {
  const sheets = get_sheets();

  return Object.entries(sheets)
    .filter(([name]) => name.startsWith("total2") || name.startsWith("total3"))
    .map(([, sheet]) => sheet);
}

function getTotalSheetConfig_(sheetName) {
  if (sheetName.includes(QUOTATION_SHEET_NAMES.TOTAL2)) {
    return {
      headerRow: 4,
      sumLabelCol: 2,
    };
  }

  if (sheetName.includes(QUOTATION_SHEET_NAMES.TOTAL3)) {
    return {
      headerRow: 3,
      sumLabelCol: 2,
    };
  }

  return null;
}
