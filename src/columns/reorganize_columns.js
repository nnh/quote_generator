/**
 * Total2, Total3シート
 * 合計0円の列を非表示に、0円以上の列を表示にする
 * @param {sheet} target_sheet シート名
 * @return none
 */
function show_hidden_cols(target_sheet) {
  const get_s_p = PropertiesService.getScriptProperties();
  // 「合計」行を取得
  const goukei_row = get_goukei_row(target_sheet);
  // 「合計」列を取得
  const goukei_col = get_years_target_col(target_sheet, "合計");
  // 「Setup」列を取得
  const add_del = new Add_del_columns(target_sheet);
  const header_t = add_del.get_setup_closing_range();
  if (!header_t) return;
  const setup_col =
    header_t.indexOf(get_s_p.getProperty("setup_sheet_name")) + 1;
  // 「Setup」〜「合計」直前までの合計行を一括取得
  const width = goukei_col - setup_col;
  const values = target_sheet
    .getRange(goukei_row, setup_col, 1, width)
    .getValues()[0];

  // 配列を見ながら列の表示／非表示を切り替え
  for (let offset = 0; offset < width; offset++) {
    const col = setup_col + offset;
    const value = values[offset];

    // 列全体のRangeを取得（1列ぶん）
    const colRange = target_sheet.getRange(
      1,
      col,
      target_sheet.getMaxRows(),
      1,
    );

    value > 0
      ? target_sheet.unhideColumn(colRange)
      : target_sheet.hideColumn(colRange);
  }
}
function total2_3_show_hidden_cols() {
  const target_sheets = extract_target_sheet();
  target_sheets.forEach((x) => show_hidden_cols(x));
}
/**
 * 引数に与えた文字列があるセルの列番号を返す。
 * @param {sheet} sheet Total2/Total3を指定
 * @param {string} target_str 検索する文字列
 * @return {number}
 */
function get_years_target_col(sheet, target_str) {
  const props = PropertiesService.getScriptProperties();

  const target_row = sheet
    .getName()
    .includes(props.getProperty("total2_sheet_name"))
    ? 4
    : sheet.getName().includes(props.getProperty("total3_sheet_name"))
      ? 3
      : null;

  if (!target_row) return null;

  const lastCol = sheet.getLastColumn();
  const rowValues = sheet.getRange(target_row, 1, 1, lastCol).getValues()[0];

  const idx = rowValues.indexOf(target_str);
  if (idx < 0) return null;

  return idx + 1; // 列番号（1始まり）
}

/**
 * 「合計」の行番号を返す。
 * @param {sheet} sheet Total2/Total3を指定
 * @return {number}
 */
function get_goukei_row(sheet) {
  const props = PropertiesService.getScriptProperties();

  const target_col = sheet
    .getName()
    .includes(props.getProperty("total2_sheet_name"))
    ? 2
    : sheet.getName().includes(props.getProperty("total3_sheet_name"))
      ? 2
      : null;

  if (!target_col) return null;

  const lastRow = sheet.getLastRow();
  const values = sheet.getRange(1, target_col, lastRow, 1).getValues();

  // 先頭から順に探して、見つかった瞬間に返す
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === "合計") {
      return i + 1; // 行番号は1始まり
    }
  }

  // 見つからなかった場合
  return null;
}

/**
 * Trialシートの試験期間年数から列の追加削除を行う
 * @param none
 * @return none
 */
function total2_3_add_del_cols() {
  // 初回のみsetProtectionEditusersを実行
  initial_process();
  //　フィルタを解除し全行表示する
  resetFilterVisibility();
  const target_sheets = extract_target_sheet();
  // 列を初期化する
  target_sheets.forEach((x) => new Add_del_columns(x).init_cols());
  // Trialシートの試験期間、見出し、試験期間年数を取得する
  const trial_term_info = getTrialTermInfo_();
  // 列の追加
  const add_columns = trial_term_info.filter(
    ([_sheetName, _header, count]) => count > 1,
  );
  if (add_columns.length > 0) {
    target_sheets.forEach((sheet) => {
      const add_del = new Add_del_columns(sheet);
      add_columns.forEach(([sheetName, _, count]) => {
        add_del.add_cols([sheetName, count], sheet);
      });
    });
  }
  // 合計0円の年度を非表示にする
  total2_3_show_hidden_cols();
  //　0の行を非表示にするフィルタをセット
  hideFilterVisibility();
}
/**
 * Total2, Total3シートの列構成用
 * 対象のシートオブジェクトの配列を返す
 * @param none
 * @return {[sheet]}
 */
function extract_target_sheet() {
  const props = PropertiesService.getScriptProperties();
  const sheets = get_sheets(); // 全シートの辞書

  const totalNames = [
    props.getProperty("total2_sheet_name").toLowerCase(),
    props.getProperty("total3_sheet_name").toLowerCase(),
  ];

  const suffixes = [
    "",
    "_" + props.getProperty("name_nmc"),
    "_" + props.getProperty("name_oscr"),
  ];

  const result = [];

  // total2 / total3 × 接尾辞 の組み合わせをすべて試す
  totalNames.forEach((base) => {
    suffixes.forEach((suffix) => {
      const sheetObj = sheets[base + suffix];
      if (sheetObj) {
        result.push(sheetObj);
      }
    });
  });

  return result;
}
