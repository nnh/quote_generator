/**
* スクリプトプロパティの一覧をログに出力する
*/
function work_getproperty(){
  const get_s_p = PropertiesService.getScriptProperties();
  for(var key in get_s_p.getProperties()) {
    Logger.log('get_s_p.setProperty(' + "'" + key + "', " + get_s_p.getProperty(key) + ')');
  }
}
/**
* シート名から年度の計算式を返す
* @param {String} sheet_name シート名
* @param {Number} trial_row trialシートの試験期間年数の行
* @return {String} 年度の式
*/
function get_fy_formula(sheet_name, trial_row){
  const get_s_p = PropertiesService.getScriptProperties();
  var temp_str;
  if (sheet_name == get_s_p.getProperty('setup_sheet_name')){
    temp_str = '=if(' + get_s_p.getProperty('trial_sheet_name') + '!$C$' + trial_row + '<>"", year(edate(' + get_s_p.getProperty('trial_sheet_name') + '!$D$' + trial_row + ', -3)), 2019)';
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
  const setup_col_str = getColumnString(start_col);
  const closing_col_str = getColumnString(total_col - 1);
  const temp_range = sheet.getRange(1, total_col, row_count, 1);
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  const const_trial_setup_row = get_s_p.getProperty('trial_setup_row');
  const const_trial_years_col = get_s_p.getProperty('trial_years_col');
  const const_count_col =get_s_p.getProperty('fy_sheet_count_col');
  const sheet = get_sheets();
  const const_start_row = 4;
  const row_count = sheet.total.getLastRow();
  const temp_range = sheet.total.getRange(1, 6, row_count, 1);
  var temp_array = temp_range.getFormulas();
  var trial_cell_addr, temp_str; 
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  const const_start_col = 4;
  const const_start_row = 5;
  const row_count = sheet.total2.getLastRow();
  var insert_col, temp_str, temp_range, temp_array;
  // E~H列を削除
  sheet.total2.deleteColumns(5, 4);
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
    temp_str = get_fy_formula(array_sheet[i], parseInt(trial_start_row) + i - 1);
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  const const_start_col = 4;
  const const_start_row = 4;
  const const_sum_str = '合計';
 　　const array_total_item = get_fy_items(sheet.total, 2);
  const row_count = sheet.total3.getLastRow();
  var insert_col, temp_str, temp_range, temp_array, item_name, temp_row, temp_col;
  // E~H列を削除
  sheet.total3.deleteColumns(5, 4);
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
        if (item_name == ''){
          temp_str = '';
        } else if (item_name == const_sum_str){
          temp_col = getColumnString(insert_col);
          temp_str = '=sum(' + temp_col + const_start_row + ':' + temp_col + (j) + ')';
        } else {
          temp_str = '=if(or(' + array_sheet[i] + '!B2="",' + array_sheet[i] + '!$I' + temp_row + '=""),"",' + array_sheet[i] + '!$I' + temp_row + ')';
        }
        temp_array[j][0] = temp_str;
      }
    }    
    temp_range.setFormulas(temp_array);
    // 2行目にシート名、3行目に年度
    sheet.total3.getRange(2, insert_col).setValue(array_sheet[i]);
    temp_str = get_fy_formula(array_sheet[i], parseInt(trial_start_row) + i - 1);
    sheet.total3.getRange(3, insert_col).setFormula(temp_str);
  }
  // 合計列再構成
  reconfigure_total_col(sheet.total3, const_start_col + array_sheet.length, row_count, const_start_col, const_start_row + 1, 0, 3);
  // 書式を会計にする
  sheet.total3.getRange(const_start_row, const_start_col, row_count - const_start_row, const_start_col + array_sheet.length).setNumberFormat('#,##0;(#,##0)');
}
function work_addsheet(){
  // スクリプトプロパティの設定
  work_setproperty();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = {trial:ss.getSheetByName(get_s_p.getProperty('trial_sheet_name')),
                 quotation_request:ss.getSheetByName(get_s_p.getProperty('quotation_request_sheet_name')),
                 total:ss.getSheetByName(get_s_p.getProperty('total_sheet_name')),
                 total2:ss.getSheetByName(get_s_p.getProperty('total2_sheet_name')),
                 total3:ss.getSheetByName(get_s_p.getProperty('total3_sheet_name')),
                 setup:ss.getSheetByName(get_s_p.getProperty('setup_sheet_name')),
                 closing:ss.getSheetByName(get_s_p.getProperty('closing_sheet_name'))}
  const const_trial_header_col = 3;
  const trial_header_end_row = parseInt(get_s_p.getProperty('trial_closing_row'));
  const rule = SpreadsheetApp.newDataValidation();
  const count_col = getColumnString(get_s_p.getProperty('fy_sheet_count_col'));
  const replace_source_str = '"契約期間は"&text($D$32,"yyyy年m月d日")&"〜"&text($E$39,"yyyy年m月d日") & " ("&$C$40&"間）を想定しております。"';
  const replace_str = '"契約期間は"&text($D$40,"yyyy年m月d日")&"〜"&text($E$40,"yyyy年m月d日") & " ("&$C$40&"間）を想定しております。"'
  const textFinder = sheet.trial.createTextFinder(replace_source_str).matchFormulaText(true);
  var trial_header_row = parseInt(get_s_p.getProperty('trial_setup_row'));
  var temp_sheet_t = [get_s_p.getProperty('registration_1_sheet_name'),
                      get_s_p.getProperty('registration_2_sheet_name'),
                      get_s_p.getProperty('interim_1_sheet_name'),
                      get_s_p.getProperty('observation_1_sheet_name'),
                      get_s_p.getProperty('interim_2_sheet_name'),
                      get_s_p.getProperty('observation_2_sheet_name')];
  var temp_row, ss_sheet_copy, temp_range, temp_addr, temp_array, temp_formulas_range, temp_formulas;
  // quotation_requestシートの修正
  const quotation_request_header = [['タイムスタンプ', '見積種別', '見積発行先', '研究代表者名', '試験課題名', '試験実施番号', '試験種別', 'PMDA相談資料作成支援', 'AMED申請資料作成支援', 
                                     '1例あたりの実地モニタリング回数', '年間1施設あたりの必須文書実地モニタリング回数', '監査対象施設数', '保険料', '治験薬管理', '治験薬運搬', 'CRB申請', 
                                     '効安事務局設置', '安全性管理事務局設置', '研究結果報告書作成支援', '目標症例数', '実施施設数', 'CRF項目数', '症例登録開始日', '症例登録終了日', 
                                     '副作用モニタリング終了日', '試験終了日', 'キックオフミーティング', '症例検討会', 'その他会議（のべ回数）', '中間解析に必要な帳票数', '中間解析の頻度', 
                                     '統計解析に必要な帳票数', '研究協力費、負担軽減費配分管理', '研究協力費、負担軽減費', '試験開始準備費用', '症例登録毎の支払', '症例最終報告書提出毎の支払', 
                                     '備考', 'CDISC対応']];
  sheet.quotation_request.clearContents();
  sheet.quotation_request.getRange(1, 1, 1, aaa[0].length).setValues(aaa);
  // シート作成
  for (var i = 0; i < temp_sheet_t.length; i++){
    if (ss.getSheetByName(temp_sheet_t[i]) == null){
      ss_sheet_copy = sheet.setup.copyTo(ss);
      ss_sheet_copy.setName(temp_sheet_t[i]);
      ss.getSheetByName(temp_sheet_t[i]).activate();
      ss.moveActiveSheet(i + 7);
      trial_header_row++;
    }
  }
  // trial!B27の入力規則を変更する
  temp_range = sheet.trial.getRange('B27');
  temp_range.clearDataValidations();
  rule.requireValueInList(['観察研究・レジストリ', get_s_p.getProperty('investigator_initiated_trial'), '介入研究（特定臨床研究以外）', get_s_p.getProperty('specified_clinical_trial')], true);
  rule.setAllowInvalid(false);
  rule.build();
  temp_range.setDataValidation(rule);
  // trial!C27の判定式を変更する
  temp_addr = temp_range.getA1Notation();
  temp_range.offset(0, 1).setFormula('=IF(' + temp_addr + '="観察研究・レジストリ",1,IF(OR(' + temp_addr + '="' + get_s_p.getProperty('specified_clinical_trial') +'", ' + temp_addr + '="介入研究（特定臨床研究以外）"),2,5))');
  // 対象シートセット  
  temp_sheet_t = [get_s_p.getProperty('setup_sheet_name'),
                  get_s_p.getProperty('registration_1_sheet_name'),
                 　　get_s_p.getProperty('registration_2_sheet_name'),
                  get_s_p.getProperty('interim_1_sheet_name'),
                  get_s_p.getProperty('observation_1_sheet_name'),
                  get_s_p.getProperty('interim_2_sheet_name'),
                  get_s_p.getProperty('observation_2_sheet_name'),
                  get_s_p.getProperty('closing_sheet_name')];
  // trialシートに試験期間年月行追加
  trial_header_row = parseInt(get_s_p.getProperty('trial_setup_row'));
  if (sheet.trial.getRange(trial_header_end_row, 1).getValue() != get_s_p.getProperty('closing_sheet_name')){
    sheet.trial.insertRowsAfter(trial_header_row, const_trial_header_col);
    temp_row = trial_header_end_row - trial_header_row + 1;
    temp_range = sheet.trial.getRange(trial_header_row, 1, temp_row, 1);
    temp_array = temp_range.getValues();
    temp_formulas_range = sheet.trial.getRange(trial_header_row, 2, temp_row, 1);
    temp_formulas = temp_formulas_range.getFormulas();
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
  textFinder.replaceAllWith(replace_str);
  // trial!F31「月数」
  sheet.trial.getRange(parseInt(get_s_p.getProperty('trial_setup_row')) - 1, 6).setValue('月数');
  // trial!F40の書式を自動に変更
  sheet.trial.getRange(parseInt(trial_header_end_row) + 1, 6).setNumberFormat("@");
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
  const unprotected_range = sheet.getRangeList(['F6:F80', 'L:L']).getRanges();
  const protection = sheet.protect();
  protection.setUnprotectedRanges(unprotected_range);
}