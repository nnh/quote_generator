/**
 * 中間解析関連の項目リストを生成する
 * @param {Object} params
 * @param {string} params.trialType
 * @param {number} params.interimTableCount
 * @param {number} params.dataCleaningBefore
 * @returns {Array<Array>}
 */
function buildInterimAnalysisItems_({
  trialType,
  interimTableCount,
  dataCleaningBefore,
}) {
  const dataCleaning = dataCleaningBefore > 0 ? dataCleaningBefore + 1 : 1;

  const analysisItem =
    trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
      ? "中間解析プログラム作成、解析実施（ダブル）"
      : "中間解析プログラム作成、解析実施（シングル）";

  return [
    ["統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成", 1],
    [analysisItem, interimTableCount],
    ["中間解析報告書作成（出力結果＋表紙）", 1],
    ["データクリーニング", dataCleaning],
  ];
}
/**
 * アクティブシートに中間解析の項目を設定する。
 */
function setInterimAnalysis_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = ss.getActiveSheet().getName();

  if (!get_target_term_sheets().some((s) => s.getName() === sheetName)) {
    return;
  }

  const sheet = get_sheets();
  const lastCol = sheet.quotation_request.getDataRange().getLastColumn();
  const quotationRequest = sheet.quotation_request
    .getRange(1, 1, 2, lastCol)
    .getValues();

  new SetSheetItemValues(sheetName, quotationRequest).setInterimAnalysis();
}
