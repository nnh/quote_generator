function filtervisible(){
  // フィルタ：全条件を表示する
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws_t = ss.getSheets();
  var max_index = ws_t.length;
  var i, ws_filter;
  for (i = 0; i < max_index; i++) {
    ws_filter = ws_t[i].getFilter();
    if( ws_filter != null ){
      col = ws_filter.getRange().getColumn();
      ws_filter.removeColumnFilterCriteria(col)      
    } 
  }
}
function filterhidden(){
  // フィルタ：0を非表示にする
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws_t = ss.getSheets();
  var max_index = ws_t.length;
  var i, ws_filter, filter_criteria;
  for (i = 0; i < max_index; i++) {
    ws_filter = ws_t[i].getFilter();
    if( ws_filter != null ){
      col = ws_filter.getRange().getColumn();
      filter_criteria = ws_filter.getColumnFilterCriteria(col);
      if( filter_criteria != null ){
        ws_filter.removeColumnFilterCriteria(col)
      } 
      filter_criteria = SpreadsheetApp.newFilterCriteria();
      filter_criteria.setHiddenValues(['0']);
      ws_filter.setColumnFilterCriteria(col, filter_criteria);
    } 
  }
}
function setProtectionEditusers(){
  // シートの保護権限設定変更
  // シート編集可能者全員の権限を設定する
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var users = ss.getEditors();
  var protections = ss.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  for (var i = 0; i < protections.length; i++) {
   var protection = protections[i];
   protection.addEditors(users)
  }
}
