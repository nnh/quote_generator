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
* シート名から年度の計算式を返す
* @param {String} sheet_name シート名
* @param {Number} trial_row trialシートの試験期間年数の行
* @return {String} 年度の式
*/
function get_fy_formula(sheet_name, trial_row){
  var get_s_p = PropertiesService.getScriptProperties();
  var temp_str;
  if (sheet_name == get_s_p.getProperty('setup_sheet_name')){
    temp_str = '=if(' + get_s_p.getProperty('trial_sheet_name') + '!$C$' + trial_row + '<>"", year(edate(' + get_s_p.getProperty('trial_sheet_name') + '!$C$' + trial_row + ', -3)), 2019)';
  } else { 
    temp_str = '=if(' + get_s_p.getProperty('trial_sheet_name') + '!$C$' + trial_row + '<>"", OFFSET(INDIRECT(ADDRESS(ROW(),COLUMN())), 0, -1)+1, OFFSET(INDIRECT(ADDRESS(ROW(),COLUMN())), 0, -1))';
  }
  return(temp_str);
}
/**
* 合計列の式を再構成してセットする
* @param {Sheet} sheet セットするシート
* @param {Number} total_col 合計列
* @param {Number} row_count 最終行
* @param {Number} start_col 開始列
* @param {Number} start_row 開始行
* @param {String} cond_str 合計が0の時にセルにセットする値
* @param {Number} total_head_row 「合計」を出す行
* @return none
*/
function reconfigure_total_col(sheet, total_col, row_count, start_col, start_row, cond_str, total_head_row){
  var setup_col_str = getColumnString(start_col);
  var closing_col_str = getColumnString(total_col - 1);
  var temp_range = sheet.getRange(1, total_col, row_count, 1);
  var temp_array = temp_range.getFormulas();
  for (var i = start_row - 1; i < temp_array.length; i++){
    temp_array[i][0] = '=if(sum(' + setup_col_str + (i + 1) + ':' + closing_col_str + (i + 1) + ')=0, ' + cond_str + ',sum(' + setup_col_str + (i + 1) + ':' + closing_col_str + (i + 1) + '))';
  }
  temp_range.setFormulas(temp_array);
  sheet.getRange(total_head_row, total_col).setValue('合計');
}
/**
* totalシートの関数を再構成する
* @param {Array.<string>} array_sheet シート名
* @return none
*/
function reconfigure_total(array_sheet){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var get_s_p = PropertiesService.getScriptProperties();
  const const_trial_setup_row = get_s_p.getProperty('trial_setup_row');
  const const_trial_years_col = get_s_p.getProperty('trial_years_col');
  const const_count_col =get_s_p.getProperty('fy_sheet_count_col');
  var sheet = get_sheets();
  var trial_cell_addr, temp_str;
  const const_start_row = 4;
  var row_count = sheet.total.getLastRow();
  var temp_range = sheet.total.getRange(1, 6, row_count, 1);
  var temp_array = temp_range.getFormulas(); 
  for (var i = const_start_row - 1; i < temp_array.length; i++){
    temp_str = '=';
    if (temp_array[i][0] != ''){
      for (var j = 0; j < array_sheet.length; j++){
        trial_cell_addr = sheet.trial.getRange(parseInt(const_trial_setup_row) + j, const_trial_years_col).getA1Notation();
        temp_str = temp_str + array_sheet[j] + '!' + getColumnString(const_count_col) + (i + 1) + '*Trial!' + trial_cell_addr + '+';
      }
    }
    // 最後の＋を消してセット
    temp_array[i][0] = temp_str.substr(0, temp_str.length - 1);
  }
  temp_range.setFormulas(temp_array);
}
/**
* total2シートの関数を再構成する
* @param {Array.<string>} array_sheet シート名
* @param {Number} trial_start_row trialシートのsetup試験期間年数の行
* @return none
*/
function reconfigure_total2(array_sheet, trial_start_row){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var get_s_p = PropertiesService.getScriptProperties();
  var sheet = get_sheets();
  var insert_col, temp_str, temp_range, temp_array;
  const const_start_col = 4;
  const const_start_row = 5;
  var row_count = sheet.total2.getLastRow();
  // setup~closing列再構成  
  sheet.total2.insertColumnsAfter(const_start_col, array_sheet.length - 1);
  for (var i = 0; i < array_sheet.length; i++){
    insert_col = const_start_col + i;
    temp_range = sheet.total2.getRange(1, insert_col, row_count, 1);
    temp_array = temp_range.getFormulas();
    for (var j = const_start_row - 1; j < temp_array.length; j++){
      temp_array[j][0] = '=IF(or(' + array_sheet[i] + '!$B$2="", ' + array_sheet[i] +'!$H' + (j + 1) + '=""), "", ' + array_sheet[i] + '!$H' + (j + 1) + ')';
    }    
    temp_range.setFormulas(temp_array);
    // 2行目にシート名、4行目に年度
    sheet.total2.getRange(2, insert_col).setValue(array_sheet[i]);
    temp_str = get_fy_formula(array_sheet[i], parseInt(trial_start_row) + i);
    sheet.total2.getRange(4, insert_col).setFormula(temp_str);
  }
  // 合計列再構成
  reconfigure_total_col(sheet.total2, const_start_col + array_sheet.length, row_count, const_start_col, const_start_row, '""', const_start_row - 1);
}
/**
* total3シートの関数を再構成する
* @param {Array.<string>} array_sheet シート名
* @param {Number} trial_start_row trialシートのsetup試験期間年数の行
* @return none
*/
function reconfigure_total3(array_sheet, trial_start_row){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var get_s_p = PropertiesService.getScriptProperties();
  var sheet = get_sheets();
  var insert_col, temp_str, temp_range, temp_array;
  var item_name, temp_row, temp_col;
  const const_start_col = 4;
  const const_start_row = 4;
  const const_sum_str = '合計';
 　　var array_total_item = get_fy_items(sheet.total, 2);
  var row_count = sheet.total3.getLastRow();
  // setup~closing列再構成  
  sheet.total3.insertColumnsAfter(const_start_col, array_sheet.length - 1);
  for (var i = 0; i < array_sheet.length; i++){
    insert_col = const_start_col + i;
    temp_range = sheet.total3.getRange(1, insert_col, row_count, 1);
    temp_array = temp_range.getFormulas();
    for (var j = const_start_row - 1; j <= temp_array.length; j++){
      item_name = sheet.total3.getRange(j + 1, 2).getValue();
      temp_row = array_total_item[item_name];
      if (temp_row !== void 0){
        if (item_name == const_sum_str){
          temp_col = getColumnString(insert_col);
          temp_str = '=sum(' + temp_col + const_start_row + ':' + temp_col + (j) + ')';
        } else {
          temp_str = '=' + array_sheet[i] + '!I' + temp_row;
        }
        temp_array[j][0] = temp_str;
      }
    }    
    temp_range.setFormulas(temp_array);
    // 2行目にシート名、3行目に年度
    sheet.total3.getRange(2, insert_col).setValue(array_sheet[i]);
    temp_str = get_fy_formula(array_sheet[i], parseInt(trial_start_row) + i);
    sheet.total3.getRange(3, insert_col).setFormula(temp_str);
  }
  // 合計列再構成
  reconfigure_total_col(sheet.total3, const_start_col + array_sheet.length, row_count, const_start_col, const_start_row + 1, 0, 3);
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
  var temp_sheet_t = [get_s_p.getProperty('registration_1_sheet_name'),
                      get_s_p.getProperty('registration_2_sheet_name'),
                      get_s_p.getProperty('interim_1_sheet_name'),
                      get_s_p.getProperty('interim_2_sheet_name'),
                      get_s_p.getProperty('observation_1_sheet_name'),
                      get_s_p.getProperty('observation_2_sheet_name')];
  var trial_header_row = parseInt(get_s_p.getProperty('trial_setup_row'));
  var trial_header_end_row = parseInt(get_s_p.getProperty('trial_closing_row'));
  var temp_row;
  const const_trial_header_col = 3;
  var count_col = getColumnString(get_s_p.getProperty('fy_sheet_count_col'));
  // シート作成
  for (var i = 0; i < temp_sheet_t.length; i++){
    if (ss.getSheetByName(temp_sheet_t[i]) == null){
      var ss_sheet_copy = sheet.setup.copyTo(ss);
      ss_sheet_copy.setName(temp_sheet_t[i]);
      ss.getSheetByName(temp_sheet_t[i]).activate();
      ss.moveActiveSheet(i + 7);
      trial_header_row++;
    }
  }
  // trial!B27の入力規則を変更する
  var temp_range = sheet.trial.getRange('B27');
  var rule = SpreadsheetApp.newDataValidation();
  temp_range.clearDataValidations();
  rule.requireValueInList(['観察研究・レジストリ', get_s_p.getProperty('investigator_initiated_trial'), '介入研究（特定臨床研究法対応以外）', get_s_p.getProperty('specified_clinical_trial')], true);
  rule.setAllowInvalid(false);
  rule.build();
  temp_range.setDataValidation(rule);
  // trial!C27の判定式を変更する
  var temp_addr = temp_range.getA1Notation();
  temp_range.offset(0, 1).setFormula('=IF(' + temp_addr + '="観察研究・レジストリ",1,IF(OR(' + temp_addr + '="' + get_s_p.getProperty('specified_clinical_trial') +'", ' + temp_addr + '="介入研究（特定臨床研究法対応以外）"),2,5))');
  
  temp_sheet_t = [get_s_p.getProperty('setup_sheet_name'),
                  get_s_p.getProperty('registration_1_sheet_name'),
                 　　get_s_p.getProperty('registration_2_sheet_name'),
                  get_s_p.getProperty('interim_1_sheet_name'),
                  get_s_p.getProperty('interim_2_sheet_name'),
                  get_s_p.getProperty('observation_1_sheet_name'),
                  get_s_p.getProperty('observation_2_sheet_name'),
                  get_s_p.getProperty('closing_sheet_name')];
  // trialシートに試験期間年月行追加
  trial_header_row = parseInt(get_s_p.getProperty('trial_setup_row'));
  if (sheet.trial.getRange(trial_header_end_row, 1).getValue() != get_s_p.getProperty('closing_sheet_name')){
    sheet.trial.insertRowsAfter(trial_header_row, const_trial_header_col);
    temp_row = trial_header_end_row - trial_header_row + 1;
    temp_range = sheet.trial.getRange(trial_header_row, 1, temp_row, 1);
    var temp_array = temp_range.getValues();
    var temp_formulas_range = sheet.trial.getRange(trial_header_row, 2, temp_row, 1);
    var temp_formulas = temp_formulas_range.getFormulas();
    sheet.trial.getRange(trial_header_row, const_trial_header_col, temp_row, 3).clear();
    for (var i = 0; i < temp_sheet_t.length; i++){
      temp_row = (trial_header_row + i);
      temp_array[i][0] = temp_sheet_t[i];
      temp_formulas[i][0] = '=if(C' + temp_row + '<>"","【見積明細：1年毎（" & year(edate(D' + temp_row + ',-3)) & if(C' + temp_row + '>1,"〜" & year(edate(edate(D' + temp_row + ',-3),12*(C' + temp_row + '-1))), "")& "年度）】","")';
      // setup~closingシートのB2セルに年度を表示、回数列をクリア
      ss.getSheetByName(temp_sheet_t[i]).getRange('B2').setFormula('=' + get_s_p.getProperty('trial_sheet_name') + '!B' + temp_row);
      ss.getSheetByName(temp_sheet_t[i]).getRange(count_col + ':' + count_col).clearContent();
      // setup~closingシートの保護
      set_protection(ss.getSheetByName(temp_sheet_t[i]));
    }
    temp_range.setValues(temp_array);
    temp_formulas_range.setFormulas(temp_formulas);
  }
  // trial!コメントの修正
  var replace_source_str = '"契約期間は"&text($D$32,"yyyy年m月d日")&"〜"&text($E$39,"yyyy年m月d日") & " ("&$C$40&"間）を想定しております。"';
  var replace_str = '"契約期間は"&text($D$40,"yyyy年m月d日")&"〜"&text($E$40,"yyyy年m月d日") & " ("&$C$40&"間）を想定しております。"'
  var textFinder = sheet.trial.createTextFinder(replace_source_str).matchFormulaText(true);
  textFinder.replaceAllWith(replace_str);

  // total関数再構成
  reconfigure_total(temp_sheet_t);
  reconfigure_total2(temp_sheet_t, parseInt(get_s_p.getProperty('trial_setup_row')) + 1);
  reconfigure_total3(temp_sheet_t, parseInt(get_s_p.getProperty('trial_setup_row')) + 1);

  // シート削除
  temp_sheet_t = ['Registration', 'Interim', 'observation'];
  for (var i = 0; i < temp_sheet_t.length; i++){
    if (ss.getSheetByName(temp_sheet_t[i]) != null){
      ss.deleteSheet(ss.getSheetByName(temp_sheet_t[i]));
    }
  }
}
/**
* シートの保護をかける
*/
function set_protection(sheet){
  var unprotected_range = sheet.getRangeList(['F6:F80', 'L:L']).getRanges();
  var protection = sheet.protect();
  protection.setUnprotectedRanges(unprotected_range);
}