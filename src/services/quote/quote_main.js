/**
 * 見積処理メインエントリ
 * - quote_script_main
 * Momentライブラリの追加が必要
 * ライブラリキー：MHMchiX6c1bwSqGM1PZiW_PxhMjh3Sh48
 */

/**
 * Quotation request シートから見積処理に必要な入力データを読み込む
 *
 * - 1〜2行目を対象として値を取得する
 * - A2セルが空白の場合は、Quotation request が未入力と判断し処理を中断する
 * - 未入力時はメッセージを表示し、null を返す
 *
 * quote_script_main などの見積処理の前段で呼び出される想定
 *
 * @return {Array<Array>|null}
 *   Quotation request シートの1〜2行目の値配列
 *   未入力の場合は null
 */
function loadQuotationRequest_() {
  const sheet = get_sheets().quotation_request;
  const lastCol = sheet.getDataRange().getLastColumn();
  const values = sheet.getRange(1, 1, 2, lastCol).getValues();
  // Quotation requestシートのA2セルが空白の場合、Quotation requestが入っていないものと判断して処理を終了する
  if (values[1][0] === "") {
    Browser.msgBox(
      "Quotation requestシートの2行目に情報を貼り付けて再実行してください。",
    );
    return null;
  }
  return values;
}

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
 * @param {Array<Array>} array_quotation_request
 *   Quotation request シート1〜2行目の値配列
 *
 * @return {void}
 */
function applyQuotationToSheet_(sheetName, array_quotation_request) {
  let values = null;
  const context = buildSheetContext_(sheetName, array_quotation_request);

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
 * @param {Array<Array>} array_quotation_request
 *   Quotation request シート1〜2行目の値配列
 *
 * @return {void}
 */
function postProcessQuotation_(array_quotation_request) {
  setImbalanceValues_(array_quotation_request);
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
  // 初回のみsetProtectionEditusersを実行
  initial_process();
  // 各種シートオブジェクトを取得
  const sheet = get_sheets();
  // Quotation request シートの入力範囲（1〜2行目）を取得
  const array_quotation_request = loadQuotationRequest_();
  // Quotation request が未入力の場合は処理を中断
  // （2行目A列が空白＝依頼情報なしと判断）
  if (!array_quotation_request) return;

  const SHEETNAME_IDX = 0;
  // フィルタや非表示設定を初期状態に戻す
  resetFilterVisibility();
  // Trial シートに試験情報（開始日・終了日・期間など）を反映
  set_trial_sheet_(sheet, array_quotation_request);
  // 試験期間が存在し、見積計算の対象となる年度別シートを抽出
  const targetSheetList = getActiveTrialTermSheets_();
  // 抽出された各シートに対し、Quotation request の値を元に見積項目を設定
  targetSheetList.forEach((x) =>
    applyQuotationToSheet_(x[SHEETNAME_IDX], array_quotation_request),
  );
  // 全シート反映後に行う後処理（不均等項目・表示制御など）
  postProcessQuotation_(array_quotation_request);
}
