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
  register_script_property();
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
  const temp_range = temp_sheet.getRange(1, parseInt(column_number));
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
  return(end_date.subtract(1, 'days').diff(start_date, 'months') + 1);
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
  var temp_array = sheet.getRange(1, parseInt(target_col), sheet.getDataRange().getLastRow(), 1).getValues();
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
* シートを連想配列に格納する
* @param none
* @return シートの連想配列
*/
function get_sheets(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  let sheet = {trial:ss.getSheetByName(get_s_p.getProperty('trial_sheet_name')),
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
               items:ss.getSheetByName(get_s_p.getProperty('items_sheet_name')),
               quote:ss.getSheetByName(get_s_p.getProperty('quote_sheet_name')),
               check:ss.getSheetByName(get_s_p.getProperty('value_check_sheet_name'))}
  const temp_sheet = ss.getSheetByName(get_s_p.getProperty('total_nmc_sheet_name'));
  if (temp_sheet != null){
    sheet.total_nmc = ss.getSheetByName(get_s_p.getProperty('total_nmc_sheet_name'));
    sheet.total2_nmc = ss.getSheetByName(get_s_p.getProperty('total2_nmc_sheet_name'));
    sheet.total_oscr = ss.getSheetByName(get_s_p.getProperty('total_oscr_sheet_name'));
    sheet.total2_oscr = ss.getSheetByName(get_s_p.getProperty('total2_oscr_sheet_name'));
  }
  return sheet;
}
/**
* Setup〜Closingのシートを配列に格納する
* @param none
* @return シートの配列
*/
function get_target_term_sheets(){
  const sheet = get_sheets();
  const array_target_sheet = [sheet.setup, sheet.closing, sheet.observation_2, sheet.registration_2, sheet.registration_1, sheet.interim_1, sheet.observation_1, sheet.interim_2];
  return array_target_sheet;
}
/**
* スクリプトプロパティの設定
*/
function register_script_property(){
  const get_s_p = PropertiesService.getScriptProperties();
  get_s_p.setProperty('quote_sheet_name', 'Quote');
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
  get_s_p.setProperty('folder_id', '');
  get_s_p.setProperty('cost_of_prepare_quotation_request', '試験開始準備費用');
  get_s_p.setProperty('cost_of_registration_quotation_request', '症例登録毎の支払');  
  get_s_p.setProperty('cost_of_report_quotation_request', '症例最終報告書提出毎の支払');
  get_s_p.setProperty('cost_of_prepare_item', '試験開始準備費用');
  get_s_p.setProperty('cost_of_registration_item', '症例登録');
  get_s_p.setProperty('cost_of_report_item', '症例報告');
  get_s_p.setProperty('name_nmc', 'nmc');
  get_s_p.setProperty('name_oscr', 'oscr');
  get_s_p.setProperty('quote_nmc_sheet_name', 'Quote_' + get_s_p.getProperty('name_nmc'));
  get_s_p.setProperty('total_nmc_sheet_name', 'Total_' + get_s_p.getProperty('name_nmc'));
  get_s_p.setProperty('total2_nmc_sheet_name', 'Total2_' + get_s_p.getProperty('name_nmc'));
  get_s_p.setProperty('total3_nmc_sheet_name', 'Total3_' + get_s_p.getProperty('name_nmc'));
  get_s_p.setProperty('quote_oscr_sheet_name', 'Quote_' + get_s_p.getProperty('name_oscr'));
  get_s_p.setProperty('total_oscr_sheet_name', 'Total_' + get_s_p.getProperty('name_oscr'));
  get_s_p.setProperty('total2_oscr_sheet_name', 'Total2_' + get_s_p.getProperty('name_oscr'));
  get_s_p.setProperty('total3_oscr_sheet_name', 'Total3_' + get_s_p.getProperty('name_oscr'));
  get_s_p.setProperty('value_check_sheet_name', 'Check');
  get_s_p.setProperty('facilities_itemname', '実施施設数');
  get_s_p.setProperty('number_of_cases_itemname', '目標症例数');
  get_s_p.setProperty('coefficient', '原資');
  get_s_p.setProperty('commercial_company_coefficient', '営利企業原資（製薬企業等）');
}
/**
* 指定した列に値が存在したらその行番号を返す。存在しなければ0を返す。
* @param {sheet} target_sheet 対象のシート
* @param {number} target_col_num 対象の列番号
* @param {string} target_value 検索対象の値
*/
function get_row_num_matched_value(target_sheet, target_col_num, target_value){
  const target_col = getColumnString(target_col_num);
  const col_values = target_sheet.getRange(target_col + ':' + target_col).getValues().map(function(x){ return(x[0]) });
  return(col_values.indexOf(target_value) + 1);
}
/**
* スクリプトプロパティとシート保護権限を設定して10秒待機する
*/
function initial_process(){
  const get_s_p = PropertiesService.getScriptProperties();
  if (get_s_p.getProperty('quote_sheet_name') === null){
    setProtectionEditusers();
    Utilities.sleep(10000);
  }
}
/**
* quotation_requestの1行目（項目名）からフォーム入力情報を取得する
* @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
* @param {string} header_str 検索対象の値
* @return 項目名が完全一致すればその項目の値を返す。一致しなければnullを返す。
* @example 
*   var trial_start_date = get_quotation_request_value(array_quotation_request, const_trial_start);
*/
function get_quotation_request_value(array_quotation_request, header_str){
  const temp_col = array_quotation_request[0].indexOf(header_str);
  if (temp_col > -1){
    return(array_quotation_request[1][temp_col]);
  } else {
    return null;
  }  
}