/**
 * メニューに追加
 */
function onOpen() {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadSheet.getSheetByName("Quotation Request");
  if (sheet) {
    if (sheet.getRange("A2").getValue() === "quote-generator-2") {
      return;
    }
  }
  const arr = [{ name: "見積項目設定", functionName: "runQuotationProcess" }];
  const arr2 = [
    { name: "フィルタ:0を非表示", functionName: "hideFilterVisibility" },
    { name: "フィルタ:全て表示", functionName: "resetFilterVisibility" },
  ];
  const arr3 = [
    {
      name: "Total2,3列再構成",
      functionName: "updateTotalSheetsColumnsByTrialTerm",
    },
  ];
  const arr4 = [{ name: "PDF出力", functionName: "exportAllPdfs" }];
  const arr5 = [
    {
      name: "出力結果チェック",
      functionName: "runOutputValidationToCheckSheet",
    },
  ];
  const arr6 = [{ name: "Price再構成", functionName: "reorganizePriceSheets" }];
  spreadSheet.addMenu("見積作成", arr);
  spreadSheet.addMenu("フィルタ", arr2);
  spreadSheet.addMenu("列再構成", arr3);
  spreadSheet.addMenu("PDF出力", arr4);
  spreadSheet.addMenu("出力結果チェック", arr5);
  spreadSheet.addMenu("Price再構成", arr6);
}
function resetFilterVisibility() {
  new FilterVisibleHidden().resetFilterVisibility();
}
function hideFilterVisibility() {
  new FilterVisibleHidden().hideFilterVisibility();
}

/**
 * 初期処理をまとめた関数
 *
 * - シートのキャッシュ取得
 * - quotation_request のヘッダー→値 Map を構築
 */
function runInitialProcess_() {
  get_sheets();
  buildQuotationRequestMap_();
}
