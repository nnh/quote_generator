/**
* メニューに追加
*/
function onOpen() {
  const arr = [
    {name: "シート保護権限設定", functionName: "setProtectionEditusers"},
    {name: "見積項目設定", functionName: "quote_script_main"}
  ];
  const arr2 = [
    {name: "フィルタ:0を非表示", functionName: "filterhidden"},
    {name: "フィルタ:全て表示", functionName: "filtervisible"}
  ];
  const arr3 = [
    {name: "PDF出力", functionName: "ssToPdf"}
  ];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.addMenu("見積作成", arr);
  ss.addMenu("フィルタ", arr2);
  ss.addMenu("PDF出力", arr3);
}
