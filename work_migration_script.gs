function work_getproperty(){
  var get_s_p = PropertiesService.getScriptProperties();
  for(var key in get_s_p.getProperties()) {
    // get_s_p.setProperty('setup_term', setup_term);
    Logger.log('get_s_p.setProperty(' + "'" + key + "', " + get_s_p.getProperty(key) + ')');
  }
}
function work_setproperty(){
  var get_s_p = PropertiesService.getScriptProperties();
  get_s_p.setProperty('trial_years_col', 3);
  get_s_p.setProperty('trial_closing_row', 39);
  get_s_p.setProperty('quotation_request_sheet_name', 'Quotation Request');
  get_s_p.setProperty('setup_sheet_name', 'Setup');
  get_s_p.setProperty('registration_1_sheet_name', 'Registration_1');
  get_s_p.setProperty('flag_overflowing_setup', 0.0);
  get_s_p.setProperty('specified_clinical_trial', '特定臨床研究');
  get_s_p.setProperty('facilities_value', 30.0);
  get_s_p.setProperty('registration_years', 7.0);
  get_s_p.setProperty('setup_term', 6.0);
  get_s_p.setProperty('closing_sheet_name', 'Closing');
  get_s_p.setProperty('observation_1_sheet_name', 'Observation_1');
  get_s_p.setProperty('fy_sheet_items_col', 3);
  get_s_p.setProperty('trial_sheet_name', 'Trial');
  get_s_p.setProperty('interim_2_sheet_name', 'Interim_2');
  get_s_p.setProperty('central_monitoring_str', '中央モニタリング');
  get_s_p.setProperty('trial_start_col', 4);
  get_s_p.setProperty('trial_setup_row', 32);
  get_s_p.setProperty('trial_end_col', 5);
  get_s_p.setProperty('observation_2_sheet_name', 'Observation_2');
  get_s_p.setProperty('fy_sheet_count_col', 6);
  get_s_p.setProperty('interim_1_sheet_name', 'Interim_1');
  get_s_p.setProperty('closing_term', 6.0);
  get_s_p.setProperty('investigator_initiated_trial', '医師主導治験');
  get_s_p.setProperty('registration_2_sheet_name', 'Registration_2');
  get_s_p.setProperty('total_sheet_name', 'Total');
  get_s_p.setProperty('total2_sheet_name', 'Total2');
  get_s_p.setProperty('total3_sheet_name', 'Total3');
}
/**
* totalシートの関数を再構成する
* @param none
* @return none
*/
function reconfigure_total(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var get_s_p = PropertiesService.getScriptProperties();
  const const_trial_setup_row = get_s_p.getProperty('trial_setup_row');
  const const_trial_years_col = get_s_p.getProperty('trial_years_col');
  const const_count_col =get_s_p.getProperty('fy_sheet_count_col');
  var sheet = get_sheets();
  var array_total_items = get_fy_items(sheet.total);
  var array_target_sheet_name = ['setup', 'registration_1', 'registration_2', 'interim_1', 'interim_2', 
                            'observation_1', 'observation_2', 'closing']
  var temp_items, trial_cell_addr, temp_str;
  Object.keys(array_total_items).forEach(
    function(row_num){
      temp_str = '=';
      for (var i = 0; i < array_target_sheet_name.length; i++){
        trial_cell_addr = sheet.trial.getRange(parseInt(const_trial_setup_row) + i, const_trial_years_col).getA1Notation();
        temp_str = temp_str + sheet[array_target_sheet_name[i]].getName() + '!' + getColumnString(const_count_col) + this[row_num] + '*Trial!' + trial_cell_addr + '+';  
    }
    // 最後の＋を消してセット
    sheet.total.getRange(this[row_num], const_count_col).setFormula(temp_str.substr(0, temp_str.length - 1));
  }, array_total_items);
}
function work_addsheet(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var get_s_p = PropertiesService.getScriptProperties();
  var sheet = {trial:ss.getSheetByName(get_s_p.getProperty('trial_sheet_name')),
               quotation_request:ss.getSheetByName(get_s_p.getProperty('quotation_request_sheet_name')),
               total:ss.getSheetByName(get_s_p.getProperty('total_sheet_name')),
               total2:ss.getSheetByName(get_s_p.getProperty('total2_sheet_name')),
               total3:ss.getSheetByName(get_s_p.getProperty('total3_sheet_name')),
               setup:ss.getSheetByName(get_s_p.getProperty('setup_sheet_name')),
               closing:ss.getSheetByName(get_s_p.getProperty('closing_sheet_name'))}
  // シート作成
  var temp_sheet_t = [get_s_p.getProperty('registration_1_sheet_name'),
                      get_s_p.getProperty('registration_2_sheet_name'),
                      get_s_p.getProperty('interim_1_sheet_name'),
                      get_s_p.getProperty('interim_2_sheet_name'),
                      get_s_p.getProperty('observation_1_sheet_name'),
                      get_s_p.getProperty('observation_2_sheet_name')];
  var trial_header_row = parseInt(get_s_p.getProperty('trial_setup_row'));
  for (var i = 0; i < temp_sheet_t.length; i++){
    if (ss.getSheetByName(temp_sheet_t[i]) == null){
      var ss_sheet_copy = sheet.setup.copyTo(ss);
      ss_sheet_copy.setName(temp_sheet_t[i]);
      ss.getSheetByName(temp_sheet_t[i]).activate();
      ss.moveActiveSheet(i + 7);
      trial_header_row++;
      ss.getSheetByName(temp_sheet_t[i]).getRange(2, 2).setFormula('=' + get_s_p.getProperty('trial_sheet_name') + '!B' + trial_header_row);
    }
  }
  // total関数再構成
  reconfigure_total();
  // シート削除
  var temp_sheet_t = ['Registration', 'Interim', 'observation'];
  for (var i = 0; i < temp_sheet_t.length; i++){
    if (ss.getSheetByName(temp_sheet_t[i]) != null){
      ss.deleteSheet(ss.getSheetByName(temp_sheet_t[i]));
    }
  }
}
/**
* Registrationの列をテンプレートにしてtotal2シートの関数を再構成する
* @param {Array.<string>} array_sheet シート名
* @param {Number} trial_start_row trialシートのsetup試験期間年数の行
* @return none
*/
function reconfigure_total2(array_sheet, trial_start_row){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var get_s_p = PropertiesService.getScriptProperties();
  var sheet = get_sheets();
  var rangeToCopy, temp_formula, array_formula, insert_col, replace_str;
  var source_sheet_name = 'Registration';
  const const_replace_source = new RegExp(source_sheet_name, 'g');
  const const_start_row = 5;
  // setupは元の列を残す
  const const_registration_col = 5;
  // registrationの列の関数再構成
  var temp_str;
  for (var i = const_registration_col; i <= sheet.total2.getLastRow(); i++){
    if (sheet.total2.getRange(i, const_registration_col).getFormula() != ''){
      temp_str = '=IF(or(' + source_sheet_name + '!$B$2="", ' + source_sheet_name +'!$H' + i + '=""), "", ' +source_sheet_name + '!$H' + i + ')';
      sheet.total2.getRange(i, const_registration_col).setFormula(temp_str);
    }
  }
  for (var i = 0; i < array_sheet.length; i++){
    insert_col = const_registration_col + i;
    sheet.total2.insertColumnAfter(insert_col);
    rangeToCopy = sheet.total2.getRange(1, const_registration_col, sheet.total2.getMaxRows(), 1);
    rangeToCopy.copyTo(sheet.total2.getRange(1, insert_col + 1));
    array_formula = sheet.total2.getRange(1, insert_col + 1, sheet.total2.getDataRange().getLastRow(), 1).getFormulas();
    array_formula = Array.prototype.concat.apply([],array_formula);
    for (var j = 0; j < array_formula.length; j++){
      if (array_formula[j] != ''){
        replace_str = array_formula[j].replace(const_replace_source, array_sheet[i]);
        sheet.total2.getRange(j + 1, insert_col + 1).setFormula(replace_str);
      }
    }
    // 2行目にシート名、4行目に年度
    sheet.total2.getRange(2, insert_col + 1).setValue(array_sheet[i]);
    temp_str = '=if(' + get_s_p.getProperty('trial_sheet_name') + '!$C$' + (parseInt(trial_start_row) + i) + '<>"", OFFSET(INDIRECT(ADDRESS(ROW(),COLUMN())), 0, -1)+1, OFFSET(INDIRECT(ADDRESS(ROW(),COLUMN())), 0, -1))';
    sheet.total2.getRange(4, insert_col + 1).setFormula(temp_str);
  }
  // 合計列再構成
  var total_col = const_registration_col + array_sheet.length + 1;
  var closing_col_str = getColumnString(total_col - 1);
  for (var i = const_start_row; i <= sheet.total2.getLastRow(); i++){
    if (sheet.total2.getRange(i, total_col).getFormula() != ''){
      temp_str = '=if(sum(D' + i + ':' + closing_col_str + i + ')=0,"",sum(D' + i + ':' + closing_col_str + i + '))';
      sheet.total2.getRange(i, total_col).setFormula(temp_str);
    }
  }
}
function call_total2(){
  var get_s_p = PropertiesService.getScriptProperties();
  var temp_sheet_t = [get_s_p.getProperty('registration_1_sheet_name'),
                      get_s_p.getProperty('registration_2_sheet_name'),
                      get_s_p.getProperty('interim_1_sheet_name'),
                      get_s_p.getProperty('interim_2_sheet_name'),
                      get_s_p.getProperty('observation_1_sheet_name'),
                      get_s_p.getProperty('observation_2_sheet_name'),
                      get_s_p.getProperty('closing_sheet_name')];
  reconfigure_total2(temp_sheet_t, parseInt(get_s_p.getProperty('trial_setup_row')) + 1);
}
/**
* total3シートの関数を再構成する
* @param {Array.<string>} array_sheet シート名
* @param {Number} trial_start_row trialシートのsetup試験期間年数の行
* @return none
*/
function reconfigure_total3(array_sheet, trial_start_row){
  // totalシートのB列の値と行を配列に格納
  
}