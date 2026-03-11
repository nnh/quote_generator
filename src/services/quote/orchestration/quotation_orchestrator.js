/**
 * 見積処理メインエントリ
 */

/**
 * 試験期間が設定されており、見積計算の対象となる年度別シート一覧を取得する
 *
 * - Setup〜Closing のいずれかの期間が存在するシートのみを対象とする
 * - 見積処理メイン（quote_script_main）から呼び出される
 *
 * @return {Array<Array>} 見積対象シート情報の配列
 *   [0]: シート名
 *   [1]: 試験期間情報（内部判定用）
 *   [2]: 対象有無判定用フラグ（空文字以外＝対象）
 */
function getActiveTrialTermSheets_() {
  const COUNT_IDX = 2;
  return getTrialTermInfo_()
    .map((x, idx) => x.concat(idx))
    .filter((x) => x[COUNT_IDX] !== "");
}

/**
 * 指定された年度別シートに対して、Quotation request の内容を反映する
 *
 * - Setup / 登録期間 / Closing などの見積項目を順に設定する
 * - シート単位の見積計算処理を集約した関数
 *
 * @param {string} sheetName 見積を反映する年度別シート名
 *
 * @return {void}
 */
function applyQuotationToSheet_(sheetName) {
  let values = null;
  const context = buildSheetContext_(sheetName);

  values = applySetupItems_(context, values);
  values = applyRegistrationTermItems_(context, values);
  values = applyRegistrationItems_(context, values);
  values = applyClosingItems_(context, values);
  values = applyNonSetupItems_(context, values);
  values = applyCommonItems_(context, values);
  setTargetCountValues_(
    (sheetname = sheetName),
    (target_col = context.target_col),
    (values = values),
  );
}

/**
 * 見積処理完了後に行う後処理をまとめて実行する
 *
 * - 年度間で不均等な項目の補正
 * - Setup〜Closing の内容に応じたシート表示／非表示制御
 * - 見積全体に関わる横断的な処理を担当
 *
 * quote_script_main の最終フェーズで呼び出される
 *
 * @return {void}
 */
function postProcessQuotation_() {
  setImbalanceValues_();
  get_target_term_sheets().forEach((sheet) =>
    sheet.getRange("B2").getValue() === ""
      ? sheet.hideSheet()
      : sheet.showSheet(),
  );
}
/**
 * 見積処理メインエントリ
 * Quotation request を元に、各年度別シートへ見積項目を反映する
 */
function quote_script_main() {
  initial_process();
  if (!_quotationRequestMap.has("タイムスタンプ")) {
    throw new Error(
      "Quotation request が未入力です。Quotation requestシートの1〜2行目に必要な情報を入力してください。",
    );
  }
  const SHEETNAME_IDX = 0;
  // フィルタや非表示設定を初期状態に戻す
  resetFilterVisibility();
  // Trial シートに試験情報（開始日・終了日・期間など）を反映
  set_trial_sheet_();
  // 試験期間が存在し、見積計算の対象となる年度別シートを抽出
  const targetSheetList = getActiveTrialTermSheets_();
  // 抽出された各シートに対し、Quotation request の値を元に見積項目を設定
  targetSheetList.forEach((x) => applyQuotationToSheet_(x[SHEETNAME_IDX]));
  // 全シート反映後に行う後処理（不均等項目・表示制御など）
  postProcessQuotation_();
}
