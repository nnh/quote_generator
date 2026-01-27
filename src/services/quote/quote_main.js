/**
 * 見積処理メインエントリ
 * - quote_script_main
 * Momentライブラリの追加が必要
 * ライブラリキー：MHMchiX6c1bwSqGM1PZiW_PxhMjh3Sh48
 */

/**
 * 見積項目設定
 */
function quote_script_main() {
  // 初回のみsetProtectionEditusersを実行
  initial_process();
  const sheet = get_sheets();
  const quotation_request_last_col = sheet.quotation_request
    .getDataRange()
    .getLastColumn();
  const array_quotation_request = sheet.quotation_request
    .getRange(1, 1, 2, quotation_request_last_col)
    .getValues();
  // Quotation requestシートのA2セルが空白の場合、Quotation requestが入っていないものと判断して処理を終了する
  if (array_quotation_request[1][0] === "") {
    Browser.msgBox(
      "Quotation requestシートの2行目に情報を貼り付けて再実行してください。",
    );
    return;
  }
  const SHEETNAME_IDX = 0;
  const COUNT_IDX = 2;

  resetFilterVisibility();
  set_trial_sheet_(sheet, array_quotation_request);
  const targetSheetList = getTrialTermInfo_()
    .map((x, idx) => x.concat(idx))
    .filter((x) => x[COUNT_IDX] !== "");
  targetSheetList.forEach((x) => {
    const set_sheet_item_values = new SetSheetItemValues(
      x[SHEETNAME_IDX],
      array_quotation_request,
    );
    let values = null;
    values = set_sheet_item_values.set_setup_items_(values);
    values = set_sheet_item_values.set_registration_term_items_(values);
    values = set_sheet_item_values.set_registration_items_(values);
    values = set_sheet_item_values.set_closing_items_(values);
    values = set_sheet_item_values.set_all_sheet_exclude_setup_(values);
    values = set_sheet_item_values.set_all_sheet_common_items_(values);
    set_sheet_item_values.setSheetValues(x[SHEETNAME_IDX], values);
  });
  setImbalanceValues_(array_quotation_request);
  const setupToClosing = get_target_term_sheets();
  setupToClosing.forEach((x) =>
    x.getRange("B2").getValue() === "" ? x.hideSheet() : x.showSheet(),
  );
}
