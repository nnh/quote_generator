/**
* メニューに追加
*/
function onOpen() {
  const arr = [
    {name: "見積項目設定", functionName: "quote_script_main"},
    {name: "フィルタ:0を非表示", functionName: "filterhidden"},
    {name: "フィルタ:全て表示", functionName: "filtervisible"},
    {name: "シート保護権限設定", functionName: "setProtectionEditusers"}
  ];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.addMenu("見積作成", arr);
}