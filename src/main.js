/**
 * メニューに追加
 */
function onOpen() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Quotation Request");
  if (sheet) {
    if (sheet.getRange("A2").getValue() === "quote-generator-2") {
      return;
    }
  }
  const arr = [{ name: "見積項目設定", functionName: "quote_script_main" }];
  const arr2 = [
    { name: "フィルタ:0を非表示", functionName: "hideFilterVisibility" },
    { name: "フィルタ:全て表示", functionName: "resetFilterVisibility" },
  ];
  const arr3 = [
    { name: "Total2,3列再構成", functionName: "total2_3_add_del_cols" },
  ];
  const arr4 = [{ name: "PDF出力", functionName: "ssToPdf" }];
  const arr5 = [
    { name: "出力結果チェック", functionName: "check_output_values" },
  ];
  const arr6 = [{ name: "Price再構成", functionName: "reorganizePriceSheets" }];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.addMenu("見積作成", arr);
  ss.addMenu("フィルタ", arr2);
  ss.addMenu("列再構成", arr3);
  ss.addMenu("PDF出力", arr4);
  ss.addMenu("出力結果チェック", arr5);
  ss.addMenu("Price再構成", arr6);
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
