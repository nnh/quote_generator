/**
* フィルタ：全条件を表示する
* @param none
* @return none
*/
function filtervisible(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws_t = ss.getSheets();
  const max_index = ws_t.length;
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws_t = ss.getSheets();
  const max_index = ws_t.length;
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
* 初回必須処理
* シート編集可能者全員の権限を設定し、見積設定に必要なスクリプトプロパティを設定する
* @param none
* @return none
*/
function setProtectionEditusers(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const users = ss.getEditors();
  const protections = ss.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  for (var i = 0; i < protections.length; i++){
   protections[i].addEditors(users)
  }
  work_setproperty();
}
/**
* 列名から列番号を返す
* @param {string} column_name 列名（'A'など）
* @return Aなら1、のような列番号
*/
function getColumnNumber(column_name){ 
  const temp_sheet = SpreadsheetApp.getActiveSheet();
  const temp_range = temp_sheet.getRange(column_name + '1').getColumn();
  return(temp_range);
}
/**
* 列番号から列名を返す
* @param {Number} column_name 列番号
* @return 1ならA、のような列名
*/
function getColumnString(column_number) {
  const temp_sheet = SpreadsheetApp.getActiveSheet();
  const temp_range = temp_sheet.getRange(1, column_number);
  var temp_res = temp_range.getA1Notation();
  temp_res = temp_res.replace(/\d/,'');
  return(temp_res);
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
  var temp;
  if (start_date == '' || end_date == ''){
    return(null);
  }
  temp = get_months(start_date, end_date);
  return(Math.ceil(temp / 12));
}
/**
* 項目と行番号を連想配列に格納する（例：{契約・支払手続、実施計画提出支援=24.0, バリデーション報告書=39.0, ...}）
* @param {associative array sheet} sheet シートオブジェクト
* @param {string} target_col 項目名の列
* @return {associative array} array_fy_items 項目と行番号の連想配列
* @example 
*   var array_item = get_fy_items(target_sheet, target_col);
*/
function get_fy_items(sheet, target_col){
  const get_s_p = PropertiesService.getScriptProperties();
  var temp_array = sheet.getRange(1, target_col, sheet.getDataRange().getLastRow(), 1).getValues();
  // 二次元配列から一次元配列に変換
  temp_array = Array.prototype.concat.apply([],temp_array);
  var array_fy_items = {};
  for (var i = 0; i < temp_array.length; i++){
    if (temp_array[i] != ''){
      array_fy_items[temp_array[i]] = i + 1;
    }
  }
  return(array_fy_items);
}
/**
* シート名を連想配列に格納する
* @param none
* @return シート名の連想配列
*/
function get_sheets(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = {trial:ss.getSheetByName(get_s_p.getProperty('trial_sheet_name')),
               quotation_request:ss.getSheetByName(get_s_p.getProperty('quotation_request_sheet_name')),
               total:ss.getSheetByName(get_s_p.getProperty('total_sheet_name')),
               total2:ss.getSheetByName(get_s_p.getProperty('total2_sheet_name')),
               total3:ss.getSheetByName(get_s_p.getProperty('total3_sheet_name')),
               setup:ss.getSheetByName(get_s_p.getProperty('setup_sheet_name')),
               registration_1:ss.getSheetByName(get_s_p.getProperty('registration_1_sheet_name')),
               registration_2:ss.getSheetByName(get_s_p.getProperty('registration_2_sheet_name')),
               interim_1:ss.getSheetByName(get_s_p.getProperty('interim_1_sheet_name')),
               observation_1:ss.getSheetByName(get_s_p.getProperty('observation_1_sheet_name')),
               interim_2:ss.getSheetByName(get_s_p.getProperty('interim_2_sheet_name')),
               observation_2:ss.getSheetByName(get_s_p.getProperty('observation_2_sheet_name')),
               closing:ss.getSheetByName(get_s_p.getProperty('closing_sheet_name')),
               items:ss.getSheetByName(get_s_p.getProperty('items_sheet_name'))}
  return(sheet);
}
/**
* スクリプトプロパティの設定
*/
function work_setproperty(){
  const get_s_p = PropertiesService.getScriptProperties();
  get_s_p.setProperty('total_sheet_name', 'Total');
  get_s_p.setProperty('total2_sheet_name', 'Total2');
  get_s_p.setProperty('total3_sheet_name', 'Total3');
  get_s_p.setProperty('setup_sheet_name', 'Setup');
  get_s_p.setProperty('registration_1_sheet_name', 'Registration_1');
  get_s_p.setProperty('registration_2_sheet_name', 'Registration_2');
  get_s_p.setProperty('interim_1_sheet_name', 'Interim_1');
  get_s_p.setProperty('observation_1_sheet_name', 'Observation_1');
  get_s_p.setProperty('observation_2_sheet_name', 'Observation_2');
  get_s_p.setProperty('interim_2_sheet_name', 'Interim_2');
  get_s_p.setProperty('closing_sheet_name', 'Closing');
  get_s_p.setProperty('trial_sheet_name', 'Trial');
  get_s_p.setProperty('items_sheet_name', 'Items');
  get_s_p.setProperty('quotation_request_sheet_name', 'Quotation Request');
  get_s_p.setProperty('investigator_initiated_trial', '医師主導治験');
  get_s_p.setProperty('specified_clinical_trial', '特定臨床研究');
  get_s_p.setProperty('central_monitoring_str', '中央モニタリング');
  get_s_p.setProperty('flag_overflowing_setup', 0.0);
  get_s_p.setProperty('fy_sheet_items_col', 3);
  get_s_p.setProperty('trial_start_col', 4);
  get_s_p.setProperty('trial_end_col', 5);
  get_s_p.setProperty('trial_years_col', 3);
  get_s_p.setProperty('trial_setup_row', 32);
  get_s_p.setProperty('trial_closing_row', 39);
  get_s_p.setProperty('fy_sheet_count_col', 6);
  get_s_p.setProperty('trial_number_of_cases_row', 28);
  get_s_p.setProperty('trial_const_facilities_row', 29);
  get_s_p.setProperty('trial_comment_range', 'B12:B26');
  get_s_p.setProperty('function_number_of_cases', '=' + get_s_p.getProperty('trial_sheet_name') + '!B' + parseInt(get_s_p.getProperty('trial_number_of_cases_row'))); 
  get_s_p.setProperty('function_facilities', '=' + get_s_p.getProperty('trial_sheet_name') + '!B' + parseInt(get_s_p.getProperty('trial_const_facilities_row'))); 
}
