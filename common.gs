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
}
/**
* ブック全体のPDFとTotal2, Total3を横方向で出力したPDFを作成する
* @param none
* @return none
*/
function ssToPdf(){
  const get_s_p = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws_t = ss.getSheets();
  const excluded_sheets = ['trial', 'items', 'quotation_request'];
  const pdf_h = [get_s_p.getProperty('total2_sheet_name'), get_s_p.getProperty('total3_sheet_name')];
  var temp_target_sheets = get_sheets();
  var target_sheetsName = [];
  var show_sheets;
  temp_target_sheets.quote = ss.getSheetByName(get_s_p.getProperty('quote_sheet_name'));
  excluded_sheets.map(function(x){ delete temp_target_sheets[x] });
  Object.keys(temp_target_sheets).forEach(function(x){
    target_sheetsName.push(this[x].getName());
  }, temp_target_sheets);
  show_sheets = ws_t.map(function(x){
    if (!(x.isSheetHidden())){
      var temp = x;
    } 
    if (this.indexOf(x.getName()) == -1){
      x.hideSheet();
    }
    return temp;
  }, target_sheetsName);
  // remove null
  show_sheets = show_sheets.filter(Boolean);
  filterhidden();
  total2_3_show_hidden_cols();
  convertSpreadsheetToPdf(null, true, 4);
  if (show_sheets !== void　0){
    show_sheets.map(function(x){ x.showSheet(); });
  }
  pdf_h.map(function(x){
    if (!(ss.getSheetByName(x).isSheetHidden())){
      convertSpreadsheetToPdf(x, false, 4); 
    }
  });
}
/**
* PDFを作成する
* @param {string} sheet_name シート名
* @param {boolean} portrait true:vertical false:Horizontal
* @param {number} scale 1= 標準100%, 2= 幅に合わせる, 3= 高さに合わせる,  4= ページに合わせる
* @return none
*/
function convertSpreadsheetToPdf(sheet_name, portrait, scale){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const folder_id = PropertiesService.getScriptProperties().getProperty("folder_id");
  const output_folder = DriveApp.getFolderById(folder_id);
  const url_base = ss.getUrl().replace(/edit$/,'');
  var pdfName = ss.getName();
  var str_id = '&id=' +ss.getId();
  if (sheet_name != null){
    var sheet_id = ss.getSheetByName(sheet_name).getSheetId();
    str_id = '&gid=' + sheet_id;
    pdfName = sheet_name;
  }
  const url_ext = 'export?exportFormat=pdf&format=pdf'
      + str_id
      + '&size=letter'
      + '&portrait=' + portrait 
      + '&fitw=true'
      + '&scale=' + scale
      + '&sheetnames=false&printtitle=false&pagenumbers=false'
      + '&gridlines=false'  // hide gridlines
      + '&fzr=false';       // do not repeat row headers (frozen rows) on each page
  const options = {
    headers: {
      'Authorization': 'Bearer ' +  ScriptApp.getOAuthToken(),
    }
  }
  const response = UrlFetchApp.fetch(url_base + url_ext, options);
  const blob = response.getBlob().setName(pdfName + '.pdf');
  output_folder.createFile(blob);
}
/**
* 「合計」の列または行の番号を返す
* @param {sheet} sheet 対象シート
* @param {boolean} target true:列, false:行
* @param {number} header_row 見出し行の番号
* @param {number} header_col 見出し列の番号
* @return number
*/
function get_col_row_number(sheet, target, header_row, header_col){
  var last_col = 1;
  var last_row = 1;
  if (target){
    last_col = sheet.getLastColumn();
  } else {
    last_row = sheet.getLastRow();
  }
  var temp_header = sheet.getRange(header_row, header_col, last_row, last_col).getValues();
  var header = [];
  if (!target){
    temp_header.map(function(x){ this.push(x[0]); }, header);
  } else {
    header = temp_header[0];
  }
  var sum_col_row = header.map(function(x, idx){
    if (x == '合計'){
      return(idx);
    }
  });
  sum_col_row = sum_col_row.filter(Boolean)[0];
  if (target){
    return(sum_col_row + header_col);
  } else {
    return(sum_col_row + header_row);
  }
}
/**
* Total2, Total3シート
* 合計0円の列を非表示に、0円以上の列を表示にする
* @param {sheet} target_sheet シート名
* @param {number} start_col setup列の番号
* @param {number} header_row 見出し行の番号
* @param {number} header_col 見出し列の番号
* @return none
*/
function show_hidden_cols(target_sheet, start_col, header_row, header_col){
  // 「合計」列を取得
  const sum_col = get_col_row_number(target_sheet, true, header_row, header_col);
  // 合計列の前までを処理範囲にする
  const last_col = sum_col - start_col;
  // 「合計」行を取得
  const sum_row = get_col_row_number(target_sheet, false, header_row, header_col);
  // 「合計」行が0より大きい数値の場合のみ表示
  const target_sum_rows = target_sheet.getRange(sum_row, start_col, 1, last_col);
  const sum_row_values = target_sum_rows.getValues();
  for (var i = 0; i < last_col; i++){
    if (target_sum_rows.offset(0, i, 1, 1).getValue() > 0){
      target_sheet.unhideColumn(target_sum_rows.offset(0, i, 1, 1));
    } else {
      target_sheet.hideColumn(target_sum_rows.offset(0, i, 1, 1));
    }
  }  
}
function total2_3_show_hidden_cols(){
  const sheet = get_sheets();
  show_hidden_cols(sheet.total2, 4, 4, 2);
  show_hidden_cols(sheet.total3, 4, 3, 2);
}
/**
* Total2, Total3シート
* Trialシートの試験期間年数から列の追加削除を行う
* @param {sheet} sheet Total2/Total3を指定
* @param {number} term_row Total2/Total3シートの年度の上の行
* @param {string} target_term_name 試験期間名（Setupなど）
* @param {number} term_years 試験期間年数
* @return none
*/
function add_del_cols(sheet, term_row, target_term_name, term_years){
  const term_str = sheet.getRange(term_row, 1, 1, sheet.getLastColumn()).getValues();
  const term_str_first = term_str[0].indexOf(target_term_name);
  if (term_str_first == -1){
    return;
  }
  const term_str_count = term_str[0].filter(function(x){return(x == target_term_name)}).length;
  if (term_str_count > term_years){
    // 試験期間年数より列数が多ければ列の削除を行う
    sheet.deleteColumn(term_str_first + 1);
  } else if (term_str_count < term_years){
    // 試験期間年数より列数が少なければ列の追加を行う
    sheet.insertColumnAfter(term_str_first + 1);
    sheet.getRange(1, (term_str_first + 1), sheet.getLastRow(), 1).copyTo(sheet.getRange(1, (term_str_first + 2)));
  } else {
    return;
  }
  add_del_cols(sheet, term_row, target_term_name, term_years);
}
function total2_3_add_del_cols(){
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  // 試験期間年数を取得
  const row_count = parseInt(get_s_p.getProperty('trial_closing_row')) - parseInt(get_s_p.getProperty('trial_setup_row')) + 1;
  const trial_term_info = sheet.trial.getRange(get_s_p.getProperty('trial_setup_row'), 1, row_count, 3).getValues();
  filtervisible();
  trial_term_info.filter(function(x){ return(x[2] > 1) }).map(
    function(y){
      add_del_cols(sheet.total2, 2, y[0], y[2]);
      add_del_cols(sheet.total3, 2, y[0], y[2]);
    });
  total2_3_show_hidden_cols();
  filterhidden();
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
