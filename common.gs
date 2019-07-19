/**
* フィルタ：全条件を表示する
* @param none
* @return none
*/
function filtervisible(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws_t = ss.getSheets();
  var max_index = ws_t.length;
  var i, ws_filter, col;
  for (i = 0; i < max_index; i++){
    ws_filter = ws_t[i].getFilter();
    if (ws_filter != null){
      col = ws_filter.getRange().getColumn();
      ws_filter.removeColumnFilterCriteria(col)      
    } 
  }
}
/**
* フィルタ：0を非表示にする
* @param none
* @return none
*/
function filterhidden(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws_t = ss.getSheets();
  var max_index = ws_t.length;
  var i, ws_filter, filter_criteria, col; 
  for (i = 0; i < max_index; i++){
    ws_filter = ws_t[i].getFilter();
    if (ws_filter != null){
      col = ws_filter.getRange().getColumn();
      filter_criteria = ws_filter.getColumnFilterCriteria(col);
      if (filter_criteria != null){
        ws_filter.removeColumnFilterCriteria(col)
      } 
      filter_criteria = SpreadsheetApp.newFilterCriteria();
      filter_criteria.setHiddenValues(['0']);
      ws_filter.setColumnFilterCriteria(col, filter_criteria);
    } 
  }
}
/**
* シートの保護権限設定変更
* シート編集可能者全員の権限を設定する
* @param none
* @return none
*/
function setProtectionEditusers(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var users = ss.getEditors();
  var protections = ss.getProtections(SpreadsheetApp.ProtectionType.sheet);
  for (var i = 0; i < protections.length; i++){
   protections[i].addEditors(users)
  }
}
/**
* 列名から列番号を返す
* @param {string} column_name 列名（'A'など）
* @return Aなら1、のような列番号
*/
function getColumnNumber(column_name){
  // 
  var temp_sheet = SpreadsheetApp.getActiveSheet();
  var temp_range = temp_sheet.getRange(column_name + '1').getColumn();
  return(temp_range);
}
/**
* 開始日、終了日から月数・年数を返す
*/
function get_months(start_date, end_date){
  if (start_date == '' || end_date == ''){
    return(null);
  }
  return(end_date.diff(start_date, 'months') + 1);
}
function get_years(start_date, end_date){
  if (start_date == '' || end_date == ''){
    return(null);
  }
  var temp = get_months(start_date, end_date);
  return(Math.ceil(temp / 12));
}

