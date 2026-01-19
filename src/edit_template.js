/**
* Itemsシートに項目を追加する
* @param {string} item_str 追加する項目名
* @param {number} target_row 追加する行
* @param {number} target_col 項目名を追加する列
* @return 項目名が完全一致すればその項目の値を返す。一致しなければnullを返す。
*/
function add_items(item_str, target_row, target_col){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  // itemsシート
  var target_sheet = ss.getSheetByName(get_s_p.getProperty('items_sheet_name'));
  copy_formulas_to_inserted_line(target_sheet, target_row, null);
  target_sheet.getRange(target_row, target_col).clearDataValidations();
  target_sheet.getRange(target_row, target_col).setValue(item_str);
  target_sheet.getRange('S' + target_row + ':' + 'U' + target_row).setValue('');
  // price, pricelogic, pricelogiccompanyシート
  target_sheetnames = ['Price', 'PriceLogicCompany', 'PriceLogic'];
  var temp = target_sheetnames.map(
    function(x){
      copy_formulas_to_inserted_line(ss.getSheetByName(x), target_row - 1, null);
    });
  target_sheetnames = [get_s_p.getProperty('total_sheet_name'), get_s_p.getProperty('total2_sheet_name'), get_s_p.getProperty('total3_sheet_name'), 
                       get_s_p.getProperty('setup_sheet_name'), get_s_p.getProperty('registration_1_sheet_name'), 
                       get_s_p.getProperty('registration_2_sheet_name'), get_s_p.getProperty('interim_1_sheet_name'), 
                       get_s_p.getProperty('observation_1_sheet_name'), get_s_p.getProperty('interim_2_sheet_name'), 
                       get_s_p.getProperty('observation_2_sheet_name'), get_s_p.getProperty('closing_sheet_name'), ];
  var temp = target_sheetnames.map(
    function(x){
      copy_formulas_to_inserted_line(ss.getSheetByName(x), target_row + 2, null);
    });
  // totalシートの数式再セット
  temp_sheet_t = [get_s_p.getProperty('setup_sheet_name'),
                  get_s_p.getProperty('registration_1_sheet_name'),
                  get_s_p.getProperty('registration_2_sheet_name'),
                  get_s_p.getProperty('interim_1_sheet_name'),
                  get_s_p.getProperty('observation_1_sheet_name'),
                  get_s_p.getProperty('interim_2_sheet_name'),
                  get_s_p.getProperty('observation_2_sheet_name'),
                  get_s_p.getProperty('closing_sheet_name')];
  reconfigure_total(temp_sheet_t, target_row + 2);
}
/**
* フォントの太さをA列なら太字、それ以外なら標準にする
*/
function set_target_font_weight(target_range){
  var str_font_weight = 'normal';
  if (target_range.getColumn() == 1){
    str_font_weight = 'bold';
  }
  target_range.setFontWeight(str_font_weight);
}
/**
* 行を挿入して1行上から数式をコピーする
*/
function copy_formulas_to_inserted_line(sheet, target_row, ref_row){
  var last_col = sheet.getLastColumn();
  if (ref_row == null){
    var target_ref_row = target_row - 1;
  } else {
    var target_ref_row = ref_row;
  }
  sheet.insertRowBefore(target_row);
  sheet.getRange(target_ref_row, 1, 1,last_col).copyTo(sheet.getRange(target_row, 1), SpreadsheetApp.CopyPasteType.PASTE_FORMULA);
  sheet.autoResizeRows(target_row, 1);
}
/**
* totalシートの関数を再構成する
* @param {Array.<string>} array_sheet シート名
* @param {number} target_row 再構成対象の行
* @return none
*/
function reconfigure_total(array_sheet, target_row){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  const const_trial_setup_row = get_s_p.getProperty('trial_setup_row');
  const const_trial_years_col = get_s_p.getProperty('trial_years_col');
  const const_count_col =get_s_p.getProperty('fy_sheet_count_col');
  const sheet = get_sheets();
  const const_start_row = 4;
  var trial_cell_addr, temp_str; 
  var i = target_row;
  temp_str = '=';
  for (var j = 0; j < array_sheet.length; j++){
        trial_cell_addr = sheet.trial.getRange(parseInt(const_trial_setup_row) + j, const_trial_years_col).getA1Notation();
        temp_str = temp_str + array_sheet[j] + '!' + getColumnString(const_count_col) + (i + 1) + '*Trial!' + trial_cell_addr + '+';
  }
    // 最後の＋を消してセット
  sheet.total.getRange(target_row, const_count_col).setFormula(temp_str.substr(0, temp_str.length - 1));
}
/**
* 行の追加call
*/
function additems_main(){
  add_items('特定臨床研究法申請資料作成支援', 22, 2);
}
